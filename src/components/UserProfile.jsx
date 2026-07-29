import React, { useState } from 'react';
import { Grid, Heart, Settings, UserPlus, Film, Edit3 } from 'lucide-react';

export const UserProfile = ({ user, userReels = [], onSelectReel }) => {
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'liked'

  const myUploads = userReels.filter(
    (r) => r.user?.username === user.username || r.user?.id === user.id
  );

  const likedReels = userReels.filter((r) => r.isLiked);

  const displayList = activeTab === 'uploads' ? myUploads : likedReels;

  return (
    <div className="profile-screen">
      {/* Profile Header */}
      <div className="profile-header">
        <img src={user.avatar} alt={user.name} className="profile-pic-large" />
        <div style={{ textAlign: 'center' }}>
          <div className="profile-name">{user.name}</div>
          <div className="profile-username">{user.username}</div>
        </div>

        {/* Stats Bar */}
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-value">{user.following || 12}</span>
            <span className="stat-label">Following</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user.followers || 48}</span>
            <span className="stat-label">Followers</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{user.likesCount || 1240}</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>

        {/* Bio */}
        <p className="profile-bio">{user.bio || 'Creating fun reels in Nepal with friends! 🇳🇵'}</p>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            style={{
              padding: '8px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Grid Tabs */}
      <div
        style={{
          display: 'flex',
          justify: 'space-around',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '8px'
        }}
      >
        <button
          onClick={() => setActiveTab('uploads')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'uploads' ? '#ffffff' : '#64748b',
            borderBottom: activeTab === 'uploads' ? '2px solid #e11d48' : 'none',
            paddingBottom: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            fontSize: '14px'
          }}
        >
          <Grid size={18} /> Uploads ({myUploads.length})
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          style={{
            background: 'none',
            border: 'none',
            color: activeTab === 'liked' ? '#ffffff' : '#64748b',
            borderBottom: activeTab === 'liked' ? '2px solid #e11d48' : 'none',
            paddingBottom: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 700,
            fontSize: '14px'
          }}
        >
          <Heart size={18} /> Liked ({likedReels.length})
        </button>
      </div>

      {/* Video Grid */}
      {displayList.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '50px 0', fontSize: '14px' }}>
          <Film size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <div>No reels found in this section.</div>
        </div>
      ) : (
        <div className="profile-grid">
          {displayList.map((reel) => (
            <div
              key={reel.id}
              className="grid-item"
              onClick={() => onSelectReel && onSelectReel(reel)}
            >
              <img
                src={reel.thumbnail}
                alt={reel.caption}
                className="grid-thumbnail"
              />
              <div className="grid-likes-overlay">
                <Heart size={12} fill="#fff" color="#fff" />
                <span>{reel.likesCount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
