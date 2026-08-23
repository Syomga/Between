export interface AiCulturalHighlight {
  originalPhrase: string;
  translation: string;
  explanation: string;
  explanationSource?: string;
  category: "holiday" | "tradition" | "idiom" | "food" | "other";
}

export interface AiTranslationResponse {
  translatedText: string;
  culturalHighlights: AiCulturalHighlight[];
}
