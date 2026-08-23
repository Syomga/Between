import { useMemo, useState } from "react";
import type { Message } from "../types/chat";
import { splitWithHighlights } from "../utils/highlightText";
import { getMessageView, hasTranslationToggle } from "../utils/messageView";
import { CultureWidget } from "./CultureWidget";
import { MessageAttachmentView } from "./MessageAttachmentView";
import { OriginalToggle } from "./OriginalToggle";

interface Props {
  message: Message;
  isMine: boolean;
  isActiveSearchMatch?: boolean;
  searchDimmed?: boolean;
}

export function MessageBubble({
  message,
  isMine,
  isActiveSearchMatch = false,
  searchDimmed = false,
}: Props) {
  const [showAlternate, setShowAlternate] = useState(false);

  const view = useMemo(
    () => getMessageView(message, isMine, showAlternate),
    [isMine, message, showAlternate],
  );

  const highlights = useMemo(
    () => splitWithHighlights(view.text, message.culturalHighlights ?? [], view.mode),
    [message.culturalHighlights, view.mode, view.text],
  );

  const hasAttachment = Boolean(message.attachmentUrl);
  const hasCaption = Boolean(message.originalText && !message.originalText.startsWith("📎 "));
  const showText = hasCaption || (!hasAttachment && Boolean(view.text));

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const canToggle = hasTranslationToggle(message);

  return (
    <div
      className={`mb-2 flex scroll-mt-24 ${isMine ? "justify-end" : "justify-start"} ${
        isActiveSearchMatch ? "rounded-2xl ring-2 ring-[#3390ec]" : ""
      } ${searchDimmed ? "opacity-35" : ""}`}
    >
      <div
        className={`max-w-[min(75%,520px)] px-3 py-2 shadow-sm ${
          isMine ? "rounded-2xl rounded-br-md tg-msg-out" : "rounded-2xl rounded-bl-md tg-msg-in"
        }`}
      >
        {hasAttachment && message.attachmentUrl && (
          <div className={showText ? "mb-2" : ""}>
            <MessageAttachmentView
              isMine={isMine}
              mimeType={message.attachmentMimeType}
              name={message.attachmentName ?? "file"}
              size={message.attachmentSize}
              url={message.attachmentUrl}
            />
          </div>
        )}

        {showText && (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {highlights.map((part, index) =>
              part.type === "highlight" && part.phrase ? (
                <CultureWidget
                  category={part.category ?? "other"}
                  explanation={part.explanation ?? ""}
                  isMine={isMine}
                  key={`${part.value}-${index}`}
                  phrase={part.phrase}
                >
                  {part.value}
                </CultureWidget>
              ) : (
                <span key={`${part.value}-${index}`}>{part.value}</span>
              ),
            )}
          </p>
        )}

        <div
          className={`mt-1 flex items-center gap-2 ${canToggle ? "justify-between" : "justify-end"}`}
        >
          {canToggle && (
            <OriginalToggle
              isMine={isMine}
              onToggle={() => setShowAlternate((value) => !value)}
              showAlternate={showAlternate}
            />
          )}
          <span className="shrink-0 text-[11px] tg-text-subtle">{time}</span>
        </div>
      </div>
    </div>
  );
}
