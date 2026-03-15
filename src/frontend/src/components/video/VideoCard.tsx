import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
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
  isOwner?: boolean;
  onDelete?: (videoId: string) => void;
  onEdit?: (videoId: string) => void;
}

const CARD_GRADIENTS = [
  "from-purple-900/60 to-blue-900/60",
  "from-rose-900/60 to-orange-900/60",
  "from-teal-900/60 to-cyan-900/60",
  "from-violet-900/60 to-pink-900/60",
  "from-amber-900/60 to-yellow-900/60",
];

export default function VideoCard({
  video,
  channelName,
  isOwner,
  onDelete,
  onEdit,
}: VideoCardProps) {
  const { getBlobUrl } = useStorage();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const thumbnailUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";

  const gradientIndex = video.id.charCodeAt(0) % CARD_GRADIENTS.length;
  const gradient = CARD_GRADIENTS[gradientIndex];

  return (
    <>
      <div className="group block relative">
        <Link to="/video/$id" params={{ id: video.id }}>
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

        {isOwner && (
          // biome-ignore lint/a11y/useKeyWithClickEvents: presentation wrapper only stops propagation; real interaction is the button inside
          <div
            role="presentation"
            className="absolute top-1.5 right-1.5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-ocid="video.menu.button"
                  className="w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label="Video options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                data-ocid="video.menu.dropdown_menu"
              >
                <DropdownMenuItem
                  data-ocid="video.edit.button"
                  onClick={() => onEdit?.(video.id)}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit video
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="video.delete.button"
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-ocid="video.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the video from your channel, search
              results, and all playlists. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="video.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="video.delete.confirm_button"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() => {
                onDelete?.(video.id);
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
