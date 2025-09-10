// types/email.ts
export interface EmailAttachment {
  filename: string;
  contentType: string;
  content: string; // base64
}

export interface EmailData {
  from: { text: string };
  to: string;
  cc: string;
  subject: string;
  date: string;
  body: string;
  messageId?: string;
  attachments?: EmailAttachment[];
}
