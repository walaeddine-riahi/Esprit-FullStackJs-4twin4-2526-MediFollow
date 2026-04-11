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

    const { vitalsList, patientContext } = await req.json();

    if (!vitalsList || !Array.isArray(vitalsList)) {
      return NextResponse.json({ error: "Données vitales invalides" }, { status: 400 });
    }

    // Préparer les données pour l'IA
    const dataStr = vitalsList.map((v: any) => {
      const date = v.recordedAt ? new Date(v.recordedAt).toLocaleString("fr-FR") : "Date inconnue";
      return `[${date}] Temp: ${v.temperature ?? '-'} | FC: ${v.heartRate ?? '-'} | TA: ${v.systolicBP ?? '-'}/${v.diastolicBP ?? '-'} | SpO2: ${v.oxygenSaturation ?? '-'}`;
    }).join("\n");

    const systemPrompt = `Tu es un Assistant d'Analyse Médicale Expert IA intégré à la plateforme MediFollow. Ton rôle est d'analyser l'historique complet des constantes vitales d'un patient pour aider le coordinateur de soins.
Le coordinateur souhaite une détection stricte des anomalies ligne par ligne (ex: coquilles typographiques comme 42°C pour la température) et une vision des tendances si applicable.

Tu DOIS impérativement répondre avec une structure JSON valide, contenant exactement ces trois clés:
1. "resumeGlobal": Un paragraphe de synthèse (1 à 3 phrases max) résumant l'état du patient.
2. "analyseParParametre": Un tableau d'objets (JSON Array) contenant les anomalies et tendances éventuelles. Chaque objet a {"parametre": "...", "analyse": "..."}.
3. "recommandations": Un tableau de chaînes de caractères (array of strings) contenant des actions concrètes pour le coordinateur (ex: "Contacter le patient pour revérifier la température du 08/04").

Réponds UNIQUEMENT et EXCLUSIVEMENT avec le JSON brut. N'ajoute AUCUN texte avant ou après. N'utilise pas les balises markdown de code \`\`\`json.`;

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Voici l'historique des constantes du patient :\n${dataStr}\n\nContexte patient (Pathologie/Age) : ${JSON.stringify(patientContext)}` }
        ],
        temperature: 0.1, 
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[VitalsReport API Error]", response.status, errorText);
      return NextResponse.json({ error: "Erreur lors de la génération." }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content || "{}";

    try {
      const jsonReport = JSON.parse(rawContent);
      return NextResponse.json({ success: true, report: jsonReport });
    } catch (parseError) {
      console.error("[VitalsReport JSON Parse Error]", rawContent);
      return NextResponse.json({ error: "Format rendu par l'IA invalide." }, { status: 500 });
    }

  } catch (error) {
    console.error("[VitalsReport Request Error]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
