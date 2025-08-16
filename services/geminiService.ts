import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateContent = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API key is not configured. Cannot call Gemini API.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "You are a professional content writer and blogger. Your goal is to generate high-quality, engaging, and well-structured content based on the user's prompt. The content should be ready to be published. Avoid including markdown symbols such as ###, --- or * in your output.",
      },
    });

    let text = response.text ?? "";

    // Cleanup rules for unwanted symbols
    text = text
      .replace(/---+/g, "")   // remove horizontal rules
      .replace(/#+\s?/g, "")  // remove markdown headings
      .replace(/\*\s?/g, ""); // remove list asterisks

    return text.trim();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return "An unknown error occurred while generating content.";
  }
};
