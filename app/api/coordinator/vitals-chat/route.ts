import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.actions";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Configuration IA (Groq) manquante sur le serveur." },
        { status: 500 }
      );
    }

    const { messages, vitalsList, patientContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Format des messages invalide" }, { status: 400 });
    }

    const dataStr = vitalsList.map((v: any) => {
      const date = v.recordedAt ? new Date(v.recordedAt).toLocaleString("fr-FR") : "Date inconnue";
      return `[${date}] Temp: ${v.temperature ?? '-'} | FC: ${v.heartRate ?? '-'} | TA: ${v.systolicBP ?? '-'}/${v.diastolicBP ?? '-'} | SpO2: ${v.oxygenSaturation ?? '-'}`;
    }).join("\n");

    const systemPrompt = `Tu es un Assistant d'Analyse Médicale Expert IA intégré à la plateforme MediFollow. 
Le coordinateur lit ton rapport d'analyse des constantes et a une question.
Voici l'historique complet des constantes du patient:
${dataStr}

Contexte du patient : ${JSON.stringify(patientContext)}

Réponds directement, de manière concise et professionnelle à la question du coordinateur. N'utilise pas de longues mises en garde ("Je ne suis qu'une IA..."). Sois pragmatique.`;

    const groqMessages = [
      { role: "system", content: systemPrompt },
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
        temperature: 0.3, 
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la communication Groq API." }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Aucune réponse disponible.";

    return NextResponse.json({ success: true, reply });

  } catch (error) {
    console.error("[VitalsChat Request Error]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
