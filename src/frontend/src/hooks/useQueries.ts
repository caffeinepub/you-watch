import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useAllVideos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVideo(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["video", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVideo(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSearchVideos(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["search", term],
    queryFn: async () => {
      if (!actor || !term) return [];
      return actor.searchVideos(term);
    },
    enabled: !!actor && !isFetching && !!term,
  });
}

export function useComments(videoId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useChannel(userId: Principal | null, refetchInterval?: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["channel", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getChannel(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: refetchInterval,
  });
}

export function useIsSubscribed(channelOwnerId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subscribed", channelOwnerId?.toString()],
    queryFn: async () => {
      if (!actor || !channelOwnerId) return false;
      return actor.isSubscribedToChannel(channelOwnerId);
    },
    enabled: !!actor && !isFetching && !!channelOwnerId,
  });
}

export function useSubscriberStats(channelOwnerId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["subscriberStats", channelOwnerId?.toString()],
    queryFn: async () => {
      if (!actor || !channelOwnerId) return null;
      const result = await actor.getChannel(channelOwnerId);
      if (!result) return null;
      const [, count] = result;
      return { total: count };
    },
    enabled: !!actor && !isFetching && !!channelOwnerId,
    refetchInterval: 10_000,
  });
}

export function useLikedVideos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["likedVideos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLikedVideos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getUserProfile(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useLikeVideo() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.likeVideo(videoId);
    },
    onSuccess: (_, videoId) => {
      qc.invalidateQueries({ queryKey: ["video", videoId] });
      qc.invalidateQueries({ queryKey: ["videos"] });
      qc.invalidateQueries({ queryKey: ["likedVideos"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoId,
      text,
    }: { videoId: string; text: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addComment(videoId, text);
    },
    onSuccess: (_, { videoId }) => {
      qc.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });
}

export function useLikeComment() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.likeComment(commentId);
    },
  });
}

export function useSubscribe() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channelOwnerId,
      isSubscribed,
    }: {
      channelOwnerId: Principal;
      isSubscribed: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      if (isSubscribed) {
        await actor.unsubscribeFromChannel(channelOwnerId);
      } else {
        await actor.subscribeToChannel(channelOwnerId);
      }
    },
    onSuccess: (_, { channelOwnerId }) => {
      qc.invalidateQueries({
        queryKey: ["subscribed", channelOwnerId.toString()],
      });
      qc.invalidateQueries({
        queryKey: ["channel", channelOwnerId.toString()],
      });
      qc.invalidateQueries({
        queryKey: ["subscriberStats", channelOwnerId.toString()],
      });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: import("../backend").UserProfile) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// PLAYLIST HOOKS

export function useMyPlaylists() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myPlaylists"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPlaylists();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaylistVideos(playlistId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playlistVideos", playlistId],
    queryFn: async () => {
      if (!actor || !playlistId) return [];
      return actor.getPlaylistVideos(playlistId);
    },
    enabled: !!actor && !isFetching && !!playlistId,
  });
}

export function useVideoPlaylistIds(videoId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["videoPlaylistIds", videoId],
    queryFn: async () => {
      if (!actor || !videoId) return [];
      return actor.getVideoPlaylistIds(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.createPlaylist(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}

export function useAddVideoToPlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      videoId,
    }: { playlistId: string; videoId: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.addVideoToPlaylist(playlistId, videoId);
    },
    onSuccess: (_, { playlistId, videoId }) => {
      qc.invalidateQueries({ queryKey: ["playlistVideos", playlistId] });
      qc.invalidateQueries({ queryKey: ["videoPlaylistIds", videoId] });
    },
  });
}

export function useRemoveVideoFromPlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playlistId,
      videoId,
    }: { playlistId: string; videoId: string }) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeVideoFromPlaylist(playlistId, videoId);
    },
    onSuccess: (_, { playlistId, videoId }) => {
      qc.invalidateQueries({ queryKey: ["playlistVideos", playlistId] });
      qc.invalidateQueries({ queryKey: ["videoPlaylistIds", videoId] });
    },
  });
}

export function useDeletePlaylist() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playlistId: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deletePlaylist(playlistId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myPlaylists"] });
    },
  });
}
