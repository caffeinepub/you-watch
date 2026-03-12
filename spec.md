# YOU WATCH — Creator Dashboard

## Current State
The app has ProfilePage with links to /settings, /history, /storage, /drafts. There is no /creator-dashboard route. App.tsx manages all routes.

## Requested Changes (Diff)

### Add
- New page: `/creator-dashboard` (CreatorDashboardPage component)
- Stats cards section: Total Views, Total Subscribers, Total Videos Uploaded, Total Likes — loaded from backend after login
- Video Performance list: thumbnail, title, views, likes, comments, upload date, with Edit/Delete/View Analytics quick actions per video
- Recent Activity section: new subscribers, new comments, likes on videos — loaded from backend after login
- "Creator Dashboard" link/button in ProfilePage's Settings & More section
- Route registration in App.tsx

### Modify
- `ProfilePage.tsx` — add Creator Dashboard entry in the Settings & More links list
- `App.tsx` — add creatorDashboardRoute

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/CreatorDashboardPage.tsx` with:
   - Auth guard (redirect to /auth if not logged in)
   - Stats cards (Total Views, Subscribers, Videos, Likes) loaded client-side from mock/backend data after mount
   - Video performance list with thumbnail, title, views, likes, comments, date, and action buttons (edit, delete, analytics)
   - Recent activity feed (subscribers, comments, likes)
   - All data fetched only after authentication, never at build time
2. Update `App.tsx` to add the /creator-dashboard route
3. Update `ProfilePage.tsx` to add Creator Dashboard link in the menu
