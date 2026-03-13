import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Video } from "../../backend";

interface AutoplayOverlayProps {
  nextVideo: Video;
  thumbnailUrl: string;
  onCancel: () => void;
  onPlayNow: () => void;
}

export default function AutoplayOverlay({
  nextVideo,
  thumbnailUrl,
  onCancel,
  onPlayNow,
}: AutoplayOverlayProps) {
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          onPlayNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onPlayNow]);

  return (
    <div
      className="fixed bottom-24 right-4 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-card/95 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-300"
      data-ocid="autoplay_overlay.card"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={nextVideo.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        {/* Countdown ring overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white font-bold text-lg">{countdown}</span>
            </div>
            <span className="text-white text-xs font-medium">
              Next video in {countdown}s
            </span>
          </div>
        </div>
      </div>

      {/* Info + actions */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-0.5">Up next</p>
        <p className="font-semibold text-sm line-clamp-2 leading-snug mb-3">
          {nextVideo.title}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-full"
            onClick={onCancel}
            data-ocid="autoplay_overlay.cancel_button"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-full bg-primary text-primary-foreground"
            onClick={onPlayNow}
            data-ocid="autoplay_overlay.primary_button"
          >
            <Play className="w-3.5 h-3.5 mr-1" />
            Play Now
          </Button>
        </div>
      </div>
    </div>
  );
}
