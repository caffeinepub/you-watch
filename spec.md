# YOU WATCH

## Current State
`StorageClient.ts` exposes only `putFile` (accepts raw `Uint8Array`, parallel upload, no resume) and `getDirectURL`. However `useStorage.ts` calls `client.putBlob(file, onProgress, resumedChunks, onChunkComplete)` which does not exist, causing a TypeError that surfaces as the upload failing before the blob-tree step.

## Requested Changes (Diff)

### Add
- `putBlob(file, onProgress, resumedChunks, onChunkComplete)` public method on `StorageClient`
  - Streams file in 1 MB slices (never loads full file into memory)
  - Computes per-chunk YHash and builds `BlobHashTree`
  - Fetches canister certificate, uploads blob tree, then uploads chunks
  - Skips chunks present in `resumedChunks`, fires `onChunkComplete` after each successful chunk
  - Reports fractional progress (0–1) via `onProgress`
  - Returns `{ hash: string }` in the same shape `useStorage.ts` expects

### Modify
- Nothing else; no UI, no other upload logic changed

### Remove
- Nothing

## Implementation Plan
1. Add `putBlob` method to `StorageClient` class in `StorageClient.ts`, reusing existing `createFileChunks`, `BlobHashTree.build`, `getCertificate`, and `storageGatewayClient` helpers.
2. Handle resume: when `resumedChunks` is provided, skip blob-tree re-upload if a `409 Conflict` (already exists) is returned, and skip already-completed chunk indices.
3. Validate and deploy.
