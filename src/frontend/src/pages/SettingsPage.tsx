import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Settings, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  loadMutedUsers,
  saveMutedUsers,
} from "../components/stories/StoriesRow";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Arabic",
  "Chinese",
  "Japanese",
  "Korean",
  "Hindi",
  "Turkish",
  "Italian",
  "Russian",
  "Dutch",
  "Swedish",
];

const CAPTION_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Arabic",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Japanese",
  "Korean",
  "Hindi",
  "Turkish",
  "Italian",
  "Russian",
  "Dutch",
  "Swedish",
  "Polish",
  "Indonesian",
  "Thai",
  "Vietnamese",
  "Swahili",
  "Bengali",
];

const QUALITY_OPTIONS = ["Auto", "1080p", "720p", "480p", "360p"];
const SPEED_OPTIONS = [
  "0.25x",
  "0.5x",
  "0.75x",
  "Normal",
  "1.25x",
  "1.5x",
  "2x",
];

type AppSettings = {
  language: string;
  theme: string;
  profileVisibility: string;
  commentPermission: string;
  personalizedRecs: boolean;
  defaultQuality: string;
  defaultSpeed: string;
  autoCaptions: boolean;
  captionLanguage: string;
  notifySubscribers: boolean;
  notifyComments: boolean;
  notifyUploads: boolean;
  notifySystem: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  language: "English",
  theme: "System",
  profileVisibility: "Everyone",
  commentPermission: "Everyone",
  personalizedRecs: true,
  defaultQuality: "Auto",
  defaultSpeed: "Normal",
  autoCaptions: false,
  captionLanguage: "English",
  notifySubscribers: true,
  notifyComments: true,
  notifyUploads: true,
  notifySystem: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [mutedUsers, setMutedUsers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("yw_settings");
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        // ignore
      }
    }
    setMutedUsers(loadMutedUsers());
  }, []);

  const update = (key: keyof AppSettings, value: string | boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== "undefined") {
        localStorage.setItem("yw_settings", JSON.stringify(next));
      }
      return next;
    });
  };

  const handleUnmute = (userId: string) => {
    const updated = { ...mutedUsers };
    delete updated[userId];
    setMutedUsers(updated);
    saveMutedUsers(updated);
    toast.success("Unmuted successfully");
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Settings saved successfully");
  };

  const mutedEntries = Object.entries(mutedUsers);

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Settings</h1>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 w-full mb-6 bg-muted/50">
          <TabsTrigger value="general" data-ocid="settings.tab">
            General
          </TabsTrigger>
          <TabsTrigger value="privacy" data-ocid="settings.tab">
            Privacy
          </TabsTrigger>
          <TabsTrigger value="video" data-ocid="settings.tab">
            Video &amp; Audio
          </TabsTrigger>
          <TabsTrigger value="notifications" data-ocid="settings.tab">
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                App Language
              </Label>
              <Select
                value={settings.language}
                onValueChange={(v) => update("language", v)}
              >
                <SelectTrigger className="w-full" data-ocid="settings.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">Theme</Label>
              <div className="flex gap-3">
                {["Light", "Dark", "System"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => update("theme", t)}
                    data-ocid="settings.toggle"
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      settings.theme === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Muted Stories Section */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <VolumeX className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Muted Stories</h3>
              {mutedEntries.length > 0 && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {mutedEntries.length}
                </Badge>
              )}
            </div>
            {mutedEntries.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-4"
                data-ocid="muted_stories.empty_state"
              >
                No muted stories. You're seeing all creators.
              </p>
            ) : (
              <div className="space-y-2" data-ocid="muted_stories.list">
                {mutedEntries.map(([userId, username], i) => (
                  <div
                    key={userId}
                    className="flex items-center justify-between py-2"
                    data-ocid={`muted_stories.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">@{username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnmute(userId)}
                      className="text-xs text-primary font-semibold hover:underline"
                      data-ocid={`muted_stories.delete_button.${i + 1}`}
                    >
                      Unmute
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Who can see your profile
              </Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(v) => update("profileVisibility", v)}
              >
                <SelectTrigger data-ocid="settings.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Everyone", "Subscribers", "Nobody"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Who can comment on your videos
              </Label>
              <Select
                value={settings.commentPermission}
                onValueChange={(v) => update("commentPermission", v)}
              >
                <SelectTrigger data-ocid="settings.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Everyone", "Subscribers", "Nobody"].map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Personalized Recommendations
                </p>
                <p className="text-xs text-muted-foreground">
                  Allow YOU WATCH to tailor your feed
                </p>
              </div>
              <Switch
                checked={settings.personalizedRecs}
                onCheckedChange={(v) => update("personalizedRecs", v)}
                data-ocid="settings.switch"
              />
            </div>
          </div>
        </TabsContent>

        {/* Video & Audio */}
        <TabsContent value="video" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Default Video Quality
              </Label>
              <Select
                value={settings.defaultQuality}
                onValueChange={(v) => update("defaultQuality", v)}
              >
                <SelectTrigger data-ocid="settings.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((q) => (
                    <SelectItem key={q} value={q}>
                      {q}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Default Playback Speed
              </Label>
              <Select
                value={settings.defaultSpeed}
                onValueChange={(v) => update("defaultSpeed", v)}
              >
                <SelectTrigger data-ocid="settings.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Auto-enable Captions</p>
                <p className="text-xs text-muted-foreground">
                  Show captions by default on all videos
                </p>
              </div>
              <Switch
                checked={settings.autoCaptions}
                onCheckedChange={(v) => update("autoCaptions", v)}
                data-ocid="settings.switch"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Preferred Caption Language
              </Label>
              <Select
                value={settings.captionLanguage}
                onValueChange={(v) => update("captionLanguage", v)}
              >
                <SelectTrigger data-ocid="settings.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAPTION_LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {[
              {
                key: "notifySubscribers" as const,
                label: "New Subscribers",
                desc: "When someone subscribes to your channel",
              },
              {
                key: "notifyComments" as const,
                label: "Comments",
                desc: "When someone comments on your video",
              },
              {
                key: "notifyUploads" as const,
                label: "Upload Alerts",
                desc: "New videos from channels you follow",
              },
              {
                key: "notifySystem" as const,
                label: "System Notifications",
                desc: "Platform updates and announcements",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-1"
              >
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={settings[item.key] as boolean}
                  onCheckedChange={(v) => update(item.key, v)}
                  data-ocid="settings.switch"
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full brand-gradient text-primary-foreground"
          data-ocid="settings.save_button"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
