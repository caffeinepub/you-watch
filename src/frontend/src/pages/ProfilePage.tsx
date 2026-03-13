import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  FileVideo,
  HardDrive,
  History,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Save,
  Settings,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { useSaveProfile } from "../hooks/useQueries";
import { useStorage } from "../hooks/useStorage";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, identity, userProfile, logout, refreshProfile } =
    useAuthContext();
  const { mutate: saveProfile, isPending } = useSaveProfile();
  const { uploadBlob, getBlobUrl } = useStorage();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [edited, setEdited] = useState(false);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username);
      setDisplayName(userProfile.displayName);
      setBio(userProfile.bio);
    }
  }, [userProfile]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Profile</h2>
        <p className="text-muted-foreground mb-6">
          Login to view and edit your profile.
        </p>
        <Link to="/auth">
          <Button
            className="brand-gradient text-primary-foreground rounded-full px-8"
            data-ocid="profile.primary_button"
          >
            Login
          </Button>
        </Link>
      </div>
    );
  }

  const storedAvatarUrl = userProfile?.avatarBlobId
    ? getBlobUrl(userProfile.avatarBlobId)
    : "";
  const avatarUrl = localAvatarUrl ?? storedAvatarUrl;
  const principalText = identity?.getPrincipal().toString() ?? "";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    saveProfile(
      {
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        bio: bio.trim(),
        avatarBlobId: userProfile?.avatarBlobId,
        bannerBlobId: userProfile?.bannerBlobId,
        createdAt: userProfile?.createdAt ?? BigInt(Date.now() * 1_000_000),
      },
      {
        onSuccess: () => {
          toast.success("Profile saved!");
          setEdited(false);
          refreshProfile();
        },
        onError: () => toast.error("Failed to save profile"),
      },
    );
  };

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    // Preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalAvatarUrl(objectUrl);
    setAvatarSheetOpen(false);
    setAvatarUploading(true);
    try {
      const blobUrl = await uploadBlob(file);
      const newProfile = {
        username: userProfile?.username ?? username.trim(),
        displayName: userProfile?.displayName ?? displayName.trim(),
        bio: userProfile?.bio ?? bio.trim(),
        avatarBlobId: blobUrl,
        bannerBlobId: userProfile?.bannerBlobId,
        createdAt: userProfile?.createdAt ?? BigInt(Date.now() * 1_000_000),
      };
      await new Promise<void>((resolve, reject) => {
        saveProfile(newProfile, {
          onSuccess: () => resolve(),
          onError: () => reject(new Error("save failed")),
        });
      });
      await refreshProfile();
      setLocalAvatarUrl(null);
      toast.success("Profile photo updated!");
    } catch {
      setLocalAvatarUrl(null);
      toast.error("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    setAvatarSheetOpen(false);
    setAvatarUploading(true);
    try {
      const newProfile = {
        username: userProfile?.username ?? username.trim(),
        displayName: userProfile?.displayName ?? displayName.trim(),
        bio: userProfile?.bio ?? bio.trim(),
        avatarBlobId: undefined,
        bannerBlobId: userProfile?.bannerBlobId,
        createdAt: userProfile?.createdAt ?? BigInt(Date.now() * 1_000_000),
      };
      await new Promise<void>((resolve, reject) => {
        saveProfile(newProfile, {
          onSuccess: () => resolve(),
          onError: () => reject(new Error("save failed")),
        });
      });
      await refreshProfile();
      setLocalAvatarUrl(null);
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed to remove photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Profile</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        {/* Tappable avatar */}
        <button
          type="button"
          className="relative w-24 h-24 rounded-full group focus:outline-none mb-3"
          onClick={() => setAvatarSheetOpen(true)}
          data-ocid="profile.open_modal_button"
          aria-label="Change profile photo"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full brand-gradient flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          {/* Edit overlay */}
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {avatarUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
          {/* Small pencil badge */}
          {!avatarUploading && (
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary border-2 border-background flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFileChange}
          data-ocid="profile.upload_button"
        />

        {userProfile?.displayName && (
          <p className="font-semibold text-base">{userProfile.displayName}</p>
        )}
        {userProfile?.username && (
          <p className="text-sm text-muted-foreground">
            @{userProfile.username}
          </p>
        )}
        {userProfile?.bio && (
          <p className="text-sm text-center text-muted-foreground mt-1 max-w-xs">
            {userProfile.bio}
          </p>
        )}
        <Link
          to="/channel/$userId"
          params={{ userId: principalText }}
          className="text-xs text-primary hover:underline mt-2"
          data-ocid="profile.link"
        >
          View Channel
        </Link>
      </div>

      {/* Avatar options sheet */}
      <Sheet open={avatarSheetOpen} onOpenChange={setAvatarSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-8"
          data-ocid="profile.sheet"
        >
          <SheetHeader className="mb-4">
            <SheetTitle>Profile Photo</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            {/* Upload / Change */}
            <button
              type="button"
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-muted/60 transition-colors text-left w-full"
              onClick={() => {
                setAvatarSheetOpen(false);
                setTimeout(() => fileInputRef.current?.click(), 150);
              }}
              data-ocid="profile.upload_button"
            >
              {avatarUrl ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Pencil className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Change image</p>
                    <p className="text-xs text-muted-foreground">
                      Replace your current photo
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Upload image</p>
                    <p className="text-xs text-muted-foreground">
                      Choose a photo from your device
                    </p>
                  </div>
                </>
              )}
            </button>

            {/* Delete — only shown if avatar exists */}
            {avatarUrl && (
              <button
                type="button"
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-destructive/10 transition-colors text-left w-full"
                onClick={handleDeleteAvatar}
                data-ocid="profile.delete_button"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-sm text-destructive">
                    Delete image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Remove your profile photo
                  </p>
                </div>
              </button>
            )}

            <Button
              variant="outline"
              className="mt-2 rounded-xl"
              onClick={() => setAvatarSheetOpen(false)}
              data-ocid="profile.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <form onSubmit={handleSave} className="space-y-5 mb-8">
        <div>
          <Label
            htmlFor="username"
            className="text-sm font-semibold mb-1.5 block"
          >
            Username *
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setEdited(true);
            }}
            placeholder="your_username"
            data-ocid="profile.input"
          />
        </div>
        <div>
          <Label
            htmlFor="displayName"
            className="text-sm font-semibold mb-1.5 block"
          >
            Display Name
          </Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setEdited(true);
            }}
            placeholder="Your Name"
            data-ocid="profile.input"
          />
        </div>
        <div>
          <Label htmlFor="bio" className="text-sm font-semibold mb-1.5 block">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setEdited(true);
            }}
            placeholder="Tell the world about yourself..."
            rows={3}
            data-ocid="profile.textarea"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isPending || !edited}
            className="flex-1 brand-gradient text-primary-foreground"
            data-ocid="profile.save_button"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Profile
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await logout();
              navigate({ to: "/" });
            }}
            className="gap-2"
            data-ocid="profile.delete_button"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </form>

      <Separator className="mb-6" />

      {/* Settings & More */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Settings &amp; More
        </h2>
        <Link to="/creator-dashboard" data-ocid="profile.link">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Creator Dashboard</p>
              <p className="text-xs text-muted-foreground">
                Stats, video performance, and activity
              </p>
            </div>
          </div>
        </Link>
        <Link to="/settings" data-ocid="profile.link">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors">
            <Settings className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Settings</p>
              <p className="text-xs text-muted-foreground">
                Language, theme, privacy, notifications
              </p>
            </div>
          </div>
        </Link>
        <Link to="/history" data-ocid="profile.link">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors">
            <History className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">History</p>
              <p className="text-xs text-muted-foreground">
                Watch, search, comment, and like history
              </p>
            </div>
          </div>
        </Link>
        <Link to="/storage" data-ocid="profile.link">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors">
            <HardDrive className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Storage &amp; Cache</p>
              <p className="text-xs text-muted-foreground">
                Manage cached videos and app storage
              </p>
            </div>
          </div>
        </Link>
        <Link to="/drafts" data-ocid="profile.link">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:bg-muted/50 transition-colors">
            <FileVideo className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Draft Videos</p>
              <p className="text-xs text-muted-foreground">
                Continue or manage your draft uploads
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
