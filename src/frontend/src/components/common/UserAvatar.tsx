import { useStorage } from "../../hooks/useStorage";
import { initials } from "../../lib/formatters";

interface UserAvatarProps {
  name: string;
  blobId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-14 h-14 text-lg",
};

export default function UserAvatar({
  name,
  blobId,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const { getBlobUrl } = useStorage();
  const avatarUrl = blobId ? getBlobUrl(blobId) : "";

  return (
    <div
      className={`${sizeMap[size]} rounded-full overflow-hidden bg-muted shrink-0 ${className}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full brand-gradient flex items-center justify-center">
          <span className="text-white font-bold">{initials(name) || "U"}</span>
        </div>
      )}
    </div>
  );
}
