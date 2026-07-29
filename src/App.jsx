import React, { useState, useEffect } from 'react';
import { VideoFeed } from './components/VideoFeed';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { CommentsModal } from './components/CommentsModal';
import { UploadModal } from './components/UploadModal';
import { ShareModal } from './components/ShareModal';
import { UserProfile } from './components/UserProfile';
import {
  getReels,
  toggleLikeReel,
  addComment,
  saveNewReel,
  getCurrentUser
} from './services/storage';
import { Compass, MessageSquare, Sparkles, Flame, Search } from 'lucide-react';

export default function App() {
  const [reels, setReels] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'discover' | 'inbox' | 'profile'
  const [feedSubTab, setFeedSubTab] = useState('foryou'); // 'foryou' | 'following'

  const [activeCommentReel, setActiveCommentReel] = useState(null);
  const [activeShareReel, setActiveShareReel] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setReels(getReels());
    setUser(getCurrentUser());
  }, []);

  const handleLike = (reelId) => {
    const updated = toggleLikeReel(reelId);
    setReels(updated);
    if (activeCommentReel && activeCommentReel.id === reelId) {
      const match = updated.find((r) => r.id === reelId);
      if (match) setActiveCommentReel(match);
    }
  };

  const handleAddComment = (reelId, text) => {
    const updated = addComment(reelId, text);
    setReels(updated);
    const match = updated.find((r) => r.id === reelId);
    if (match) setActiveCommentReel(match);
  };

  const handleUploadSuccess = (newReelData) => {
    const updated = saveNewReel(newReelData);
    setReels(updated);
    setActiveTab('home'); // Switch to home feed to watch uploaded video live
  };

  const handleSelectUser = (targetUser) => {
    setSelectedUser(targetUser);
    setActiveTab('profile');
  };

  if (!user) return null;

  return (
    <div className="app-container">
      {/* Top Header Bar for Home Feed */}
      {activeTab === 'home' && (
        <TopNav activeFeedTab={feedSubTab} onFeedTabChange={setFeedSubTab} />
      )}

      {/* Main Screen Router */}
      {activeTab === 'home' && (
        <VideoFeed
          reels={reels}
          onLike={handleLike}
          onOpenComments={(reel) => setActiveCommentReel(reel)}
          onOpenShare={(reel) => setActiveShareReel(reel)}
          onSelectUser={handleSelectUser}
        />
      )}

      {/* Discover / Trending Screen */}
      {activeTab === 'discover' && (
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#09090b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '24px', padding: '10px 16px', marginBottom: '20px' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search reels, #Nepal, friends..."
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '14px', flex: 1, outline: 'none' }}
            />
          </div>

          <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame color="#f59e0b" size={20} /> Trending Hashtags in Nepal
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {['#Nepal', '#Kathmandu', '#Pokhara', '#Momo', '#Dashain', '#Himalayas', '#Ramailo'].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#38bdf8'
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles color="#e11d48" size={20} /> Popular Nepali Shorts
          </div>

          <div className="profile-grid">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="grid-item"
                onClick={() => {
                  setActiveTab('home');
                }}
              >
                <img src={reel.thumbnail} alt={reel.caption} className="grid-thumbnail" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inbox Screen */}
      {activeTab === 'inbox' && (
        <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#09090b', color: '#94a3b8' }}>
          <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Activity & Notifications</div>
          <div style={{ fontSize: '13px', marginTop: '6px', textAlign: 'center' }}>
            When your friends like or comment on your reels, you will see notifications here!
          </div>
        </div>
      )}

      {/* Profile Screen */}
      {activeTab === 'profile' && (
        <UserProfile
          user={selectedUser || user}
          userReels={reels}
          onSelectReel={() => setActiveTab('home')}
        />
      )}

      {/* Bottom Nav Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedUser(null);
          setActiveTab(tab);
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Modals */}
      {activeCommentReel && (
        <CommentsModal
          reel={activeCommentReel}
          onClose={() => setActiveCommentReel(null)}
          onAddComment={handleAddComment}
        />
      )}

      {activeShareReel && (
        <ShareModal
          reel={activeShareReel}
          onClose={() => setActiveShareReel(null)}
        />
      )}

      {isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
