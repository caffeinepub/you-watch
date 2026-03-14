# YOU WATCH

## Current State
The backend has no `deleteVideo` function. In CreatorStudioPage, clicking the delete trash icon only removes the video from local state (UI-only), not from the database. The VideoPage has no delete option for creators.

## Requested Changes (Diff)

### Add
- Backend: `deleteVideo(videoId)` function — checks caller is uploader, removes video from `videos` map, removes videoId from all playlists in `playlistVideoIds`, removes from all `userPlaylistIds` tracking.
- Frontend hook: `useDeleteVideo` mutation in `useQueries.ts` that calls `actor.deleteVideo`, then invalidates `["videos"]`, `["video", id]`, `["myPlaylists"]`, and all playlist video queries.
- VideoPage: "Delete Video" option in a creator options menu (3-dot or explicit button visible only to owner). Shows confirmation dialog "Delete this video?" with Delete/Cancel buttons. On confirm, calls `deleteVideo`, shows "Video deleted" toast, navigates back to home.

### Modify
- CreatorStudioPage: `handleDeleteVideo` to call `useDeleteVideo` mutation (real backend) instead of just local state removal. Shows "Video deleted" toast on success.
- Export `useDeleteVideo` from `useVideos.ts`.

### Remove
- Nothing.

## Implementation Plan
1. Add `deleteVideo` shared function to `src/backend/main.mo`.
2. Add `useDeleteVideo` hook to `src/frontend/src/hooks/useQueries.ts`.
3. Export it from `src/frontend/src/hooks/useVideos.ts`.
4. Update `VideoPage.tsx` to add creator delete button with confirmation dialog.
5. Update `CreatorStudioPage.tsx` to call real backend deletion.
