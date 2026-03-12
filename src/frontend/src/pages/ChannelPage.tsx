import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import ChannelHeader from "../components/channel/ChannelHeader";
import VideoGrid from "../components/video/VideoGrid";
import { useAuthContext } from "../context/AuthContext";
import { useChannel } from "../hooks/useChannel";
import { useAllVideos } from "../hooks/useVideos";

export default function ChannelPage() {
  const { userId } = useParams({ from: "/channel/$userId" });
  const { identity } = useAuthContext();

  let principal: Principal | null = null;
  try {
    principal = Principal.fromText(userId);
  } catch {
    principal = null;
  }

  const { data: channelData, isLoading: channelLoading } =
    useChannel(principal);
  const { data: allVideos = [], isLoading: videosLoading } = useAllVideos();

  const channelVideos = useMemo(
    () => allVideos.filter((v) => v.uploaderUserId.toString() === userId),
    [allVideos, userId],
  );

  if (channelLoading) {
    return (
      <div className="px-4 py-6 max-w-screen-2xl mx-auto">
        <Skeleton className="w-full h-36 md:h-52 rounded-xl mb-6" />
        <div className="flex gap-4 items-end mb-8">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div
        className="flex items-center justify-center min-h-[50vh] text-muted-foreground"
        data-ocid="channel.error_state"
      >
        Channel not found
      </div>
    );
  }

  const [channel, subscriberCount] = channelData;

  return (
    <div className="px-4 py-6 max-w-screen-2xl mx-auto animate-fade-in">
      <ChannelHeader
        channel={channel}
        subscriberCount={subscriberCount}
        currentUserPrincipal={identity?.getPrincipal()}
      />

      <h2 className="font-display font-bold text-lg mb-4">Videos</h2>
      <VideoGrid
        videos={channelVideos}
        isLoading={videosLoading}
        emptyMessage="This channel hasn't uploaded any videos yet"
      />
    </div>
  );
}
