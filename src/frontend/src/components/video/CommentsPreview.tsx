import { Button } from "@/components/ui/button";
import { ChevronDown, MessageSquare } from "lucide-react";
import { formatNumber } from "../../lib/formatters";

interface CommentsPreviewProps {
  commentCount: bigint;
  onExpand: () => void;
  expanded: boolean;
}

export default function CommentsPreview({
  commentCount,
  onExpand,
  expanded,
}: CommentsPreviewProps) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex items-center justify-between w-full bg-muted/40 hover:bg-muted/60 transition-colors rounded-xl px-4 py-3 mt-3"
      data-ocid="comments_preview.button"
    >
      <span className="flex items-center gap-2 font-semibold text-sm">
        <MessageSquare className="w-4 h-4 text-primary" />
        {formatNumber(commentCount)} Comments
      </span>
      <ChevronDown
        className={`w-4 h-4 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
