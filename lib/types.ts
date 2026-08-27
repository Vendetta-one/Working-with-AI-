export type AppState = 'upload' | 'therapy' | 'report';

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

export interface ImageData {
  mimeType: string;
  /** base64-encoded bytes, without the data URL prefix */
  data: string;
  /** full data URL, used directly for <img src> */
  dataUrl: string;
  name: string;
}

export interface Report {
  recallClarity: string;
  sentiment: string;
  engagementMetrics: string;
  clinicalSummary: string;
}
