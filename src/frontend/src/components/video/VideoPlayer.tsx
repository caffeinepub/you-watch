import { Switch } from "@/components/ui/switch";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Lock,
  Maximize,
  Minimize,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Subtitles,
  Timer,
  Volume2,
  VolumeX,
  Wifi,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

type DoubleTapSide = "left" | "right" | null;
type SettingsView = "main" | "quality" | "speed" | "advanced" | "sleep_timer";

const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];
const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_TIMER_OPTIONS: (number | null)[] = [10, 20, 30, 45, 60, null];
const speedLabel = (s: number) => (s === 1 ? "Normal" : `${s}x`);
const sleepLabel = (v: number | null) => (v === null ? "Off" : `${v} min`);

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView>("main");
  const [quality, setQuality] = useState("Auto");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [lockScreen, setLockScreen] = useState(false);

  // Advanced settings state
  const [loopVideo, setLoopVideo] = useState(false);
  const [ambientMode, setAmbientMode] = useState(false);
  const [stableVolume, setStableVolume] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const prevVolumeRef = useRef<number>(1);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Touch swipe-down to close
  const touchStartY = useRef<number>(0);

  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTime = useRef<number>(0);
  const lastTapSide = useRef<"left" | "right" | null>(null);
  const doubleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Loop video effect
  useEffect(() => {
    if (videoRef.current) videoRef.current.loop = loopVideo;
  }, [loopVideo]);

  // Stable volume effect
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (stableVolume) {
      prevVolumeRef.current = v.volume;
      v.volume = 0.8;
      setVolume(0.8);
    } else {
      v.volume = prevVolumeRef.current;
      setVolume(prevVolumeRef.current);
    }
  }, [stableVolume]);

  // Sleep timer effect
  useEffect(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepTimer !== null) {
      sleepTimerRef.current = setTimeout(() => {
        videoRef.current?.pause();
      }, sleepTimer * 60000);
    }
    return () => {
      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [sleepTimer]);

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
      if (lockScreen) return;
      if (showSettings) return;
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
    [
      handleSkip,
      showDoubleTapAnimation,
      resetAutoHide,
      lockScreen,
      showSettings,
    ],
  );

  const handleContainerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === " " || e.key === "Enter") handlePlayPause();
      if (e.key === "ArrowLeft") handleSkip(-10);
      if (e.key === "ArrowRight") handleSkip(10);
    },
    [handlePlayPause, handleSkip],
  );

  const handleSelectQuality = useCallback((q: string) => {
    setQuality(q);
    setSettingsView("main");
  }, []);

  const handleSelectSpeed = useCallback((s: number) => {
    setPlaybackSpeed(s);
    if (videoRef.current) videoRef.current.playbackRate = s;
    setSettingsView("main");
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
    setSettingsView("main");
  }, []);

  const handleSheetTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      touchStartY.current = e.touches[0].clientY;
    },
    [],
  );

  const handleSheetTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      if (delta > 60) closeSettings();
    },
    [closeSettings],
  );

  const getBackView = (): SettingsView => {
    if (settingsView === "quality" || settingsView === "speed") return "main";
    if (settingsView === "advanced") return "main";
    if (settingsView === "sleep_timer") return "advanced";
    return "main";
  };

  const getSheetTitle = () => {
    switch (settingsView) {
      case "main":
        return "Settings";
      case "quality":
        return "Quality";
      case "speed":
        return "Playback Speed";
      case "advanced":
        return "Advanced Settings";
      case "sleep_timer":
        return "Sleep Timer";
    }
  };

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

  const currentQualityLabel = quality;
  const currentSpeedLabel = speedLabel(playbackSpeed);

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
      {/* Ambient Mode glow */}
      {ambientMode && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
      )}

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

      {/* Lock screen overlay */}
      {lockScreen && (
        <button
          type="button"
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 w-full"
          onClick={(e) => {
            e.stopPropagation();
            setLockScreen(false);
          }}
          aria-label="Tap to unlock"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/10 rounded-full p-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <span className="text-white text-sm font-medium">
              Tap to unlock
            </span>
          </div>
        </button>
      )}

      {/* Controls overlay */}
      {!lockScreen && (
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
              className={`transition-colors p-1 ${
                captionsEnabled
                  ? "text-primary"
                  : "text-white/70 hover:text-white"
              }`}
              aria-label="Captions"
              title="Captions"
              onClick={(e) => {
                e.stopPropagation();
                setCaptionsEnabled((v) => !v);
              }}
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
              data-ocid="player.open_modal_button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSettings(true);
                setSettingsView("main");
              }}
            >
              <Settings
                className={`w-4 h-4 transition-transform duration-300 ${
                  showSettings ? "rotate-45" : ""
                }`}
              />
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
      )}

      {/* Settings bottom sheet backdrop */}
      {showSettings && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click to close
        <div
          className="absolute inset-0 z-20 bg-black/50"
          onClick={(e) => {
            e.stopPropagation();
            closeSettings();
          }}
        />
      )}

      {/* Settings bottom sheet */}
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 z-30 rounded-t-2xl bg-zinc-900 border-t border-zinc-700 transition-transform duration-300"
        style={{
          transform: showSettings ? "translateY(0)" : "translateY(100%)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onTouchStart={handleSheetTouchStart}
        onTouchEnd={handleSheetTouchEnd}
        data-ocid="player.sheet"
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50">
          {settingsView !== "main" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsView(getBackView());
              }}
              className="text-zinc-300 hover:text-white p-1 -ml-1"
              aria-label="Back"
              data-ocid="player.secondary_button"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-7" />
          )}
          <span className="text-white font-semibold text-sm">
            {getSheetTitle()}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeSettings();
            }}
            className="text-zinc-400 hover:text-white p-1"
            aria-label="Close settings"
            data-ocid="player.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main settings menu */}
        {settingsView === "main" && (
          <div className="py-1">
            {/* Quality */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsView("quality");
              }}
            >
              <SlidersHorizontal className="w-5 h-5 text-zinc-300 shrink-0" />
              <span className="text-white text-sm flex-1">Quality</span>
              <span className="text-sm text-zinc-400 mr-1">
                {currentQualityLabel}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            {/* Playback Speed */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsView("speed");
              }}
            >
              <Gauge className="w-5 h-5 text-zinc-300 shrink-0" />
              <span className="text-white text-sm flex-1">Playback Speed</span>
              <span className="text-sm text-zinc-400 mr-1">
                {currentSpeedLabel}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            {/* Captions */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: switch handles its own keyboard */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCaptionsEnabled((v) => !v);
              }}
            >
              <Subtitles className="w-5 h-5 text-zinc-300 shrink-0" />
              <span className="text-white text-sm flex-1">Captions</span>
              <Switch
                checked={captionsEnabled}
                onCheckedChange={(val) => setCaptionsEnabled(val)}
                data-ocid="player.captions.switch"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Lock Screen */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: switch handles its own keyboard */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setLockScreen((v) => !v);
                if (!lockScreen) closeSettings();
              }}
            >
              <Lock className="w-5 h-5 text-zinc-300 shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm">Lock Screen</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  Prevent accidental touches
                </div>
              </div>
              <Switch
                checked={lockScreen}
                onCheckedChange={(val) => {
                  setLockScreen(val);
                  if (val) closeSettings();
                }}
                data-ocid="player.lock.switch"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* More → Advanced */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsView("advanced");
              }}
              data-ocid="player.open_modal_button"
            >
              <MoreHorizontal className="w-5 h-5 text-zinc-300 shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm">More</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  Advanced settings
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        )}

        {/* Quality sub-menu */}
        {settingsView === "quality" && (
          <div className="py-1">
            {QUALITY_OPTIONS.map((q, i) => (
              <button
                key={q}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
                data-ocid={`player.quality.item.${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectQuality(q);
                }}
              >
                <span
                  className={`text-sm flex-1 ${
                    quality === q ? "text-primary font-medium" : "text-white"
                  }`}
                >
                  {q}
                </span>
                {quality === q && (
                  <Check className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Speed sub-menu */}
        {settingsView === "speed" && (
          <div className="py-1">
            {SPEED_OPTIONS.map((s, i) => (
              <button
                key={s}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
                data-ocid={`player.speed.item.${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectSpeed(s);
                }}
              >
                <span
                  className={`text-sm flex-1 ${
                    playbackSpeed === s
                      ? "text-primary font-medium"
                      : "text-white"
                  }`}
                >
                  {speedLabel(s)}
                </span>
                {playbackSpeed === s && (
                  <Check className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Advanced Settings sub-menu */}
        {settingsView === "advanced" && (
          <div className="py-1">
            {/* Loop Video */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: switch handles keyboard */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setLoopVideo((v) => !v);
              }}
            >
              <Repeat className="w-5 h-5 text-zinc-300 shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm">Loop Video</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  Restart automatically when video ends
                </div>
              </div>
              <Switch
                checked={loopVideo}
                onCheckedChange={(val) => setLoopVideo(val)}
                data-ocid="advanced.loop.switch"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Ambient Mode */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: switch handles keyboard */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setAmbientMode((v) => !v);
              }}
            >
              <Sparkles className="w-5 h-5 text-zinc-300 shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm">Ambient Mode</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  Soft glow effect around the player
                </div>
              </div>
              <Switch
                checked={ambientMode}
                onCheckedChange={(val) => setAmbientMode(val)}
                data-ocid="advanced.ambient.switch"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Stable Volume */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: switch handles keyboard */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setStableVolume((v) => !v);
              }}
            >
              <Volume2 className="w-5 h-5 text-zinc-300 shrink-0" />
              <div className="flex-1">
                <div className="text-white text-sm">Stable Volume</div>
                <div className="text-zinc-500 text-xs mt-0.5">
                  Balance loud and quiet scenes
                </div>
              </div>
              <Switch
                checked={stableVolume}
                onCheckedChange={(val) => setStableVolume(val)}
                data-ocid="advanced.volume.switch"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Sleep Timer */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsView("sleep_timer");
              }}
              data-ocid="advanced.sleep_timer.button"
            >
              <Timer className="w-5 h-5 text-zinc-300 shrink-0" />
              <span className="text-white text-sm flex-1">Sleep Timer</span>
              <span className="text-sm text-zinc-400 mr-1">
                {sleepLabel(sleepTimer)}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        )}

        {/* Sleep Timer sub-menu */}
        {settingsView === "sleep_timer" && (
          <div className="py-1">
            {SLEEP_TIMER_OPTIONS.map((opt, i) => (
              <button
                key={opt === null ? "off" : opt}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
                data-ocid={`advanced.sleep.item.${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSleepTimer(opt);
                  setSettingsView("advanced");
                }}
              >
                <span
                  className={`text-sm flex-1 ${
                    sleepTimer === opt
                      ? "text-primary font-medium"
                      : "text-white"
                  }`}
                >
                  {sleepLabel(opt)}
                </span>
                {sleepTimer === opt && (
                  <Check className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Safe area spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
