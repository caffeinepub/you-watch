import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Bookmark,
  Check,
  Copy,
  Download,
  Facebook,
  Film,
  Loader2,
  MessageCircle,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Playlist, Video } from "../../backend";
import { useAuthContext } from "../../context/AuthContext";
import {
  useAddVideoToPlaylist,
  useCreatePlaylist,
  useMyPlaylists,
  usePlaylistVideos,
  useVideoPlaylistIds,
} from "../../hooks/useQueries";
import { useStorage } from "../../hooks/useStorage";
import { formatNumber } from "../../lib/formatters";

interface VideoActionsProps {
  video: Video;
  onLike: () => void;
  liking?: boolean;
  isOwnVideo?: boolean;
}

// ── Playlist thumbnail row ────────────────────────────────────────────────────
function PlaylistThumbnailItem({
  playlist,
  alreadySaved,
  isAdding,
  onSelect,
}: {
  playlist: Playlist;
  alreadySaved: boolean;
  isAdding: boolean;
  onSelect: (id: string) => void;
}) {
  const { getBlobUrl } = useStorage();
  const { data: videos = [] } = usePlaylistVideos(playlist.id);
  const firstVideo = videos[0];
  const thumbnailUrl = firstVideo?.thumbnailBlobId
    ? getBlobUrl(firstVideo.thumbnailBlobId)
    : null;
  const count = videos.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(playlist.id)}
      disabled={alreadySaved || isAdding}
      className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl transition-colors text-left ${
        alreadySaved
          ? "opacity-50 cursor-default"
          : "hover:bg-muted cursor-pointer"
      }`}
      data-ocid="save_playlist.button"
    >
      {/* Thumbnail */}
      <div className="w-16 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={playlist.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Film className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{playlist.name}</p>
        <p className="text-xs text-muted-foreground">
          {count} {count === 1 ? "video" : "videos"}
        </p>
      </div>

      {/* Status */}
      {isAdding ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
      ) : alreadySaved ? (
        <Check className="w-4 h-4 text-primary flex-shrink-0" />
      ) : null}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function VideoActions({
  video,
  onLike,
  liking,
}: VideoActionsProps) {
  const { isAuthenticated } = useAuthContext();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [addingToId, setAddingToId] = useState<string | null>(null);

  const { data: playlists = [], isLoading: loadingPlaylists } =
    useMyPlaylists();
  const { data: savedInPlaylistIds = [] } = useVideoPlaylistIds(video.id);
  const createPlaylist = useCreatePlaylist();
  const addVideo = useAddVideoToPlaylist();

  const handleLike = () => {
    setLiked((prev) => !prev);
    if (disliked) setDisliked(false);
    onLike();
  };

  const handleDislike = () => {
    setDisliked((prev) => !prev);
    if (liked) {
      setLiked(false);
      onLike();
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: video.title, url: window.location.href });
    } else {
      setShowShareSheet(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
    setShowShareSheet(false);
  };

  const handleShareTo = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(video.title);
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${title}%20${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
      messages: `sms:?body=${title}%20${url}`,
    };
    if (shareUrls[platform]) window.open(shareUrls[platform], "_blank");
    setShowShareSheet(false);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save videos.");
      return;
    }
    if (savedInPlaylistIds.includes(playlistId)) return;
    setAddingToId(playlistId);
    try {
      await addVideo.mutateAsync({ playlistId, videoId: video.id });
      toast.success("Saved to playlist");
      setShowSaveDialog(false);
    } catch {
      toast.error("Unable to save. Please try again.");
    } finally {
      setAddingToId(null);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error("Enter a playlist name");
      return;
    }
    if (!isAuthenticated) {
      toast.error("Please log in to create playlists.");
      return;
    }
    try {
      const newId = await createPlaylist.mutateAsync(newPlaylistName.trim());
      await addVideo.mutateAsync({ playlistId: newId, videoId: video.id });
      toast.success("Saved to playlist");
      setNewPlaylistName("");
      setShowSaveDialog(false);
    } catch {
      toast.error("Unable to create playlist. Please try again.");
    }
  };

  const handleDownload = () => {
    toast.info("Download is available for Premium members only.", {
      description: "Upgrade to Premium to enable offline playback.",
    });
  };

  const isSaved = savedInPlaylistIds.length > 0;

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-2 py-3 border-y border-border"
        data-ocid="video_actions.section"
      >
        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          {/* Like */}
          <Button
            variant={liked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
            disabled={liking}
            className={`gap-1.5 rounded-full ${
              liked
                ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                : ""
            }`}
            data-ocid="video_actions.toggle"
          >
            <ThumbsUp className="w-4 h-4" />
            {video.likeCount > 0n ? formatNumber(video.likeCount) : "Like"}
          </Button>

          {/* Dislike */}
          <Button
            variant={disliked ? "secondary" : "outline"}
            size="sm"
            onClick={handleDislike}
            className="gap-1.5 rounded-full"
            data-ocid="video_actions.secondary_button"
          >
            <ThumbsDown className="w-4 h-4" />
            Dislike
          </Button>

          {/* Share */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 rounded-full"
            data-ocid="video_actions.secondary_button"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>

          {/* Save */}
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowSaveDialog(true)}
            className="gap-1.5 rounded-full"
            data-ocid="video_actions.open_modal_button"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>

          {/* Download */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-1.5 rounded-full"
            data-ocid="video_actions.secondary_button"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl"
          data-ocid="video_actions.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Share Video</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Copy Link",
                icon: <Copy className="w-5 h-5" />,
                bg: "bg-muted",
                action: handleCopyLink,
              },
              {
                label: "Messages",
                icon: <MessageCircle className="w-5 h-5 text-blue-600" />,
                bg: "bg-blue-100 dark:bg-blue-900",
                action: () => handleShareTo("messages"),
              },
              {
                label: "WhatsApp",
                icon: (
                  <span className="text-green-600 font-bold text-sm">WA</span>
                ),
                bg: "bg-green-100 dark:bg-green-900",
                action: () => handleShareTo("whatsapp"),
              },
              {
                label: "Facebook",
                icon: <Facebook className="w-5 h-5 text-white" />,
                bg: "bg-blue-600",
                action: () => handleShareTo("facebook"),
              },
              {
                label: "Twitter",
                icon: <Twitter className="w-5 h-5 text-white" />,
                bg: "bg-black",
                action: () => handleShareTo("twitter"),
              },
            ].map(({ label, icon, bg, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors"
                data-ocid="video_actions.button"
              >
                <div
                  className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}
                >
                  {icon}
                </div>
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Save to Playlist Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent data-ocid="video_actions.dialog">
          <DialogHeader>
            <DialogTitle>Save to playlist</DialogTitle>
          </DialogHeader>

          {/* Existing playlists with thumbnails */}
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {loadingPlaylists ? (
              <div
                className="flex items-center justify-center py-6"
                data-ocid="video_actions.loading_state"
              >
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : playlists.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-3"
                data-ocid="video_actions.empty_state"
              >
                No playlists yet. Create one below.
              </p>
            ) : (
              playlists.map((pl) => (
                <PlaylistThumbnailItem
                  key={pl.id}
                  playlist={pl}
                  alreadySaved={savedInPlaylistIds.includes(pl.id)}
                  isAdding={addingToId === pl.id}
                  onSelect={handleAddToPlaylist}
                />
              ))
            )}
          </div>

          {/* Create new playlist */}
          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              New playlist
            </p>
            <Input
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              className="w-full"
              data-ocid="video_actions.input"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleCreatePlaylist}
                disabled={createPlaylist.isPending || addVideo.isPending}
                data-ocid="video_actions.save_button"
              >
                {createPlaylist.isPending || addVideo.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : null}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSaveDialog(false);
                  setNewPlaylistName("");
                }}
                data-ocid="video_actions.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
