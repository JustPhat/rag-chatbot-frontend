"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";

import { clearAuth } from "@/lib/auth";
import {
  deleteConversation,
  getConversations,
  updateConversationTitle,
} from "@/lib/api";

import type { Conversation } from "@/types/api";
import UploadButton from "@/components/UploadButton";

type SidebarProps = {
  selectedConversationId?: string | null;
  refreshKey?: number;
  onSelectConversation: (conversationId: string) => void;
  onNewChat?: () => void;
  onUploadSuccess?: (conversationId: string) => void;
  onCloseSidebar?: () => void;
};

export default function Sidebar({
  selectedConversationId,
  refreshKey = 0,
  onSelectConversation,
  onNewChat,
  onUploadSuccess,
  onCloseSidebar,
}: SidebarProps) {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadConversations() {
    setLoading(true);
    setError("");

    try {
      const response = await getConversations();
      setConversations(response.conversations);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Không thể tải danh sách chat.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConversation(
    event: MouseEvent<HTMLButtonElement>,
    conversationId: string
  ) {
    event.stopPropagation();

    const confirmed = window.confirm(
      "Bạn có chắc muốn xóa đoạn chat này không?"
    );

    if (!confirmed) return;

    try {
      await deleteConversation(conversationId);

      setConversations((prev) =>
        prev.filter((item) => item.conversation_id !== conversationId)
      );

      if (selectedConversationId === conversationId) {
        onNewChat?.();
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Xóa đoạn chat thất bại.");
      }
    }
  }
  async function handleRenameConversation(
    event: MouseEvent<HTMLButtonElement>,
    conversationId: string,
    currentTitle: string
    ) {
    event.stopPropagation();

    const newTitle = window.prompt(
        "Nhập tên mới cho đoạn chat:",
        currentTitle
    );

    if (newTitle === null) return;

    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
        alert("Tên đoạn chat không được để trống.");
        return;
    }

    if (trimmedTitle === currentTitle) return;

    try {
        await updateConversationTitle(
        conversationId,
        trimmedTitle
        );

        setConversations((prev) =>
        prev.map((item) =>
            item.conversation_id === conversationId
            ? {
                ...item,
                title: trimmedTitle,
                updated_at: new Date().toISOString(),
                }
            : item
        )
        );
    } catch (err) {
        if (err instanceof Error) {
        alert(err.message);
        } else {
        alert("Đổi tên đoạn chat thất bại.");
        }
    }
    }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  useEffect(() => {
    loadConversations();
    }, [refreshKey]);

  return (
    <aside className="flex h-screen w-80 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">RAG Chatbot</h1>

            <p className="mt-1 text-sm text-zinc-400">
              Hỏi đáp dựa trên tài liệu của bạn
            </p>
          </div>

          <button
            type="button"
            title="Ẩn sidebar"
            onClick={onCloseSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            ←
          </button>
        </div>
      </div>

      <div className="p-3">
        <UploadButton
          conversationId={null}
          label="+ Tạo đoạn chat mới"
          onUploadSuccess={(conversationId) => {
            onUploadSuccess?.(conversationId);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {loading && (
          <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-400">
            Đang tải danh sách chat...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-500">
            Chưa có đoạn chat nào.
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const active =
                selectedConversationId === conversation.conversation_id;

              return (
                <div
                    key={conversation.conversation_id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                    onSelectConversation(conversation.conversation_id)
                    }
                    onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectConversation(conversation.conversation_id);
                    }
                    }}
                    className={[
                    "group w-full cursor-pointer rounded-xl border px-3 py-3 text-left transition outline-none",
                    active
                        ? "border-blue-600 bg-blue-950/40"
                        : "border-zinc-800 hover:bg-zinc-900",
                    ].join(" ")}
                >
                    <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-100">
                        {conversation.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-zinc-500">
                        {conversation.file_name}
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                        type="button"
                        onClick={(event) =>
                            handleRenameConversation(
                            event,
                            conversation.conversation_id,
                            conversation.title
                            )
                        }
                        className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100"
                        >
                        Sửa
                        </button>

                        <button
                        type="button"
                        onClick={(event) =>
                            handleDeleteConversation(
                            event,
                            conversation.conversation_id
                            )
                        }
                        className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition hover:bg-red-950 hover:text-red-300"
                        >
                        Xóa
                        </button>
                    </div>
                    </div>

                    <p className="mt-2 text-[11px] text-zinc-600">
                    {new Date(conversation.updated_at).toLocaleString("vi-VN")}
                    </p>
                </div>
                );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl px-4 py-3 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-100"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}