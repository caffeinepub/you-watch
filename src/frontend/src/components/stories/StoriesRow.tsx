import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Forward,
  MoreVertical,
  Plus,
  Send,
  SmilePlus,
  Users,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { useConversations } from "../../hooks/useConversations";
import { useStorage } from "../../hooks/useStorage";
import EmojiPicker from "../chat/EmojiPicker";

// ── Types ────────────────────────────────────────────────────────────────────
export interface StoryViewer {
  userId: string;
  username: string;
  viewedAt: number;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  avatarBlobId?: string;
  type: "image" | "text";
  mediaDataUrl?: string;
  textContent?: string;
  textBg?: string;
  createdAt: number;
  expiresAt: number;
  viewers: StoryViewer[];
}

// ── Storage helpers ─────────────────────────────────────────────────────────
const STORIES_KEY = "yw_stories";
const MUTED_KEY = "yw_muted_stories";
const STORY_TTL_MS = 32 * 60 * 60 * 1000;

export function loadStories(): Story[] {
  try {
    const raw = localStorage.getItem(STORIES_KEY);
    if (!raw) return [];
    const all: Story[] = JSON.parse(raw);
    const now = Date.now();
    return all.filter((s) => s.expiresAt > now);
  } catch {
    return [];
  }
}

export function saveStories(stories: Story[]) {
  const now = Date.now();
  const live = stories.filter((s) => s.expiresAt > now);
  localStorage.setItem(STORIES_KEY, JSON.stringify(live));
}

export function loadMutedUsers(): Record<string, string> {
  // { userId: username }
  try {
    const raw = localStorage.getItem(MUTED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMutedUsers(muted: Record<string, string>) {
  localStorage.setItem(MUTED_KEY, JSON.stringify(muted));
}

function formatTimeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STORY_DURATION_MS = 7000; // 7s per story
const REACTIONS = ["❤️", "👍", "😂", "😮", "🔥"] as const;

// ── Share Story Sheet ────────────────────────────────────────────────────────
function ShareStorySheet({
  story,
  onClose,
}: {
  story: Story;
  onClose: () => void;
}) {
  const { conversations, getOrCreateConversation, sendMessage } =
    useConversations();
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  function handleShare(conv: { id: string; userId: string; username: string }) {
    if (sentTo.has(conv.id)) return;
    const c = getOrCreateConversation(conv.userId, conv.username);
    sendMessage(c.id, `Shared a story from @${story.username}`, undefined, {
      storyId: story.id,
      username: story.username,
      type: story.type,
      mediaDataUrl: story.mediaDataUrl,
      textContent: story.textContent,
      textBg: story.textBg,
    });
    setSentTo((prev) => new Set(prev).add(conv.id));
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      data-ocid="share_story.modal"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative z-10 w-full max-w-sm bg-background rounded-t-2xl pb-safe">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="px-4 pb-6">
          <h3 className="font-semibold text-base mb-1">Share Story</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Send @{story.username}'s story to a conversation
          </p>
          <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5 mb-4">
            {story.type === "image" && story.mediaDataUrl ? (
              <img
                src={story.mediaDataUrl}
                alt="story"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold text-center overflow-hidden"
                style={{ background: story.textBg || "#1a1a2e" }}
              >
                {story.textContent?.slice(0, 15)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                @{story.username}'s story
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(story.createdAt)}
              </p>
            </div>
          </div>
          {conversations.length === 0 ? (
            <p
              className="text-sm text-muted-foreground text-center py-6"
              data-ocid="share_story.empty_state"
            >
              No conversations yet. Start a chat first.
            </p>
          ) : (
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {conversations.map((conv, idx) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => handleShare(conv)}
                  data-ocid={`share_story.conversation.item.${idx + 1}`}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {conv.initials.charAt(0)}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium truncate">
                    {conv.username}
                  </span>
                  {sentTo.has(conv.id) ? (
                    <span className="text-xs text-green-500 font-semibold">
                      Sent!
                    </span>
                  ) : (
                    <Send className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-semibold hover:bg-muted/70 transition-colors"
            data-ocid="share_story.cancel_button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Story Reply Bar ──────────────────────────────────────────────────────────
function StoryReplyBar({
  story,
  currentUserId,
  onReplySent,
}: {
  story: Story;
  currentUserId: string;
  onReplySent: () => void;
}) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getOrCreateConversation, sendMessage } = useConversations();

  function handleSend() {
    if (!text.trim()) return;
    if (story.userId === currentUserId) return;
    const conv = getOrCreateConversation(story.userId, story.username);
    sendMessage(conv.id, text.trim(), {
      storyId: story.id,
      username: story.username,
      type: story.type,
      mediaDataUrl: story.mediaDataUrl,
      textContent: story.textContent,
      textBg: story.textBg,
    });
    setText("");
    setShowEmoji(false);
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onReplySent();
    }, 1200);
  }

  if (story.userId === currentUserId) return null;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-4 pt-2 bg-gradient-to-t from-black/90 to-transparent"
      data-ocid="story_reply.section"
    >
      <div className="flex items-center gap-2 mb-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
        {story.type === "image" && story.mediaDataUrl ? (
          <img
            src={story.mediaDataUrl}
            alt="story"
            className="w-8 h-8 rounded-md object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold leading-tight text-center overflow-hidden"
            style={{ background: story.textBg || "#1a1a2e" }}
          >
            {story.textContent?.slice(0, 20)}
          </div>
        )}
        <p className="text-white/70 text-xs truncate">
          Replying to{" "}
          <span className="text-white font-semibold">@{story.username}</span>'s
          story
        </p>
      </div>

      {sent ? (
        <div
          className="flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/40 rounded-full px-4 py-2 text-green-400 text-sm font-medium"
          data-ocid="story_reply.success_state"
        >
          <Send className="w-4 h-4" />
          Sent!
        </div>
      ) : (
        <div className="flex items-center gap-2 relative">
          {showEmoji && (
            <div className="absolute bottom-12 left-0 z-50">
              <EmojiPicker
                onSelect={(emoji) => {
                  setText((p) => p + emoji);
                  inputRef.current?.focus();
                }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
            data-ocid="story_reply.emoji_button"
          >
            <SmilePlus className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Reply to story..."
            className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/40 rounded-full px-4 py-2 text-sm outline-none border border-white/20 focus:border-white/50 transition-colors"
            data-ocid="story_reply.input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-30 flex-shrink-0"
            data-ocid="story_reply.send_button"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Story Reactions ──────────────────────────────────────────────────────────
function StoryReactions({
  story,
  currentUserId,
}: {
  story: Story;
  currentUserId: string;
}) {
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const { getOrCreateConversation, sendMessage } = useConversations();

  if (story.userId === currentUserId) return null;

  function handleReaction(emoji: string) {
    if (sentReaction) return;
    const conv = getOrCreateConversation(story.userId, story.username);
    sendMessage(conv.id, `${emoji} Reacted to your story`, {
      storyId: story.id,
      username: story.username,
      type: story.type,
      mediaDataUrl: story.mediaDataUrl,
      textContent: story.textContent,
      textBg: story.textBg,
    });
    setSentReaction(emoji);
    setTimeout(() => setSentReaction(null), 2000);
  }

  return (
    <div
      className="absolute bottom-20 left-0 right-0 z-20 flex justify-center gap-3 px-4"
      data-ocid="story_reactions.section"
    >
      {sentReaction ? (
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-xl">{sentReaction}</span>
          <span className="text-white text-sm font-medium">Sent!</span>
        </div>
      ) : (
        REACTIONS.map((emoji, i) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleReaction(emoji)}
            data-ocid={`story_reactions.button.${i + 1}`}
            className="text-2xl bg-black/40 backdrop-blur-sm hover:bg-black/60 active:scale-110 rounded-full w-11 h-11 flex items-center justify-center transition-all hover:scale-110"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))
      )}
    </div>
  );
}

// ── Story viewer modal ───────────────────────────────────────────────────────
export function StoryViewerModal({
  stories,
  startIndex,
  currentUserId,
  currentUsername,
  onClose,
  onStoriesUpdate,
  onMuteUser,
}: {
  stories: Story[];
  startIndex: number;
  currentUserId: string;
  currentUsername: string;
  onClose: () => void;
  onStoriesUpdate: (stories: Story[]) => void;
  onMuteUser?: (userId: string, username: string) => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const [showViewers, setShowViewers] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const story = stories[idx] ?? null;

  // Mark as viewed
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only re-run on story id change
  useEffect(() => {
    if (!story) return;
    if (story.userId === currentUserId) return;
    const alreadyViewed = story.viewers.some((v) => v.userId === currentUserId);
    if (alreadyViewed) return;
    const all = loadStories();
    const updated = all.map((s) => {
      if (s.id !== story.id) return s;
      return {
        ...s,
        viewers: [
          ...s.viewers,
          {
            userId: currentUserId,
            username: currentUsername,
            viewedAt: Date.now(),
          },
        ],
      };
    });
    saveStories(updated);
    onStoriesUpdate(updated.filter((s) => s.expiresAt > Date.now()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, currentUserId]);

  // Progress timer — auto-advance
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional - only re-run on story/idx change
  useEffect(() => {
    if (!story) return;
    setProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);

    const TICK_MS = 50;
    const total = STORY_DURATION_MS;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += TICK_MS;
      const pct = Math.min((elapsed / total) * 100, 100);
      setProgress(pct);
      if (elapsed >= total) {
        if (timerRef.current) clearInterval(timerRef.current);
        // auto-advance
        setIdx((prev) => {
          if (prev < stories.length - 1) return prev + 1;
          onClose();
          return prev;
        });
      }
    }, TICK_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [idx, story?.id, stories.length, onClose]);

  if (!story) return null;

  const isOwner = story.userId === currentUserId;
  const viewCount = story.viewers.length;

  const goNext = () => {
    if (idx < stories.length - 1) setIdx(idx + 1);
    else onClose();
  };
  const goPrev = () => {
    if (idx > 0) setIdx(idx - 1);
  };

  const handleMute = () => {
    setShowMenu(false);
    onMuteUser?.(story.userId, story.username);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      data-ocid="story_viewer.modal"
    >
      {/* Progress bars — timer driven */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((s, i) => (
          <div
            key={s.id || i}
            className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-white transition-none"
              style={{
                width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%",
                transition: i === idx ? "none" : undefined,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-white text-sm font-bold">
            {story.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{story.username}</p>
            <p className="text-white/60 text-xs">
              {formatTimeAgo(story.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            data-ocid="story_viewer.share_button"
            aria-label="Share story"
          >
            <Forward className="w-5 h-5" />
          </button>
          {/* Three-dot menu — non-owner only */}
          {!isOwner && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((v) => !v)}
                className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                data-ocid="story_viewer.dropdown_menu"
                aria-label="More options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-background border border-border rounded-xl shadow-xl w-44 overflow-hidden z-50">
                  <button
                    type="button"
                    onClick={handleMute}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
                    data-ocid="story_viewer.mute_button"
                  >
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                    Mute @{story.username}
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            data-ocid="story_viewer.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div className="w-full max-w-sm mx-auto aspect-[9/16] relative">
        {story.type === "image" && story.mediaDataUrl ? (
          <img
            src={story.mediaDataUrl}
            alt="story"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div
            className="w-full h-full rounded-lg flex items-center justify-center p-6"
            style={{ background: story.textBg || "#1a1a2e" }}
          >
            <p className="text-white text-xl font-bold text-center leading-snug">
              {story.textContent}
            </p>
          </div>
        )}
        <button
          type="button"
          className="absolute left-0 top-0 w-1/3 h-full"
          onClick={goPrev}
          aria-label="Previous story"
        />
        <button
          type="button"
          className="absolute right-0 top-0 w-2/3 h-full"
          onClick={goNext}
          aria-label="Next story"
        />
      </div>

      {/* Nav arrows */}
      {idx > 0 && (
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-1 text-white z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {idx < stories.length - 1 && (
        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 rounded-full p-1 text-white z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Reactions row — non-owner */}
      {!isOwner && (
        <StoryReactions story={story} currentUserId={currentUserId} />
      )}

      {/* View count — owner only */}
      {isOwner && (
        <button
          type="button"
          onClick={() => setShowViewers(true)}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full z-10 hover:bg-black/70 transition-colors"
          data-ocid="story_viewer.toggle"
        >
          <Eye className="w-4 h-4" />
          <span>
            {viewCount} {viewCount === 1 ? "view" : "views"}
          </span>
        </button>
      )}

      {/* Reply bar — non-owner */}
      {!isOwner && (
        <StoryReplyBar
          story={story}
          currentUserId={currentUserId}
          onReplySent={onClose}
        />
      )}

      {/* Viewers list */}
      {showViewers && (
        <div
          className="absolute inset-0 bg-black/80 z-20 flex flex-col"
          data-ocid="story_viewers.panel"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Viewers ({viewCount})</span>
            </div>
            <button
              type="button"
              onClick={() => setShowViewers(false)}
              className="text-white/70 hover:text-white"
              data-ocid="story_viewers.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {story.viewers.length === 0 ? (
              <p
                className="text-white/50 text-sm text-center py-6"
                data-ocid="story_viewers.empty_state"
              >
                No views yet
              </p>
            ) : (
              story.viewers.map((viewer, i) => (
                <div
                  key={viewer.userId}
                  className="flex items-center gap-3"
                  data-ocid={`story_viewers.item.${i + 1}`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {viewer.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {viewer.username}
                    </p>
                    <p className="text-white/50 text-xs">
                      {formatTimeAgo(viewer.viewedAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Share story sheet */}
      {showShare && (
        <ShareStorySheet story={story} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

// ── Add story modal ──────────────────────────────────────────────────────────
const TEXT_BG_OPTIONS = [
  "linear-gradient(135deg,#1a1a2e,#16213e)",
  "linear-gradient(135deg,#c31432,#240b36)",
  "linear-gradient(135deg,#134e5e,#71b280)",
  "linear-gradient(135deg,#f7971e,#ffd200)",
  "linear-gradient(135deg,#4776e6,#8e54e9)",
];

function AddStoryModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (
    story: Omit<
      Story,
      | "id"
      | "viewers"
      | "createdAt"
      | "expiresAt"
      | "userId"
      | "username"
      | "avatarBlobId"
    >,
  ) => void;
}) {
  const [tab, setTab] = useState<"image" | "text">("image");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [selectedBg, setSelectedBg] = useState(TEXT_BG_OPTIONS[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (tab === "image" && imageDataUrl) {
      onAdd({ type: "image", mediaDataUrl: imageDataUrl });
    } else if (tab === "text" && textContent.trim()) {
      onAdd({
        type: "text",
        textContent: textContent.trim(),
        textBg: selectedBg,
      });
    }
    setImageDataUrl(null);
    setTextContent("");
    onClose();
  };

  const canPost =
    (tab === "image" && !!imageDataUrl) ||
    (tab === "text" && textContent.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" data-ocid="add_story.dialog">
        <h2 className="font-bold text-base mb-3">Add Story</h2>
        <div className="flex gap-2 mb-4">
          {(["image", "text"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              data-ocid="add_story.tab"
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "image" && (
          <div className="space-y-3">
            <button
              type="button"
              className="w-full aspect-[9/16] max-h-64 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
              onClick={() => fileRef.current?.click()}
              data-ocid="add_story.dropzone"
            >
              {imageDataUrl ? (
                <img
                  src={imageDataUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tap to choose image
                  </p>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="add_story.upload_button"
            />
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-3">
            <div
              className="aspect-[9/16] max-h-64 rounded-xl flex items-center justify-center p-4"
              style={{ background: selectedBg }}
            >
              <textarea
                className="bg-transparent text-white text-center text-lg font-bold w-full resize-none outline-none placeholder:text-white/40"
                placeholder="Type your story..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={4}
                maxLength={200}
                data-ocid="add_story.textarea"
              />
            </div>
            <div className="flex gap-2 justify-center">
              {TEXT_BG_OPTIONS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setSelectedBg(bg)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedBg === bg
                      ? "border-primary scale-110"
                      : "border-transparent"
                  }`}
                  style={{ background: bg }}
                  data-ocid="add_story.button"
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handlePost}
            disabled={!canPost}
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 transition-opacity"
            data-ocid="add_story.submit_button"
          >
            Post Story
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-muted text-muted-foreground rounded-lg py-2 text-sm font-semibold"
            data-ocid="add_story.cancel_button"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function StoriesRow() {
  const { isAuthenticated, userProfile, identity } = useAuthContext();
  const { getBlobUrl } = useStorage();
  const [stories, setStories] = useState<Story[]>(loadStories);
  const [mutedUsers, setMutedUsers] =
    useState<Record<string, string>>(loadMutedUsers);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setStories(loadStories()), 60_000);
    return () => clearInterval(id);
  }, []);

  const currentUserId = identity?.getPrincipal().toString() ?? "";
  const currentUsername =
    userProfile?.username || userProfile?.displayName || "You";

  const handleMuteUser = (userId: string, username: string) => {
    const updated = { ...mutedUsers, [userId]: username };
    setMutedUsers(updated);
    saveMutedUsers(updated);
  };

  // Filter out muted users (never filter own stories)
  const visibleStories = stories.filter(
    (s) => s.userId === currentUserId || !mutedUsers[s.userId],
  );

  const userStoryMap = visibleStories.reduce<Record<string, Story[]>>(
    (acc, s) => {
      if (!acc[s.userId]) acc[s.userId] = [];
      acc[s.userId].push(s);
      return acc;
    },
    {},
  );

  const orderedUserIds = Object.keys(userStoryMap).sort((a, b) =>
    a === currentUserId ? -1 : b === currentUserId ? 1 : 0,
  );

  const handleAddStory = (
    data: Omit<
      Story,
      | "id"
      | "viewers"
      | "createdAt"
      | "expiresAt"
      | "userId"
      | "username"
      | "avatarBlobId"
    >,
  ) => {
    const now = Date.now();
    const newStory: Story = {
      ...data,
      id: `story_${now}_${Math.random().toString(36).slice(2)}`,
      userId: currentUserId,
      username: currentUsername,
      avatarBlobId: userProfile?.avatarBlobId,
      viewers: [],
      createdAt: now,
      expiresAt: now + STORY_TTL_MS,
    };
    const all = loadStories();
    saveStories([...all, newStory]);
    setStories(loadStories());
  };

  const handleViewUser = (userId: string) => {
    const startIdx = visibleStories.findIndex((s) => s.userId === userId);
    setViewingIndex(startIdx >= 0 ? startIdx : 0);
  };

  if (!isAuthenticated && visibleStories.length === 0) return null;

  return (
    <>
      <div
        className="flex gap-3 overflow-x-auto hide-scrollbar pb-1"
        data-ocid="stories.section"
      >
        {isAuthenticated && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex flex-col items-center gap-1 flex-shrink-0"
            data-ocid="stories.open_modal_button"
          >
            <div className="relative w-14 h-14">
              <div className="w-14 h-14 rounded-full bg-muted border-2 border-border flex items-center justify-center overflow-hidden">
                {userProfile?.avatarBlobId ? (
                  <img
                    src={getBlobUrl(userProfile.avatarBlobId)}
                    alt="You"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {currentUsername.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                <Plus className="w-3 h-3 text-primary-foreground" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground truncate w-14 text-center">
              Your story
            </span>
          </button>
        )}

        {orderedUserIds.map((uid) => {
          const userStories = userStoryMap[uid];
          const first = userStories[0];
          const isMe = uid === currentUserId;
          const hasUnviewed =
            !isMe &&
            userStories.some(
              (s) => !s.viewers.some((v) => v.userId === currentUserId),
            );

          return (
            <button
              key={uid}
              type="button"
              onClick={() => handleViewUser(uid)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              data-ocid="stories.button"
            >
              <div
                className={`w-14 h-14 rounded-full p-0.5 ${
                  hasUnviewed
                    ? "bg-gradient-to-tr from-red-500 via-yellow-400 to-primary"
                    : "bg-border"
                }`}
              >
                <div className="w-full h-full rounded-full bg-muted border-2 border-background flex items-center justify-center overflow-hidden">
                  {first.avatarBlobId ? (
                    <img
                      src={getBlobUrl(first.avatarBlobId)}
                      alt={first.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold text-muted-foreground">
                      {first.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground truncate w-14 text-center">
                {isMe ? "My story" : first.username}
              </span>
            </button>
          );
        })}
      </div>

      {viewingIndex !== null && (
        <StoryViewerModal
          stories={visibleStories}
          startIndex={viewingIndex}
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          onClose={() => setViewingIndex(null)}
          onStoriesUpdate={setStories}
          onMuteUser={handleMuteUser}
        />
      )}

      <AddStoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddStory}
      />
    </>
  );
}
