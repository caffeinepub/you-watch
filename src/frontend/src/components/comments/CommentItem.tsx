import { useNavigate } from "@tanstack/react-router";
import { ThumbsUp } from "lucide-react";
import type { Comment } from "../../backend";
import { useAuthContext } from "../../context/AuthContext";
import { useLikeComment, useUserProfile } from "../../hooks/useQueries";
import { useStorage } from "../../hooks/useStorage";
import { formatNumber, formatTimeAgo } from "../../lib/formatters";

interface CommentItemProps {
  comment: Comment;
  index: number;
}

export default function CommentItem({ comment, index }: CommentItemProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { mutate: likeComment } = useLikeComment();
  const { data: authorProfile } = useUserProfile(comment.authorUserId);
  const { getBlobUrl } = useStorage();

  const avatarUrl = authorProfile?.avatarBlobId
    ? getBlobUrl(authorProfile.avatarBlobId)
    : "";

  const displayName =
    authorProfile?.displayName ||
    authorProfile?.username ||
    `${comment.authorUserId.toString().slice(0, 8)}...`;

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }
    likeComment(comment.id);
  };

  return (
    <div className="flex gap-3" data-ocid={`comments.item.${index}`}>
      <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full brand-gradient flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {displayName[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">
          {comment.text}
        </p>
        <button
          type="button"
          onClick={handleLike}
          className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-ocid={`comments.toggle.${index}`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          {comment.likeCount > 0n && (
            <span>{formatNumber(comment.likeCount)}</span>
          )}
        </button>
      </div>
    </div>
  );
}
