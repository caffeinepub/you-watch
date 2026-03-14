import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Play, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Video } from "../backend";
import AIAssistantButton from "../components/common/AIAssistantButton";
import StoriesRow from "../components/stories/StoriesRow";
import VideoCard from "../components/video/VideoCard";
import { useStorage } from "../hooks/useStorage";
import { useAllVideos } from "../hooks/useVideos";
import { formatResumeTime, getAllProgress } from "../hooks/useWatchProgress";

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

function ContinueWatchingCard({
  video,
  currentTime,
  duration,
}: {
  video: Video;
  currentTime: number;
  duration: number;
}) {
  const { getBlobUrl } = useStorage();
  const thumbnailUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";
  const pct = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <Link
      to="/video/$id"
      params={{ id: video.id }}
      className="flex-shrink-0 w-[280px] group"
      data-ocid="home.continue_watching.card"
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
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-sm font-semibold line-clamp-2 leading-snug mb-1">
        {video.title}
      </p>
      <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
        <Play className="w-3 h-3 fill-red-500" />
        Resume at {formatResumeTime(currentTime)}
      </p>
    </Link>
  );
}

const SECTIONS = [
  { id: "trending" as const, label: "Trending", icon: TrendingUp },
  { id: "latest" as const, label: "Latest", icon: Clock },
  { id: "recommended" as const, label: "Recommended For You", icon: Sparkles },
];

export default function HomePage() {
  const { data: allVideos = [], isLoading } = useAllVideos();
  const [openStoryId, setOpenStoryId] = useState<string | undefined>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("openStory") ?? undefined;
  });

  // Listen for popstate (from notification tap) to pick up openStory param
  useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("openStory");
      if (id) setOpenStoryId(id);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Clear openStoryId from URL once consumed
  useEffect(() => {
    if (!openStoryId) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("openStory");
    window.history.replaceState({}, "", url.toString());
  }, [openStoryId]);

  const continueWatching = useMemo(() => {
    const progressEntries = getAllProgress();
    return progressEntries
      .map((entry) => {
        const video = allVideos.find((v) => v.id === entry.videoId);
        if (!video) return null;
        if (entry.currentTime <= 5) return null;
        if (entry.duration > 0 && entry.currentTime >= entry.duration - 5)
          return null;
        return {
          video,
          currentTime: entry.currentTime,
          duration: entry.duration,
        };
      })
      .filter(Boolean) as Array<{
      video: Video;
      currentTime: number;
      duration: number;
    }>;
  }, [allVideos]);

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
      <div className="relative rounded-2xl overflow-hidden mb-6 h-36 md:h-52 brand-gradient flex items-center px-8">
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

      {/* Stories row */}
      <section className="mb-6" data-ocid="home.stories.section">
        <StoriesRow openStoryId={openStoryId} />
      </section>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="mb-8" data-ocid="home.continue_watching.section">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500 fill-red-500" />
              Continue Watching
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {continueWatching.map(({ video, currentTime, duration }) => (
              <ContinueWatchingCard
                key={video.id}
                video={video}
                currentTime={currentTime}
                duration={duration}
              />
            ))}
          </div>
        </section>
      )}

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

      <AIAssistantButton />
    </div>
  );
}
