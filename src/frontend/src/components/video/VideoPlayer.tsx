import {
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Subtitles,
  Volume2,
  VolumeX,
  Wifi,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

type DoubleTapSide = "left" | "right" | null;

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [doubleTapSide, setDoubleTapSide] = useState<DoubleTapSide>(null);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef<number>(0);
  const lastTapSide = useRef<"left" | "right" | null>(null);
  const doubleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(
      Math.max(v.currentTime + seconds, 0),
      v.duration || 0,
    );
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = pct * v.duration;
  }, []);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = videoRef.current;
      const val = Number.parseFloat(e.target.value);
      if (!v) return;
      v.volume = val;
      setVolume(val);
      setMuted(val === 0);
    },
    [],
  );

  const handleToggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const resetAutoHide = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => {
      if (playingRef.current) setShowControls(false);
    }, 5000);
  }, []);

  const showDoubleTapAnimation = useCallback((side: "left" | "right") => {
    setDoubleTapSide(side);
    if (doubleTapTimer.current) clearTimeout(doubleTapTimer.current);
    doubleTapTimer.current = setTimeout(() => setDoubleTapSide(null), 700);
  }, []);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Ignore clicks on control buttons themselves
      if (
        (e.target as HTMLElement).closest("button") ||
        (e.target as HTMLElement).closest("[data-controls]")
      ) {
        return;
      }

      const now = Date.now();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const side = e.clientX - rect.left < rect.width / 2 ? "left" : "right";

      const timeSinceLast = now - lastTapTime.current;
      const sameSide = lastTapSide.current === side;

      if (timeSinceLast < 300 && sameSide) {
        // Double tap
        if (side === "left") {
          handleSkip(-10);
          showDoubleTapAnimation("left");
        } else {
          handleSkip(10);
          showDoubleTapAnimation("right");
        }
        lastTapTime.current = 0;
        lastTapSide.current = null;
      } else {
        // Single tap — toggle controls
        lastTapTime.current = now;
        lastTapSide.current = side;
        setShowControls((prev) => {
          if (!prev) {
            resetAutoHide();
            return true;
          }
          if (controlsTimer.current) clearTimeout(controlsTimer.current);
          return false;
        });
      }
    },
    [handleSkip, showDoubleTapAnimation, resetAutoHide],
  );

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === " " || e.key === "Enter") handlePlayPause();
      if (e.key === "ArrowLeft") handleSkip(-10);
      if (e.key === "ArrowRight") handleSkip(10);
    },
    [handlePlayPause, handleSkip],
  );

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      if (doubleTapTimer.current) clearTimeout(doubleTapTimer.current);
    };
  }, []);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl overflow-hidden select-none cursor-pointer"
      style={{ aspectRatio: "16/9" }}
      onClick={handleContainerClick}
      onKeyDown={handleContainerKeyDown}
      onMouseMove={resetAutoHide}
      data-ocid="player.canvas_target"
      aria-label="Video player"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: video platform, user-uploaded content */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        preload="metadata"
      />

      {/* Double tap flash animations */}
      {doubleTapSide === "left" && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none animate-fade-out">
          <div className="bg-black/50 rounded-full p-3">
            <RotateCcw className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-sm font-bold drop-shadow">-10s</span>
        </div>
      )}
      {doubleTapSide === "right" && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 pointer-events-none animate-fade-out">
          <div className="bg-black/50 rounded-full p-3">
            <RotateCw className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-sm font-bold drop-shadow">+10s</span>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)",
        }}
        data-controls="true"
      >
        {/* Seek bar */}
        <div
          ref={progressRef}
          className="relative h-1 mx-4 mb-2 bg-white/25 rounded-full cursor-pointer group/bar"
          onClick={(e) => {
            e.stopPropagation();
            handleSeek(e);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSeek(e as any)}
          role="slider"
          aria-label="Video progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 w-3.5 h-3.5 bg-white rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{
              left: `${progress}%`,
              transform: "translateX(-50%) translateY(-50%)",
            }}
          />
        </div>

        {/* Bottom controls row */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only, buttons inside handle keyboard */}
        <div
          className="flex items-center gap-2 px-3 pb-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Play/Pause */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="text-white hover:scale-110 transition-transform p-1"
            data-ocid="player.toggle"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="w-5 h-5" fill="white" />
            ) : (
              <Play className="w-5 h-5" fill="white" />
            )}
          </button>

          {/* Rewind 10s */}
          <button
            type="button"
            onClick={() => handleSkip(-10)}
            className="text-white hover:scale-110 transition-transform p-1"
            data-ocid="player.secondary_button"
            aria-label="Rewind 10 seconds"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Forward 10s */}
          <button
            type="button"
            onClick={() => handleSkip(10)}
            className="text-white hover:scale-110 transition-transform p-1"
            data-ocid="player.secondary_button"
            aria-label="Forward 10 seconds"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Volume */}
          <div className="flex items-center gap-1 group/vol">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-white p-1"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-14 opacity-0 group-hover/vol:opacity-100 transition-opacity accent-primary"
              aria-label="Volume"
            />
          </div>

          {/* Time */}
          <span className="text-white text-xs tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* CC */}
          <button
            type="button"
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Captions"
            title="Captions"
          >
            <Subtitles className="w-4 h-4" />
          </button>

          {/* Cast */}
          <button
            type="button"
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Cast"
            title="Cast"
          >
            <Wifi className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            type="button"
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={handleFullscreen}
            className="text-white hover:scale-110 transition-transform p-1"
            data-ocid="player.toggle"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize className="w-4 h-4" />
            ) : (
              <Maximize className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
