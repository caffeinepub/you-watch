import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NotificationRecord } from "../backend";
import { useActor } from "../hooks/useActor";
import { useAuthContext } from "./AuthContext";

export type NotificationType =
  | "new_upload"
  | "comment"
  | "reply"
  | "mention"
  | "subscribe"
  | "like"
  | "story_reaction";

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  important: boolean;
  createdAt: Date;
  actor: { name: string; avatarUrl: string };
  message: string;
  videoThumbnail?: string;
  videoId?: string;
  // for story_reaction
  storyId?: string;
  storyCreatedAt?: number;
  conversationId?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  unreadReactionCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllRead: () => void;
  markAllStoryReactionsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(
  null,
);

// ── Story Reaction Notification helpers ──────────────────────────────────────
const STORY_REACTION_NOTIF_KEY = "yw_story_reaction_notifs";

export interface StoryReactionNotif {
  id: string;
  storyOwnerUserId: string;
  reactorUsername: string;
  reactorAvatarSeed: string;
  emoji: string;
  storyId: string;
  storyCreatedAt: number;
  conversationId: string;
  createdAt: number;
  read: boolean;
}

export function loadStoryReactionNotifs(): StoryReactionNotif[] {
  try {
    return JSON.parse(localStorage.getItem(STORY_REACTION_NOTIF_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveStoryReactionNotifs(notifs: StoryReactionNotif[]) {
  localStorage.setItem(STORY_REACTION_NOTIF_KEY, JSON.stringify(notifs));
  window.dispatchEvent(new Event("yw_notif_update"));
}

export function pushStoryReactionNotif(
  notif: Omit<StoryReactionNotif, "id" | "createdAt" | "read">,
) {
  const existing = loadStoryReactionNotifs();
  const newNotif: StoryReactionNotif = {
    ...notif,
    id: `srn-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    read: false,
  };
  saveStoryReactionNotifs([newNotif, ...existing]);
}

// ── Backend record converter ─────────────────────────────────────────────────
function recordToNotification(r: NotificationRecord): Notification {
  const type = (r.notifType as NotificationType) || "comment";
  const important = type === "subscribe" || type === "mention";
  return {
    id: r.id,
    type,
    read: r.read,
    important,
    createdAt: new Date(Number(r.createdAt) / 1_000_000),
    actor: {
      name: r.actorName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.actorName)}&backgroundColor=random`,
    },
    message: r.message,
    videoId: r.videoId ?? undefined,
  };
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function NotificationsProvider({
  children,
}: { children: React.ReactNode }) {
  const { isAuthenticated, userProfile } = useAuthContext();
  const { actor, isFetching } = useActor();
  const [backendNotifs, setBackendNotifs] = useState<Notification[]>([]);
  const [storyNotifs, setStoryNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Current user id — use username as fallback key
  const currentUserId = userProfile?.username ?? "";

  // Load story reaction notifs from localStorage, filtered to this user
  const loadLocalStoryNotifs = useCallback(() => {
    if (!currentUserId) {
      setStoryNotifs([]);
      return;
    }
    const all = loadStoryReactionNotifs();
    const mine = all.filter((n) => n.storyOwnerUserId === currentUserId);
    const converted: Notification[] = mine.map((n) => ({
      id: n.id,
      type: "story_reaction" as NotificationType,
      read: n.read,
      important: false,
      createdAt: new Date(n.createdAt),
      actor: {
        name: n.reactorUsername,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(n.reactorAvatarSeed)}&backgroundColor=random`,
      },
      message: `${n.reactorUsername} ${n.emoji} reacted to your story`,
      storyId: n.storyId,
      storyCreatedAt: n.storyCreatedAt,
      conversationId: n.conversationId,
    }));
    setStoryNotifs(converted);
  }, [currentUserId]);

  // Listen for storage updates
  useEffect(() => {
    loadLocalStoryNotifs();
    const handler = () => loadLocalStoryNotifs();
    window.addEventListener("yw_notif_update", handler);
    return () => window.removeEventListener("yw_notif_update", handler);
  }, [loadLocalStoryNotifs]);

  const fetchNotifications = useCallback(async () => {
    if (!actor || isFetching || !isAuthenticated) return;
    try {
      const records = await actor.getMyNotifications();
      setBackendNotifs(records.map(recordToNotification));
    } catch {
      // silently fail
    }
  }, [actor, isFetching, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !actor || isFetching) {
      setBackendNotifs([]);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
    pollRef.current = setInterval(fetchNotifications, 20_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAuthenticated, actor, isFetching, fetchNotifications]);

  // Merge backend + story notifs, sorted by createdAt desc
  const notifications: Notification[] = [...backendNotifs, ...storyNotifs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const markRead = useCallback(
    async (id: string) => {
      if (id.startsWith("srn-")) {
        const existing = loadStoryReactionNotifs();
        saveStoryReactionNotifs(
          existing.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      } else {
        setBackendNotifs((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        if (actor) {
          try {
            await actor.markNotificationRead(id);
          } catch {}
        }
      }
    },
    [actor],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      if (id.startsWith("srn-")) {
        const existing = loadStoryReactionNotifs();
        saveStoryReactionNotifs(existing.filter((n) => n.id !== id));
      } else {
        setBackendNotifs((prev) => prev.filter((n) => n.id !== id));
        if (actor) {
          try {
            await actor.deleteMyNotification(id);
          } catch {}
        }
      }
    },
    [actor],
  );

  const markAllRead = useCallback(async () => {
    const existing = loadStoryReactionNotifs();
    saveStoryReactionNotifs(existing.map((n) => ({ ...n, read: true })));
    setBackendNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    if (actor) {
      try {
        await actor.markAllMyNotificationsRead();
      } catch {}
    }
  }, [actor]);

  const markAllStoryReactionsRead = useCallback(() => {
    const existing = loadStoryReactionNotifs();
    const updated = existing.map((n) => ({ ...n, read: true }));
    saveStoryReactionNotifs(updated);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadReactionCount = storyNotifs.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        unreadReactionCount,
        loading,
        markRead,
        deleteNotification,
        markAllRead,
        markAllStoryReactionsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationsProvider",
    );
  return ctx;
}
