import { Play, X } from "lucide-react";

function extractVideoId(url: string): string | null {
  const match = url.match(/\/video\/([^/?#\s]+)/);
  return match ? match[1] : null;
}

export function hasVideoLink(text: string): boolean {
  return /\/video\/[^/?#\s]+/.test(text);
}

interface VideoLinkPreviewProps {
  url: string;
  onRemove?: () => void;
  onClick?: () => void;
}

export default function VideoLinkPreview({
  url,
  onRemove,
  onClick,
}: VideoLinkPreviewProps) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg p-2 w-full relative group">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <div className="w-16 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
          <Play className="w-4 h-4 text-muted-foreground fill-current" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
            YOU WATCH Video
          </p>
          <p className="text-sm font-semibold text-foreground truncate">
            Video: {videoId}
          </p>
        </div>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 w-6 h-6 rounded-full bg-muted hover:bg-destructive/20 flex items-center justify-center transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
