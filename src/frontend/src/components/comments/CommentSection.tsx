import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../../context/AuthContext";
import { useAddComment, useComments } from "../../hooks/useQueries";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
  videoId: string;
}

export default function CommentSection({ videoId }: CommentSectionProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();
  const { data: comments = [], isLoading } = useComments(videoId);
  const { mutate: addComment, isPending } = useAddComment();
  const [commentText, setCommentText] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate({ to: "/auth" });
      return;
    }
    if (!commentText.trim()) return;
    addComment(
      { videoId, text: commentText.trim() },
      {
        onSuccess: () => {
          setCommentText("");
          setFocused(false);
          toast.success("Comment posted!");
        },
        onError: () => toast.error("Failed to post comment"),
      },
    );
  };

  return (
    <div className="mt-6">
      <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        {comments.length} Comments
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={
            isAuthenticated ? "Add a comment..." : "Login to comment"
          }
          rows={focused ? 3 : 1}
          className="resize-none transition-all"
          data-ocid="comments.textarea"
        />
        {focused && (
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFocused(false);
                setCommentText("");
              }}
              data-ocid="comments.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !commentText.trim()}
              className="brand-gradient text-primary-foreground"
              data-ocid="comments.submit_button"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Comment"
              )}
            </Button>
          </div>
        )}
      </form>

      {isLoading ? (
        <div className="space-y-4" data-ocid="comments.loading_state">
          {["a", "b", "c"].map((k) => (
            <div key={k} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div
          className="text-center py-10 text-muted-foreground"
          data-ocid="comments.empty_state"
        >
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map((comment, i) => (
            <CommentItem key={comment.id} comment={comment} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
