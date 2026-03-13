import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Globe,
  Lock,
  Maximize,
  Minimize,
  MoreHorizontal,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Search,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Caption types & data ─────────────────────────────────────────────────────

interface CaptionCue {
  startTime: number;
  endTime: number;
  text: string;
}

const DEMO_CAPTIONS: CaptionCue[] = [
  { startTime: 2, endTime: 6, text: "Welcome to YOU WATCH." },
  {
    startTime: 7,
    endTime: 11,
    text: "The best place to watch and share videos.",
  },
  {
    startTime: 12,
    endTime: 16,
    text: "Upload your content and reach viewers worldwide.",
  },
  {
    startTime: 17,
    endTime: 22,
    text: "Our platform supports creators of all sizes.",
  },
  { startTime: 23, endTime: 27, text: "Discover trending videos every day." },
  { startTime: 28, endTime: 33, text: "Subscribe to your favorite channels." },
  { startTime: 34, endTime: 38, text: "Like and comment to support creators." },
  {
    startTime: 39,
    endTime: 44,
    text: "Share videos with your friends and family.",
  },
  {
    startTime: 45,
    endTime: 50,
    text: "Watch in high quality with our advanced player.",
  },
  {
    startTime: 51,
    endTime: 56,
    text: "Enable captions in over 100 languages.",
  },
  { startTime: 57, endTime: 62, text: "Thank you for watching on YOU WATCH." },
  {
    startTime: 63,
    endTime: 68,
    text: "Don't forget to subscribe for more content.",
  },
];

type CaptionMode = "off" | "original" | "translated";

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "sv", name: "Swedish", nativeName: "Svenska" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "th", name: "Thai", nativeName: "ภาษาไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "fa", name: "Persian/Farsi", nativeName: "فارسی" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά" },
  { code: "cs", name: "Czech", nativeName: "Čeština" },
  { code: "ro", name: "Romanian", nativeName: "Română" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "fi", name: "Finnish", nativeName: "Suomi" },
  { code: "da", name: "Danish", nativeName: "Dansk" },
  { code: "no", name: "Norwegian", nativeName: "Norsk" },
  { code: "sk", name: "Slovak", nativeName: "Slovenčina" },
  { code: "hr", name: "Croatian", nativeName: "Hrvatski" },
  { code: "sr", name: "Serbian", nativeName: "Српски" },
  { code: "bg", name: "Bulgarian", nativeName: "Български" },
  { code: "ca", name: "Catalan", nativeName: "Català" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල" },
  { code: "my", name: "Burmese", nativeName: "မြန်မာဘာသာ" },
  { code: "km", name: "Khmer", nativeName: "ខ្មែរ" },
  { code: "lo", name: "Lao", nativeName: "ພາສາລາວ" },
  { code: "mn", name: "Mongolian", nativeName: "Монгол" },
  { code: "bo", name: "Tibetan", nativeName: "བོད་སྐད་" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "so", name: "Somali", nativeName: "Soomaali" },
  { code: "ha", name: "Hausa", nativeName: "Hausa" },
  { code: "yo", name: "Yoruba", nativeName: "Yorùbá" },
  { code: "ig", name: "Igbo", nativeName: "Igbo" },
  { code: "zu", name: "Zulu", nativeName: "isiZulu" },
  { code: "xh", name: "Xhosa", nativeName: "isiXhosa" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "sq", name: "Albanian", nativeName: "Shqip" },
  { code: "hy", name: "Armenian", nativeName: "Հայերեն" },
  { code: "az", name: "Azerbaijani", nativeName: "Azərbaycanca" },
  { code: "be", name: "Belarusian", nativeName: "Беларуская" },
  { code: "bs", name: "Bosnian", nativeName: "Bosanski" },
  { code: "ka", name: "Georgian", nativeName: "ქართული" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
  { code: "ga", name: "Irish", nativeName: "Gaeilge" },
  { code: "kk", name: "Kazakh", nativeName: "Қазақша" },
  { code: "ky", name: "Kyrgyz", nativeName: "Кыргызча" },
  { code: "lv", name: "Latvian", nativeName: "Latviešu" },
  { code: "lt", name: "Lithuanian", nativeName: "Lietuvių" },
  { code: "mk", name: "Macedonian", nativeName: "Македонски" },
  { code: "mt", name: "Maltese", nativeName: "Malti" },
  { code: "mo", name: "Moldovan", nativeName: "Moldovenească" },
  { code: "ps", name: "Pashto", nativeName: "پښتو" },
  { code: "sl", name: "Slovenian", nativeName: "Slovenščina" },
  { code: "tg", name: "Tajik", nativeName: "Тоҷикӣ" },
  { code: "tk", name: "Turkmen", nativeName: "Türkmençe" },
  { code: "uz", name: "Uzbek", nativeName: "Oʻzbek" },
  { code: "cy", name: "Welsh", nativeName: "Cymraeg" },
  { code: "eu", name: "Basque", nativeName: "Euskara" },
  { code: "gl", name: "Galician", nativeName: "Galego" },
  { code: "et", name: "Estonian", nativeName: "Eesti" },
  { code: "lb", name: "Luxembourgish", nativeName: "Lëtzebuergesch" },
  { code: "tl", name: "Filipino/Tagalog", nativeName: "Filipino" },
  { code: "jv", name: "Javanese", nativeName: "Basa Jawa" },
  { code: "su", name: "Sundanese", nativeName: "Basa Sunda" },
  { code: "ceb", name: "Cebuano", nativeName: "Sinugbuanong Binisaya" },
  { code: "mg", name: "Malagasy", nativeName: "Malagasy" },
  { code: "st", name: "Sesotho", nativeName: "Sesotho" },
  { code: "sn", name: "Shona", nativeName: "chiShona" },
];

// ─── Translation simulation ───────────────────────────────────────────────────

const WORD_DICT: Record<string, Record<string, string>> = {
  es: {
    Welcome: "Bienvenido",
    to: "a",
    The: "El",
    best: "mejor",
    place: "lugar",
    watch: "ver",
    and: "y",
    share: "compartir",
    videos: "vídeos",
    Upload: "Sube",
    your: "tu",
    content: "contenido",
    reach: "llega",
    viewers: "espectadores",
    worldwide: "en todo el mundo",
    Subscribe: "Suscríbete",
    favorite: "favoritos",
    channels: "canales",
    Thank: "Gracias",
    you: "tú",
    for: "por",
    watching: "ver",
    on: "en",
    Don: "No",
    forget: "olvides",
  },
  fr: {
    Welcome: "Bienvenue",
    to: "sur",
    The: "Le",
    best: "meilleur",
    place: "endroit",
    watch: "regarder",
    and: "et",
    share: "partager",
    videos: "vidéos",
    Upload: "Téléchargez",
    your: "votre",
    content: "contenu",
    Subscribe: "Abonnez-vous",
    favorite: "favoris",
    channels: "chaînes",
    Thank: "Merci",
    you: "vous",
    for: "pour",
    watching: "regarder",
    Don: "N'oubliez",
    forget: "pas",
  },
  de: {
    Welcome: "Willkommen",
    to: "bei",
    The: "Das",
    best: "beste",
    place: "Ort",
    watch: "ansehen",
    and: "und",
    share: "teilen",
    videos: "Videos",
    Upload: "Lade hoch",
    your: "deine",
    content: "Inhalte",
    Subscribe: "Abonnieren",
    Thank: "Danke",
    you: "dir",
    for: "für",
    watching: "zuschauen",
  },
  ja: {
    Welcome: "ようこそ",
    to: "へ",
    best: "最高の",
    place: "場所",
    watch: "視聴",
    share: "共有",
    videos: "動画",
    Upload: "アップロード",
    content: "コンテンツ",
    Subscribe: "登録する",
    Thank: "ありがとう",
    watching: "ご視聴",
  },
  ko: {
    Welcome: "환영합니다",
    to: "에",
    best: "최고의",
    place: "곳",
    watch: "시청",
    share: "공유",
    videos: "동영상",
    Upload: "업로드",
    content: "콘텐츠",
    Subscribe: "구독하기",
    Thank: "감사합니다",
    watching: "시청",
  },
  "zh-CN": {
    Welcome: "欢迎",
    to: "来到",
    best: "最好的",
    place: "地方",
    watch: "观看",
    share: "分享",
    videos: "视频",
    Upload: "上传",
    content: "内容",
    Subscribe: "订阅",
    Thank: "谢谢",
    watching: "观看",
  },
  pt: {
    Welcome: "Bem-vindo",
    to: "ao",
    best: "melhor",
    place: "lugar",
    watch: "assistir",
    share: "compartilhar",
    videos: "vídeos",
    Upload: "Envie",
    content: "conteúdo",
    Subscribe: "Inscreva-se",
    Thank: "Obrigado",
    watching: "assistir",
  },
  ru: {
    Welcome: "Добро пожаловать",
    to: "в",
    best: "лучшее",
    place: "место",
    watch: "смотреть",
    share: "делиться",
    videos: "видео",
    Upload: "Загружайте",
    content: "контент",
    Subscribe: "Подписывайтесь",
    Thank: "Спасибо",
    watching: "просмотр",
  },
  ar: {
    Welcome: "مرحباً",
    to: "في",
    best: "أفضل",
    place: "مكان",
    watch: "مشاهدة",
    share: "مشاركة",
    videos: "فيديوهات",
    Upload: "ارفع",
    content: "محتوى",
    Subscribe: "اشترك",
    Thank: "شكراً",
    watching: "المشاهدة",
  },
  hi: {
    Welcome: "स्वागत है",
    to: "में",
    best: "सबसे अच्छी",
    place: "जगह",
    watch: "देखें",
    share: "शेयर करें",
    videos: "वीडियो",
    Upload: "अपलोड करें",
    content: "सामग्री",
    Subscribe: "सदस्यता लें",
    Thank: "धन्यवाद",
    watching: "देखने",
  },
};

function translateText(text: string, langCode: string): string {
  const dict = WORD_DICT[langCode];
  if (!dict) {
    const lang = LANGUAGES.find((l) => l.code === langCode);
    const tag = lang ? lang.code.toUpperCase() : langCode.toUpperCase();
    return `[${tag}] ${text}`;
  }
  return text
    .split(" ")
    .map((word) => {
      const clean = word.replace(/[.,!?]$/, "");
      const punct = word.slice(clean.length);
      return (dict[clean] ?? word) + (dict[clean] ? punct : "");
    })
    .join(" ");
}

// ─── Player types & constants ─────────────────────────────────────────────────

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  startTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

type DoubleTapSide = "left" | "right" | null;
type SettingsView =
  | "main"
  | "quality"
  | "speed"
  | "captions"
  | "advanced"
  | "sleep_timer";

const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];
const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const SLEEP_TIMER_OPTIONS: (number | null)[] = [10, 20, 30, 45, 60, null];
const speedLabel = (s: number) => (s === 1 ? "Normal" : `${s}x`);
const sleepLabel = (v: number | null) => (v === null ? "Off" : `${v} min`);

export default function VideoPlayer({
  src,
  poster,
  startTime,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
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
  const [lockScreen, setLockScreen] = useState(false);

  // Caption state
  const [captionMode, setCaptionMode] = useState<CaptionMode>("off");
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [showCCMenu, setShowCCMenu] = useState(false);
  const [ccMenuView, setCCMenuView] = useState<"main" | "languages">("main");
  const [languageSearch, setLanguageSearch] = useState("");

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

  // ─── Active caption derivation ─────────────────────────────────────────────

  const activeCaption = useMemo(() => {
    if (captionMode === "off") return null;
    const cue = DEMO_CAPTIONS.find(
      (c) => currentTime >= c.startTime && currentTime < c.endTime,
    );
    if (!cue) return null;
    if (captionMode === "original") return cue.text;
    if (captionMode === "translated" && selectedLanguage) {
      return translateText(cue.text, selectedLanguage.code);
    }
    return cue.text;
  }, [captionMode, currentTime, selectedLanguage]);

  // ─── Filtered languages ────────────────────────────────────────────────────

  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) return LANGUAGES;
    const q = languageSearch.toLowerCase();
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q),
    );
  }, [languageSearch]);

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
    onTimeUpdate?.(v.currentTime, v.duration);
  }, [onTimeUpdate]);

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
      if (showSettings || showCCMenu) return;
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
      showCCMenu,
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

  const closeCCMenu = useCallback(() => {
    setShowCCMenu(false);
    setCCMenuView("main");
    setLanguageSearch("");
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

  const handleCCSheetTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const delta = e.changedTouches[0].clientY - touchStartY.current;
      if (delta > 60) closeCCMenu();
    },
    [closeCCMenu],
  );

  const getBackView = (): SettingsView => {
    if (
      settingsView === "quality" ||
      settingsView === "speed" ||
      settingsView === "captions"
    )
      return "main";
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
      case "captions":
        return "Captions";
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
  const captionModeLabel =
    captionMode === "off"
      ? "Off"
      : captionMode === "original"
        ? "Original"
        : (selectedLanguage?.name ?? "Translated");

  // ─── Caption options shared between CC sheet and settings captions view ────

  const CaptionOptions = ({ onClose }: { onClose: () => void }) => (
    <div className="py-1">
      {/* Off */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
        data-ocid="captions.off.button"
        onClick={(e) => {
          e.stopPropagation();
          setCaptionMode("off");
          onClose();
        }}
      >
        <span
          className={`text-sm flex-1 ${captionMode === "off" ? "text-primary font-medium" : "text-white"}`}
        >
          Off
        </span>
        {captionMode === "off" && <Check className="w-4 h-4 text-primary" />}
      </button>

      {/* Original Language */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
        data-ocid="captions.original.button"
        onClick={(e) => {
          e.stopPropagation();
          setCaptionMode("original");
          onClose();
        }}
      >
        <span
          className={`text-sm flex-1 ${captionMode === "original" ? "text-primary font-medium" : "text-white"}`}
        >
          Original Language
        </span>
        {captionMode === "original" && (
          <Check className="w-4 h-4 text-primary" />
        )}
      </button>

      {/* Auto Translate > */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
        data-ocid="captions.translate.button"
        onClick={(e) => {
          e.stopPropagation();
          setCCMenuView("languages");
          // also open the language picker from settings captions view
          if (!showCCMenu) {
            setShowCCMenu(true);
            closeCCMenu;
          }
        }}
      >
        <Globe className="w-4 h-4 text-zinc-400 shrink-0" />
        <span
          className={`text-sm flex-1 ${captionMode === "translated" ? "text-primary font-medium" : "text-white"}`}
        >
          Auto Translate
        </span>
        {captionMode === "translated" && selectedLanguage && (
          <span className="text-xs text-zinc-400 mr-1">
            {selectedLanguage.name}
          </span>
        )}
        <ChevronRight className="w-4 h-4 text-zinc-500" />
      </button>
    </div>
  );

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
        onLoadedMetadata={() => {
          const v = videoRef.current;
          if (!v) return;
          setDuration(v.duration ?? 0);
          if (startTime && startTime > 0) {
            v.currentTime = startTime;
          }
        }}
        preload="metadata"
        controls={false}
        playsInline
        onEnded={onEnded}
      />

      {/* Caption overlay */}
      {activeCaption && (
        <div
          className="absolute bottom-14 left-0 right-0 flex justify-center pointer-events-none z-10"
          data-ocid="captions.overlay"
        >
          <div
            className="px-3 py-1.5 rounded-lg max-w-[80%] text-center"
            style={{ background: "rgba(0,0,0,0.75)" }}
          >
            <span className="text-white text-sm sm:text-base font-medium leading-snug">
              {activeCaption}
            </span>
          </div>
        </div>
      )}

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

            {/* CC Button */}
            <button
              type="button"
              className={`transition-colors p-1 ${
                captionMode !== "off"
                  ? "text-primary"
                  : "text-white/70 hover:text-white"
              }`}
              aria-label="Captions"
              title="Captions"
              data-ocid="player.cc_button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCCMenu(true);
                setCCMenuView("main");
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

      {/* ── CC Menu Sheet ──────────────────────────────────────────────────── */}

      {/* CC backdrop */}
      {showCCMenu && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click to close
        <div
          className="absolute inset-0 z-20 bg-black/50"
          onClick={(e) => {
            e.stopPropagation();
            closeCCMenu();
          }}
        />
      )}

      {/* CC Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 rounded-t-2xl bg-zinc-900 border-t border-zinc-700 transition-transform duration-300"
        style={{ transform: showCCMenu ? "translateY(0)" : "translateY(100%)" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onTouchStart={handleSheetTouchStart}
        onTouchEnd={handleCCSheetTouchEnd}
        data-ocid="captions.sheet"
      >
        {/* CC Sheet header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50">
          {ccMenuView === "languages" ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCCMenuView("main");
                setLanguageSearch("");
              }}
              className="text-zinc-300 hover:text-white p-1 -ml-1"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-7" />
          )}
          <span className="text-white font-semibold text-sm">
            {ccMenuView === "main" ? "Captions" : "Select Language"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeCCMenu();
            }}
            className="text-zinc-400 hover:text-white p-1"
            aria-label="Close captions menu"
            data-ocid="captions.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CC Menu main view */}
        {ccMenuView === "main" && <CaptionOptions onClose={closeCCMenu} />}

        {/* Language picker */}
        {ccMenuView === "languages" && (
          <div className="flex flex-col" style={{ maxHeight: "60vh" }}>
            {/* Search */}
            <div className="px-4 py-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  value={languageSearch}
                  onChange={(e) => setLanguageSearch(e.target.value)}
                  placeholder="Search languages..."
                  className="bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 pl-9 text-sm"
                  data-ocid="captions.language.search_input"
                />
              </div>
            </div>

            {/* Language list */}
            <div className="overflow-y-auto flex-1 py-1">
              {filteredLanguages.map((lang, i) => (
                <button
                  key={lang.code}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 cursor-pointer text-left"
                  data-ocid={`captions.language.item.${i + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLanguage(lang);
                    setCaptionMode("translated");
                    closeCCMenu();
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm ${
                        selectedLanguage?.code === lang.code &&
                        captionMode === "translated"
                          ? "text-primary font-medium"
                          : "text-white"
                      }`}
                    >
                      {lang.name}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {lang.nativeName}
                    </div>
                  </div>
                  {selectedLanguage?.code === lang.code &&
                    captionMode === "translated" && (
                      <Check className="w-4 h-4 text-primary shrink-0" />
                    )}
                </button>
              ))}
              {filteredLanguages.length === 0 && (
                <div className="px-4 py-6 text-center text-zinc-400 text-sm">
                  No languages found
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* ── Settings Sheet ─────────────────────────────────────────────────── */}

      {/* Settings backdrop */}
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

            {/* Captions → navigate to captions view */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-800 cursor-pointer text-left"
              onClick={(e) => {
                e.stopPropagation();
                setSettingsView("captions");
              }}
            >
              <Subtitles className="w-5 h-5 text-zinc-300 shrink-0" />
              <span className="text-white text-sm flex-1">Captions</span>
              <span className="text-sm text-zinc-400 mr-1">
                {captionModeLabel}
              </span>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

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
                  className={`text-sm flex-1 ${quality === q ? "text-primary font-medium" : "text-white"}`}
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
                  className={`text-sm flex-1 ${playbackSpeed === s ? "text-primary font-medium" : "text-white"}`}
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

        {/* Captions sub-menu in settings */}
        {settingsView === "captions" && (
          <CaptionOptions
            onClose={() => {
              setSettingsView("main");
            }}
          />
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
                  className={`text-sm flex-1 ${sleepTimer === opt ? "text-primary font-medium" : "text-white"}`}
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
