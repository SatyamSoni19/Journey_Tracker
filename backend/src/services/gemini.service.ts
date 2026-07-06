import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Helper to call Gemini with automatic fallback to lite if the primary model fails.
 */
async function callGeminiWithFallback(contents: any, config: any): Promise<any> {
  const primaryModel = env.GEMINI_MODEL || "gemini-2.5-flash";
  const fallbackModel = "gemini-2.5-flash-lite";

  try {
    // Attempt Primary Model
    return await ai.models.generateContent({
      model: primaryModel,
      contents,
      config,
    });
  } catch (error: any) {
    console.error(`================ GEMINI PRIMARY MODEL ERROR (${primaryModel}) ================`);
    console.error(`Message: ${error.message}`);
    
    const errorStr = String(error) + JSON.stringify(error);
    const isQuotaOrAvailability = error?.status === 429 || error?.status === 503 || errorStr.includes("429") || errorStr.includes("503") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("UNAVAILABLE");
    
    if (!isQuotaOrAvailability) {
      // If it's a structural error (like bad prompt), fallback won't help. Just fail.
      throw ApiError.internal("AI Planner is temporarily unavailable. Please try again in a few moments.");
    }
    
    console.log(`Fallback triggered. Attempting ${fallbackModel}...`);
    
    try {
      // Attempt Fallback Model
      return await ai.models.generateContent({
        model: fallbackModel,
        contents,
        config,
      });
    } catch (fallbackError: any) {
      console.error(`================ GEMINI FALLBACK MODEL ERROR (${fallbackModel}) ================`);
      console.error(`Message: ${fallbackError.message}`);
      
      // Both failed. Return clean error.
      throw ApiError.internal("AI Planner is temporarily unavailable. Please try again in a few moments.");
    }
  }
}

/**
 * Send a structured prompt to Gemini and parse the JSON response.
 * Gemini is instructed to return pure JSON — never markdown or plain text.
 */
export async function generateStructuredResponse<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const response = await callGeminiWithFallback(
    [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    }
  );

  const text = response.text?.trim() || "";

  if (!text) {
    throw ApiError.internal("AI Planner is temporarily unavailable. Please try again in a few moments.");
  }

  try {
    // Clean response: strip markdown code fences if present
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("Failed to parse Gemini response:", text.substring(0, 500));
    throw ApiError.internal("AI Planner is temporarily unavailable. Please try again in a few moments.");
  }
}

/**
 * Simple text completion — used for quick extractions like trip intent parsing.
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await callGeminiWithFallback(
    [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    {
      systemInstruction: systemPrompt,
      temperature: 0.3,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    }
  );

  return response.text?.trim() || "";
}

/**
 * Send a chat conversation to Gemini and get a markdown response.
 */
export async function generateChatResponse(
  systemPrompt: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  userPrompt: string
): Promise<string> {
  const response = await callGeminiWithFallback(
    [
      ...history,
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
    }
  );

  return response.text?.trim() || "";
}