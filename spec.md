# YOU WATCH

## Current State
- VideoPage has a 2-column layout (desktop): left column has player/info/actions/description/comments, right column has suggested videos
- VideoPlayer has basic controls (play/pause, volume, seek, fullscreen, settings) but no rewind/forward buttons, no CC, no Cast, no double-tap, no 5s auto-hide
- Controls auto-hide timer is 2.5s, not 5s
- No back button in top nav or video page header
- Suggested videos appear in a separate column (right on desktop), not below main content in mobile-first order
- Comments appear before suggested videos in mobile view
- SuggestedVideoCard uses Link (full page reload navigation)
- Controls do not respond to tap-to-show pattern on mobile

## Requested Changes (Diff)

### Add
- Back arrow button on the video watch page header (top-left, beside logo)
- Rewind 10s and Forward 10s buttons in player controls overlay
- CC (Captions) button in player controls
- Cast button in player controls
- Double-tap gesture: left side rewinds 10s, right side forwards 10s with +10s/-10s animation
- 5-second auto-hide timer for controls (currently 2.5s)
- Tap-to-show controls on mobile (tap video area shows controls, 5s idle hides them)
- Show +10s / -10s ripple animation on double-tap

### Modify
- VideoPage layout order (mobile-first, single column): Player → Title+Channel → Actions → Description → Suggested Videos → Comments
- On desktop, keep 2-column layout but ensure suggested videos section is present in left column flow before comments
- SuggestedVideoCard: use onClick + navigate instead of Link to load video without full page reload
- Auto-hide timer extended to 5 seconds
- Controls overlay: restructure to include all buttons in correct positions

### Remove
- Comments-before-suggested ordering on mobile

## Implementation Plan
1. VideoPlayer.tsx: Add rewind10/forward10 buttons, CC button, Cast button, double-tap handler with animation, extend auto-hide to 5s, tap-to-toggle controls
2. VideoPage.tsx: Add back button header, reorder layout (Player → Info → Actions → Description → Suggested → Comments), single column on mobile, 2-col on desktop
3. SuggestedVideoCard.tsx: Replace Link with button+navigate for SPA navigation without reload
