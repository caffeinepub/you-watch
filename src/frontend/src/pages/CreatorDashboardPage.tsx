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
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { useAllVideos, useChannel } from "../hooks/useQueries";

interface CreatorVideo {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  uploadDate: string;
}

function formatNumber(n: number | bigint): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

function formatTimestamp(ts: bigint): string {
  // ts is nanoseconds on ICP
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statCards = [
  {
    key: "totalViews" as const,
    label: "Total Views",
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "totalSubscribers" as const,
    label: "Subscribers",
    icon: Users,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "totalVideos" as const,
    label: "Videos",
    icon: Film,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "totalLikes" as const,
    label: "Total Likes",
    icon: ThumbsUp,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
] as const;

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

  const { data: allVideos = [], isLoading: videosLoading } = useAllVideos();
  const { data: channelData, isLoading: channelLoading } = useChannel(
    isAuthenticated ? currentPrincipal : null,
    10_000,
  );

  const [deleteTarget, setDeleteTarget] = useState<CreatorVideo | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  // Filter videos uploaded by the current user
  const creatorVideos = useMemo(() => {
    if (!currentPrincipal) return [];
    return allVideos.filter(
      (v) =>
        v.uploaderUserId.toString() === currentPrincipal.toString() &&
        !deletedIds.has(v.id),
    );
  }, [allVideos, currentPrincipal, deletedIds]);

  const totalSubscribers = Number(channelData?.[1] ?? 0n);

  const stats = useMemo(() => {
    const totalViews = creatorVideos.reduce(
      (sum, v) => sum + Number(v.viewCount),
      0,
    );
    const totalLikes = creatorVideos.reduce(
      (sum, v) => sum + Number(v.likeCount),
      0,
    );
    return {
      totalViews,
      totalSubscribers,
      totalVideos: creatorVideos.length,
      totalLikes,
    };
  }, [creatorVideos, totalSubscribers]);

  const statsLoading = videosLoading || channelLoading;

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
    setDeletedIds((prev) => new Set([...prev, deleteTarget.id]));
    toast.success(`"${deleteTarget.title}" removed`);
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
                      {formatNumber(stats[key])}
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
        {channelLoading ? (
          <Skeleton
            className="h-28 rounded-2xl"
            data-ocid="creator_dashboard.loading_state"
          />
        ) : (
          <Card className="rounded-2xl border-border/60 inline-block">
            <CardContent className="p-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="font-display font-bold text-2xl text-emerald-400">
                {formatNumber(totalSubscribers)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total Subscribers
              </p>
            </CardContent>
          </Card>
        )}
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
        ) : creatorVideos.length === 0 ? (
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
            {creatorVideos.map((video, idx) => {
              const cv: CreatorVideo = {
                id: video.id,
                title: video.title,
                views: Number(video.viewCount),
                likes: Number(video.likeCount),
                comments: Number(video.commentCount),
                uploadDate: formatTimestamp(video.createdAt),
              };
              return (
                <motion.div key={video.id} variants={itemVariant}>
                  <Card className="rounded-2xl border-border/60 hover:border-primary/20 transition-colors">
                    <CardContent className="p-3 flex gap-3 items-center">
                      {/* Thumbnail placeholder */}
                      <div className="flex-shrink-0 w-24 h-14 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                        <Film className="w-5 h-5 text-white/40" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight mb-1">
                          {cv.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(cv.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(cv.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {cv.comments}
                          </span>
                          <span>{cv.uploadDate}</span>
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
                          onClick={() => setDeleteTarget(cv)}
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
            <DialogTitle>Remove Video</DialogTitle>
            <DialogDescription>
              Remove{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>{" "}
              from your dashboard view?
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
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
