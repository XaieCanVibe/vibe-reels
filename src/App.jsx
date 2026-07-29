import React, { useState, useEffect } from 'react';
import { VideoFeed } from './components/VideoFeed';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CommentsModal } from './components/CommentsModal';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { UserProfile } from './components/UserProfile';
import { AuthScreen } from './components/AuthScreen';
import { isSupabaseConfigured } from './lib/supabase';
import {
  onAuthStateChange,
  signOut,
  getProfile,
  getFeedReels,
  getLikedReelIds,
  likeReel,
  unlikeReel,
  getComments,
  addComment as supabaseAddComment,
  uploadReel
} from './services/supabaseService';
import { Compass, MessageSquare, Sparkles, Flame, Search, LogOut, Loader2, WifiOff, Lock, X } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [reels, setReels] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [feedLoading, setFeedLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [feedSubTab, setFeedSubTab] = useState('foryou');

  const [activeCommentReel, setActiveCommentReel] = useState(null);
  const [reelComments, setReelComments] = useState([]);
  const [activeShareReel, setActiveShareReel] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [guestUploadNotice, setGuestUploadNotice] = useState(false);

  // ── AUTH LISTENER ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }
    const unsub = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        const p = await getProfile(session.user.id);
        setProfile(p);
      } else if (!authUser?.isGuest) {
        setAuthUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── LOAD FEED ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    loadFeed();
  }, [authUser]);

  const loadFeed = async () => {
    setFeedLoading(true);
    const [feedData, liked] = await Promise.all([
      getFeedReels(),
      getLikedReelIds(authUser?.id)
    ]);
    setReels(feedData);
    setLikedIds(new Set(liked));
    setFeedLoading(false);
  };

  // ── LIKE / UNLIKE ────────────────────────────────────────────────────────────
  const handleLike = async (reelId) => {
    const alreadyLiked = likedIds.has(reelId);
    // Optimistic UI
    const newLikedIds = new Set(likedIds);
    setReels((prev) => prev.map((r) =>
      r.id === reelId
        ? { ...r, likes_count: (r.likes_count || 0) + (alreadyLiked ? -1 : 1) }
        : r
    ));
    if (alreadyLiked) {
      newLikedIds.delete(reelId);
      setLikedIds(newLikedIds);
      await unlikeReel(authUser.id, reelId);
    } else {
      newLikedIds.add(reelId);
      setLikedIds(newLikedIds);
      await likeReel(authUser.id, reelId);
    }
  };

  // ── COMMENTS ─────────────────────────────────────────────────────────────────
  const handleOpenComments = async (reel) => {
    setActiveCommentReel(reel);
    const comments = await getComments(reel.id);
    setReelComments(comments);
  };

  const handleAddComment = async (reelId, text) => {
    const { data, error } = await supabaseAddComment(authUser.id, reelId, text);
    if (!error && data) {
      setReelComments((prev) => [data, ...prev]);
      setReels((prev) => prev.map((r) =>
        r.id === reelId ? { ...r, comments_count: (r.comments_count || 0) + 1 } : r
      ));
    }
  };

  // ── UPLOAD GUARD ─────────────────────────────────────────────────────────────
  const handleOpenUpload = () => {
    if (authUser?.isGuest || authUser?.id?.toString().startsWith('guest-')) {
      setGuestUploadNotice(true);
    } else {
      setIsUploadOpen(true);
    }
  };

  const handleUploadSuccess = async (file, metadata) => {
    setIsUploadOpen(false);
    const { data, error } = await uploadReel(authUser.id, file, metadata);
    if (!error && data) {
      setReels((prev) => [data, ...prev]);
      setActiveTab('home');
    } else {
      alert('Upload failed: ' + (error?.message || 'Unknown error'));
    }
  };

  // ── SELECT USER PROFILE ──────────────────────────────────────────────────────
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setActiveTab('profile');
  };

  // ── SIGN OUT ─────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    setAuthUser(null);
    setProfile(null);
    setReels([]);
    setLikedIds(new Set());
  };

  // ── NOT CONFIGURED ───────────────────────────────────────────────────────────
  if (!isSupabaseConfigured) {
    return (
      <div className="app-container">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', gap: '16px' }}>
          <WifiOff size={48} color="#e11d48" />
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', color: '#fff' }}>
            Setup Required
          </div>
          <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            To use real accounts, videos, and data you need to set up your free Supabase backend.
            <br /><br />
            Add your Supabase URL and anon key to <code style={{ color: '#e11d48' }}>.env</code> file.
          </div>
        </div>
      </div>
    );
  }

  // ── AUTH LOADING ─────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="app-container">
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <Loader2 size={36} color="#e11d48" style={{ animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#64748b', fontSize: '14px' }}>Loading VibeReels...</div>
        </div>
      </div>
    );
  }

  // ── NOT LOGGED IN ────────────────────────────────────────────────────────────
  if (!authUser) {
    return (
      <div className="app-container">
        <AuthScreen onAuthSuccess={(user) => {
          setAuthUser(user);
          if (user.isGuest) setProfile(user);
        }} />
      </div>
    );
  }

  const reelsWithLiked = reels.map((r) => ({ ...r, isLiked: likedIds.has(r.id) }));

  return (
    <div className="app-container">
      {/* Top Header */}
      {activeTab === 'home' && (
        <div style={{ position: 'relative' }}>
          <TopNav activeFeedTab={feedSubTab} onFeedTabChange={setFeedSubTab} />
          <button
            onClick={handleSignOut}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', zIndex: 50 }}
          >
            <LogOut size={14} /> Out
          </button>
        </div>
      )}

      {/* ── Home Feed ── */}
      {activeTab === 'home' && (
        feedLoading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <Loader2 size={28} color="#e11d48" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ color: '#64748b', fontSize: '13px' }}>Loading reels...</div>
          </div>
        ) : reelsWithLiked.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#64748b', padding: '32px', textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>🎬</span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>No reels yet!</div>
            <div style={{ fontSize: '14px' }}>Be the first to post a reel. Tap the + button below!</div>
          </div>
        ) : (
          <VideoFeed
            reels={reelsWithLiked}
            onLike={handleLike}
            onOpenComments={handleOpenComments}
            onOpenShare={(reel) => setActiveShareReel(reel)}
            onSelectUser={handleSelectUser}
          />
        )
      )}

      {/* ── Discover ── */}
      {activeTab === 'discover' && (
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#09090b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '24px', padding: '10px 16px', marginBottom: '20px' }}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search reels, #Nepal, friends..." style={{ background: 'none', border: 'none', color: '#fff', fontSize: '14px', flex: 1, outline: 'none' }} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame color="#f59e0b" size={20} /> Trending Hashtags
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {['#Nepal', '#Kathmandu', '#Pokhara', '#Momo', '#Dashain', '#Himalayas', '#VibeReels'].map((tag) => (
              <div key={tag} style={{ padding: '8px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>{tag}</div>
            ))}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles color="#e11d48" size={20} /> All Reels
          </div>
          <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {reelsWithLiked.map((reel) => (
              <div key={reel.id} className="grid-item" onClick={() => setActiveTab('home')} style={{ aspectRatio: '9/16', background: '#000', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                <video src={reel.video_url} className="grid-thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Inbox ── */}
      {activeTab === 'inbox' && (
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#94a3b8' }}>
          <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Notifications</div>
          <div style={{ fontSize: '13px', marginTop: '6px', textAlign: 'center' }}>
            When your friends like or comment on your reels, notifications will appear here!
          </div>
        </div>
      )}

      {/* ── Profile ── */}
      {activeTab === 'profile' && (
        <UserProfile
          user={selectedUser || profile || authUser}
          currentUserId={authUser?.id}
          userReels={reelsWithLiked}
          onSelectReel={() => setActiveTab('home')}
          onSignOut={handleSignOut}
        />
      )}

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => { setSelectedUser(null); setActiveTab(tab); }}
        onOpenUpload={handleOpenUpload}
      />

      {/* Modals */}
      {activeCommentReel && (
        <CommentsModal
          reel={activeCommentReel}
          comments={reelComments}
          onClose={() => setActiveCommentReel(null)}
          onAddComment={handleAddComment}
        />
      )}
      {activeShareReel && (
        <ShareModal reel={activeShareReel} onClose={() => setActiveShareReel(null)} />
      )}
      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Guest Upload Restriction Modal */}
      {guestUploadNotice && (
        <div className="modal-overlay" onClick={() => setGuestUploadNotice(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '24px', maxWidth: '380px', borderRadius: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚫</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              Guests Cannot Upload Videos
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
              Guest accounts can watch, like, and comment on reels, but uploading is reserved for registered accounts. Please log in or create a free account to upload reels!
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setGuestUploadNotice(false)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => { setGuestUploadNotice(false); handleSignOut(); }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                🔑 Log In / Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
