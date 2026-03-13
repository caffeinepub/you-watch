import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import CommentSection from "../components/comments/CommentSection";
import CommentsPreview from "../components/video/CommentsPreview";
import SuggestedVideosList from "../components/video/SuggestedVideosList";
import VideoActions from "../components/video/VideoActions";
import VideoDescription from "../components/video/VideoDescription";
import VideoInfo from "../components/video/VideoInfo";
import VideoPlayer from "../components/video/VideoPlayer";
import { useAuthContext } from "../context/AuthContext";
import { useChannel } from "../hooks/useChannel";
import { useStorage } from "../hooks/useStorage";
import { useAllVideos, useLikeVideo, useVideo } from "../hooks/useVideos";

export default function VideoPage() {
  const { id } = useParams({ from: "/video/$id" });
  const navigate = useNavigate();
  const { isAuthenticated, identity } = useAuthContext();
  const { getBlobUrl } = useStorage();
  const { data: video, isLoading } = useVideo(id);
  const { data: channelData } = useChannel(
    video?.uploaderUserId ?? null,
    10_000,
  );
  const { data: allVideos, isLoading: loadingSuggested } = useAllVideos();
  const { mutate: likeVideo, isPending: liking } = useLikeVideo();
  const [showComments, setShowComments] = useState(false);

  // ── Loading State ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="px-4 py-6 max-w-4xl mx-auto space-y-4"
        data-ocid="video.loading_state"
      >
        <Skeleton className="aspect-video rounded-xl" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────────
  if (!video) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
        data-ocid="video.error_state"
      >
        <h2 className="font-display font-bold text-2xl mb-2">
          Video not found
        </h2>
        <Button
          onClick={() => navigate({ to: "/" })}
          variant="outline"
          data-ocid="video.secondary_button"
        >
          Go Home
        </Button>
      </div>
    );
  }

  const videoUrl = video.videoBlobId ? getBlobUrl(video.videoBlobId) : "";
  const thumbUrl = video.thumbnailBlobId
    ? getBlobUrl(video.thumbnailBlobId)
    : "";
  const channel = channelData?.[0];
  const subscriberCount = channelData?.[1] ?? 0n;
  const isOwnVideo =
    identity?.getPrincipal().toString() === video.uploaderUserId.toString();

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }
    likeVideo(video.id);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <div className="px-4 py-4 max-w-4xl mx-auto animate-fade-in">
      {/* Back button row */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors"
          aria-label="Go back"
          data-ocid="video.secondary_button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-black text-lg tracking-tight">
          YOU <span className="text-primary">WATCH</span>
        </span>
      </div>

      {/* Main single-column content */}
      <div className="space-y-0">
        {/* 1. Video Player */}
        <VideoPlayer src={videoUrl} poster={thumbUrl} title={video.title} />

        {/* 2. Video Info: title, channel, views, upload time */}
        <VideoInfo
          video={video}
          channelName={channel?.name}
          channelAvatarBlobId={channel?.avatarBlobId}
          subscriberCount={subscriberCount}
          channelOwnerId={video.uploaderUserId}
        />

        {/* 3. Action Buttons: Like, Dislike, Share, Save, Download | Subscribe */}
        <VideoActions
          video={video}
          onLike={handleLike}
          liking={liking}
          isOwnVideo={isOwnVideo}
        />

        {/* 4. Description + Tags */}
        <VideoDescription video={video} />

        {/* 5. Comments */}
        <div className="mt-4">
          <CommentsPreview
            commentCount={video.commentCount}
            onExpand={() => setShowComments((p) => !p)}
            expanded={showComments}
          />
          {showComments && (
            <div className="mt-2 animate-fade-in">
              <CommentSection videoId={video.id} />
            </div>
          )}
        </div>

        {/* 6. Suggested Videos - BELOW comments */}
        <div className="mt-6 pb-6">
          <SuggestedVideosList
            videos={allVideos ?? []}
            currentVideoId={video.id}
            isLoading={loadingSuggested}
          />
        </div>
      </div>
    </div>
  );
}
