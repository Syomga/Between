import OpenAI from "openai";
import type { TranslationResult } from "../types/chat";

const model = "cx/gpt-5.4";

const client = new OpenAI({
  apiKey: process.env.ANYMODEL_API_KEY || "",
  baseURL: "https://anymodel.org/v1",
});

const fallbackResult = (text: string): TranslationResult => ({
  translatedText: text,
  culturalHighlights: [],
});

export async function translateWithCulture(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<TranslationResult> {
  if (!process.env.ANYMODEL_API_KEY) {
    console.error("AI key is not configured. Returning fallback translation.");
    return fallbackResult(text);
  }

  const systemPrompt =
    "You are a translation and culture assistant. Translate source text from sourceLang to targetLang and identify cultural references. Return strict JSON with shape: { translatedText: string, culturalHighlights: [{ originalPhrase: string, translation: string, explanation: string, category: 'holiday'|'tradition'|'idiom'|'food'|'other' }] }. Explanations must be in targetLang.";

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            sourceLang,
            targetLang,
            text,
          }),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw) as TranslationResult;
    if (!parsed?.translatedText || !Array.isArray(parsed.culturalHighlights)) {
      return fallbackResult(text);
    }

    return parsed;
  } catch (error) {
    console.error("AI translation error:", error);
    return fallbackResult(text);
  }
}
