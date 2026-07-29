# Ramailo Reels (रमाइलो रील्स) 🇳🇵 - Free Nepali TikTok Clone

A modern, minimal, 100% **FREE OF COST** TikTok clone designed for you and your friends in Nepal to test and share short video reels.

---

## 🌟 Key Features Included

1. 📱 **Vertical Snap Feed**: Fullscreen swipeable video player with auto-play, double-tap heart pop animation, and sound disk spinning.
2. 📤 **Video Reel Upload**: Upload videos from phone or PC, write captions, select Nepali hashtags (`#Nepal`, `#Pokhara`, `#Momo`), and push directly to your friends' feed.
3. ❤️ **Likes & Counter**: Interactive heart animation with instant like counter updates.
4. 💬 **Slide-up Comments Sheet**: Real-time comments drawer with user avatars and timestamping.
5. 👤 **User Profiles**: Profile stats (Followers, Following, Likes), bio, and video grid of uploaded & liked reels.
6. 🔗 **Instant Sharing**: Share video links with friends via WhatsApp or copy direct link.
7. 🇳🇵 **Nepali Theme & Identity**: Localized Nepali badges, popular hashtags, and crimson red Dhaka accents.
8. 📱 **100% Free PWA Support**: Install on Android or iPhone Home Screen without paying $25 Play Store or $99/yr Apple fees.

---

## 🚀 How to Run Locally

1. Open your terminal in this directory:
   ```bash
   cd c:\PCSX2\PCSX2\newwau
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser. (Press F12 -> Toggle Device Toolbar for mobile view!).

---

## 🌐 How to Host Online for FREE (For You & Your Friends)

### Option 1: Deploy on Vercel (Recommended - 1 Click & Free Forever)
1. Push this project folder to your free **GitHub** repository.
2. Go to [Vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository and click **Deploy**.
4. Vercel will give you a free link like `ramailo-reels.vercel.app`!
5. Send this link to your friends!

### Option 2: Install as Phone App (PWA - 0 Cost)
- **On Android**: Open your Vercel link in Chrome -> Tap 3 dots -> Tap **"Add to Home Screen"**.
- **On iPhone (iOS)**: Open your Vercel link in Safari -> Tap Share button -> Tap **"Add to Home Screen"**.
- The app will now appear on your phone like a native TikTok app!

---

## ☁️ Setting Up Free Cloud Storage (Supabase / Cloudinary)

Out of the box, the app uses Local Storage & IndexedDB so you can test it immediately.
When you want your friends' uploads to sync across all devices in real-time for free:
1. Create a free account at [Supabase.com](https://supabase.com) (500MB DB + 1GB Storage for Free).
2. Create a bucket named `reels` and set access to Public.
3. Replace the storage functions in `src/services/storage.js` with Supabase Client SDK calls!
