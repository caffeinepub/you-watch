# YOU WATCH

## Current State
Stories are fully implemented with viewing, replies, sharing, view counts, and clickable preview cards in chat. The StoryViewerModal in StoriesRow.tsx handles all story interactions. Progress bars are static (no timer-based fill). No reaction buttons exist. No mute functionality exists.

## Requested Changes (Diff)

### Add
- **Story Reactions**: Row of 5 emoji reactions (❤️ 👍 😂 😮 🔥) shown while viewing a story (non-owner only). Tapping a reaction sends it as a message to the story owner in Messages and shows a brief sent confirmation.
- **Story Progress Indicator**: Animated timer-based progress bar at the top of the story viewer. Each story auto-advances after a set duration (5s for text, 7s for image). Bar fills smoothly and auto-moves to next story on completion.
- **Mute Stories**: Long-press or three-dot menu on a story circle in the row to mute that creator. Muted creators' stories are hidden from the stories row. Muted list stored in localStorage. Users can unmute from Settings page under a "Muted Stories" section.

### Modify
- StoryViewerModal: Add animated progress bar, reaction buttons, and mute option
- StoriesRow: Filter out muted users from story circles
- SettingsPage: Add Muted Stories section with unmute controls

### Remove
- Static non-animated progress bar segments (replace with timed animated version)

## Implementation Plan
1. Add mute helpers (localStorage key, load/save muted list)
2. Update StoryViewerModal: replace static progress bars with timer-driven animated bars that auto-advance
3. Add StoryReactions component below reply bar (non-owner only): 5 emoji buttons, tap sends message to story owner
4. Add mute option (three-dot menu in story header) to mute the current story creator
5. Filter muted users from StoriesRow circles
6. Add Muted Stories section in SettingsPage with list of muted creators and unmute buttons
