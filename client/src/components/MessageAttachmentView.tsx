import { FileText } from "lucide-react";
import { getApiUrl } from "../utils/apiUrl";

const API_URL = getApiUrl();

interface Props {
  url: string;
  name: string;
  mimeType: string | null;
  size: number | null;
  isMine: boolean;
}

function formatSize(bytes: number | null): string {
  if (!bytes) {
    return "";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageAttachmentView({ url, name, mimeType, size, isMine }: Props) {
  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
  const isImage = mimeType?.startsWith("image/");

  if (isImage) {
    return (
      <a className="block overflow-hidden rounded-lg" href={fullUrl} rel="noreferrer" target="_blank">
        <img
          alt={name}
          className="max-h-64 max-w-full rounded-lg object-cover"
          src={fullUrl}
        />
      </a>
    );
  }

  return (
    <a
      className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
        isMine ? "tg-attach-mine" : "tg-attach-other"
      }`}
      download={name}
      href={fullUrl}
      rel="noreferrer"
      target="_blank"
    >
      <FileText className="h-5 w-5 shrink-0 tg-text-muted" />
      <span className="min-w-0 flex-1 truncate text-sm tg-text-secondary">{name}</span>
      {size ? <span className="shrink-0 text-xs tg-text-subtle">{formatSize(size)}</span> : null}
    </a>
  );
}
