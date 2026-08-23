export interface CulturalHighlight {
  originalPhrase: string;
  translation: string;
  explanation: string;
  explanationSource: string;
  category: "holiday" | "tradition" | "idiom" | "food" | "other";
}

export interface TranslationResult {
  translatedText: string;
  culturalHighlights: CulturalHighlight[];
}
