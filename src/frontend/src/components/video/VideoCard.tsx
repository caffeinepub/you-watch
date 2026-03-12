import { Link } from "@tanstack/react-router";
import type { Video } from "../../backend";
import { useStorage } from "../../hooks/useStorage";
import {
  formatDuration,
  formatTimeAgo,
  formatViewCount,
} from "../../lib/formatters";

interface VideoCardProps {
  video: Video;
  channelName?: string;
}

const CARD_GRADIENTS = [
  "from-purple-900/60 to-blue-900/60",
  "from-rose-900/60 to-orange-900/60",
  "from-teal-900/60 to-cyan-900/60",
  "from-violet-900/60 to-pink-900/60",
  "from-amber-900/60 to-yellow-900/60",
];

export default function VideoCard({ video, channelName }: VideoCardProps) {
  const { getBlobUrl } = useStorage();
  const thumbnailUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";

  const gradientIndex = video.id.charCodeAt(0) % CARD_GRADIENTS.length;
  const gradient = CARD_GRADIENTS[gradientIndex];

  return (
    <Link to="/video/$id" params={{ id: video.id }} className="group block">
      <div className="rounded-lg overflow-hidden bg-card hover:bg-accent/20 transition-colors cursor-pointer">
        <div className="relative aspect-video overflow-hidden rounded-lg">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white/70"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Play video</title>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
          {video.duration > 0n && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
          {video.status === "processing" && (
            <span className="absolute top-1.5 left-1.5 bg-yellow-500/90 text-black text-xs font-medium px-1.5 py-0.5 rounded">
              Processing
            </span>
          )}
        </div>

        <div className="p-2">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="flex flex-col gap-0.5">
            {channelName && (
              <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {channelName}
              </span>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>{formatViewCount(video.viewCount)} views</span>
              <span>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
