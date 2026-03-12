import { useState } from "react";
import type { Video } from "../../backend";

interface VideoDescriptionProps {
  video: Video;
}

export default function VideoDescription({ video }: VideoDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!video.description && video.tags.length === 0) return null;

  return (
    <div
      className="bg-muted/40 rounded-xl p-3 mt-3"
      data-ocid="video_description.section"
    >
      {video.description && (
        <div
          className={`text-sm text-foreground/80 whitespace-pre-wrap ${
            !expanded ? "line-clamp-3" : ""
          }`}
        >
          {video.description}
        </div>
      )}
      {video.description && video.description.length > 120 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold mt-1 hover:text-primary transition-colors"
          data-ocid="video_description.toggle"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
      {video.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
