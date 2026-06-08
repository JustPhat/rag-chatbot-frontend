"use client";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, LogOut, Settings } from "lucide-react";

import { clearAuth, getStoredUser } from "@/lib/auth";
import {
  deleteConversation,
  getConversations,
  updateConversationTitle,
} from "@/lib/api";

import type { Conversation } from "@/types/api";
import UploadButton from "@/components/UploadButton";
import { getCurrentUser } from "@/lib/api";
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [userName, setUserName] = useState("Người dùng");
  const [userEmail, setUserEmail] = useState("");

  async function loadCurrentUser() {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUserName(storedUser.full_name || storedUser.email || "Người dùng");
      setUserEmail(storedUser.email || "");
    }

    try {
      const user = await getCurrentUser();

      setUserName(user.full_name || user.email || "Người dùng");
      setUserEmail(user.email || "");
    } catch {
      // Nếu API /auth/me lỗi thì vẫn giữ thông tin từ localStorage.
    }
  }
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
      await updateConversationTitle(conversationId, trimmedTitle);

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

  function handleOpenSettings() {
    setProfileMenuOpen(false);
    router.push("/settings");
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  useEffect(() => {
    loadConversations();
    loadCurrentUser();
  }, [refreshKey]);

  return (
  <aside className="flex h-screen w-80 flex-col border-r border-[var(--border-main)] bg-[var(--panel-bg)] text-[var(--text-main)]">
    <div className="border-b border-[var(--border-main)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">
            RAG Chatbot
          </h1>

          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Hỏi đáp dựa trên tài liệu của bạn
          </p>
        </div>

        <button
          type="button"
          title="Ẩn sidebar"
          onClick={onCloseSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-main)] bg-[var(--panel-bg)] text-sm text-[var(--text-muted)] transition hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)]"
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
        <div className="rounded-xl border border-[var(--border-main)] bg-[var(--panel-bg)] p-4 text-sm text-[var(--text-muted)]">
          Đang tải danh sách chat...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && conversations.length === 0 && (
        <div className="rounded-xl border border-[var(--border-main)] bg-[var(--panel-bg)] p-4 text-sm text-[var(--text-muted)]">
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
                  "group w-full cursor-pointer rounded-xl border px-3 py-3 text-left outline-none transition",
                  active
                    ? "border-blue-600 bg-blue-950/40"
                    : "border-[var(--border-main)] hover:bg-[var(--panel-bg)]",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-main)]">
                      {conversation.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                      {conversation.file_name}
                    </p>

                    <p className="mt-2 text-xs text-[var(--text-soft)]">
                      {new Date(conversation.updated_at).toLocaleTimeString(
                        "vi-VN"
                      )}{" "}
                      {new Date(conversation.updated_at).toLocaleDateString(
                        "vi-VN"
                      )}
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
                      className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] transition hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)]"
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
                      className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] transition hover:bg-red-950/40 hover:text-red-300"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    <footer className="relative border-t border-[var(--border-main)] p-3">
      {profileMenuOpen && (
        <div className="absolute bottom-20 left-3 right-3 rounded-2xl border border-[var(--border-main)] bg-[var(--panel-bg)] p-2 shadow-2xl">
          <button
            type="button"
            onClick={handleOpenSettings}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[var(--text-muted)] transition hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)]"
          >
            <Settings size={17} strokeWidth={2} />
            <span>Cài đặt</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-300 transition hover:bg-red-950/40 hover:text-red-200"
          >
            <LogOut size={17} strokeWidth={2} />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setProfileMenuOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-[var(--panel-bg)]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-white">
          P
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--text-main)]">
            {userName}
          </p>

          <p className="truncate text-xs text-[var(--text-muted)]">
            {userEmail}
          </p>
        </div>

        <ChevronUp
          size={16}
          strokeWidth={2}
          className={[
            "shrink-0 text-[var(--text-muted)] transition",
            profileMenuOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
    </footer>
  </aside>
);
}
