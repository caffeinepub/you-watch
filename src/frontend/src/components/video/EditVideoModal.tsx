import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Video } from "../../backend";
import { useStorage } from "../../hooks/useStorage";
import { useUpdateVideo } from "../../hooks/useVideos";

interface EditVideoModalProps {
  open: boolean;
  video: Video | null;
  onClose: () => void;
}

export default function EditVideoModal({
  open,
  video,
  onClose,
}: EditVideoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailBlobId, setThumbnailBlobId] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadBlob, getBlobUrl } = useStorage();
  const updateVideoMutation = useUpdateVideo();

  // Seed form when video changes
  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description);
      setThumbnailBlobId(video.thumbnailBlobId);
      setThumbnailPreview(getBlobUrl(video.thumbnailBlobId));
    }
  }, [video, getBlobUrl]);

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    setUploadProgress(0);
    try {
      const url = await uploadBlob(file, (pct) => setUploadProgress(pct));
      setThumbnailBlobId(url);
      setThumbnailPreview(url);
    } catch {
      toast.error("Failed to upload thumbnail. Please try again.");
    } finally {
      setUploadingThumbnail(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!video) return;
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    updateVideoMutation.mutate(
      { id: video.id, title: title.trim(), description, thumbnailBlobId },
      {
        onSuccess: () => {
          toast.success("Video updated");
          onClose();
        },
        onError: () => {
          toast.error("Failed to update video. Please try again.");
        },
      },
    );
  };

  const handleClose = () => {
    if (!updateVideoMutation.isPending && !uploadingThumbnail) {
      onClose();
    }
  };

  const isBusy = updateVideoMutation.isPending || uploadingThumbnail;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="sm:max-w-lg bg-card border-border"
        data-ocid="edit_video.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            Edit Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              disabled={isBusy}
              data-ocid="edit_video.title.input"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={4}
              disabled={isBusy}
              className="resize-none"
              data-ocid="edit_video.description.textarea"
            />
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Thumbnail</Label>
            <div className="flex gap-4 items-start">
              {thumbnailPreview ? (
                <div className="relative w-36 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadingThumbnail && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                      <span className="text-white text-xs">
                        {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-36 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <X className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="edit_video.thumbnail.upload_button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {thumbnailPreview ? "Change thumbnail" : "Upload thumbnail"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP · Max 5 MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleThumbnailUpload}
              disabled={isBusy}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isBusy}
            data-ocid="edit_video.cancel.cancel_button"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isBusy}
            data-ocid="edit_video.save.submit_button"
          >
            {updateVideoMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
