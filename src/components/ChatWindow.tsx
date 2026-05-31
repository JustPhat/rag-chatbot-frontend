"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import {
  getConversation,
  getConversationMessages,
  sendChatMessage,
} from "@/lib/api";

import MessageBubble from "@/components/MessageBubble";
import UploadButton from "@/components/UploadButton";

import type {
  ConversationDocument,
  Message,
  SearchMode,
} from "@/types/api";

type ChatWindowProps = {
  conversationId?: string | null;
  refreshKey?: number;
  onMessageSent?: () => void;
  onUploadSuccess?: (conversationId: string) => void;
};

function createTempMessage(params: {
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  sources?: Message["sources"];
}): Message {
  return {
    message_id: `temp-${params.role}-${Date.now()}-${Math.random()}`,
    user_id: "current-user",
    conversation_id: params.conversationId,
    role: params.role,
    content: params.content,
    sources: params.sources || [],
    timestamp: new Date().toISOString(),
  };
}

export default function ChatWindow({
  conversationId,
  refreshKey = 0,
  onMessageSent,
  onUploadSuccess,
}: ChatWindowProps) {
  const typingIntervalRef = useRef<number | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [fileName, setFileName] = useState("");
  const [documents, setDocuments] = useState<ConversationDocument[]>([]);

  const [question, setQuestion] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("Balanced");

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");

  function clearTypingInterval() {
    if (typingIntervalRef.current !== null) {
      window.clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
  }

  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      const container = chatScrollRef.current;

      if (!container) return;

      container.scrollTop = container.scrollHeight;
    });
  }

  async function loadMessages(selectedId: string) {
    setLoading(true);
    setError("");

    try {
      const [messagesResponse, conversationResponse] = await Promise.all([
        getConversationMessages(selectedId),
        getConversation(selectedId),
      ]);

      setMessages(messagesResponse.messages);
      setFileName(messagesResponse.file_name || "");
      setDocuments(conversationResponse.documents || []);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể tải lịch sử chat.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function reloadConversationDetail(selectedId: string) {
    try {
      const conversationResponse = await getConversation(selectedId);

      setDocuments(conversationResponse.documents || []);
      setFileName(conversationResponse.file_name || "");
    } catch {
      // Không chặn UI nếu chỉ lỗi reload documents.
    }
  }

  function typeAssistantMessage(params: {
    conversationId: string;
    fullAnswer: string;
    sources: Message["sources"];
    onDone?: () => void;
  }) {
    clearTypingInterval();

    const assistantMessageId = `temp-assistant-${Date.now()}-${Math.random()}`;

    const emptyAssistantMessage: Message = {
      message_id: assistantMessageId,
      user_id: "current-user",
      conversation_id: params.conversationId,
      role: "assistant",
      content: "",
      sources: [],
      timestamp: new Date().toISOString(),
    };

    setTyping(true);
    setMessages((prev) => [...prev, emptyAssistantMessage]);

    let currentIndex = 0;

    const typingSpeed = 12;
    const chunkSize = 3;

    typingIntervalRef.current = window.setInterval(() => {
      currentIndex += chunkSize;

      const isFinished = currentIndex >= params.fullAnswer.length;

      const nextContent = params.fullAnswer.slice(
        0,
        Math.min(currentIndex, params.fullAnswer.length)
      );

      setMessages((prev) =>
        prev.map((message) =>
          message.message_id === assistantMessageId
            ? {
                ...message,
                content: nextContent,
                sources: isFinished ? params.sources : [],
              }
            : message
        )
      );

      if (isFinished) {
        clearTypingInterval();
        setTyping(false);
        params.onDone?.();
      }
    }, typingSpeed);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!conversationId) return;

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    setError("");
    setSending(true);
    setQuestion("");

    const userMessage = createTempMessage({
      conversationId,
      role: "user",
      content: trimmedQuestion,
    });

    setMessages((prev) => [...prev, userMessage]);

    scrollChatToBottom();

    try {
      const response = await sendChatMessage({
        conversation_id: conversationId,
        question: trimmedQuestion,
        search_mode: searchMode,
      });

      setSending(false);

      typeAssistantMessage({
        conversationId,
        fullAnswer: response.answer,
        sources: response.sources,
        onDone: () => {
          onMessageSent?.();
        },
      });
    } catch (err) {
      setSending(false);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể gửi câu hỏi.");
      }

      const errorMessage = createTempMessage({
        conversationId,
        role: "assistant",
        content:
          "Có lỗi xảy ra khi gửi câu hỏi. Vui lòng kiểm tra backend hoặc thử lại.",
      });

      setMessages((prev) => [...prev, errorMessage]);
    }
  }

  useEffect(() => {
    clearTypingInterval();
    setTyping(false);

    if (!conversationId) {
      setMessages([]);
      setFileName("");
      setDocuments([]);
      setError("");
      setQuestion("");
      return;
    }

    loadMessages(conversationId);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    reloadConversationDetail(conversationId);
  }, [refreshKey, conversationId]);

  useEffect(() => {
    return () => {
      clearTypingInterval();
    };
  }, []);

  if (!conversationId) {
    return (
      <section className="flex h-screen flex-1 items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <h2 className="text-2xl font-bold">Chưa chọn đoạn chat</h2>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Chọn một đoạn chat ở sidebar hoặc tạo đoạn chat mới bằng cách upload
            tài liệu.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-screen flex-1 flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Lịch sử hội thoại</h2>

            <p className="mt-1 text-xs text-zinc-500">
              {documents.length > 0
                ? `${documents.length} tài liệu trong đoạn chat này`
                : fileName
                  ? `Tài liệu: ${fileName}`
                  : "Đang tải tài liệu..."}
            </p>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {documents.map((document) => (
              <span
                key={document.document_id}
                className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                title={`${document.num_chunks || 0} chunks`}
              >
                📄 {document.file_name}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {loading && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
            Đang tải lịch sử chat...
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto mb-4 max-w-3xl rounded-2xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
            Đoạn chat này chưa có tin nhắn nào. Hãy nhập câu hỏi bên dưới.
          </div>
        )}

        {!loading && messages.length > 0 && (
          <div className="mx-auto flex max-w-5xl flex-col gap-5">
            {messages.map((message) => (
              <MessageBubble key={message.message_id} message={message} />
            ))}

            {sending && (
              <div className="max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 px-5 py-4 text-sm text-zinc-400">
                Assistant đang suy nghĩ...
              </div>
            )}

            {typing && (
              <div className="text-xs text-zinc-600">
                Assistant đang soạn câu trả lời...
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="border-t border-zinc-800 px-6 py-4">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto flex max-w-5xl items-center gap-3"
        >
          <UploadButton
            variant="icon"
            conversationId={conversationId}
            title="Ấn vào đây để thêm file vào đoạn chat"
            onUploadSuccess={(uploadedConversationId) => {
              onUploadSuccess?.(uploadedConversationId);

              if (uploadedConversationId === conversationId) {
                reloadConversationDetail(conversationId);
              }
            }}
          />

          <select
            value={searchMode}
            onChange={(event) =>
              setSearchMode(event.target.value as SearchMode)
            }
            disabled={sending || typing}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-200 outline-none transition focus:border-blue-500 disabled:opacity-60"
          >
            <option value="Instant">Instant</option>
            <option value="Balanced">Balanced</option>
            <option value="Deep">Deep</option>
          </select>

          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            disabled={sending || typing}
            placeholder="Nhập câu hỏi về tài liệu..."
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-blue-500 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={sending || typing || !question.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Đang gửi..." : typing ? "Đang trả lời..." : "Gửi"}
          </button>
        </form>
      </footer>
    </section>
  );
}