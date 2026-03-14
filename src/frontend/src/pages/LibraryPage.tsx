import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookMarked,
  ChevronRight,
  ListVideo,
  Lock,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Playlist, Video } from "../backend";
import { PlaylistDetail, PlaylistGrid } from "../components/video/PlaylistGrid";
import { useAuthContext } from "../context/AuthContext";
import { useDeletePlaylist, useMyPlaylists } from "../hooks/useQueries";
import { useStorage } from "../hooks/useStorage";
import { useAllVideos } from "../hooks/useVideos";
import {
  clearProgress,
  formatResumeTime,
  getAllProgress,
} from "../hooks/useWatchProgress";
import { formatDuration } from "../lib/formatters";

// ── Playlist order helpers ────────────────────────────────────────────────
const ORDER_KEY = "yw_playlist_order";

function getStoredOrder(): string[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Continue Watching card ────────────────────────────────────────────────
function ContinueWatchingCard({
  video,
  currentTime,
  duration,
  onRemove,
}: {
  video: Video;
  currentTime: number;
  duration: number;
  onRemove: () => void;
}) {
  const { getBlobUrl } = useStorage();
  const thumbUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="relative flex-shrink-0 w-60 group"
      data-ocid="library.continue_watching.card"
    >
      <Link to="/video/$id" params={{ id: video.id }}>
        <div className="relative rounded-xl overflow-hidden bg-muted aspect-video mb-2">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
          {/* duration badge */}
          {video.duration > 0n && (
            <span className="absolute bottom-5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {formatDuration(video.duration)}
            </span>
          )}
          {/* progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-red-500 transition-none"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        <p className="text-sm font-semibold line-clamp-2 leading-snug mb-0.5">
          {video.title}
        </p>
        <p className="text-xs text-red-500 font-medium">
          Resume at {formatResumeTime(currentTime)}
        </p>
      </Link>
      {/* remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black z-10"
        aria-label="Remove from continue watching"
        data-ocid="library.continue_watching.delete_button"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Continue Watching vertical list item ─────────────────────────────────
function ContinueWatchingListItem({
  video,
  currentTime,
  duration,
  index,
  onRemove,
}: {
  video: Video;
  currentTime: number;
  duration: number;
  index: number;
  onRemove: () => void;
}) {
  const { getBlobUrl } = useStorage();
  const thumbUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="flex gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group"
      data-ocid={`library.continue_watching_all.item.${index}`}
    >
      <Link
        to="/video/$id"
        params={{ id: video.id }}
        className="flex gap-3 flex-1 min-w-0"
      >
        <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-muted">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800" />
          )}
          {video.duration > 0n && (
            <span className="absolute bottom-4 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {formatDuration(video.duration)}
            </span>
          )}
          {/* progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-red-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <p className="font-semibold text-sm line-clamp-2 leading-snug mb-1">
            {video.title}
          </p>
          <p className="text-xs text-red-500 font-medium">
            Resume at {formatResumeTime(currentTime)}
          </p>
        </div>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 self-center w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Remove"
        data-ocid={`library.continue_watching_all.delete_button.${index}`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Continue Watching section ─────────────────────────────────────────────
function ContinueWatchingSection({
  viewAll,
  onViewAll,
  onBack,
}: {
  viewAll: boolean;
  onViewAll: () => void;
  onBack: () => void;
}) {
  const { data: allVideos = [], isLoading } = useAllVideos();
  const [progressItems, setProgressItems] = useState(() => getAllProgress());

  // Refresh progress entries after removal
  const refresh = () => setProgressItems(getAllProgress());

  const handleRemove = (videoId: string) => {
    clearProgress(videoId);
    refresh();
  };

  // Match progress records with video objects, filter qualifying entries
  const items = progressItems
    .filter((p) => {
      if (p.currentTime <= 5) return false;
      if (p.duration > 0 && p.duration - p.currentTime <= 5) return false;
      return true;
    })
    .slice(0, 20)
    .flatMap((p) => {
      const video = allVideos.find((v) => v.id === p.videoId);
      if (!video) return [];
      return [{ video, currentTime: p.currentTime, duration: p.duration }];
    });

  if (isLoading) {
    return (
      <section className="mb-8" data-ocid="library.continue_watching.section">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-60">
              <Skeleton className="w-full aspect-video rounded-xl mb-2" />
              <Skeleton className="h-3.5 w-full mb-1.5" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  // ── View All mode ────────────────────────────────────────────
  if (viewAll) {
    return (
      <section
        className="mb-8 animate-fade-in"
        data-ocid="library.continue_watching_all.section"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full hover:bg-white/10"
            data-ocid="library.continue_watching_all.cancel_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-display font-bold text-xl">Continue Watching</h2>
        </div>
        <div className="flex flex-col gap-1">
          {items.map(({ video, currentTime, duration }, i) => (
            <ContinueWatchingListItem
              key={video.id}
              video={video}
              currentTime={currentTime}
              duration={duration}
              index={i + 1}
              onRemove={() => handleRemove(video.id)}
            />
          ))}
        </div>
      </section>
    );
  }

  // ── Default horizontal scroll row ────────────────────────────
  return (
    <section className="mb-8" data-ocid="library.continue_watching.section">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-lg">Continue Watching</h2>
        {items.length > 3 && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            data-ocid="library.continue_watching.link"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
        data-ocid="library.continue_watching.list"
      >
        {items.map(({ video, currentTime, duration }) => (
          <ContinueWatchingCard
            key={video.id}
            video={video}
            currentTime={currentTime}
            duration={duration}
            onRemove={() => handleRemove(video.id)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Playlists section ─────────────────────────────────────────────────────
function PlaylistsSection({
  onPlaylistClick,
}: {
  onPlaylistClick: (pl: Playlist) => void;
}) {
  const { data: playlists = [], isLoading } = useMyPlaylists();
  const { mutate: deletePlaylist, isPending: deleting } = useDeletePlaylist();
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    if (playlists.length === 0) return;
    const stored = getStoredOrder();
    const allIds = playlists.map((p) => p.id);
    const merged = [
      ...stored.filter((id) => allIds.includes(id)),
      ...allIds.filter((id) => !stored.includes(id)),
    ];
    setOrder(merged);
  }, [playlists]);

  const sortedPlaylists =
    order.length > 0
      ? (order
          .map((id) => playlists.find((p) => p.id === id))
          .filter(Boolean) as Playlist[])
      : playlists;

  return (
    <section data-ocid="library.playlists.section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListVideo className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg">Playlists</h2>
        </div>

        {playlists.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                data-ocid="library.playlists.edit_button"
              >
                <Settings2 className="w-4 h-4" /> Manage
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="library.playlists.modal">
              <AlertDialogHeader>
                <AlertDialogTitle>Manage Playlists</AlertDialogTitle>
                <AlertDialogDescription>
                  Select a playlist to delete it permanently.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2 max-h-72 overflow-y-auto py-2">
                {sortedPlaylists.map((pl, i) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                    data-ocid={`library.manage.item.${i + 1}`}
                  >
                    <span className="text-sm font-medium truncate flex-1 mr-2">
                      {pl.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                      disabled={deleting}
                      onClick={() => {
                        deletePlaylist(pl.id);
                        setOrder((prev) => prev.filter((id) => id !== pl.id));
                      }}
                      aria-label={`Delete ${pl.name}`}
                      data-ocid={`library.manage.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel data-ocid="library.playlists.cancel_button">
                  Done
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <PlaylistGrid
        playlists={sortedPlaylists}
        isLoading={isLoading}
        onPlaylistClick={onPlaylistClick}
      />
    </section>
  );
}

// ── Main LibraryPage ──────────────────────────────────────────────────────
export default function LibraryPage() {
  const { isAuthenticated } = useAuthContext();
  const [viewAllContinue, setViewAllContinue] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(
    null,
  );

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Your Library</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Login to access your playlists and continue watching.
        </p>
        <Link to="/auth">
          <Button
            className="brand-gradient text-primary-foreground rounded-full px-8"
            data-ocid="library.primary_button"
          >
            Login
          </Button>
        </Link>
      </div>
    );
  }

  // ── Playlist detail view ──────────────────────────────────────
  if (selectedPlaylist) {
    return (
      <div className="px-4 py-6 max-w-screen-2xl mx-auto">
        <PlaylistDetail
          playlist={selectedPlaylist}
          onBack={() => setSelectedPlaylist(null)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      {/* page header — hidden when viewing all continue watching */}
      {!viewAllContinue && (
        <div className="flex items-center gap-3 mb-6">
          <BookMarked className="w-6 h-6 text-primary" />
          <h1 className="font-display font-bold text-2xl">Library</h1>
        </div>
      )}

      {/* Section 1: Continue Watching */}
      <ContinueWatchingSection
        viewAll={viewAllContinue}
        onViewAll={() => setViewAllContinue(true)}
        onBack={() => setViewAllContinue(false)}
      />

      {/* Section 2: Playlists (hidden while in view-all mode) */}
      {!viewAllContinue && (
        <PlaylistsSection onPlaylistClick={setSelectedPlaylist} />
      )}
    </div>
  );
}
