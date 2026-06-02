"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

import { getAccessToken } from "@/lib/auth";

export default function ChatPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [refreshKey, setRefreshKey] = useState(0);

  function refreshSidebar() {
    setRefreshKey((prev) => prev + 1);
  }

  function handleUploadSuccess(conversationId: string) {
    setSelectedConversationId(conversationId);
    refreshSidebar();
  }

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-transparent text-[var(--text-main)]">
        <div className="rounded-2xl border border-[var(--border-main)] bg-[var(--panel-bg)] px-6 py-4 text-sm text-[var(--text-muted)]">
          Đang kiểm tra đăng nhập...
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-transparent text-[var(--text-main)]">
      {sidebarOpen ? (
        <Sidebar
          selectedConversationId={selectedConversationId}
          refreshKey={refreshKey}
          onSelectConversation={(conversationId) => {
            setSelectedConversationId(conversationId);
          }}
          onNewChat={() => {
            setSelectedConversationId(null);
          }}
          onUploadSuccess={handleUploadSuccess}
          onCloseSidebar={() => {
            setSidebarOpen(false);
          }}
        />
      ) : (
        <aside className="flex h-screen w-14 shrink-0 flex-col items-center border-r border-[var(--border-main)] bg-[var(--app-bg)] py-4">
          <button
            type="button"
            title="Hiện sidebar"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-main)] bg-[var(--panel-bg)] text-lg text-[var(--text-muted)] transition hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)]"
          >
            ☰
          </button>

          <div className="mt-4 h-px w-8 bg-[var(--border-main)]" />

          <button
            type="button"
            title="Tạo đoạn chat mới"
            onClick={() => {
              setSidebarOpen(true);
              setSelectedConversationId(null);
            }}
            className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg text-[var(--text-muted)] transition hover:bg-[var(--panel-bg)] hover:text-[var(--text-main)]"
          >
            ＋
          </button>
        </aside>
      )}

      <div className="flex min-w-0 flex-1">
        <ChatWindow
          conversationId={selectedConversationId}
          refreshKey={refreshKey}
          onMessageSent={refreshSidebar}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>
    </main>
  );
}

