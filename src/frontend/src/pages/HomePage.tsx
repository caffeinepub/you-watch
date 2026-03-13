import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Sparkles, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type { Video } from "../backend";
import AIAssistantButton from "../components/common/AIAssistantButton";
import VideoCard from "../components/video/VideoCard";
import { useAllVideos } from "../hooks/useVideos";

function VideoRow({
  videos,
  isLoading,
}: { videos: Video[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {["a", "b", "c", "d"].map((k) => (
          <div key={k} className="min-w-[280px]">
            <Skeleton className="aspect-video rounded-lg mb-2" />
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
      {videos.map((video) => (
        <div key={video.id} className="min-w-[280px] max-w-[280px]">
          <VideoCard video={video} />
        </div>
      ))}
    </div>
  );
}

const SECTIONS = [
  { id: "trending" as const, label: "Trending", icon: TrendingUp },
  { id: "latest" as const, label: "Latest", icon: Clock },
  { id: "recommended" as const, label: "Recommended For You", icon: Sparkles },
];

export default function HomePage() {
  const { data: allVideos = [], isLoading } = useAllVideos();

  const sections = useMemo(() => {
    const ready = allVideos.filter((v) => v.status !== "failed");
    const trending = [...ready]
      .sort((a, b) => Number(b.viewCount - a.viewCount))
      .slice(0, 10);
    const latest = [...ready]
      .sort((a, b) => Number(b.createdAt - a.createdAt))
      .slice(0, 10);
    const shuffled = [...ready].sort(() => Math.random() - 0.5).slice(0, 10);
    return { trending, latest, recommended: shuffled };
  }, [allVideos]);

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <div className="relative rounded-2xl overflow-hidden mb-8 h-36 md:h-52 brand-gradient flex items-center px-8">
        <div className="relative z-10">
          <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
            YOU <span className="opacity-80">WATCH</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-1">
            Discover, upload, and share incredible videos
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/10" />
      </div>

      {SECTIONS.map(({ id, label, icon: Icon }) => {
        const videos = sections[id];
        if (!isLoading && videos.length === 0) return null;
        return (
          <section key={id} className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Icon className="w-5 h-5 text-primary" />
                {label}
              </h2>
              <Link
                to="/explore"
                className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                data-ocid="home.link"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <VideoRow videos={videos} isLoading={isLoading} />
          </section>
        );
      })}

      {!isLoading && allVideos.length === 0 && (
        <div className="text-center py-20" data-ocid="home.empty_state">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">No videos yet</h3>
          <p className="text-muted-foreground">
            Be the first to upload a video!
          </p>
        </div>
      )}

      {/* Floating AI Assistant Button */}
      <AIAssistantButton />
    </div>
  );
}
