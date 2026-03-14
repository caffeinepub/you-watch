# YOU WATCH

## Current State
The Messages page has a search bar that only searches across existing conversation users (local filter). There is no backend `searchUsers` API. The backend `users` Map contains all registered user profiles but is not exposed for search.

## Requested Changes (Diff)

### Add
- `searchUsers(query: Text): [UserSearchResult]` backend query — searches all registered users by username (case-insensitive, partial match), excludes the caller, returns max 20 results with username and avatarBlobId.
- `UserSearchResult` type in backend and `backend.d.ts`.
- Backend-powered user search in `MessagesPage.tsx` replacing the current local conversation filter.

### Modify
- `main.mo`: add `UserSearchResult` type and `searchUsers` query function.
- `backend.d.ts`: add `UserSearchResult` interface and `searchUsers` method.
- `MessagesPage.tsx`: replace `searchConversationUsers` with a `useEffect` that calls `actor.searchUsers(query)` and renders real results with avatar and username.

### Remove
- `searchConversationUsers` local helper function from `MessagesPage.tsx`.

## Implementation Plan
1. Add `UserSearchResult` type and `searchUsers` to `main.mo`.
2. Add `UserSearchResult` interface and `searchUsers` signature to `backend.d.ts`.
3. Update `MessagesPage.tsx` to call `actor.searchUsers(query)` debounced, show avatar (via `getBlobUrl`) and username, keep empty state "No users found".
