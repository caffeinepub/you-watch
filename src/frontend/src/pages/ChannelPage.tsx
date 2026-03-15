import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@icp-sdk/core/principal";
import { useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Video } from "../backend";
import ChannelHeader from "../components/channel/ChannelHeader";
import EditVideoModal from "../components/video/EditVideoModal";
import VideoGrid from "../components/video/VideoGrid";
import { useAuthContext } from "../context/AuthContext";
import { useChannel } from "../hooks/useChannel";
import { useAllVideos, useDeleteVideo } from "../hooks/useVideos";

export default function ChannelPage() {
  const { userId } = useParams({ from: "/channel/$userId" });
  const { identity } = useAuthContext();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  let principal: Principal | null = null;
  try {
    principal = Principal.fromText(userId);
  } catch {
    principal = null;
  }

  const { data: channelData, isLoading: channelLoading } = useChannel(
    principal,
    10_000,
  );
  const { data: allVideos = [], isLoading: videosLoading } = useAllVideos();
  const deleteVideoMutation = useDeleteVideo();

  const isOwner = !!identity && identity.getPrincipal().toString() === userId;

  const channelVideos = useMemo(
    () =>
      allVideos.filter(
        (v) => v.uploaderUserId.toString() === userId && !deletedIds.has(v.id),
      ),
    [allVideos, userId, deletedIds],
  );

  const handleDelete = useCallback(
    (videoId: string) => {
      deleteVideoMutation.mutate(videoId, {
        onSuccess: () => {
          setDeletedIds((prev) => new Set([...prev, videoId]));
          toast.success("Video deleted");
        },
        onError: () => {
          toast.error("Failed to delete video. Please try again.");
        },
      });
    },
    [deleteVideoMutation],
  );

  const handleEdit = useCallback(
    (videoId: string) => {
      const video = channelVideos.find((v) => v.id === videoId);
      if (video) {
        setEditingVideo(video);
      }
    },
    [channelVideos],
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
        isOwner={isOwner}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />

      <EditVideoModal
        open={!!editingVideo}
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
      />
    </div>
  );
}
