export interface CitationSource {
  documentId: string;
  documentName: string;
  page: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: CitationSource[];
  insufficientEvidence?: boolean;
  disclaimer?: string;
  suggestedQuestions?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}
