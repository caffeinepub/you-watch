import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useActor } from "../hooks/useActor";
import { useStorage } from "../hooks/useStorage";
import {
  deleteUploadEntry,
  getUploadEntry,
  saveUploadEntry,
  updateUploadChunks,
} from "../utils/uploadDB";

export type UploadStatus =
  | "queued"
  | "uploading-thumb"
  | "uploading-video"
  | "saving"
  | "complete"
  | "paused";

export interface UploadJob {
  id: string;
  title: string;
  progress: number;
  status: UploadStatus;
  /** true when restored from a previous session and not yet restarted */
  restored?: boolean;
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

const LS_KEY = "youwatch-upload-jobs";

type PersistedJob = Pick<UploadJob, "id" | "title" | "progress" | "status">;

function saveJobsToLS(jobs: UploadJob[]): void {
  try {
    const toSave: PersistedJob[] = jobs
      .filter((j) => j.status !== "complete")
      .map(({ id, title, progress, status }) => ({
        id,
        title,
        progress,
        status,
      }));
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore storage errors
  }
}

function loadJobsFromLS(): UploadJob[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed: PersistedJob[] = JSON.parse(raw);
    return parsed.map((j) => ({
      ...j,
      status: "queued" as UploadStatus,
      progress: 0,
      restored: true,
    }));
  } catch {
    return [];
  }
}

function waitForOnline(): Promise<void> {
  if (navigator.onLine) return Promise.resolve();
  return new Promise((resolve) =>
    window.addEventListener("online", () => resolve(), { once: true }),
  );
}

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { actor } = useActor();
  const { uploadBlob, ready } = useStorage();
  const [uploads, setUploads] = useState<UploadJob[]>(() => loadJobsFromLS());

  const actorRef = useRef(actor);
  actorRef.current = actor;
  const uploadBlobRef = useRef(uploadBlob);
  uploadBlobRef.current = uploadBlob;

  // Track which job ids have been started to avoid double-starting
  const startedIds = useRef<Set<string>>(new Set());

  // Sync to localStorage whenever uploads change
  useEffect(() => {
    saveJobsToLS(uploads);
  }, [uploads]);

  const updateJob = useCallback((id: string, patch: Partial<UploadJob>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const runUploadJob = useCallback(
    async (
      id: string,
      videoFile: Blob,
      thumbnailFile: Blob | null,
      metadata: UploadMetadata,
      initialCompletedChunks?: Set<number>,
    ) => {
      // Retry loop: on any failure, pause and wait for connectivity, then retry
      while (true) {
        try {
          let thumbnailBlobId = "";
          if (thumbnailFile) {
            updateJob(id, {
              status: "uploading-thumb",
              progress: 0,
              restored: false,
            });
            thumbnailBlobId = await uploadBlobRef.current(
              thumbnailFile as File,
              (pct) => updateJob(id, { progress: pct * 0.2 }),
            );
          }

          updateJob(id, {
            status: "uploading-video",
            progress: thumbnailFile ? 20 : 0,
            restored: false,
          });
          const thumbOffset = thumbnailFile ? 20 : 0;

          // Build the resume set — mutated as chunks complete
          const completedChunks = new Set<number>(initialCompletedChunks ?? []);

          const videoBlobId = await uploadBlobRef.current(
            videoFile as File,
            (pct) => updateJob(id, { progress: thumbOffset + pct * 0.75 }),
            completedChunks,
            (chunkIdx) => {
              completedChunks.add(chunkIdx);
              // Persist completed indices to IndexedDB for resume (fire-and-forget)
              updateUploadChunks(id, Array.from(completedChunks)).catch(
                () => {},
              );
            },
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
          await deleteUploadEntry(id);
          // Success — exit the retry loop
          return;
        } catch {
          // Pause silently, wait for network, then retry
          updateJob(id, { status: "paused" });
          await waitForOnline();
          // Small delay before retrying to avoid tight loops
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    },
    [updateJob],
  );

  // Auto-resume queued jobs when storage becomes ready
  useEffect(() => {
    if (!ready) return;
    setUploads((prev) => {
      const queuedRestored = prev.filter(
        (j) =>
          j.status === "queued" && j.restored && !startedIds.current.has(j.id),
      );
      if (queuedRestored.length === 0) return prev;

      // Kick off resume for each
      for (const job of queuedRestored) {
        if (startedIds.current.has(job.id)) continue;
        startedIds.current.add(job.id);
        (async () => {
          const entry = await getUploadEntry(job.id);
          if (!entry) {
            // No IndexedDB entry — silently remove the job
            setUploads((p) => p.filter((u) => u.id !== job.id));
            return;
          }
          // Restore completed chunk indices for resume
          const resumeSet = new Set<number>(entry.completedChunkIndices ?? []);
          await runUploadJob(
            job.id,
            entry.videoBlob,
            entry.thumbnailBlob,
            entry.metadata,
            resumeSet,
          );
        })();
      }
      return prev;
    });
  }, [ready, runUploadJob]);

  const startUpload = useCallback(
    (videoFile: File, thumbnailFile: File | null, metadata: UploadMetadata) => {
      const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      // Save to IndexedDB first (no completedChunkIndices yet)
      saveUploadEntry({
        id,
        videoBlob: videoFile,
        thumbnailBlob: thumbnailFile,
        metadata,
        createdAt: Date.now(),
      }).catch(console.error);

      startedIds.current.add(id);
      setUploads((prev) => [
        ...prev,
        {
          id,
          title: metadata.title,
          progress: 0,
          status: "queued",
          restored: false,
        },
      ]);

      runUploadJob(id, videoFile, thumbnailFile, metadata, new Set());
    },
    [runUploadJob],
  );

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
    deleteUploadEntry(id).catch(() => {});
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
