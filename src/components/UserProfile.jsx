import React, { useState } from 'react';
import { Grid, Heart, Film, Edit3, LogOut, Sparkles, User, Check, X } from 'lucide-react';
import { updateProfile } from '../services/supabaseService';

export const UserProfile = ({ user, currentUserId, userReels = [], onSelectReel, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' | 'liked'
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const isGuest = user?.isGuest || user?.id?.toString().startsWith('guest-');
  const isOwnProfile = !isGuest && currentUserId && (user?.id === currentUserId);

  const myUploads = userReels.filter(
    (r) => r.user_id === user?.id || r.profiles?.id === user?.id || r.user?.id === user?.id
  );
  const likedReels = userReels.filter((r) => r.isLiked);
  const displayList = activeTab === 'uploads' ? myUploads : likedReels;

  const avatarUrl = user?.avatar_url || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { data, error } = await updateProfile(user.id, { name, bio });
    if (!error && data) {
      user.name = data.name;
      user.bio = data.bio;
      setIsEditing(false);
    } else {
      alert('Error updating profile: ' + (error?.message || 'Failed'));
    }
    setIsSaving(false);
  };

  return (
    <div className="profile-screen" style={{ flex: 1, overflowY: 'auto', background: '#09090b', color: '#fff', padding: '20px' }}>
      
      {/* Guest Mode Banner */}
      {isGuest && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '16px',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ color: '#38bdf8', fontWeight: '800', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Sparkles size={18} /> You are Browsing as Guest
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', marginBottom: '12px', lineHeight: 1.4 }}>
            Create a real account to save your uploaded reels, bio, and likes permanently across all devices!
          </div>
          <button
            onClick={onSignOut}
            style={{
              background: 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
            }}
          >
            🔑 Log In / Create Account
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          className="profile-pic-large"
          style={{ width: '88px', height: '88px', borderRadius: '50%', border: '3px solid #e11d48', objectFit: 'cover', marginBottom: '12px' }}
          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`; }}
        />
        <div style={{ textAlign: 'center' }}>
          <div className="profile-name" style={{ fontSize: '20px', fontWeight: '800' }}>
            {user?.name || user?.username || 'Nepali User'}
          </div>
          <div className="profile-username" style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
            @{user?.username || 'user'}
          </div>
        </div>

        {/* Real Stats Bar - nullish coalescing so 0 is shown properly */}
        <div className="profile-stats" style={{ display: 'flex', justifyContent: 'center', gap: '32px', margin: '16px 0' }}>
          <div className="stat-box" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '18px', fontWeight: '800' }}>
              {user?.following_count ?? user?.following ?? 0}
            </span>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Following</span>
          </div>
          <div className="stat-box" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '18px', fontWeight: '800' }}>
              {user?.followers_count ?? user?.followers ?? 0}
            </span>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Followers</span>
          </div>
          <div className="stat-box" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '18px', fontWeight: '800' }}>
              {user?.likes_count ?? user?.likesCount ?? 0}
            </span>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Likes</span>
          </div>
        </div>

        {/* Bio */}
        <p className="profile-bio" style={{ color: '#cbd5e1', fontSize: '13px', textAlign: 'center', maxWidth: '300px', lineHeight: 1.4 }}>
          {user?.bio || (isGuest ? 'Guest user account' : 'No bio added yet.')}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.08)',
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
          )}

          {!isGuest && (
            <button
              onClick={onSignOut}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: '1px solid rgba(225, 29, 72, 0.4)',
                background: 'rgba(225, 29, 72, 0.15)',
                color: '#fda4af',
                fontWeight: 600,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Profile</span>
              <button className="close-btn" onClick={() => setIsEditing(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your friends something about yourself..."
                />
              </div>
              <button type="submit" className="submit-btn" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid Tabs */}
      <div
        style={{
          display: 'flex',
          justify: 'space-around',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '8px',
          marginTop: '10px'
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
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '10px' }}>
          {displayList.map((reel) => (
            <div
              key={reel.id}
              className="grid-item"
              onClick={() => onSelectReel && onSelectReel(reel)}
              style={{ position: 'relative', aspectRatio: '9/16', background: '#000', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
            >
              <video
                src={reel.video_url || reel.videoUrl}
                className="grid-thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted
                playsInline
              />
              <div className="grid-likes-overlay" style={{ position: 'absolute', bottom: '6px', left: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                <Heart size={12} fill="#fff" color="#fff" />
                <span>{reel.likes_count ?? reel.likesCount ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
