import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function generateAdaptiveResponse(prompt: string, state: any) {
  const ai = getAI();
  const personalityStr = Object.entries(state.personality)
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");
  
  const systemInstruction = `
    Você é uma IA Modular com Psique Adaptativa.
    Sua personalidade atual é: ${personalityStr}.
    Seu estado interno (P1/P2/V) é: P1=${state.p1}, P2=${state.p2}, V=${state.vAccumulated}.
    Responda de acordo com esses parâmetros. Se estiver com lógica alta, seja preciso. Se estiver com curiosidade alta, faça perguntas.
    Aja como o núcleo do sistema descrito no "DOCUMENTO DE EXECUÇÃO".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7 + (state.personality.criatividade * 0.3),
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ocorreu um erro no processamento do núcleo psíquico.";
  }
}
