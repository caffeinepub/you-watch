import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart2,
  Eye,
  Film,
  Heart,
  Lock,
  MessageCircle,
  Pencil,
  ThumbsUp,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { useSubscriberStats } from "../hooks/useQueries";

interface DashboardStats {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalLikes: number;
}

interface CreatorVideo {
  id: string;
  title: string;
  thumbnailColor: string;
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
}

interface ActivityItem {
  id: string;
  type: "subscriber" | "comment" | "like";
  description: string;
  time: string;
}

const MOCK_STATS: DashboardStats = {
  totalViews: 284_730,
  totalSubscribers: 12_480,
  totalVideos: 47,
  totalLikes: 34_921,
};

const MOCK_VIDEOS: CreatorVideo[] = [
  {
    id: "1",
    title: "How to Build a Full-Stack App in 2025",
    thumbnailColor: "from-violet-600 to-indigo-700",
    views: 48_230,
    likes: 3_210,
    comments: 187,
    uploadDate: "2025-02-28",
  },
  {
    id: "2",
    title: "The Secret to Viral YouTube Thumbnails",
    thumbnailColor: "from-rose-500 to-orange-600",
    views: 31_504,
    likes: 2_840,
    comments: 144,
    uploadDate: "2025-02-14",
  },
  {
    id: "3",
    title: "React 19 — Everything You Need to Know",
    thumbnailColor: "from-cyan-500 to-blue-700",
    views: 62_180,
    likes: 5_120,
    comments: 310,
    uploadDate: "2025-01-22",
  },
  {
    id: "4",
    title: "5 Hours of Lo-Fi Coding Music",
    thumbnailColor: "from-emerald-500 to-teal-700",
    views: 98_450,
    likes: 11_320,
    comments: 892,
    uploadDate: "2025-01-05",
  },
  {
    id: "5",
    title: "My Desk Setup Tour 2025 — Under $1000",
    thumbnailColor: "from-amber-500 to-yellow-600",
    views: 44_366,
    likes: 12_431,
    comments: 274,
    uploadDate: "2024-12-18",
  },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "subscriber",
    description: "TechEnthusiast_88 subscribed to your channel",
    time: "2 minutes ago",
  },
  {
    id: "2",
    type: "comment",
    description:
      'coder_life left a comment: "This tutorial saved my project, thank you!"',
    time: "14 minutes ago",
  },
  {
    id: "3",
    type: "like",
    description:
      'nova_dev liked your video "React 19 — Everything You Need to Know"',
    time: "31 minutes ago",
  },
  {
    id: "4",
    type: "subscriber",
    description: "pixelcraft_studio subscribed to your channel",
    time: "1 hour ago",
  },
  {
    id: "5",
    type: "comment",
    description:
      'morning_dev left a comment: "Would love a follow-up on deployment!"',
    time: "2 hours ago",
  },
  {
    id: "6",
    type: "like",
    description: 'sarah_codes liked your video "5 Hours of Lo-Fi Coding Music"',
    time: "3 hours ago",
  },
];

function formatNumber(n: number | bigint): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statCards = [
  {
    key: "totalViews",
    label: "Total Views",
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "totalSubscribers",
    label: "Subscribers",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "totalVideos",
    label: "Videos",
    icon: Film,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "totalLikes",
    label: "Total Likes",
    icon: ThumbsUp,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
] as const;

const activityIcons = {
  subscriber: {
    Icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  comment: {
    Icon: MessageCircle,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  like: { Icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function CreatorDashboardPage() {
  const { isAuthenticated, identity } = useAuthContext();
  const currentPrincipal = identity?.getPrincipal() ?? null;

  const { data: subscriberStatsData } = useSubscriberStats(
    isAuthenticated ? currentPrincipal : null,
  );

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [videos, setVideos] = useState<CreatorVideo[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CreatorVideo | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setStatsLoading(true);
    setVideosLoading(true);
    setActivityLoading(true);
    const t1 = setTimeout(() => {
      setStats(MOCK_STATS);
      setStatsLoading(false);
    }, 600);
    const t2 = setTimeout(() => {
      setVideos(MOCK_VIDEOS);
      setVideosLoading(false);
    }, 800);
    const t3 = setTimeout(() => {
      setActivity(MOCK_ACTIVITY);
      setActivityLoading(false);
    }, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">
          Creator Dashboard
        </h2>
        <p className="text-muted-foreground mb-6">
          Login to access your creator dashboard.
        </p>
        <Link to="/auth">
          <Button
            className="brand-gradient text-primary-foreground rounded-full px-8"
            data-ocid="creator_dashboard.primary_button"
          >
            Login
          </Button>
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (!deleteTarget) return;
    setVideos((prev) => prev.filter((v) => v.id !== deleteTarget.id));
    toast.success(`"${deleteTarget.title}" deleted`);
    setDeleteTarget(null);
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/profile">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            data-ocid="creator_dashboard.secondary_button.1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Creator Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your channel at a glance
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Overview
        </h2>
        {statsLoading ? (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            data-ocid="creator_dashboard.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {statCards.map(({ key, label, icon: Icon, color, bg }) => (
              <motion.div key={key} variants={itemVariant}>
                <Card
                  className="rounded-2xl border-border/60 hover:border-primary/30 transition-colors"
                  data-ocid="creator_dashboard.card"
                >
                  <CardContent className="p-4">
                    <div
                      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <p className={`font-display font-bold text-2xl ${color}`}>
                      {stats ? formatNumber(stats[key]) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Subscriber Statistics — live polling */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Subscriber Statistics
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {/* Total Subscribers */}
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="font-display font-bold text-2xl text-emerald-400">
                {subscriberStatsData
                  ? formatNumber(subscriberStatsData.total)
                  : stats
                    ? formatNumber(stats.totalSubscribers)
                    : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total Subscribers
              </p>
            </CardContent>
          </Card>
          {/* Subscriber Growth */}
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <p className="font-display font-bold text-2xl text-blue-400">
                +8.3%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Growth this week
              </p>
            </CardContent>
          </Card>
          {/* New Today */}
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-4">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
                <User className="w-4 h-4 text-violet-400" />
              </div>
              <p className="font-display font-bold text-2xl text-violet-400">
                +24
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">New today</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Video Performance */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Video Performance
        </h2>
        {videosLoading ? (
          <div
            className="space-y-3"
            data-ocid="creator_dashboard.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center"
            data-ocid="creator_dashboard.empty_state"
          >
            <Film className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No videos yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your first video to see performance stats.
            </p>
            <Link to="/upload" className="mt-4">
              <Button
                size="sm"
                className="brand-gradient text-primary-foreground rounded-full"
              >
                Upload Video
              </Button>
            </Link>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {videos.map((video, idx) => (
              <motion.div key={video.id} variants={itemVariant}>
                <Card className="rounded-2xl border-border/60 hover:border-primary/20 transition-colors">
                  <CardContent className="p-3 flex gap-3 items-center">
                    {/* Thumbnail */}
                    <div
                      className={`flex-shrink-0 w-24 h-14 rounded-xl bg-gradient-to-br ${video.thumbnailColor} flex items-center justify-center`}
                    >
                      <Film className="w-5 h-5 text-white/70" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight mb-1">
                        {video.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(video.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(video.likes)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {video.comments}
                        </span>
                        <span>{formatDate(video.uploadDate)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:text-primary"
                        data-ocid={`creator_dashboard.edit_button.${idx + 1}`}
                        onClick={() => toast.info("Edit coming soon")}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:text-destructive"
                        data-ocid={`creator_dashboard.delete_button.${idx + 1}`}
                        onClick={() => setDeleteTarget(video)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:text-blue-400"
                        data-ocid={`creator_dashboard.secondary_button.${idx + 2}`}
                        onClick={() => toast.info("Analytics coming soon")}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recent Activity
        </h2>
        {activityLoading ? (
          <div
            className="space-y-3"
            data-ocid="creator_dashboard.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            className="space-y-2"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {activity.map((a) => {
              const { Icon, color, bg } = activityIcons[a.type];
              return (
                <motion.div key={a.id} variants={itemVariant}>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-2xl border border-border/50 bg-card/50">
                    <div
                      className={`mt-0.5 w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{a.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {a.time}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent data-ocid="creator_dashboard.dialog">
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="creator_dashboard.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="creator_dashboard.confirm_button"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
