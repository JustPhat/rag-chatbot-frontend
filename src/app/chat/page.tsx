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
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-4 text-sm text-zinc-400">
          Đang kiểm tra đăng nhập...
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
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
        <aside className="flex h-screen w-14 shrink-0 flex-col items-center border-r border-zinc-800 bg-zinc-950 py-4">
          <button
            type="button"
            title="Hiện sidebar"
            onClick={() => setSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-lg text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            ☰
          </button>

          <div className="mt-4 h-px w-8 bg-zinc-800" />

          <button
            type="button"
            title="Tạo đoạn chat mới"
            onClick={() => {
              setSidebarOpen(true);
              setSelectedConversationId(null);
            }}
            className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
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