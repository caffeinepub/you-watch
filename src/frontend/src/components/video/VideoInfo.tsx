import type { Principal } from "@icp-sdk/core/principal";
import { useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import type { Video } from "../../backend";
import { useAuthContext } from "../../context/AuthContext";
import { useStorage } from "../../hooks/useStorage";
import { formatTimeAgo, formatViewCount } from "../../lib/formatters";
import SubscribeButton from "../channel/SubscribeButton";

interface VideoInfoProps {
  video: Video;
  channelName?: string;
  channelAvatarBlobId?: string;
  subscriberCount?: bigint;
  channelOwnerId?: Principal;
}

export default function VideoInfo({
  video,
  channelName,
  channelAvatarBlobId,
  subscriberCount,
  channelOwnerId,
}: VideoInfoProps) {
  const { getBlobUrl } = useStorage();
  const navigate = useNavigate();
  const { identity } = useAuthContext();

  const isOwner =
    identity?.getPrincipal().toString() === channelOwnerId?.toString();

  const goToChannel = () => {
    navigate({
      to: "/channel/$userId",
      params: { userId: video.uploaderUserId.toString() },
    });
  };

  return (
    <div className="mt-3" data-ocid="video_info.section">
      {/* Title */}
      <h1 className="font-display font-bold text-xl md:text-2xl leading-tight mb-2">
        {video.title}
      </h1>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
        {channelName && (
          <button
            type="button"
            onClick={goToChannel}
            className="font-medium text-foreground hover:text-primary transition-colors"
            data-ocid="video_info.link"
          >
            {channelName}
          </button>
        )}
        {channelName && <span>•</span>}
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {formatViewCount(video.viewCount)} views
        </span>
        <span>•</span>
        <span>{formatTimeAgo(video.createdAt)}</span>
        {video.category && (
          <>
            <span>•</span>
            <span className="text-primary font-medium">{video.category}</span>
          </>
        )}
      </div>

      {/* Channel row */}
      {channelName && (
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={goToChannel}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {channelAvatarBlobId ? (
                <img
                  src={getBlobUrl(channelAvatarBlobId)}
                  alt={channelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full brand-gradient flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {channelName[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{channelName}</p>
              {subscriberCount !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {formatViewCount(subscriberCount)} subscribers
                </p>
              )}
            </div>
          </button>
          {channelOwnerId && !isOwner && (
            <SubscribeButton channelOwnerId={channelOwnerId} />
          )}
        </div>
      )}
    </div>
  );
}
