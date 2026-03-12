import { Skeleton } from "@/components/ui/skeleton";
import type { Video } from "../../backend";
import SuggestedVideoCard from "./SuggestedVideoCard";

interface SuggestedVideosListProps {
  videos: Video[];
  currentVideoId: string;
  isLoading?: boolean;
}

export default function SuggestedVideosList({
  videos,
  currentVideoId,
  isLoading,
}: SuggestedVideosListProps) {
  const filtered = videos.filter((v) => v.id !== currentVideoId).slice(0, 20);

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="suggested.loading_state">
        {[...Array(6)].map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <div key={i} className="flex gap-2.5">
            <Skeleton className="w-36 aspect-video rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div
        className="text-sm text-muted-foreground text-center py-8"
        data-ocid="suggested.empty_state"
      >
        No suggested videos yet
      </div>
    );
  }

  return (
    <div className="space-y-1" data-ocid="suggested.list">
      <h3 className="font-display font-bold text-base mb-3">Up Next</h3>
      {filtered.map((video, i) => (
        <SuggestedVideoCard key={video.id} video={video} index={i} />
      ))}
    </div>
  );
}
