import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const geminiInteraction = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
  });

  return response.text;
};

export { ai, geminiInteraction };
