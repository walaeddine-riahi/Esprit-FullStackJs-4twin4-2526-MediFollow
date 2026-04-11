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

    const { title, note, vitalRecord } = await req.json();

    const systemPrompt = `Tu es une IA experte qui assiste le coordinateur médical de la plateforme MediFollow. Ton objectif est d'analyser rapidement un signalement ou une alerte vitale.
On te fournit le titre du signalement, le motif/note, et potentiellement les constantes vitales.
Instructions strictes:
1. Analyse la situation de manière extrêmement concise (2 ou 3 phrases maximum).
2. Identifie les éléments anormaux si présents (ex: tension trop haute, FC élevée).
3. Conclus par une recommandation opérationnelle très courte (ex: "Recommande de contacter le patient", "Escalade au médecin urgente", "Possible erreur de saisie, demander re-mesure").
4. Ne fais aucun avertissement textuel rébarbatif ("Je ne suis qu'une IA" etc.), fournis juste le corps de l'analyse professionnelle.`;

    const vitalsStr = vitalRecord ? `
Constantes: 
- Temp: ${vitalRecord.temperature || "N/A"}
- FC: ${vitalRecord.heartRate || "N/A"}
- TA Sys: ${vitalRecord.systolicBP || "N/A"}
- TA Dia: ${vitalRecord.diastolicBP || "N/A"}
- SpO2: ${vitalRecord.oxygenSaturation || "N/A"}
` : "Pas de constante liée.";

    const userMessage = `Signalement: ${title}\nMotif technique: ${note}\n${vitalsStr}`;

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
          { role: "user", content: userMessage }
        ],
        temperature: 0.3, 
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur Groq API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content || "Analyse impossible actuellement.";

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error("[ReviewAnalysis Error]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
