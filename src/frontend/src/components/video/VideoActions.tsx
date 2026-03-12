import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import { Bookmark, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import type { Video } from "../../backend";
import { formatNumber } from "../../lib/formatters";
import SubscribeButton from "../channel/SubscribeButton";

interface VideoActionsProps {
  video: Video;
  onLike: () => void;
  liking?: boolean;
  isOwnVideo?: boolean;
}

export default function VideoActions({
  video,
  onLike,
  liking,
  isOwnVideo,
}: VideoActionsProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div
      className="flex flex-wrap items-center gap-2 py-3 border-y border-border"
      data-ocid="video_actions.section"
    >
      {/* Subscribe */}
      {!isOwnVideo && <SubscribeButton channelOwnerId={video.uploaderUserId} />}

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Like */}
        <Button
          variant="outline"
          size="sm"
          onClick={onLike}
          disabled={liking}
          className="gap-1.5 rounded-full"
          data-ocid="video_actions.toggle"
        >
          <ThumbsUp className="w-4 h-4" />
          {video.likeCount > 0n ? formatNumber(video.likeCount) : "Like"}
        </Button>

        {/* Dislike */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full"
          data-ocid="video_actions.secondary_button"
        >
          <ThumbsDown className="w-4 h-4" />
          Dislike
        </Button>

        {/* Share */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="gap-1.5 rounded-full"
          data-ocid="video_actions.secondary_button"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        {/* Save */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full hidden sm:flex"
          data-ocid="video_actions.secondary_button"
        >
          <Bookmark className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
