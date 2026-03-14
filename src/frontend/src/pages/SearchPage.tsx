import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Play, Search, User } from "lucide-react";
import { useActor } from "../hooks/useActor";
import { useStorage } from "../hooks/useStorage";

function useSearchAll(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["searchAll", term],
    queryFn: async () => {
      if (!actor || !term) return { videos: [], users: [] };
      const [videos, users] = await Promise.all([
        actor.searchVideos(term),
        actor.searchUsers(term),
      ]);
      return {
        videos: videos.slice(0, 20),
        users: users.slice(0, 20),
      };
    },
    enabled: !!actor && !isFetching && !!term,
  });
}

function formatViews(n: bigint): string {
  const v = Number(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M views`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K views`;
  return `${v} view${v !== 1 ? "s" : ""}`;
}

export default function SearchPage() {
  const { q = "" } = useSearch({ from: "/search" }) as { q?: string };
  const { data, isLoading } = useSearchAll(q);
  const { getBlobUrl } = useStorage();
  const navigate = useNavigate();

  const videos = data?.videos ?? [];
  const users = data?.users ?? [];
  const hasResults = videos.length > 0 || users.length > 0;

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">
          {q ? `Results for "${q}"` : "Search"}
        </h1>
      </div>

      {!q ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="search.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            Enter a search term to find videos and channels
          </p>
        </div>
      ) : isLoading ? (
        <div
          className="flex items-center justify-center py-20"
          data-ocid="search.loading_state"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !hasResults ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          data-ocid="search.empty_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">No results found</p>
          <p className="text-muted-foreground mt-1">Try different keywords</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* USER / CHANNEL RESULTS */}
          {users.length > 0 && (
            <section data-ocid="search.users.section">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Channels ({users.length})
              </h2>
              <div className="flex flex-col gap-1">
                {users.map((user, idx) => {
                  const avatarUrl = user.avatarBlobId
                    ? getBlobUrl(user.avatarBlobId)
                    : "";
                  return (
                    <button
                      key={user.username}
                      type="button"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors text-left w-full"
                      data-ocid={`search.user.item.${idx + 1}`}
                      onClick={() =>
                        navigate({
                          to: "/channel/$userId",
                          params: {
                            userId: (user.userId as Principal).toString(),
                          },
                        })
                      }
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* VIDEO RESULTS */}
          {videos.length > 0 && (
            <section data-ocid="search.videos.section">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-muted-foreground" />
                Videos ({videos.length})
              </h2>
              <div className="flex flex-col gap-3">
                {videos.map((video, idx) => {
                  const thumbUrl = video.thumbnailBlobId
                    ? getBlobUrl(video.thumbnailBlobId)
                    : "";
                  return (
                    <button
                      key={video.id}
                      type="button"
                      className="flex gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors text-left w-full"
                      data-ocid={`search.video.item.${idx + 1}`}
                      onClick={() =>
                        navigate({ to: "/video/$id", params: { id: video.id } })
                      }
                    >
                      <div className="w-40 h-[90px] rounded-lg overflow-hidden bg-muted shrink-0">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-7 h-7 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <p className="font-semibold line-clamp-2 text-sm leading-snug">
                          {video.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatViews(video.viewCount)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
