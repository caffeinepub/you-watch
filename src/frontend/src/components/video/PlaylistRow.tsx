import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import type { Playlist, Video } from "../../backend";
import { usePlaylistVideos } from "../../hooks/useQueries";
import { useStorage } from "../../hooks/useStorage";
import { formatDuration } from "../../lib/formatters";

function PlaylistVideoCard({ video }: { video: Video }) {
  const { getBlobUrl } = useStorage();
  const thumbnailUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";

  return (
    <Link
      to="/video/$id"
      params={{ id: video.id }}
      className="flex-shrink-0 w-44 group"
      data-ocid="playlist_row.card"
    >
      <div className="relative rounded-xl overflow-hidden bg-muted aspect-video mb-2">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Video</title>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {video.duration > 0n && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      <p className="text-xs font-semibold line-clamp-2 leading-snug mb-0.5">
        {video.title}
      </p>
      <p className="text-xs text-muted-foreground truncate">Channel</p>
    </Link>
  );
}

function PlaylistRowSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-44">
            <Skeleton className="w-full aspect-video rounded-xl mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface PlaylistRowProps {
  playlist: Playlist;
  /** When true, hides the built-in header (parent renders it instead) */
  hideHeader?: boolean;
}

export function PlaylistRow({
  playlist,
  hideHeader = false,
}: PlaylistRowProps) {
  const { data: videos = [], isLoading } = usePlaylistVideos(playlist.id);

  if (isLoading) return <PlaylistRowSkeleton />;
  if (videos.length === 0) return null;

  return (
    <div className="mb-8" data-ocid="playlist_row.section">
      {!hideHeader && (
        <h2 className="font-semibold text-base mb-3">{playlist.name}</h2>
      )}
      <ScrollArea className="w-full" type="scroll">
        <div className="flex gap-3 pb-3">
          {videos.map((video) => (
            <PlaylistVideoCard key={video.id} video={video} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
