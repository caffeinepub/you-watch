import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@tanstack/react-router";
import { BookMarked, Heart, Lock } from "lucide-react";
import VideoGrid from "../components/video/VideoGrid";
import { useAuthContext } from "../context/AuthContext";
import { useLikedVideos } from "../hooks/useQueries";

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
          Login to access your liked videos and watch history.
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

      <Tabs defaultValue="liked">
        <TabsList className="mb-6">
          <TabsTrigger value="liked" className="gap-2" data-ocid="library.tab">
            <Heart className="w-4 h-4" /> Liked Videos
          </TabsTrigger>
        </TabsList>
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
