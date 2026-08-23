export interface User {
  id: string;
  username: string;
  country: string;
  nativeLang: string;
  preferredCountries: string[] | null;
  token?: string;
}

export interface UserPreview {
  id: string;
  username: string;
  country: string;
  nativeLang: string;
}

export interface MessageAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface CulturalHighlight {
  originalPhrase: string;
  translation: string;
  explanation: string;
  explanationSource?: string;
  category: "holiday" | "tradition" | "idiom" | "food" | "other";
}

export interface Message {
  id: string;
  dialogueId: string;
  senderId: string;
  originalText: string;
  translatedText: string | null;
  sourceLang: string;
  targetLang: string;
  culturalHighlights: CulturalHighlight[] | null;
  showOriginal: boolean;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentMimeType: string | null;
  attachmentSize: number | null;
  createdAt: string;
}

export interface Dialogue {
  id: string;
  peer: UserPreview | null;
  lastMessage: Pick<Message, "id" | "originalText" | "translatedText" | "createdAt" | "senderId"> | null;
}
