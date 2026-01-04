
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "./types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGiftRecommendation = async (userInput: string, products: Product[]) => {
  const productList = products.map(p => `${p.id}: ${p.name} (${p.category})`).join('\n');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are GoTher AI assistant. Help the user choose a digital animated gift based on their request: "${userInput}".
    Here is the catalog:
    ${productList}
    
    Return a helpful recommendation in both Arabic and English, and list the relevant product IDs from the catalog.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommendationEn: { type: Type.STRING },
          recommendationAr: { type: Type.STRING },
          productIds: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["recommendationEn", "recommendationAr", "productIds"]
      }
    }
  });

  return JSON.parse(response.text);
};
