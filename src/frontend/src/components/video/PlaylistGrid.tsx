import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ListVideo, PlayCircle } from "lucide-react";
import { useState } from "react";
import type { Playlist, Video } from "../../backend";
import { usePlaylistVideos } from "../../hooks/useQueries";
import { useStorage } from "../../hooks/useStorage";
import { formatDuration, formatViewCount } from "../../lib/formatters";

// ── Playlist thumbnail: shows first video's thumbnail ──────────────────────
function PlaylistThumbnail({ playlistId }: { playlistId: string }) {
  const { data: videos = [], isLoading } = usePlaylistVideos(playlistId);
  const { getBlobUrl } = useStorage();

  if (isLoading) {
    return <Skeleton className="w-full aspect-video rounded-xl" />;
  }

  const first = videos[0];
  const thumbUrl = first?.thumbnailBlobId
    ? getBlobUrl(first.thumbnailBlobId)
    : "";

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
          <ListVideo className="w-8 h-8 text-zinc-600" />
        </div>
      )}
      {/* video count badge */}
      <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded font-medium">
        {videos.length} {videos.length === 1 ? "video" : "videos"}
      </div>
      {/* play overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <PlayCircle className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
      </div>
    </div>
  );
}

// ── Playlist detail: vertical video list ─────────────────────────────────
function PlaylistVideoRow({ video, index }: { video: Video; index: number }) {
  const { getBlobUrl } = useStorage();
  const thumbUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";

  return (
    <Link
      to="/video/$id"
      params={{ id: video.id }}
      className="flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
      data-ocid={`library.playlist_detail.item.${index}`}
    >
      {/* thumbnail */}
      <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-muted">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-zinc-600" />
          </div>
        )}
        {video.duration > 0n && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration)}
          </span>
        )}
      </div>
      {/* info */}
      <div className="flex-1 min-w-0 py-1">
        <p className="font-semibold text-sm line-clamp-2 leading-snug mb-1 text-foreground">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatViewCount(video.viewCount)} views
        </p>
      </div>
    </Link>
  );
}

export function PlaylistDetail({
  playlist,
  onBack,
}: {
  playlist: Playlist;
  onBack: () => void;
}) {
  const { data: videos = [], isLoading } = usePlaylistVideos(playlist.id);

  return (
    <div
      className="animate-fade-in"
      data-ocid="library.playlist_detail.section"
    >
      {/* header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full hover:bg-white/10"
          data-ocid="library.playlist_detail.cancel_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="font-display font-bold text-xl">{playlist.name}</h2>
          {!isLoading && (
            <p className="text-xs text-muted-foreground">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </p>
          )}
        </div>
      </div>

      {/* list */}
      {isLoading ? (
        <div
          className="space-y-3"
          data-ocid="library.playlist_detail.loading_state"
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 p-2">
              <Skeleton className="flex-shrink-0 w-40 aspect-video rounded-lg" />
              <div className="flex-1 space-y-2 py-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="library.playlist_detail.empty_state"
        >
          <ListVideo className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-semibold">No videos in this playlist</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add videos from the watch page.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-col gap-1"
          data-ocid="library.playlist_detail.list"
        >
          {videos.map((video, i) => (
            <PlaylistVideoRow key={video.id} video={video} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── PlaylistGrid: main grid component ────────────────────────────────────
interface PlaylistGridProps {
  playlists: Playlist[];
  isLoading: boolean;
  onPlaylistClick: (playlist: Playlist) => void;
}

export function PlaylistGrid({
  playlists,
  isLoading,
  onPlaylistClick,
}: PlaylistGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        data-ocid="library.playlists.loading_state"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="library.playlists.empty_state"
      >
        <ListVideo className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="font-semibold mb-1">No playlists yet</p>
        <p className="text-sm text-muted-foreground">
          Tap Save on any video to add it to a playlist.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      data-ocid="library.playlists.list"
    >
      {playlists.map((pl, i) => (
        <button
          key={pl.id}
          type="button"
          onClick={() => onPlaylistClick(pl)}
          className="group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
          data-ocid={`library.playlist.card.${i + 1}`}
        >
          <PlaylistThumbnail playlistId={pl.id} />
          <div className="mt-2 px-0.5">
            <p className="font-semibold text-sm line-clamp-2 leading-snug text-foreground group-hover:text-primary transition-colors">
              {pl.name}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
