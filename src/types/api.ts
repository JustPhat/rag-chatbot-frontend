// src/types/api.ts

export type SearchMode = "Instant" | "Balanced" | "Deep";

export type User = {
  user_id: string;
  email: string;
  full_name?: string | null;
};

export type AuthResponse = {
  message: string;
  access_token: string;
  token_type: "bearer";
  user_id: string;
  email: string;
  full_name?: string | null;
};

export type Conversation = {
  conversation_id: string;
  user_id: string;
  title: string;
  file_name?: string;
  documents_count?: number;
  documents?: ConversationDocument[];
  model_name?: string;
  model_label?: string;
  created_at: string;
  updated_at: string;
};

export type ConversationListResponse = {
  user_id: string;
  total: number;
  conversations: Conversation[];
};

export type EmbeddingModelName =
  | "AITeamVN/Vietnamese_Embedding"
  | "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

export type EmbeddingModelOption = {
  name: EmbeddingModelName;
  label: string;
  description: string;
};

export type UploadResponse = {
  message: string;
  conversation_id: string;
  document_id?: string;
  file_name: string;
  num_chunks: number;
  user_id: string;
  is_new_conversation?: boolean;
  model_name?: string;
  model_label?: string;
};

export type Source = {
  text: string;
  page?: number | null;
  score?: number;
  file_name?: string;
};

export type ChatRequest = {
  conversation_id: string;
  question: string;
  search_mode: SearchMode;
};

export type ChatResponse = {
  conversation_id: string;
  file_name?: string;
  file_names?: string[];
  documents_count?: number;
  question: string;
  answer: string;
  sources: Source[];
  search_mode: SearchMode;
  top_k: number;
  user_id: string;
};

export type Message = {
  message_id: string;
  user_id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  sources: Source[];
  timestamp: string;
};

export type MessageListResponse = {
  conversation_id: string;
  file_name: string;
  total: number;
  messages: Message[];
};

export type UpdateConversationResponse = {
  message: string;
  conversation_id: string;
  title: string;
};

export type DeleteConversationResponse = {
  message: string;
  conversation_id: string;
};

export type ConversationDocument = {
  document_id: string;
  file_name: string;
  num_chunks?: number;
  model_name?: string | null;
  created_at?: string;
};