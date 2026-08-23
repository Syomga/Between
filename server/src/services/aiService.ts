import OpenAI from "openai";
import type { CulturalHighlight, TranslationResult } from "../types/chat";

const model = "cx/gpt-5.4";

const client = new OpenAI({
  apiKey: process.env.ANYMODEL_API_KEY || "",
  baseURL: "https://anymodel.org/v1",
});

const systemPrompt =
  "You translate chat messages. Detect the language of the input text. " +
  "Translate it into receiverNativeLang. " +
  "Return strict JSON: { detectedSourceLang: string, translatedText: string, culturalHighlights: [{ originalPhrase: string, translation: string, explanation: string, explanationSource: string, category: 'holiday'|'tradition'|'idiom'|'food'|'other' }] }. " +
  "translatedText must be in receiverNativeLang. " +
  "originalPhrase must be an exact substring of the input text. " +
  "translation must be an exact substring of translatedText. " +
  "explanation is in receiverNativeLang. explanationSource is in detectedSourceLang.";

const fallbackResult = (text: string): TranslationResult => ({
  translatedText: text,
  culturalHighlights: [],
});

function normalizeHighlights(
  highlights: CulturalHighlight[],
  originalText: string,
  translatedText: string,
): CulturalHighlight[] {
  return highlights
    .map((item) => ({
      ...item,
      explanationSource: item.explanationSource || item.explanation || "",
    }))
    .filter((item) => item.originalPhrase?.trim())
    .map((item) => {
      const originalPhrase = item.originalPhrase.trim();
      let translation = (item.translation || originalPhrase).trim();

      if (!translatedText.includes(translation) && translatedText.includes(originalPhrase)) {
        translation = originalPhrase;
      }

      if (!originalText.includes(originalPhrase)) {
        return null;
      }

      return { ...item, originalPhrase, translation };
    })
    .filter((item): item is CulturalHighlight => item !== null);
}

async function simpleTranslateTo(text: string, targetLang: string): Promise<string | null> {
  if (!process.env.ANYMODEL_API_KEY) {
    return null;
  }

  try {
    const response = await client.chat.completions.create({
      model,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: `Translate the message into ${targetLang}. Reply with translation only, no quotes.`,
        },
        { role: "user", content: text },
      ],
    });

    const translated = response.choices[0]?.message?.content?.trim();
    return translated || null;
  } catch {
    return null;
  }
}

async function requestTranslation(
  text: string,
  senderNativeLang: string,
  receiverNativeLang: string,
): Promise<TranslationResult & { detectedSourceLang?: string }> {
  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: JSON.stringify({
          senderNativeLang,
          receiverNativeLang,
          text,
        }),
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const parsed = JSON.parse(raw) as TranslationResult & { detectedSourceLang?: string };

  if (!parsed?.translatedText || !Array.isArray(parsed.culturalHighlights)) {
    return fallbackResult(text);
  }

  let translatedText = parsed.translatedText.trim() || text;
  let culturalHighlights = normalizeHighlights(parsed.culturalHighlights, text, translatedText);

  if (translatedText.trim() === text.trim()) {
    const direct = await simpleTranslateTo(text, receiverNativeLang);
    if (direct && direct.trim() !== text.trim()) {
      translatedText = direct.trim();
      culturalHighlights = [];
    }
  }

  return {
    translatedText,
    culturalHighlights,
    detectedSourceLang: parsed.detectedSourceLang,
  };
}

export async function translateWithCulture(
  text: string,
  senderNativeLang: string,
  receiverNativeLang: string,
): Promise<TranslationResult> {
  if (!process.env.ANYMODEL_API_KEY) {
    console.error("AI key is not configured. Returning fallback translation.");
    return fallbackResult(text);
  }

  const normalizedSender = senderNativeLang.trim().toLowerCase();
  const normalizedReceiver = receiverNativeLang.trim().toLowerCase();

  try {
    let result = await requestTranslation(text, senderNativeLang, receiverNativeLang);

    if (
      result.translatedText.trim() === text.trim() &&
      normalizedSender !== normalizedReceiver
    ) {
      const direct = await simpleTranslateTo(text, receiverNativeLang);
      if (direct && direct.trim() !== text.trim()) {
        result = {
          translatedText: direct.trim(),
          culturalHighlights: [],
        };
      }
    }

    return {
      translatedText: result.translatedText,
      culturalHighlights: result.culturalHighlights,
    };
  } catch (error) {
    console.error("AI translation error:", error);
    const direct = await simpleTranslateTo(text, receiverNativeLang);
    if (direct && direct.trim() !== text.trim()) {
      return { translatedText: direct.trim(), culturalHighlights: [] };
    }
    return fallbackResult(text);
  }
}

export async function translateForViewer(
  text: string,
  viewerNativeLang: string,
  hintSourceLang?: string,
): Promise<TranslationResult> {
  return translateWithCulture(text, hintSourceLang || "auto", viewerNativeLang);
}
