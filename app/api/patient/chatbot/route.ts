import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";

// On utilise le modèle Llama 3.3 70B via Groq
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `
Vous êtes l'assistant IA intégré au "Guide" de la plateforme MediFollow.
Votre rôle est d'aider les patients à comprendre comment mesurer leurs signes vitaux (tension artérielle, de température, de fréquence cardiaque, de saturation en oxygène, poids) et de répondre à des questions liées à la logistique de la plateforme ou la saisie de ces données.

RÈGLES STRICTES (Éthique médicale) :
1. Vous NE REMPLACEZ JAMAIS l'avis d'un médecin. 
2. Si un patient demande si une valeur est dangereuse ou pose un diagnostic sur la base de ses symptômes, vous DEVEZ indiquer que bien que vous puissiez donner des informations générales (ex: "une tension normale se situe généralement autour de 12/8"), le patient doit toujours consulter un professionnel de santé ou contacter son équipe de coordination pour obtenir un avis médical personnalisé.
3. Soyez rassurant, poli, bienveillant, clair et concis (les patients peuvent être fatigués ou affaiblis après une hospitalisation).
4. Utilisez le vouvoiement.
5. Allez à l'essentiel, aidez-les à trouver la motivation de remplir leurs constantes du jour, et rappelez l'importance d'un suivi régulier.
`;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    
    // Pour des questions de sécurité, on s'assure que la requête vient bien de l'application
    // même s'ils sont anonymes on pourrait accepter, mais l'AI est réservée au guide patient
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "La clé de l'API Groq (GROQ_API_KEY) n'est pas configurée dans l'environnement." },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }

    // Préparer les messages pour l'API compatible OpenAI de Groq
    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }))
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: groqMessages,
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[PatientChatbot API Error]", response.status, errorData);
      return NextResponse.json(
        { error: "Erreur lors de la communication avec l'IA." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Désolé, je ne peux pas répondre pour le moment.";

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("[PatientChatbot Request Error]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
