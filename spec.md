# YOU WATCH

## Current State
Stories are fully implemented with a viewer modal, reply bar, and view counts. The Messages page supports text, emojis, and video link previews. Story replies send a message with a story preview card to the chat.

## Requested Changes (Diff)

### Add
- A Share button in the StoryViewerModal (visible to all viewers, including the owner)
- A ShareStorySheet component — a bottom sheet that lists the user's existing conversations and lets them pick who to share the story with
- When a story is shared, a message is sent to the selected conversation containing a story-share card (story preview thumbnail/text + "@username shared a story" label)
- A `story_share` message type in the conversation system so the chat renders a distinct story-share card (different from a reply card)

### Modify
- `StoriesRow.tsx`: add Share button to `StoryViewerModal`, add `ShareStorySheet` component
- `MessagesPage.tsx`: render `story_share` message type as a clickable story card
- `useConversations` hook: support optional `storyShare` payload on `sendMessage`

### Remove
- Nothing

## Implementation Plan
1. Update `useConversations` hook to accept a `storyShare` payload (similar to `storyPreview`)
2. Add `ShareStorySheet` inside `StoriesRow.tsx` — shows conversations list + send button
3. Add Share (forward) icon button to `StoryViewerModal` header area
4. In `MessagesPage.tsx` render `storyShare` payload as a story card bubble
5. Validate and deploy
