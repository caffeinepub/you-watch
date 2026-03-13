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
  | "like";

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
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(
  null,
);

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

export function NotificationsProvider({
  children,
}: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const { actor, isFetching } = useActor();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!actor || isFetching || !isAuthenticated) return;
    try {
      const records = await actor.getMyNotifications();
      setNotifications(records.map(recordToNotification));
    } catch {
      // silently fail — network hiccup
    }
  }, [actor, isFetching, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !actor || isFetching) {
      setNotifications([]);
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

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      if (actor) {
        try {
          await actor.markNotificationRead(id);
        } catch {}
      }
    },
    [actor],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (actor) {
        try {
          await actor.deleteMyNotification(id);
        } catch {}
      }
    },
    [actor],
  );

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (actor) {
      try {
        await actor.markAllMyNotificationsRead();
      } catch {}
    }
  }, [actor]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markRead,
        deleteNotification,
        markAllRead,
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
