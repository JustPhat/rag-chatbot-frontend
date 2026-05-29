"use client";

import type { Message, Source } from "@/types/api";

type MessageBubbleProps = {
  message: Message;
};

function formatScore(score?: number) {
  if (score === undefined || score === null) {
    return null;
  }

  return score.toFixed(4);
}

function SourceItem({
  source,
  index,
}: {
  source: Source;
  index: number;
}) {
  const score = formatScore(source.score);

  return (
    <details className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
      <summary className="cursor-pointer text-xs font-medium text-zinc-300">
        Source {index + 1}
        {source.file_name ? ` • ${source.file_name}` : ""}
        {source.page !== undefined && source.page !== null
          ? ` • Page ${source.page}`
          : ""}
        {score ? ` • Score ${score}` : ""}
      </summary>

      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-zinc-400">
        {source.text}
      </p>
    </details>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={[
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "max-w-3xl rounded-2xl px-5 py-4 shadow-sm",
          isUser
            ? "bg-blue-600 text-white"
            : "border border-zinc-800 bg-zinc-900 text-zinc-100",
        ].join(" ")}
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className={[
              "rounded-full px-2 py-0.5 text-xs font-medium",
              isUser
                ? "bg-blue-500 text-blue-50"
                : "bg-zinc-800 text-zinc-300",
            ].join(" ")}
          >
            {isUser ? "Bạn" : isAssistant ? "Assistant" : message.role}
          </span>

          {message.timestamp && (
            <span
              className={[
                "text-xs",
                isUser ? "text-blue-100" : "text-zinc-500",
              ].join(" ")}
            >
              {new Date(message.timestamp).toLocaleString("vi-VN")}
            </span>
          )}
        </div>

        <p className="whitespace-pre-wrap text-sm leading-6">
          {message.content}
        </p>

        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-400">
              📚 Sources
            </p>

            {message.sources.map((source, index) => (
              <SourceItem
                key={`${message.message_id}-source-${index}`}
                source={source}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}