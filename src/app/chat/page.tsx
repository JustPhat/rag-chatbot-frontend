"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

import { getAccessToken } from "@/lib/auth";

export default function ChatPage() {
  const router = useRouter();

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
    <main className="flex min-h-screen bg-zinc-950 text-zinc-100">
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
      />

      <ChatWindow
        conversationId={selectedConversationId}
        refreshKey={refreshKey}
        onMessageSent={refreshSidebar}
        onUploadSuccess={handleUploadSuccess}
      />
    </main>
  );
}