// src/lib/api.ts

import { getAccessToken } from "@/lib/auth";

import type {
  AuthResponse,
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationListResponse,
  DeleteConversationResponse,
  MessageListResponse,
  UpdateConversationResponse,
  UploadResponse,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

type ApiOptions = {
  method?: HttpMethod;
  body?: unknown;
  tokenRequired?: boolean;
};

async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const method = options.method || "GET";

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const token = getAccessToken();

  if (options.tokenRequired !== false) {
    if (!token) {
      throw new Error("Missing access token. Please login again.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body,
  });

  const contentType = response.headers.get("content-type");

  let data: unknown = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `API error: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

// =========================
// Auth
// =========================

export async function register(params: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: params,
    tokenRequired: false,
  });
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: params,
    tokenRequired: false,
  });
}

// =========================
// Upload
// =========================

export async function uploadDocument(
  file: File,
  conversationId?: string | null
): Promise<UploadResponse> {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Missing access token. Please login again.");
  }

  const formData = new FormData();

  formData.append("file", file);

  if (conversationId) {
    formData.append("conversation_id", conversationId);
  }

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.detail || `Upload failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as UploadResponse;
}

// =========================
// Chat
// =========================

export async function sendChatMessage(
  payload: ChatRequest
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>("/chat/", {
    method: "POST",
    body: payload,
  });
}

// =========================
// Conversations
// =========================

export async function getConversations(): Promise<ConversationListResponse> {
  return apiRequest<ConversationListResponse>("/conversations/");
}

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  return apiRequest<Conversation>(`/conversations/${conversationId}`);
}

export async function getConversationMessages(
  conversationId: string
): Promise<MessageListResponse> {
  return apiRequest<MessageListResponse>(
    `/conversations/${conversationId}/messages`
  );
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<UpdateConversationResponse> {
  return apiRequest<UpdateConversationResponse>(
    `/conversations/${conversationId}`,
    {
      method: "PATCH",
      body: {
        title,
      },
    }
  );
}

export async function deleteConversation(
  conversationId: string
): Promise<DeleteConversationResponse> {
  return apiRequest<DeleteConversationResponse>(
    `/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );
}