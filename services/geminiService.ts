
import { GoogleGenAI, Type } from "@google/genai";
import { QuoteData, QuoteGenerationParams } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuotes = async (params: QuoteGenerationParams): Promise<QuoteData[]> => {
  const prompt = `Generate ${params.count} inspiring and high-impact quotes about "${params.topic}". 
  Additional context: ${params.details}.
  The signature should be: ${params.signature}.
  Each quote should be professional, concise, and perfect for social media influencers or leaders.
  Return the result as a JSON array of objects, where each object has a 'text' property for the quote and an 'author' property for the signature.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "The content of the quote" },
              author: { type: Type.STRING, description: "The name to credit" }
            },
            required: ["text", "author"]
          }
        }
      }
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("Error generating quotes:", error);
    throw error;
  }
};
