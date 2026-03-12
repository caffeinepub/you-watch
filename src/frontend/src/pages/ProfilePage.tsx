import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, LogOut, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "../context/AuthContext";
import { useSaveProfile } from "../hooks/useQueries";
import { useStorage } from "../hooks/useStorage";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, identity, userProfile, logout, refreshProfile } =
    useAuthContext();
  const { mutate: saveProfile, isPending } = useSaveProfile();
  const { getBlobUrl } = useStorage();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [edited, setEdited] = useState(false);

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

  const avatarUrl = userProfile?.avatarBlobId
    ? getBlobUrl(userProfile.avatarBlobId)
    : "";
  const principalText = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = `${principalText.slice(0, 10)}...${principalText.slice(-4)}`;

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

  return (
    <div className="px-4 py-6 max-w-lg mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Profile</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-3">
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
        <p className="text-xs text-muted-foreground font-mono">
          {shortPrincipal}
        </p>
        <Link
          to="/channel/$userId"
          params={{ userId: principalText }}
          className="text-xs text-primary hover:underline mt-1"
          data-ocid="profile.link"
        >
          View Channel
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
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
    </div>
  );
}
