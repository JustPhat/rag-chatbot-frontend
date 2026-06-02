"use client";

import {
  ChangeEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { uploadDocument } from "@/lib/api";

const EMBEDDING_MODELS = [
  {
    name: "AITeamVN/Vietnamese_Embedding",
    label: "AITeamVN Vietnamese Embedding",
    description: "Phù hợp hơn cho tài liệu tiếng Việt.",
  },
  {
    name: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    label: "Multilingual MiniLM",
    description: "Model nhẹ, đa ngôn ngữ, tốc độ nhanh hơn.",
  },
];

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

  const [selectedModel, setSelectedModel] = useState(
    "AITeamVN/Vietnamese_Embedding"
  );
  const [showModelPicker, setShowModelPicker] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const isIcon = variant === "icon";
  const isCreateNewChat = !conversationId && variant === "full";

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

    if (isCreateNewChat && !showModelPicker) {
      setShowModelPicker(true);
      return;
    }

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
      const response = await uploadDocument(
        file,
        conversationId,
        conversationId ? undefined : selectedModel
      );

      setStatus(`Đã xử lý xong: ${response.file_name}`);

      onUploadSuccess(response.conversation_id);

      if (isCreateNewChat) {
        setShowModelPicker(false);
      }
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
            ? "cursor-not-allowed border-blue-700 bg-blue-950/40 text-blue-300"
            : "border-[var(--border-main)] bg-[var(--panel-bg)] text-[var(--text-muted)] hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)]",
          !conversationId ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      >
        {uploading ? "…" : "+"}
      </button>
    </>
  );
}

return (
  <div className="space-y-3">
    {isCreateNewChat && showModelPicker && (
      <div className="space-y-2 rounded-xl border border-[var(--border-main)] bg-[var(--panel-bg)] p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-[var(--text-main)]">
            Chọn mô hình embedding
          </p>

          <button
            type="button"
            onClick={() => {
              setShowModelPicker(false);
              setError("");
              setStatus("");
            }}
            disabled={uploading}
            className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] transition hover:bg-[var(--panel-bg-soft)] hover:text-[var(--text-main)] disabled:opacity-60"
          >
            Hủy
          </button>
        </div>

        {EMBEDDING_MODELS.map((model) => (
          <label
            key={model.name}
            className={[
              "flex cursor-pointer gap-3 rounded-xl border p-3 text-xs transition",
              selectedModel === model.name
                ? "border-blue-600 bg-blue-950/30"
                : "border-[var(--border-main)] hover:bg-[var(--panel-bg-soft)]",
            ].join(" ")}
          >
            <input
              type="radio"
              name="embedding-model"
              value={model.name}
              checked={selectedModel === model.name}
              onChange={() => setSelectedModel(model.name)}
              disabled={uploading}
              className="mt-1"
            />

            <span>
              <span className="block font-medium text-[var(--text-main)]">
                {model.label}
              </span>

              <span className="mt-1 block leading-5 text-[var(--text-muted)]">
                {model.description}
              </span>
            </span>
          </label>
        ))}
      </div>
    )}

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
          ? "cursor-not-allowed border-blue-700 bg-blue-950/40 text-blue-200"
          : "border-[var(--border-main)] bg-[var(--panel-bg)] text-[var(--text-main)] hover:bg-[var(--panel-bg-soft)]",
      ].join(" ")}
    >
      {uploading ? (
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          Đang xử lý tài liệu...
        </span>
      ) : isCreateNewChat && showModelPicker ? (
        "Chọn file để tạo đoạn chat"
      ) : (
        label || "+ Tạo đoạn chat mới"
      )}
    </button>

    {status && (
      <div className="rounded-xl border border-blue-700 bg-blue-950/30 px-3 py-2 text-xs leading-5 text-blue-200">
        <div>{status}</div>

        {isCreateNewChat && (
          <div className="mt-1 text-blue-300/80">
            Model:{" "}
            {
              EMBEDDING_MODELS.find(
                (model) => model.name === selectedModel
              )?.label
            }
          </div>
        )}

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

