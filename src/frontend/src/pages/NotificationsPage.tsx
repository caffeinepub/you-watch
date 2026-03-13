import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Heart,
  MessageCircle,
  MoreVertical,
  ThumbsUp,
  Upload,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  type Notification,
  type NotificationType,
  useNotifications,
} from "../context/NotificationsContext";

type FilterTab = "all" | "comments" | "mentions";

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  new_upload: <Upload className="w-4 h-4" />,
  comment: <MessageCircle className="w-4 h-4" />,
  reply: <MessageCircle className="w-4 h-4" />,
  mention: <Bell className="w-4 h-4" />,
  subscribe: <UserPlus className="w-4 h-4" />,
  like: <ThumbsUp className="w-4 h-4" />,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  new_upload: "bg-blue-500/20 text-blue-400",
  comment: "bg-green-500/20 text-green-400",
  reply: "bg-teal-500/20 text-teal-400",
  mention: "bg-purple-500/20 text-purple-400",
  subscribe: "bg-rose-500/20 text-rose-400",
  like: "bg-amber-500/20 text-amber-400",
};

function NotificationRow({
  notification,
  index,
}: {
  notification: Notification;
  index: number;
}) {
  const { markRead, deleteNotification } = useNotifications();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      data-ocid={`notifications.item.${index}`}
      className={`relative flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group ${
        !notification.read ? "border-l-2 border-primary bg-primary/5" : ""
      }`}
      onClick={() => markRead(notification.id)}
    >
      {/* Avatar */}
      <div className="shrink-0 relative">
        <img
          src={notification.actor.avatarUrl}
          alt={notification.actor.name}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            const fallback = el.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div className="w-10 h-10 rounded-full bg-muted items-center justify-center text-sm font-bold text-foreground hidden">
          {notification.actor.name.charAt(0)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {relativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Right: type icon */}
      <div className="shrink-0 flex items-start gap-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            TYPE_COLORS[notification.type] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {TYPE_ICONS[notification.type]}
        </div>

        {/* Three-dot menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="p-1 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {!notification.read && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  markRead(notification.id);
                }}
              >
                Mark as read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              data-ocid={`notifications.delete_button.${index}`}
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                deleteNotification(notification.id);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-5 px-1">
      {label}
    </h3>
  );
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAllRead } =
    useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (activeTab === "comments") {
      return notifications.filter(
        (n) => n.type === "comment" || n.type === "reply",
      );
    }
    if (activeTab === "mentions") {
      return notifications.filter((n) => n.type === "mention");
    }
    return notifications;
  }, [notifications, activeTab]);

  const important = filtered.filter((n) => n.important && !n.read);
  const today = filtered.filter(
    (n) => !(n.important && !n.read) && isToday(n.createdAt),
  );
  const earlier = filtered.filter(
    (n) => !(n.important && !n.read) && !isToday(n.createdAt),
  );

  let rowIndex = 0;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "comments", label: "Comments" },
    { key: "mentions", label: "Mentions" },
  ];

  const emptyMessage =
    activeTab === "comments"
      ? "No comments or replies yet"
      : activeTab === "mentions"
        ? "No mentions yet"
        : "No notifications yet";

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-6 pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            type="button"
            data-ocid="notifications.mark_read_button"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-2 bg-muted/40 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            data-ocid="notifications.tab"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.key === "all" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div
          className="flex items-center justify-center py-12"
          data-ocid="notifications.loading_state"
        >
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Notification Sections */}
      {!loading && (
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
              data-ocid="notifications.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold text-lg">
                {emptyMessage}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Notifications will appear here when something happens.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {important.length > 0 && (
                <div>
                  <SectionHeader label="Important" />
                  <AnimatePresence>
                    {important.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        index={++rowIndex}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {today.length > 0 && (
                <div>
                  <SectionHeader label="Today" />
                  <AnimatePresence>
                    {today.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        index={++rowIndex}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {earlier.length > 0 && (
                <div>
                  <SectionHeader label="Earlier" />
                  <AnimatePresence>
                    {earlier.map((n) => (
                      <NotificationRow
                        key={n.id}
                        notification={n}
                        index={++rowIndex}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
