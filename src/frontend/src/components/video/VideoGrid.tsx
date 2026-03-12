import { Skeleton } from "@/components/ui/skeleton";
import type { Video } from "../../backend";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  isLoading?: boolean;
  emptyMessage?: string;
  channelNames?: Record<string, string>;
}

export default function VideoGrid({
  videos,
  isLoading,
  emptyMessage = "No videos found",
  channelNames,
}: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
          <div key={k} className="space-y-2">
            <Skeleton className="aspect-video rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        data-ocid="videos.empty_state"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>No videos</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.361a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video, i) => (
        <div key={video.id} data-ocid={`videos.item.${i + 1}`}>
          <VideoCard
            video={video}
            channelName={channelNames?.[video.uploaderUserId.toString()]}
          />
        </div>
      ))}
    </div>
  );
}
