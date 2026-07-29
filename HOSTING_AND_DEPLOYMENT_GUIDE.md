# 🇳🇵 Ramailo Reels - Complete Free Hosting & Deployment Guide

This guide explains how to deploy **Ramailo Reels** 100% **FREE OF COST** so that you and your 5 to 9 friends can test, upload videos, like, comment, and use the app on your mobile phones!

---

## 📊 Free Hosting Comparison (For 5 to 9 Friends)

| Hosting Provider | Free Tier Bandwidth | Storage / Limits | Verdict for 5-9 Users |
| :--- | :--- | :--- | :--- |
| **Vercel** *(Recommended)* | **100 GB / month** | Unlimited static deploys | 🏆 **BEST**: Super fast CDN worldwide, instant GitHub auto-deploy, zero config needed. |
| **Netlify** | **100 GB / month** | 300 build minutes / mo | 🥈 **Great**: Simple setup, drag & drop deployment. |
| **Cloudflare Pages** | **Unlimited** | 500 builds / month | 🥉 **Excellent**: Fastest edge network in South Asia. |

> [!NOTE]
> **Is 100 GB Bandwidth enough for 5 to 9 friends?**
> **YES!** A typical 15-second compressed reel is around 3MB to 5MB. 100 GB allows your group to stream over **20,000 to 30,000 video views every single month** for $0!

---

## 🗄️ Free Database & Video Storage Options

| Platform | Free Tier Capacity | Usage |
| :--- | :--- | :--- |
| **Cloudinary** *(Recommended for Video)* | **25 GB Storage / Bandwidth** | Auto-compresses videos for fast playback on Nepali 4G / Ncell / NTC & WiFi. |
| **Supabase** | **500 MB DB + 1 GB File Storage** | Full PostgreSQL database, Auth, and Realtime subscriptions. |

---

## 🐙 STEP 1: Push Code to GitHub

Open PowerShell in this directory (`c:\PCSX2\PCSX2\newwau`) and run:

1. **Create a new repository** on GitHub named `ramailo-reels`:
   - Go to [github.com/new](https://github.com/new)
   - Name: `ramailo-reels`
   - Leave options as Public or Private
   - Click **Create repository**

2. **Link local git to GitHub and push**:
   ```bash
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ramailo-reels.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 STEP 2: Deploy to Vercel (100% Free Hosting)

1. Go to [Vercel.com](https://vercel.com) and click **Sign Up** using your GitHub account.
2. Click **"Add New..."** -> **"Project"**.
3. Import your `ramailo-reels` repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **Deploy**!
6. In ~30 seconds, Vercel will give you a live link like `https://ramailo-reels.vercel.app`.

---

## 📱 STEP 3: Share & Install on Mobile Phones (0 Cost PWA)

Send the Vercel link (`https://ramailo-reels.vercel.app`) to your 5-9 friends on WhatsApp, Viber, or Messenger!

### 🤖 For Android Phones (Samsung, Xiaomi, Realme, Vivo, OnePlus):
1. Open the Vercel link in **Google Chrome**.
2. Tap the **3 dots (⋮)** in the top right corner.
3. Tap **"Add to Home Screen"** or **"Install App"**.
4. The app icon **"Ramailo"** will now appear on your phone home screen just like a native app from Google Play!

### 🍏 For iPhones (iOS):
1. Open the Vercel link in **Safari**.
2. Tap the **Share button** (rectangle with arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**.

---

## 🛠️ Local Commands Summary

```bash
# Start local dev server
npm run dev

# Test production build
npm run build
npm run preview
```
