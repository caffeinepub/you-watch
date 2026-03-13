const KEY_PREFIX = "yw_progress_";

interface ProgressEntry {
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export function saveProgress(
  videoId: string,
  currentTime: number,
  duration: number,
): void {
  const entry: ProgressEntry = { currentTime, duration, updatedAt: Date.now() };
  try {
    localStorage.setItem(`${KEY_PREFIX}${videoId}`, JSON.stringify(entry));
  } catch {
    // ignore quota errors
  }
}

export function getProgress(
  videoId: string,
): { currentTime: number; duration: number } | null {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${videoId}`);
    if (!raw) return null;
    const entry: ProgressEntry = JSON.parse(raw);
    return { currentTime: entry.currentTime, duration: entry.duration };
  } catch {
    return null;
  }
}

export function clearProgress(videoId: string): void {
  try {
    localStorage.removeItem(`${KEY_PREFIX}${videoId}`);
  } catch {
    // ignore
  }
}

export interface ProgressRecord {
  videoId: string;
  currentTime: number;
  duration: number;
  updatedAt: number;
}

export function getAllProgress(): ProgressRecord[] {
  const results: ProgressRecord[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(KEY_PREFIX)) continue;
      const videoId = key.slice(KEY_PREFIX.length);
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const entry: ProgressEntry = JSON.parse(raw);
      results.push({ videoId, ...entry });
    }
  } catch {
    // ignore
  }
  return results.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function formatResumeTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
