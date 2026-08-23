import { useMemo, useState } from "react";
import type { Message } from "../types/chat";
import { splitWithHighlights } from "../utils/highlightText";
import { CultureWidget } from "./CultureWidget";
import { OriginalToggle } from "./OriginalToggle";

interface Props {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: Props) {
  const [showOriginal, setShowOriginal] = useState(message.showOriginal);

  const renderText = showOriginal ? message.originalText : message.translatedText || message.originalText;

  const highlights = useMemo(
    () => splitWithHighlights(renderText, message.culturalHighlights ?? []),
    [message.culturalHighlights, renderText],
  );

  return (
    <div className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-xl px-3 py-2 ${
          isMine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {highlights.map((part, index) =>
            part.type === "highlight" && part.data ? (
              <CultureWidget highlight={part.data} key={`${part.value}-${index}`}>
                {part.value}
              </CultureWidget>
            ) : (
              <span key={`${part.value}-${index}`}>{part.value}</span>
            ),
          )}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <OriginalToggle
            onToggle={() => setShowOriginal((value) => !value)}
            value={showOriginal}
          />
          <span className={`text-[10px] ${isMine ? "text-blue-100" : "text-slate-500"}`}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
