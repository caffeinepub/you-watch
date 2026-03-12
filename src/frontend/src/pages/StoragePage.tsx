import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { HardDrive, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type StorageInfo = {
  quota: number;
  usage: number;
  videoCacheSize: number;
  tempSize: number;
  thumbSize: number;
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export default function StoragePage() {
  const [mounted, setMounted] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    quota: 0,
    usage: 0,
    videoCacheSize: 0,
    tempSize: 0,
    thumbSize: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);

    const loadStorage = async () => {
      let quota = 0;
      let usage = 0;
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        quota = est.quota ?? 0;
        usage = est.usage ?? 0;
      }

      const videoCacheSize = Number(
        localStorage.getItem("yw_video_cache_size") ?? 0,
      );
      const tempSize = Number(localStorage.getItem("yw_temp_size") ?? 0);
      const thumbSize = Number(localStorage.getItem("yw_thumb_size") ?? 0);

      setStorageInfo({ quota, usage, videoCacheSize, tempSize, thumbSize });
    };

    loadStorage();
  }, []);

  const clearVideoCache = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("yw_video_cache_size");
    setStorageInfo((p) => ({ ...p, videoCacheSize: 0 }));
    toast.success(
      "Video cache cleared. Cache will regenerate when you watch videos.",
    );
  };

  const clearTempFiles = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("yw_temp_size");
    setStorageInfo((p) => ({ ...p, tempSize: 0 }));
    toast.success("Temporary files cleared");
  };

  const clearThumbnails = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("yw_thumb_size");
    setStorageInfo((p) => ({ ...p, thumbSize: 0 }));
    toast.success("Thumbnail cache cleared");
  };

  const usagePercent =
    storageInfo.quota > 0
      ? Math.min((storageInfo.usage / storageInfo.quota) * 100, 100)
      : 0;

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <HardDrive className="w-6 h-6 text-primary" />
        <h1 className="font-display font-bold text-2xl">Storage &amp; Cache</h1>
      </div>

      {!mounted ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="storage.loading_state"
        >
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Loading storage info...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* App Storage Usage */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold mb-4">App Storage Usage</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Used</span>
                <span className="font-medium">
                  {formatBytes(storageInfo.usage)}
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatBytes(storageInfo.usage)} used</span>
                <span>{formatBytes(storageInfo.quota)} total</span>
              </div>
            </div>
          </div>

          {/* Cache Items */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="font-semibold mb-2">Cache Management</h2>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Video Cache</p>
                <p className="text-xs text-muted-foreground">
                  {storageInfo.videoCacheSize > 0
                    ? formatBytes(storageInfo.videoCacheSize)
                    : "Empty"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearVideoCache}
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                data-ocid="storage.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-sm font-medium">Temporary Files</p>
                <p className="text-xs text-muted-foreground">
                  {storageInfo.tempSize > 0
                    ? formatBytes(storageInfo.tempSize)
                    : "Empty"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearTempFiles}
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                data-ocid="storage.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Thumbnails</p>
                <p className="text-xs text-muted-foreground">
                  {storageInfo.thumbSize > 0
                    ? formatBytes(storageInfo.thumbSize)
                    : "Empty"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearThumbnails}
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                data-ocid="storage.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Clearing cache frees up storage. Videos and thumbnails will reload
            automatically when viewed.
          </p>
        </div>
      )}
    </div>
  );
}
