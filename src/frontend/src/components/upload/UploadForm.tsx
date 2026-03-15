import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Film, Image, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type UploadStatus,
  useUploadContext,
} from "../../context/UploadContext";

const CATEGORIES = [
  "Entertainment",
  "Education",
  "Gaming",
  "Music",
  "Sports",
  "News",
  "Science & Tech",
  "Travel",
  "Food",
  "Fashion",
  "Comedy",
  "Film & Animation",
  "Howto & Style",
  "Other",
];

// Extension → MIME mapping for video formats from all sources
const EXT_TO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  qt: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm",
  "3gp": "video/3gpp",
  wmv: "video/x-ms-wmv",
  hevc: "video/hevc",
  ts: "video/mp2t",
  mts: "video/mp2t",
};

function getFriendlyStatus(status: UploadStatus): string {
  switch (status) {
    case "queued":
    case "uploading-thumb":
    case "uploading-video":
      return "Uploading";
    case "saving":
      return "Processing";
    case "paused":
      return "Waiting for connection...";
    case "complete":
      return "Published";
  }
}

/**
 * Resolves a File from any source (Apple Photos, Google Photos, local, camera).
 * - Detects MIME type from extension when the browser reports an empty type.
 * - Never rejects a file just because its MIME string is unrecognised.
 */
async function resolveVideoFile(file: File): Promise<File> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const detectedMime = EXT_TO_MIME[ext];

  // If the browser gave us a proper video MIME, trust it
  if (file.type?.startsWith("video/")) {
    return file;
  }

  // Missing or non-video MIME — reconstruct with detected type
  const mimeType = detectedMime || "video/mp4";
  const resolved = new File([file], file.name, {
    type: mimeType,
    lastModified: file.lastModified,
  });

  return resolved;
}

export default function UploadForm() {
  const navigate = useNavigate();
  const { uploads, startUpload } = useUploadContext();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState("");

  const activeUpload = uploads.find((u) => u.id === submittedId);

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const resolved = await resolveVideoFile(f);
      setVideoFile(resolved);
    } catch {
      // Even if resolution fails, still accept the file as-is
      setVideoFile(f);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setThumbnailFile(f);
      const url = URL.createObjectURL(f);
      setThumbnailPreview(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      toast.error("Please select a video file");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Generate a predictable ID to track this upload
    const uploadId = `upload-${Date.now()}`;
    setSubmittedId(uploadId);

    startUpload(videoFile, thumbnailFile, {
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tagList,
      duration: 0,
    });

    setSubmitted(true);
    toast.success("Upload started! You can navigate away safely.");
  };

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="upload.success_state"
      >
        <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Upload Started!</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Your video is uploading in the background. You can safely navigate to
          other pages — the upload will continue.
        </p>
        {activeUpload && (
          <div className="w-full max-w-sm mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-foreground truncate">
                {activeUpload.title}
              </span>
              <span className="text-muted-foreground">
                {Math.round(activeUpload.progress)}%
              </span>
            </div>
            <Progress value={activeUpload.progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {getFriendlyStatus(activeUpload.status)}
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setVideoFile(null);
              setThumbnailFile(null);
              setTitle("");
              setDescription("");
              setCategory("");
              setTags("");
              setThumbnailPreview("");
            }}
            data-ocid="upload.secondary_button"
          >
            Upload Another
          </Button>
          <Button
            className="brand-gradient text-primary-foreground"
            onClick={() => navigate({ to: "/" })}
            data-ocid="upload.primary_button"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Video File */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Video File *</Label>
        <label
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          data-ocid="upload.dropzone"
        >
          <input
            type="file"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,video/webm,video/3gpp,video/x-ms-wmv,video/hevc,video/mp2t,.mp4,.mov,.avi,.mkv,.webm,.3gp,.m4v,.wmv,.hevc,.ts,.mts"
            className="hidden"
            onChange={handleVideoSelect}
            data-ocid="upload.upload_button"
          />
          {videoFile ? (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <Film className="w-8 h-8 text-primary" />
              <p className="text-sm font-medium text-foreground truncate max-w-full">
                {videoFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(videoFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm font-medium">Select a video to upload</p>
            </div>
          )}
        </label>
      </div>

      {/* Thumbnail */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">
          Thumbnail (optional)
        </Label>
        <div className="flex gap-4 items-start">
          <label
            className="flex-1 flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
            data-ocid="upload.dropzone"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbnailSelect}
            />
            <Image className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">
              Upload thumbnail
            </span>
          </label>
          {thumbnailPreview && (
            <div className="relative w-40 h-28 rounded-lg overflow-hidden shrink-0">
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setThumbnailFile(null);
                  setThumbnailPreview("");
                }}
                className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-semibold mb-2 block">
          Title *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a compelling title..."
          maxLength={100}
          required
          data-ocid="upload.input"
        />
        <p className="text-xs text-muted-foreground mt-1">{title.length}/100</p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="desc" className="text-sm font-semibold mb-2 block">
          Description
        </Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers about your video..."
          rows={4}
          data-ocid="upload.textarea"
        />
      </div>

      {/* Category */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-ocid="upload.select">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags" className="text-sm font-semibold mb-2 block">
          Tags
        </Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="gaming, tutorial, funny (comma separated)"
          data-ocid="upload.input"
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full brand-gradient text-primary-foreground font-bold text-base"
        data-ocid="upload.submit_button"
      >
        <Upload className="w-5 h-5 mr-2" />
        Start Upload
      </Button>
    </form>
  );
}
