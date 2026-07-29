# 🇳🇵 VibeReels — Product Vision, Architecture & Animation Master Plan

## 🌟 Core Vision & Motive
**VibeReels** is built to deliver a **buttery-smooth, soothing, relaxing, and authentic short-form video reel experience** tailored for creators and viewers. Unlike bloated social networks with artificial metrics, VibeReels focuses on:

1. **Ultra-Smooth, Relaxing UX**: Fluid 60fps vertical swipe transitions, gesture-driven bottom sheets, non-intrusive sound policies, and soothing micro-interactions.
2. **Authenticity & Data Integrity**: 100% real user counts (verified views, likes, comments, and followers) powered by Supabase PostgreSQL — zero fake bot data.
3. **Instant Access & Privacy**: Frictionless 1-click Guest mode with automatic 1-hour expiry, 1-tap permanent account deletion (with full database cascade cleanup), and complete user data control.
4. **4K Creator Freedom**: Support for high-bitrate 4K video clips up to 15 seconds / 600MB with real-time live upload progress tracking directly on the feed.

---

## 🏗️ Technical Architecture & Tech Stack

### Frontend Stack
- **Framework**: React 18 + Vite 5 (Lightning-fast HMR and production bundle optimization)
- **Styling**: Handcrafted CSS Design System (`index.css`) with CSS Variables, `100dvh` viewport stability, hardware-accelerated transforms, and high-DPI scaling.
- **Icons & UI**: Lucide React vector icons + official SVG badges (Google Play Store & Apple App Store).

### Backend & Database (Supabase)
- **Database Engine**: PostgreSQL (`lcmugadftugcpxtmsurk.supabase.co`)
- **Authentication**: Supabase Auth (Email/Password & Guest session management)
- **Cloud Storage**:
  - `reels` bucket: 4K video clips (Max 15s / 600MB)
  - `avatars` bucket: User profile pictures (Max 5MB)
- **Atomic Stored Procedures (RPCs)**:
  - `increment_views(reel_id, viewer_id)`: Enforces 1 unique view per user/session with PostgreSQL `ON CONFLICT DO NOTHING`.
  - `increment_likes` / `decrement_likes`: Atomic non-negative like counter updates.
  - `increment_comments`: Comment count synchronization.
  - `increment_followers` / `decrement_followers` & `increment_following` / `decrement_following`: Dynamic follower relationship tracking.

---

## 🛠️ Complete Feature Inventory

### 1. Home Feed & Video Player
- **Scroll-Snap Feed**: Touch vertical swipe feed with hardware-accelerated snap points.
- **Audio Autoplay**: Always unmuted audio default with graceful browser autoplay fallback.
- **Live Upload Progress Card**: Real-time YouTube/TikTok style progress card (`0% -> 100%`) attached to top of feed during reel submission.
- **Pull-to-Refresh**: Intuitive pull-down gesture at top of feed to reload latest reels with spinning crimson loader.
- **Creator Overlay & Follow Plus Button**: Floating creator handle, verified badge, audio track info, and interactive `+` follow button that morphs and vanishes upon following.

### 2. Comment System & Nested Replies
- **Threaded Comment Tray**: Slide-up sheet with expandable/collapsible reply trees (`View X replies` / `Hide replies`).
- **Reply Action**: 1-tap **Reply** button pre-fills `@username` and focuses input bar.
- **Clean Aesthetic**: Timestamps removed for minimalist comment cards.

### 3. User Profile & Settings
- **Real Stats Dashboard**: Real-time verified counters for Following, Followers, and Total Upload Likes.
- **Top-Right 3-Dots Menu (`⋮`)**: Quick dropdown offering Edit Profile, Settings & Privacy, and Sign Out.
- **Full-Page Executive White Settings Screen (`SettingsScreen.jsx`)**:
  - **Mobile App Badges**: Official vector SVGs for Google Play Store and Apple App Store.
  - **Developer Info**: Devin Rai (`reedweveen@gmail.com`).
  - **Email Feedback & 5-Star Reviews**: Interactive review form launching direct email link.
  - **Full Legal Suite**: Comprehensive Privacy Policy and Terms & Conditions sub-pages.
  - **Danger Zone**: 1-tap permanent account deletion with complete database cascading cleanup.

---

## 🎨 Butter-Smooth Animation Roadmap

To make VibeReels feel extraordinarily soothing, relaxing, and liquid-smooth, the following animation engine features are implemented/planned:

1. **Card-Parallax Vertical Swipe Engine**:
   - `transform: opacity + scale + translateY` smooth transition curves for incoming and outgoing video cards.
2. **Exploding Heart & Sparkle Particle Burst**:
   - Multi-particle crimson & gold particle explosion on double-tap with CSS keyframe physics.
3. **Fluid Bottom Sheet Gesture Physics**:
   - Smooth cubic-bezier spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`) on comment trays, settings transitions, and upload sheets.
4. **Haptic & Scale Micro-Interactions**:
   - Subtle tap-down scale feedback (`transform: scale(0.92)`) across all action buttons, icons, and navigation tabs.
