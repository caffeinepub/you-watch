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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clapperboard,
  Eye,
  Film,
  Heart,
  ImageIcon,
  ListVideo,
  Lock,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import UserAvatar from "../components/common/UserAvatar";
import { useAuthContext } from "../context/AuthContext";
import {
  useAllVideos,
  useChannel,
  useDeletePlaylist,
  useMyPlaylists,
  useSaveProfile,
} from "../hooks/useQueries";
import { useStorage } from "../hooks/useStorage";

function formatNumber(n: number | bigint): string {
  const num = typeof n === "bigint" ? Number(n) : n;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function CreatorStudioPage() {
  const { isAuthenticated, identity, userProfile, refreshProfile } =
    useAuthContext();
  const currentPrincipal = identity?.getPrincipal() ?? null;
  const principalText = currentPrincipal?.toString() ?? null;
  const queryClient = useQueryClient();
  const { uploadBlob, getBlobUrl } = useStorage();
  const saveProfile = useSaveProfile();

  const { data: allVideos = [], isLoading: videosLoading } = useAllVideos();
  const { data: channelData, isLoading: channelLoading } = useChannel(
    isAuthenticated ? currentPrincipal : null,
    10_000,
  );
  const { data: playlists = [], isLoading: playlistsLoading } =
    useMyPlaylists();
  const deletePlaylist = useDeletePlaylist();

  const [channelName, setChannelName] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const [deleteVideoTarget, setDeleteVideoTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deletedVideoIds, setDeletedVideoIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletePlaylistTarget, setDeletePlaylistTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Banner state
  const [bannerUploading, setBannerUploading] = useState(false);
  const [localBannerUrl, setLocalBannerUrl] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const channelInfo = channelData?.[0] ?? null;
  const totalSubscribers = Number(channelData?.[1] ?? 0n);

  const storedBannerUrl = userProfile?.bannerBlobId
    ? getBlobUrl(userProfile.bannerBlobId)
    : null;
  const bannerUrl = localBannerUrl ?? storedBannerUrl;

  const creatorVideos = useMemo(() => {
    if (!currentPrincipal) return [];
    return allVideos.filter(
      (v) =>
        v.uploaderUserId.toString() === currentPrincipal.toString() &&
        !deletedVideoIds.has(v.id),
    );
  }, [allVideos, currentPrincipal, deletedVideoIds]);

  // Initialise fields from channel data when loaded (run once)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally runs only when channelInfo loads
  useEffect(() => {
    if (channelInfo) {
      setChannelName((channelInfo as { name?: string }).name ?? "");
      setChannelDesc(
        (channelInfo as { description?: string }).description ?? "",
      );
    }
  }, [channelInfo]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Creator Studio</h2>
        <p className="text-muted-foreground mb-6">
          Login to access your Creator Studio.
        </p>
        <Link to="/auth">
          <Button
            className="brand-gradient text-primary-foreground rounded-full px-8"
            data-ocid="creator_studio.primary_button"
          >
            Login
          </Button>
        </Link>
      </div>
    );
  }

  const handleSaveChannel = () => {
    toast.info("Channel settings saved (coming soon)");
  };

  const handleDeleteVideo = () => {
    if (!deleteVideoTarget) return;
    setDeletedVideoIds((prev) => new Set([...prev, deleteVideoTarget.id]));
    toast.success(`"${deleteVideoTarget.title}" removed`);
    setDeleteVideoTarget(null);
  };

  const handleDeletePlaylist = () => {
    if (!deletePlaylistTarget) return;
    deletePlaylist.mutate(deletePlaylistTarget.id, {
      onSuccess: () => {
        toast.success(`"${deletePlaylistTarget.name}" deleted`);
        setDeletePlaylistTarget(null);
      },
      onError: () => {
        toast.error("Failed to delete playlist");
        setDeletePlaylistTarget(null);
      },
    });
  };

  const handleBannerFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setLocalBannerUrl(objectUrl);
    setBannerUploading(true);
    try {
      const blobId = await uploadBlob(file);
      const newProfile = {
        username: userProfile?.username ?? "",
        displayName: userProfile?.displayName ?? "",
        bio: userProfile?.bio ?? "",
        avatarBlobId: userProfile?.avatarBlobId,
        bannerBlobId: blobId,
        createdAt: userProfile?.createdAt ?? BigInt(Date.now() * 1_000_000),
      };
      await new Promise<void>((resolve, reject) => {
        saveProfile.mutate(newProfile, {
          onSuccess: () => resolve(),
          onError: () => reject(new Error("save failed")),
        });
      });
      await refreshProfile();
      if (principalText) {
        queryClient.invalidateQueries({
          queryKey: ["userProfile", principalText],
        });
        queryClient.invalidateQueries({ queryKey: ["channel", principalText] });
      }
      setLocalBannerUrl(null);
      toast.success("Channel banner updated!");
    } catch {
      setLocalBannerUrl(null);
      toast.error("Failed to upload banner");
    } finally {
      setBannerUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const handleRemoveBanner = async () => {
    setBannerUploading(true);
    try {
      const newProfile = {
        username: userProfile?.username ?? "",
        displayName: userProfile?.displayName ?? "",
        bio: userProfile?.bio ?? "",
        avatarBlobId: userProfile?.avatarBlobId,
        bannerBlobId: undefined,
        createdAt: userProfile?.createdAt ?? BigInt(Date.now() * 1_000_000),
      };
      await new Promise<void>((resolve, reject) => {
        saveProfile.mutate(newProfile, {
          onSuccess: () => resolve(),
          onError: () => reject(new Error("save failed")),
        });
      });
      await refreshProfile();
      if (principalText) {
        queryClient.invalidateQueries({
          queryKey: ["userProfile", principalText],
        });
        queryClient.invalidateQueries({ queryKey: ["channel", principalText] });
      }
      toast.success("Banner removed");
    } catch {
      toast.error("Failed to remove banner");
    } finally {
      setBannerUploading(false);
    }
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
            data-ocid="creator_studio.secondary_button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-primary" />
            Creator Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your channel and content
          </p>
        </div>
        <div className="ml-auto">
          <UserAvatar
            name={userProfile?.displayName ?? userProfile?.username ?? ""}
            blobId={userProfile?.avatarBlobId ?? undefined}
            size="md"
          />
        </div>
      </div>

      {/* Channel Banner */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Channel Banner
        </h2>
        <Card className="rounded-2xl border-border/60 overflow-hidden">
          {/* Banner preview area */}
          <div className="relative w-full h-36 bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden">
            {bannerUploading ? (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60"
                data-ocid="creator_studio.banner.loading_state"
              >
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
                <span className="text-xs text-white/70">Uploading...</span>
              </div>
            ) : bannerUrl ? (
              <>
                <img
                  src={bannerUrl}
                  alt="Channel banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveBanner}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                  data-ocid="creator_studio.banner.delete_button"
                  aria-label="Remove banner"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-xs opacity-50">No banner uploaded</span>
              </div>
            )}
          </div>

          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Channel banner image</p>
              <p className="text-xs text-muted-foreground">
                Recommended: 2560 × 1440 px, JPG or PNG
              </p>
            </div>
            <div className="flex gap-2">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerFileChange}
                data-ocid="creator_studio.banner.upload_button"
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
                disabled={bannerUploading}
                onClick={() => bannerInputRef.current?.click()}
                data-ocid="creator_studio.banner.primary_button"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                {bannerUrl ? "Change" : "Upload"}
              </Button>
              {bannerUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-destructive hover:text-destructive gap-2"
                  disabled={bannerUploading}
                  onClick={handleRemoveBanner}
                  data-ocid="creator_studio.banner.delete_button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Channel Settings */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Channel Settings
        </h2>
        {channelLoading ? (
          <Skeleton
            className="h-56 rounded-2xl"
            data-ocid="creator_studio.loading_state"
          />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={itemVariant}>
              <Card
                className="rounded-2xl border-border/60"
                data-ocid="creator_studio.card"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Subscribers
                      </span>
                      <span className="font-display font-bold text-xl text-emerald-400">
                        {formatNumber(totalSubscribers)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Videos
                      </span>
                      <span className="font-display font-bold text-xl text-violet-400">
                        {creatorVideos.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="channel-name"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Channel Name
                    </label>
                    <Input
                      id="channel-name"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="Your channel name"
                      className="rounded-xl"
                      data-ocid="creator_studio.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="channel-desc"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Description
                    </label>
                    <Textarea
                      id="channel-desc"
                      value={channelDesc}
                      onChange={(e) => setChannelDesc(e.target.value)}
                      placeholder="Describe your channel..."
                      rows={3}
                      className="rounded-xl resize-none"
                      data-ocid="creator_studio.textarea"
                    />
                  </div>
                  <Button
                    onClick={handleSaveChannel}
                    className="brand-gradient text-primary-foreground rounded-full px-6"
                    data-ocid="creator_studio.save_button"
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* Profile Picture */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Profile Picture
        </h2>
        <Card className="rounded-2xl border-border/60">
          <CardContent className="p-5 flex items-center gap-5">
            <UserAvatar
              name={userProfile?.displayName ?? userProfile?.username ?? ""}
              blobId={userProfile?.avatarBlobId ?? undefined}
              size="lg"
            />
            <div>
              <p className="text-sm font-medium mb-1">Your profile photo</p>
              <p className="text-xs text-muted-foreground mb-3">
                Update your profile photo from the Profile page.
              </p>
              <Link to="/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                  data-ocid="creator_studio.secondary_button"
                >
                  <User className="w-3.5 h-3.5" />
                  Go to Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Video Management */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Video Management
        </h2>
        {videosLoading ? (
          <div className="space-y-3" data-ocid="creator_studio.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : creatorVideos.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-border text-center"
            data-ocid="creator_studio.empty_state"
          >
            <Film className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No videos yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Upload your first video to manage it here.
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
            {creatorVideos.map((video, idx) => (
              <motion.div key={video.id} variants={itemVariant}>
                <Card className="rounded-2xl border-border/60 hover:border-primary/20 transition-colors">
                  <CardContent className="p-3 flex gap-3 items-center">
                    <div className="flex-shrink-0 w-24 h-14 rounded-xl bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
                      <Film className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight mb-1">
                        {video.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(video.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {formatNumber(video.likeCount)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:text-primary"
                        data-ocid={`creator_studio.edit_button.${idx + 1}`}
                        onClick={() => toast.info("Edit coming soon")}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl hover:text-destructive"
                        data-ocid={`creator_studio.delete_button.${idx + 1}`}
                        onClick={() =>
                          setDeleteVideoTarget({
                            id: video.id,
                            title: video.title,
                          })
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Playlist Management */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Playlist Management
          </h2>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full gap-1.5 text-xs"
            data-ocid="creator_studio.primary_button"
            onClick={() => toast.info("Create playlist coming soon")}
          >
            <Plus className="w-3.5 h-3.5" />
            New Playlist
          </Button>
        </div>
        {playlistsLoading ? (
          <div className="space-y-3" data-ocid="creator_studio.loading_state">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 rounded-2xl border border-dashed border-border text-center"
            data-ocid="creator_studio.empty_state"
          >
            <ListVideo className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">No playlists yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first playlist to organise your videos.
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {playlists.map((playlist, idx) => (
              <motion.div key={playlist.id} variants={itemVariant}>
                <Card className="rounded-2xl border-border/60 hover:border-primary/20 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                      <ListVideo className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {playlist.name}
                      </p>
                      <p className="text-xs text-muted-foreground">0 videos</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-xl hover:text-destructive flex-shrink-0"
                      data-ocid={`creator_studio.delete_button.${idx + 1}`}
                      onClick={() =>
                        setDeletePlaylistTarget({
                          id: playlist.id,
                          name: playlist.name,
                        })
                      }
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Delete Video Dialog */}
      <Dialog
        open={!!deleteVideoTarget}
        onOpenChange={(open) => !open && setDeleteVideoTarget(null)}
      >
        <DialogContent data-ocid="creator_studio.dialog">
          <DialogHeader>
            <DialogTitle>Remove Video</DialogTitle>
            <DialogDescription>
              Remove{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deleteVideoTarget?.title}&rdquo;
              </span>{" "}
              from your studio view?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteVideoTarget(null)}
              data-ocid="creator_studio.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteVideo}
              data-ocid="creator_studio.confirm_button"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Playlist Dialog */}
      <Dialog
        open={!!deletePlaylistTarget}
        onOpenChange={(open) => !open && setDeletePlaylistTarget(null)}
      >
        <DialogContent data-ocid="creator_studio.dialog">
          <DialogHeader>
            <DialogTitle>Delete Playlist</DialogTitle>
            <DialogDescription>
              Delete{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{deletePlaylistTarget?.name}&rdquo;
              </span>
              ? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletePlaylistTarget(null)}
              data-ocid="creator_studio.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlaylist}
              data-ocid="creator_studio.confirm_button"
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
