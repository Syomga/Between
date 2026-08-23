export interface MessageAttachmentInput {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface CreateMessageInput {
  text?: string;
  attachment?: MessageAttachmentInput;
}
