import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  type UploadStatus,
  useUploadContext,
} from "../../context/UploadContext";

/** Tracks real navigator.onLine status */
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

function getFriendlyStatus(status: UploadStatus, isOnline: boolean): string {
  switch (status) {
    case "queued":
    case "uploading-thumb":
    case "uploading-video":
      return "Uploading";
    case "saving":
      return "Processing";
    case "paused":
      // Only show waiting message if actually offline
      return isOnline ? "Uploading" : "Waiting for connection...";
    case "complete":
      return "Published";
  }
}

export default function UploadManager() {
  const { uploads, removeUpload } = useUploadContext();
  const [minimised, setMinimised] = useState(false);
  const isOnline = useOnlineStatus();

  const activeUploads = uploads.filter((u) => u.status !== "complete");
  const completedUploads = uploads.filter((u) => u.status === "complete");

  if (uploads.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 right-4 md:bottom-6 z-50 w-72 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
      data-ocid="upload.panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Upload className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold">
            {activeUploads.length > 0
              ? `${activeUploads.length} uploading`
              : `${completedUploads.length} complete`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {completedUploads.length > 0 && activeUploads.length === 0 && (
            <button
              type="button"
              onClick={() => {
                for (const u of completedUploads) removeUpload(u.id);
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={() => setMinimised((v) => !v)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={
              minimised ? "Expand uploads panel" : "Minimise uploads panel"
            }
            data-ocid="upload.toggle"
          >
            {minimised ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Job list */}
      {!minimised && (
        <div className="max-h-64 overflow-y-auto">
          {uploads.map((job) => {
            // For paused+online: treat visually as uploading
            const isWaitingOffline = job.status === "paused" && !isOnline;
            const showProgress = job.status !== "complete" && !isWaitingOffline;

            return (
              <div
                key={job.id}
                className="px-3 py-2.5 border-b border-border/50 last:border-0"
                data-ocid="upload.row"
              >
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">
                    {job.status === "complete" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {job.title}
                    </p>
                    {job.status === "complete" ? (
                      <p className="text-xs text-green-500 mt-0.5">Published</p>
                    ) : (
                      <>
                        {showProgress && (
                          <Progress
                            value={job.progress}
                            className="h-1 mt-1.5"
                          />
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getFriendlyStatus(job.status, isOnline)}
                          {showProgress && ` • ${Math.round(job.progress)}%`}
                        </p>
                      </>
                    )}
                  </div>
                  {job.status === "complete" && (
                    <button
                      type="button"
                      onClick={() => removeUpload(job.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                      data-ocid="upload.close_button"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
