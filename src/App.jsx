import React, { useState, useEffect } from 'react';
import { VideoFeed } from './components/VideoFeed';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CommentsModal } from './components/CommentsModal';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { UserProfile } from './components/UserProfile';
import { AuthScreen } from './components/AuthScreen';
import { SkeletonFeed } from './components/SkeletonLoader';
import { SettingsScreen } from './components/SettingsScreen';
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
  uploadReel,
  deleteReel,
  incrementViews,
  followUser,
  unfollowUser,
  getFollowingIds,
  getNotifications
} from './services/supabaseService';
import { Compass, MessageSquare, Sparkles, Flame, Search, LogOut, Loader2, WifiOff, X, Heart, UserPlus, CheckCircle2, Play } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [reels, setReels] = useState([]);
  const [likedIds, setLikedIds] = useState(new Set());
  const [followingIds, setFollowingIds] = useState(new Set());
  const [viewedReels, setViewedReels] = useState(new Set()); // Unique view tracking per session
  const [notifications, setNotifications] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [feedSubTab, setFeedSubTab] = useState('foryou');

  const [activeCommentReel, setActiveCommentReel] = useState(null);
  const [reelComments, setReelComments] = useState([]);
  const [activeShareReel, setActiveShareReel] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Guest restrictions modal state: null | 'like' | 'comment' | 'upload' | 'follow'
  const [guestNoticeType, setGuestNoticeType] = useState(null);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  const isGuest = !!(authUser?.isGuest || authUser?.id?.toString().startsWith('guest-'));

  // ── AUTH LISTENER ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthLoading(false); return; }
    const unsub = onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        const p = await getProfile(session.user.id);
        setProfile(p);
        setShowAuthOverlay(false);
      } else if (!authUser?.isGuest) {
        setAuthUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── AUTO-EXPIRE GUEST ACCOUNTS AFTER 1 HOUR ──────────────────────────────────
  useEffect(() => {
    if (!isGuest || !authUser) return;
    let guestStart = sessionStorage.getItem('guest_created_at');
    if (!guestStart) {
      guestStart = Date.now().toString();
      sessionStorage.setItem('guest_created_at', guestStart);
    }

    const checkExpiry = () => {
      const startTime = sessionStorage.getItem('guest_created_at');
      if (startTime && Date.now() - parseInt(startTime, 10) >= 3600000) {
        sessionStorage.removeItem('guest_created_at');
        sessionStorage.removeItem('guest_session_id');
        alert('⏱️ Guest session expired after 1 hour. Please log in or register!');
        handleSignOut();
      }
    };

    checkExpiry();
    const timer = setInterval(checkExpiry, 30000);
    return () => clearInterval(timer);
  }, [authUser, isGuest]);

  // ── LOAD FEED & FOLLOWS ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!authUser) return;
    loadFeed();
  }, [authUser]);

  const loadFeed = async () => {
    setFeedLoading(true);
    const [feedData, liked, follows] = await Promise.all([
      getFeedReels(),
      getLikedReelIds(authUser?.id),
      getFollowingIds(authUser?.id)
    ]);
    setReels(feedData);
    setLikedIds(new Set(liked));
    setFollowingIds(new Set(follows));
    setFeedLoading(false);
  };

  // Load notifications when inbox is opened
  useEffect(() => {
    if (activeTab === 'inbox' && authUser && !isGuest) {
      loadNotifications();
    }
  }, [activeTab, authUser]);

  const loadNotifications = async () => {
    setNotifLoading(true);
    const notifs = await getNotifications(authUser.id);
    setNotifications(notifs);
    setNotifLoading(false);
  };

  // ── LIKE / UNLIKE ────────────────────────────────────────────────────────────
  const handleLike = async (reelId) => {
    if (isGuest) {
      setGuestNoticeType('like');
      return;
    }

    const alreadyLiked = likedIds.has(reelId);
    const newLikedIds = new Set(likedIds);
    const targetReel = reels.find((r) => r.id === reelId);
    const reelOwnerId = targetReel?.user_id || targetReel?.profiles?.id;

    // Optimistic update
    setReels((prev) => prev.map((r) =>
      r.id === reelId
        ? { ...r, likes_count: Math.max(0, (r.likes_count || 0) + (alreadyLiked ? -1 : 1)) }
        : r
    ));

    if (alreadyLiked) {
      newLikedIds.delete(reelId);
      setLikedIds(newLikedIds);
      await unlikeReel(authUser.id, reelId);
    } else {
      newLikedIds.add(reelId);
      setLikedIds(newLikedIds);
      await likeReel(authUser.id, reelId, reelOwnerId);
    }
  };

  // ── COMMENTS ─────────────────────────────────────────────────────────────────
  const handleOpenComments = async (reel) => {
    setActiveCommentReel(reel);
    const comments = await getComments(reel.id);
    setReelComments(comments);
  };

  const handleAddComment = async (reelId, text, parentId = null) => {
    if (isGuest) {
      setGuestNoticeType('comment');
      return;
    }

    const targetReel = reels.find((r) => r.id === reelId);
    const reelOwnerId = targetReel?.user_id || targetReel?.profiles?.id;

    const { data, error } = await supabaseAddComment(authUser.id, reelId, text, reelOwnerId, parentId);
    if (!error && data) {
      setReelComments((prev) => [data, ...prev]);
      if (!parentId) {
        setReels((prev) => prev.map((r) =>
          r.id === reelId ? { ...r, comments_count: (r.comments_count || 0) + 1 } : r
        ));
      }
    }
  };

  // ── FOLLOW / UNFOLLOW ────────────────────────────────────────────────────────
  const handleFollowToggle = async (targetUserId) => {
    if (isGuest) {
      setGuestNoticeType('follow');
      return;
    }

    const isFollowing = followingIds.has(targetUserId);
    const newFollowingIds = new Set(followingIds);

    if (isFollowing) {
      newFollowingIds.delete(targetUserId);
      setFollowingIds(newFollowingIds);
      await unfollowUser(authUser.id, targetUserId);
      if (selectedUser && selectedUser.id === targetUserId) {
        setSelectedUser((prev) => ({
          ...prev,
          followers_count: Math.max(0, (prev.followers_count || 1) - 1)
        }));
      }
    } else {
      newFollowingIds.add(targetUserId);
      setFollowingIds(newFollowingIds);
      await followUser(authUser.id, targetUserId);
      if (selectedUser && selectedUser.id === targetUserId) {
        setSelectedUser((prev) => ({
          ...prev,
          followers_count: (prev.followers_count || 0) + 1
        }));
      }
    }
  };

  // ── DELETE REEL ──────────────────────────────────────────────────────────────
  const handleDeleteReel = async (reelId) => {
    const { error } = await deleteReel(authUser.id, reelId);
    if (!error) {
      setReels((prev) => prev.filter((r) => r.id !== reelId));
    } else {
      alert('Could not delete reel: ' + error.message);
    }
  };

  // ── UNIQUE VIEW COUNTING (1 View Per Reel per user/session) ───────────────────
  const handleVideoChange = (reelId) => {
    if (!reelId || viewedReels.has(reelId)) return; // Prevent duplicate counts on re-scroll
    setViewedReels((prev) => new Set(prev).add(reelId));
    const viewerId = authUser?.id || 'guest-' + (sessionStorage.getItem('guest_session_id') || Math.random().toString(36).substring(2, 10));
    if (!sessionStorage.getItem('guest_session_id')) {
      sessionStorage.setItem('guest_session_id', viewerId);
    }
    incrementViews(reelId, viewerId);
  };

  // ── UPLOAD GUARD ─────────────────────────────────────────────────────────────
  const handleOpenUpload = () => {
    if (isGuest) setGuestNoticeType('upload');
    else setIsUploadOpen(true);
  };

  const [uploadProgress, setUploadProgress] = useState(null); // { isUploading, progress, previewUrl, caption }

  const handleUploadSuccess = async (file, metadata) => {
    setIsUploadOpen(false);
    setActiveTab('home');
    
    setUploadProgress({
      isUploading: true,
      progress: 15,
      previewUrl: metadata.previewUrl,
      caption: metadata.caption
    });

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev.progress >= 90) return prev;
        return { ...prev, progress: prev.progress + 15 };
      });
    }, 400);

    const { data, error } = await uploadReel(authUser.id, file, metadata);
    clearInterval(progressInterval);

    if (!error && data) {
      setUploadProgress({
        isUploading: true,
        progress: 100,
        previewUrl: metadata.previewUrl,
        caption: metadata.caption
      });
      setReels((prev) => [data, ...prev]);

      setTimeout(() => {
        setUploadProgress(null);
      }, 2500);
    } else {
      setUploadProgress(null);
      alert('Upload failed: ' + (error?.message || 'Unknown error'));
    }
  };

  // ── SELECT USER PROFILE ──────────────────────────────────────────────────────
  const handleSelectUser = (user) => {
    if (!user) return;
    if (authUser && (user.id === authUser.id || user.id === profile?.id)) {
      setSelectedUser(null);
      setActiveTab('profile');
    } else {
      setSelectedUser(user);
      setActiveTab('user_profile');
    }
  };

  // ── SIGN OUT ─────────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    await signOut();
    setAuthUser(null);
    setProfile(null);
    setReels([]);
    setLikedIds(new Set());
    setFollowingIds(new Set());
    setViewedReels(new Set());
    setShowAuthOverlay(false);
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
        </div>
      )}

      {/* ── Home Feed ── */}
      {activeTab === 'home' && (
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Live YouTube/TikTok Style Upload Card */}
          {uploadProgress && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '16px',
              right: '16px',
              zIndex: 200,
              background: 'rgba(18, 18, 24, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              borderRadius: '16px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.8)'
            }}>
              <div style={{ width: '40px', height: '54px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                {uploadProgress.previewUrl && <video src={uploadProgress.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>{uploadProgress.progress < 100 ? '⏳ Uploading Reel to Feed...' : '✅ Upload Complete!'}</span>
                  <span style={{ color: '#e11d48' }}>{uploadProgress.progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.12)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress.progress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #e11d48)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          )}

          {feedLoading ? (
            <SkeletonFeed />
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
            onVideoChange={handleVideoChange}
            isGuest={isGuest}
            onGuestAction={(action) => setGuestNoticeType(action)}
            followingIds={followingIds}
            currentUserId={authUser?.id}
            onFollowToggle={handleFollowToggle}
            onRefresh={loadFeed}
          />
        )}
      </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {reelsWithLiked.map((reel) => (
              <div key={reel.id} onClick={() => setActiveTab('home')} style={{ position: 'relative', aspectRatio: '9/16', background: '#000', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}>
                <video src={reel.video_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.9)', pointerEvents: 'none' }}>
                  <Play size={12} fill="#fff" color="#fff" />
                  <span>{reel.views_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Inbox (Notifications) ── */}
      {activeTab === 'inbox' && (
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#09090b', color: '#fff' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', marginBottom: '16px' }}>
            Notifications
          </div>

          {isGuest ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 20px' }}>
              <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Log in to view notifications</div>
              <div style={{ fontSize: '13px', marginTop: '6px', marginBottom: '20px' }}>
                Notifications land here when people like or comment on your reels!
              </div>
              <button
                onClick={() => setShowAuthOverlay(true)}
                style={{ background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                🔑 Log In
              </button>
            </div>
          ) : notifLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 size={24} color="#e11d48" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 20px' }}>
              <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>No notifications yet</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>
                When someone likes, comments on your reels, or follows you, it will show here!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.map((n) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px 14px', borderRadius: '14px' }}>
                  <img
                    src={n.actor?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor?.username || 'user'}`}
                    alt="Actor"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, fontSize: '13px' }}>
                    <span style={{ fontWeight: '700', color: '#fff' }}>@{n.actor?.username || 'someone'}</span>{' '}
                    {n.type === 'like' && 'liked your reel ❤️'}
                    {n.type === 'comment' && 'commented on your reel 💬'}
                    {n.type === 'follow' && 'started following you 👤'}
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  {n.reel?.video_url && (
                    <video src={n.reel.video_url} style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} muted playsInline />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Own Profile ── */}
      {activeTab === 'profile' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'pageSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <UserProfile
            user={profile || authUser}
            currentUserId={authUser?.id}
            userReels={reelsWithLiked}
            onSelectReel={() => setActiveTab('home')}
            onSignOut={handleSignOut}
            onDeleteReel={handleDeleteReel}
            onOpenSettings={() => setActiveTab('settings')}
          />
        </div>
      )}

      {/* ── Other User Profile (Standalone Page with Back Button, No Bottom Nav) ── */}
      {activeTab === 'user_profile' && selectedUser && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'pageSlideIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <UserProfile
            user={selectedUser}
            currentUserId={authUser?.id}
            userReels={reelsWithLiked}
            onSelectReel={() => setActiveTab('home')}
            onSignOut={handleSignOut}
            isFollowing={followingIds.has(selectedUser.id)}
            onFollowToggle={handleFollowToggle}
            onBack={() => { setSelectedUser(null); setActiveTab('home'); }}
          />
        </div>
      )}

      {/* ── Settings (Full Page) ── */}
      {activeTab === 'settings' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'pageSlideIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <SettingsScreen
            user={profile || authUser}
            onBack={() => setActiveTab('profile')}
            onSignOut={handleSignOut}
            onEditProfile={() => setActiveTab('profile')}
          />
        </div>
      )}

      {/* Bottom Nav (Hidden on other user's profile and settings) */}
      {activeTab !== 'user_profile' && activeTab !== 'settings' && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => { setSelectedUser(null); setActiveTab(tab); }}
          onOpenUpload={handleOpenUpload}
        />
      )}

      {/* ── Modals ── */}
      {activeCommentReel && (
        <CommentsModal
          reel={activeCommentReel}
          comments={reelComments}
          isGuest={isGuest}
          onClose={() => setActiveCommentReel(null)}
          onAddComment={handleAddComment}
          onOpenAuth={() => { setActiveCommentReel(null); setShowAuthOverlay(true); }}
        />
      )}
      {activeShareReel && (
        <ShareModal reel={activeShareReel} onClose={() => setActiveShareReel(null)} />
      )}
      {isUploadOpen && (
        <UploadModal onClose={() => setIsUploadOpen(false)} onUploadSuccess={handleUploadSuccess} />
      )}

      {/* Guest Restriction Notice Modal */}
      {guestNoticeType && (
        <div className="modal-overlay" onClick={() => setGuestNoticeType(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', padding: '24px', maxWidth: '380px', borderRadius: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚫</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
              {guestNoticeType === 'upload' && 'Guests Cannot Upload Videos'}
              {guestNoticeType === 'like' && 'Guests Cannot Like Reels'}
              {guestNoticeType === 'comment' && 'Guests Cannot Comment'}
              {guestNoticeType === 'follow' && 'Guests Cannot Follow Users'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>
              Guest accounts can watch videos, but {guestNoticeType}ing is reserved for registered accounts. Log in or create an account in 10 seconds!
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setGuestNoticeType(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>
                Close
              </button>
              <button
                onClick={() => { setGuestNoticeType(null); setShowAuthOverlay(true); }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                🔑 Log In / Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest → Full Auth Overlay */}
      {showAuthOverlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#09090b' }}>
          <button
            onClick={() => setShowAuthOverlay(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', padding: '8px', borderRadius: '10px', cursor: 'pointer', zIndex: 10000 }}
          >
            <X size={20} />
          </button>
          <AuthScreen onAuthSuccess={(user) => {
            setAuthUser(user);
            if (!user.isGuest) setProfile(null);
            setShowAuthOverlay(false);
          }} />
        </div>
      )}
    </div>
  );
}
