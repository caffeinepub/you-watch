import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useStorage } from "../hooks/useStorage";

export type UploadStatus =
  | "queued"
  | "uploading-thumb"
  | "uploading-video"
  | "saving"
  | "complete"
  | "error";

export interface UploadJob {
  id: string;
  title: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

interface UploadMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  duration: number;
}

interface UploadContextValue {
  uploads: UploadJob[];
  startUpload: (
    videoFile: File,
    thumbnailFile: File | null,
    metadata: UploadMetadata,
  ) => void;
  removeUpload: (id: string) => void;
}

const UploadContext = createContext<UploadContextValue>({
  uploads: [],
  startUpload: () => {},
  removeUpload: () => {},
});

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor();
  const { uploadBlob } = useStorage();
  const [uploads, setUploads] = useState<UploadJob[]>([]);
  const actorRef = useRef(actor);
  actorRef.current = actor;
  const uploadBlobRef = useRef(uploadBlob);
  uploadBlobRef.current = uploadBlob;

  const updateJob = useCallback((id: string, patch: Partial<UploadJob>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const startUpload = useCallback(
    (videoFile: File, thumbnailFile: File | null, metadata: UploadMetadata) => {
      const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setUploads((prev) => [
        ...prev,
        { id, title: metadata.title, progress: 0, status: "queued" },
      ]);

      (async () => {
        try {
          let thumbnailBlobId = "";
          if (thumbnailFile) {
            updateJob(id, { status: "uploading-thumb", progress: 0 });
            thumbnailBlobId = await uploadBlobRef.current(
              thumbnailFile,
              (pct) => updateJob(id, { progress: pct * 0.2 }),
            );
          }

          updateJob(id, {
            status: "uploading-video",
            progress: thumbnailFile ? 20 : 0,
          });
          const thumbOffset = thumbnailFile ? 20 : 0;
          const videoBlobId = await uploadBlobRef.current(videoFile, (pct) =>
            updateJob(id, { progress: thumbOffset + pct * 0.75 }),
          );

          updateJob(id, { status: "saving", progress: 95 });
          const currentActor = actorRef.current;
          if (!currentActor) throw new Error("Not connected");
          await currentActor.uploadVideo(
            metadata.title,
            metadata.description,
            metadata.tags,
            metadata.category,
            videoBlobId,
            thumbnailBlobId,
            BigInt(Math.floor(metadata.duration)),
          );

          updateJob(id, { status: "complete", progress: 100 });
        } catch (err) {
          updateJob(id, { status: "error", error: String(err) });
        }
      })();
    },
    [updateJob],
  );

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  return (
    <UploadContext.Provider value={{ uploads, startUpload, removeUpload }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUploadContext() {
  return useContext(UploadContext);
}
