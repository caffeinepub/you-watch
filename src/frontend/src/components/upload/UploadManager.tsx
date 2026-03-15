import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { useUploadContext } from "../../context/UploadContext";

export default function UploadManager() {
  const { uploads, removeUpload } = useUploadContext();
  const [minimised, setMinimised] = useState(false);

  const activeUploads = uploads.filter(
    (u) => u.status !== "complete" && u.status !== "error",
  );
  const completedUploads = uploads.filter((u) => u.status === "complete");

  if (uploads.length === 0) return null;

  function getStatusLabel(status: string, restored?: boolean): string {
    if (status === "queued" && restored) return "Resuming...";
    return status.replace("-", " ");
  }

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
            data-ocid="upload.panel_toggle"
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
          {uploads.map((job) => (
            <div
              key={job.id}
              className="px-3 py-2.5 border-b border-border/50 last:border-0"
              data-ocid="upload.row"
            >
              <div className="flex items-start gap-2">
                <div className="shrink-0 mt-0.5">
                  {job.status === "complete" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : job.status === "error" ? (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {job.title}
                  </p>
                  {job.status === "error" ? (
                    <p className="text-xs text-destructive mt-0.5 truncate">
                      {job.error ?? "Upload failed"}
                    </p>
                  ) : job.status !== "complete" ? (
                    <>
                      <Progress value={job.progress} className="h-1 mt-1.5" />
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                        {getStatusLabel(job.status, job.restored)} •{" "}
                        {Math.round(job.progress)}%
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-green-500 mt-0.5">
                      Upload complete
                    </p>
                  )}
                </div>
                {(job.status === "complete" || job.status === "error") && (
                  <button
                    type="button"
                    onClick={() => removeUpload(job.id)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
