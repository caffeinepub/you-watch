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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import {
  BookMarked,
  ChevronDown,
  ChevronUp,
  Heart,
  ListVideo,
  Lock,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Playlist } from "../backend";
import { PlaylistRow } from "../components/video/PlaylistRow";
import VideoGrid from "../components/video/VideoGrid";
import { useAuthContext } from "../context/AuthContext";
import {
  useDeletePlaylist,
  useLikedVideos,
  useMyPlaylists,
} from "../hooks/useQueries";

const ORDER_KEY = "yw_playlist_order";

function getStoredOrder(): string[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOrder(order: string[]): void {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  } catch {
    // ignore
  }
}

function PlaylistsTab() {
  const { data: playlists = [], isLoading } = useMyPlaylists();
  const { mutate: deletePlaylist, isPending: deleting } = useDeletePlaylist();
  const [order, setOrder] = useState<string[]>([]);

  // Initialise/sync order when playlists load
  useEffect(() => {
    if (playlists.length === 0) return;
    const stored = getStoredOrder();
    // Merge: keep stored order for known ids, append new ids at end
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

  const movePlaylist = (index: number, direction: "up" | "down") => {
    const newOrder = [...order];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setOrder(newOrder);
    saveStoredOrder(newOrder);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i}>
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="flex gap-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex-shrink-0 w-44">
                  <Skeleton className="w-full aspect-video rounded-xl mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
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
    <div data-ocid="library.playlists.list">
      {sortedPlaylists.map((pl, index) => (
        <div key={pl.id} className="relative group">
          {/* Playlist controls header */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-base">{pl.name}</span>
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => movePlaylist(index, "up")}
                disabled={index === 0}
                aria-label="Move playlist up"
                data-ocid={`library.playlist.edit_button.${index + 1}`}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => movePlaylist(index, "down")}
                disabled={index === sortedPlaylists.length - 1}
                aria-label="Move playlist down"
                data-ocid={`library.playlist.edit_button.${index + 1}`}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    aria-label="Delete playlist"
                    data-ocid={`library.playlist.delete_button.${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete playlist?</AlertDialogTitle>
                    <AlertDialogDescription>
                      "{pl.name}" will be permanently deleted. This cannot be
                      undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-ocid="library.playlist.cancel_button">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        deletePlaylist(pl.id);
                        setOrder((prev) => prev.filter((id) => id !== pl.id));
                      }}
                      disabled={deleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-ocid="library.playlist.delete_button"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <PlaylistRow playlist={pl} hideHeader />
        </div>
      ))}
    </div>
  );
}

export default function LibraryPage() {
  const { isAuthenticated } = useAuthContext();
  const { data: likedVideos = [], isLoading } = useLikedVideos();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Your Library</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Login to access your playlists and liked videos.
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

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Library</h1>
      </div>

      <Tabs defaultValue="playlists">
        <TabsList className="mb-6">
          <TabsTrigger
            value="playlists"
            className="gap-2"
            data-ocid="library.tab"
          >
            <ListVideo className="w-4 h-4" /> Playlists
          </TabsTrigger>
          <TabsTrigger value="liked" className="gap-2" data-ocid="library.tab">
            <Heart className="w-4 h-4" /> Liked Videos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="playlists">
          <PlaylistsTab />
        </TabsContent>

        <TabsContent value="liked">
          <VideoGrid
            videos={likedVideos}
            isLoading={isLoading}
            emptyMessage="You haven't liked any videos yet. Start exploring!"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
