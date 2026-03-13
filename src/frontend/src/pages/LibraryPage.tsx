import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { BookMarked, Heart, ListVideo, Lock } from "lucide-react";
import { PlaylistRow } from "../components/video/PlaylistRow";
import VideoGrid from "../components/video/VideoGrid";
import { useAuthContext } from "../context/AuthContext";
import { useLikedVideos, useMyPlaylists } from "../hooks/useQueries";

function PlaylistsTab() {
  const { data: playlists = [], isLoading } = useMyPlaylists();

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
      {playlists.map((pl) => (
        <PlaylistRow key={pl.id} playlist={pl} />
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
