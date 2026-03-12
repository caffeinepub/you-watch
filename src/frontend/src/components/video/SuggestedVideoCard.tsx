import { useNavigate } from "@tanstack/react-router";
import type { Video } from "../../backend";
import { useStorage } from "../../hooks/useStorage";
import {
  formatDuration,
  formatTimeAgo,
  formatViewCount,
} from "../../lib/formatters";

interface SuggestedVideoCardProps {
  video: Video;
  channelName?: string;
  index?: number;
}

const CARD_GRADIENTS = [
  "from-purple-900/60 to-blue-900/60",
  "from-rose-900/60 to-orange-900/60",
  "from-teal-900/60 to-cyan-900/60",
  "from-violet-900/60 to-pink-900/60",
  "from-amber-900/60 to-yellow-900/60",
];

export default function SuggestedVideoCard({
  video,
  channelName,
  index = 0,
}: SuggestedVideoCardProps) {
  const navigate = useNavigate();
  const { getBlobUrl } = useStorage();
  const thumbnailUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";
  const gradient =
    CARD_GRADIENTS[video.id.charCodeAt(0) % CARD_GRADIENTS.length];

  const handleClick = () => {
    navigate({ to: "/video/$id", params: { id: video.id } });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex gap-2.5 group hover:bg-muted/30 rounded-lg p-1 transition-colors w-full text-left"
      data-ocid={`suggested.item.${index + 1}`}
    >
      {/* Thumbnail */}
      <div className="relative w-36 flex-shrink-0 rounded-md overflow-hidden aspect-video">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <svg
              className="w-5 h-5 text-white/60"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Play</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {video.duration > 0n && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
          {video.title}
        </h4>
        {channelName && (
          <p className="text-xs text-muted-foreground truncate">
            {channelName}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatViewCount(video.viewCount)} views •{" "}
          {formatTimeAgo(video.createdAt)}
        </p>
      </div>
    </button>
  );
}
