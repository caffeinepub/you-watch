import type { Principal } from "@icp-sdk/core/principal";
import type { Channel } from "../../backend";
import { useStorage } from "../../hooks/useStorage";
import { formatNumber } from "../../lib/formatters";
import SubscribeButton from "./SubscribeButton";

interface ChannelHeaderProps {
  channel: Channel;
  subscriberCount: bigint;
  currentUserPrincipal?: Principal;
}

export default function ChannelHeader({
  channel,
  subscriberCount,
  currentUserPrincipal,
}: ChannelHeaderProps) {
  const { getBlobUrl } = useStorage();
  const avatarUrl = channel.avatarBlobId
    ? getBlobUrl(channel.avatarBlobId)
    : "";
  const bannerUrl = channel.bannerBlobId
    ? getBlobUrl(channel.bannerBlobId)
    : "";

  const isOwner =
    currentUserPrincipal?.toString() === channel.userId.toString();

  return (
    <div className="mb-6">
      <div className="w-full h-36 md:h-52 rounded-xl overflow-hidden bg-gradient-to-br from-primary/30 to-secondary">
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="Channel banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-4 px-2">
        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted -mt-10 border-4 border-background shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={channel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full brand-gradient flex items-center justify-center">
              <span className="text-white font-display font-bold text-2xl">
                {channel.name[0]?.toUpperCase() ?? "C"}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold">{channel.name}</h1>
          <p className="text-muted-foreground text-sm">
            {formatNumber(subscriberCount)} subscribers
          </p>
          {channel.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {channel.description}
            </p>
          )}
        </div>

        {!isOwner && <SubscribeButton channelOwnerId={channel.userId} />}
      </div>
    </div>
  );
}
