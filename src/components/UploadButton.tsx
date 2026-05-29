"use client";

import {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { uploadDocument } from "@/lib/api";

type UploadButtonProps = {
  conversationId?: string | null;
  onUploadSuccess: (conversationId: string) => void;
  variant?: "full" | "icon";
  label?: string;
  title?: string;
};

const ACCEPTED_EXTENSIONS = [".txt", ".pdf", ".docx"];

function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex === -1) return "";

  return fileName.slice(lastDotIndex).toLowerCase();
}

function isAllowedFile(file: File) {
  const extension = getFileExtension(file.name);

  return ACCEPTED_EXTENSIONS.includes(extension);
}

export default function UploadButton({
  conversationId,
  onUploadSuccess,
  variant = "full",
  label,
  title,
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isIcon = variant === "icon";

  useEffect(() => {
    if (!uploading) {
      setElapsedSeconds(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [uploading]);

  function handleOpenFilePicker(event?: MouseEvent<HTMLButtonElement>) {
    event?.stopPropagation();

    if (uploading) return;

    setError("");
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setStatus("");

    if (!isAllowedFile(file)) {
      setError("Chỉ hỗ trợ file .txt, .pdf hoặc .docx.");
      event.target.value = "";
      return;
    }

    setUploading(true);

    setStatus(
      conversationId
        ? `Đang thêm file vào chat hiện tại: ${file.name}`
        : `Đang tạo chat mới từ file: ${file.name}`
    );

    try {
      const response = await uploadDocument(file, conversationId);

      setStatus(`Đã xử lý xong: ${response.file_name}`);

      onUploadSuccess(response.conversation_id);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload file thất bại.");
      }
    } finally {
      setUploading(false);

      event.target.value = "";

      setTimeout(() => {
        setStatus("");
      }, 3000);
    }
  }

  if (isIcon) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          title={title || "Ấn vào đây để thêm file vào đoạn chat"}
          onClick={handleOpenFilePicker}
          disabled={uploading || !conversationId}
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-xl transition",
            uploading
              ? "cursor-not-allowed border-blue-900 bg-blue-950/40 text-blue-300"
              : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white",
            !conversationId ? "cursor-not-allowed opacity-50" : "",
          ].join(" ")}
        >
          {uploading ? "…" : "+"}
        </button>
      </>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleOpenFilePicker}
        disabled={uploading}
        className={[
          "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
          uploading
            ? "cursor-not-allowed border-blue-900 bg-blue-950/40 text-blue-200"
            : "border-zinc-700 text-zinc-200 hover:bg-zinc-800",
        ].join(" ")}
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
            Đang xử lý tài liệu...
          </span>
        ) : (
          label || "+ Tạo đoạn chat mới"
        )}
      </button>

      {status && (
        <div className="rounded-xl border border-blue-900 bg-blue-950/30 px-3 py-2 text-xs leading-5 text-blue-200">
          <div>{status}</div>

          {uploading && (
            <div className="mt-1 text-blue-300/80">
              Thời gian xử lý: {elapsedSeconds}s
            </div>
          )}

          {uploading && (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blue-950">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-400" />
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/40 px-3 py-2 text-xs leading-5 text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}