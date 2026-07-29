import React, { useState, useRef } from 'react';
import {
  Grid, Heart, Film, Edit3, LogOut, Sparkles, User, Check, X, Camera,
  AlertCircle, MoreVertical, Trash2, UserPlus, UserCheck, Play,
  Settings, ShieldCheck, Star, Mail, Phone, UserX, ChevronRight, Info
} from 'lucide-react';
import { updateProfile, uploadAvatar, deleteAccount } from '../services/supabaseService';

export const UserProfile = ({
  user,
  currentUserId,
  userReels = [],
  onSelectReel,
  onSignOut,
  isFollowing = false,
  onFollowToggle,
  onDeleteReel,
  onOpenSettings
}) => {
  const [activeTab, setActiveTab] = useState('uploads');
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [editError, setEditError] = useState('');
  const avatarInputRef = useRef(null);

  const isGuest = user?.isGuest || user?.id?.toString().startsWith('guest-');
  const isOwnProfile = !isGuest && currentUserId && (user?.id === currentUserId);

  const myUploads = userReels.filter(
    (r) => r.user_id === user?.id || r.profiles?.id === user?.id || r.user?.id === user?.id
  );
  const likedReels = userReels.filter((r) => r.isLiked);
  const displayList = activeTab === 'uploads' ? myUploads : likedReels;

  const totalLikesOnUploads = myUploads.reduce(
    (sum, r) => sum + (r.likes_count ?? r.likesCount ?? 0),
    0
  );

  const avatarUrl = avatarPreview || user?.avatar_url || user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`;

  const formatCount = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const handleAvatarChange = (e) => {
    setEditError('');
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setEditError('⚠️ Profile picture must be under 5MB!');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    setIsSaving(true);

    let newAvatarUrl = user.avatar_url;

    if (avatarFile) {
      const avatarRes = await uploadAvatar(user.id, avatarFile);
      if (avatarRes?.error) {
        setEditError('Failed to upload picture: ' + avatarRes.error.message);
        setIsSaving(false);
        return;
      }
      if (avatarRes?.url) {
        newAvatarUrl = avatarRes.url;
      }
    }

    const { data, error } = await updateProfile(user.id, {
      name: name.trim(),
      bio: bio.trim(),
      avatar_url: newAvatarUrl
    });

    if (!error && data) {
      user.name = data.name;
      user.bio = data.bio;
      user.avatar_url = data.avatar_url;
      setIsEditing(false);
    } else if (error) {
      setEditError('Error updating profile: ' + (error.message || 'Failed'));
    }
    setIsSaving(false);
  };

  const handleDeleteAccountPermanent = async () => {
    const confirmMessage = "⚠️ PERMANENT DELETE WARNING:\n\nAre you sure you want to delete your account?\n\nThis will PERMANENTLY remove:\n• Your profile info & avatar\n• All your uploaded reels\n• All your comments, likes, and followers\n\nThis action CANNOT be undone!";
    if (window.confirm(confirmMessage)) {
      setIsDeletingAccount(true);
      const { error } = await deleteAccount(user.id);
      if (!error) {
        alert('Your account and all associated data have been permanently deleted.');
        onSignOut();
      } else {
        alert('Failed to delete account: ' + (error.message || 'Error'));
        setIsDeletingAccount(false);
      }
    }
  };

  return (
    <div className="profile-screen" style={{ flex: 1, overflowY: 'auto', background: '#09090b', color: '#fff', padding: '20px', position: 'relative' }}>
      
      {/* Top 3-Dots Menu Button (For Own Profile) */}
      {isOwnProfile && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100 }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#fff',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MoreVertical size={20} />
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              padding: '6px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
              minWidth: '170px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <button
                onClick={() => { setShowMenu(false); setEditError(''); setIsEditing(true); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>

              <button
                onClick={() => { setShowMenu(false); onOpenSettings && onOpenSettings(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Settings size={15} /> Settings & Privacy
              </button>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '2px 0' }} />

              <button
                onClick={() => { setShowMenu(false); onSignOut(); }}
                style={{
                  background: 'rgba(225,29,72,0.12)',
                  border: 'none',
                  color: '#fda4af',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}

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
            Guest accounts automatically clear after 1 hour. Create a permanent account to keep uploaded reels and likes!
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
            {user?.name || user?.username || 'User'}
          </div>
          <div className="profile-username" style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
            @{user?.username || 'user'}
          </div>
        </div>

        {/* Real Stats Bar */}
        <div className="profile-stats" style={{ display: 'flex', justifyContent: 'center', gap: '32px', margin: '16px 0' }}>
          <div className="stat-box" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '18px', fontWeight: '800' }}>
              {formatCount(user?.following_count ?? user?.following ?? 0)}
            </span>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Following</span>
          </div>
          <div className="stat-box" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '18px', fontWeight: '800' }}>
              {formatCount(user?.followers_count ?? user?.followers ?? 0)}
            </span>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Followers</span>
          </div>
          <div className="stat-box" style={{ textAlign: 'center' }}>
            <span className="stat-value" style={{ display: 'block', fontSize: '18px', fontWeight: '800' }}>
              {formatCount(totalLikesOnUploads || (user?.likes_count ?? user?.likesCount ?? 0))}
            </span>
            <span className="stat-label" style={{ color: '#64748b', fontSize: '12px' }}>Likes</span>
          </div>
        </div>

        {/* Bio */}
        <p className="profile-bio" style={{ color: '#cbd5e1', fontSize: '13px', textAlign: 'center', maxWidth: '300px', lineHeight: 1.4 }}>
          {user?.bio || (isGuest ? 'Guest user account' : 'No bio added yet.')}
        </p>

        {/* Action Buttons for Other Profiles */}
        {!isOwnProfile && !isGuest && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={() => onFollowToggle && onFollowToggle(user.id)}
              style={{
                padding: '10px 24px',
                borderRadius: '20px',
                border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
                background: isFollowing ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: isFollowing ? 'none' : '0 4px 14px rgba(225, 29, 72, 0.4)'
              }}
            >
              {isFollowing ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '24px 24px 0 0' }}>
            <div className="modal-header">
              <span className="modal-title">Edit Profile</span>
              <button className="close-btn" onClick={() => setIsEditing(false)}><X size={18} /></button>
            </div>

            {editError && (
              <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.4)', color: '#fda4af', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => avatarInputRef.current?.click()}>
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e11d48' }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, background: '#e11d48', borderRadius: '50%', padding: '6px', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    <Camera size={14} />
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Tap image to change (Max 5MB)</div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </div>

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

      {/* Settings & Privacy Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '24px 24px 0 0', maxHeight: '85%' }}>
            <div className="modal-header">
              <span className="modal-title">⚙️ Settings & Privacy</span>
              <button className="close-btn" onClick={() => setShowSettingsModal(false)}><X size={18} /></button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              
              {/* Contact Developer */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} color="#38bdf8" /> Contact Developer
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  <div><strong>Developer:</strong> Devin Rai</div>
                  <div><strong>Email:</strong> <a href="mailto:reedweveen@gmail.com" style={{ color: '#38bdf8', textDecoration: 'none' }}>reedweveen@gmail.com</a></div>
                  <div><strong>Phone:</strong> <em>Contact via email</em></div>
                </div>
              </div>

              {/* Rate & Review App */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} color="#f59e0b" /> Rate App & Send Feedback
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
                  Send your feedback directly to the creator email: <strong>reedweveen@gmail.com</strong>
                </div>
                <a
                  href="mailto:reedweveen@gmail.com?subject=VibeReels%20App%20Feedback%20%26%20Review"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Mail size={14} /> Send Email Feedback
                </a>
              </div>

              {/* Privacy Policy Toggle */}
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
                  style={{ fontSize: '14px', fontWeight: '700', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="#22c55e" /> Privacy Policy
                  </span>
                  <ChevronRight size={16} style={{ transform: showPrivacyPolicy ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
                {showPrivacyPolicy && (
                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, marginTop: '10px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ marginBottom: '6px' }}><strong>VibeReels Privacy Policy:</strong></p>
                    <p style={{ marginBottom: '6px' }}>1. We only store essential data (username, display name, bio, uploaded reels, likes, comments, and avatar).</p>
                    <p style={{ marginBottom: '6px' }}>2. Storage Limits: Profile avatars are capped at 5MB, and reels at 20s/100MB.</p>
                    <p style={{ marginBottom: '6px' }}>3. Delete Account: You hold full ownership of your data. Deleting your account instantly purges all your uploaded reels, comments, and profile info from our database permanently.</p>
                  </div>
                )}
              </div>

              {/* Delete Account Permanently */}
              <div style={{ background: 'rgba(225, 29, 72, 0.1)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(225, 29, 72, 0.3)', marginTop: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fda4af', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserX size={16} /> Danger Zone
                </div>
                <div style={{ fontSize: '12px', color: '#f87171', marginBottom: '12px', lineHeight: 1.4 }}>
                  Deleting your account will permanently wipe your profile, uploaded videos, comments, and followers from the database.
                </div>
                <button
                  onClick={handleDeleteAccountPermanent}
                  disabled={isDeletingAccount}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #e11d48, #be123c)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={15} /> {isDeletingAccount ? 'Deleting...' : 'Delete Account Permanently'}
                </button>
              </div>

            </div>
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
              style={{ position: 'relative', aspectRatio: '9/16', background: '#000', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }}
            >
              <video
                src={reel.video_url || reel.videoUrl}
                className="grid-thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                muted
                playsInline
                onClick={() => onSelectReel && onSelectReel(reel)}
              />
              
              {/* TikTok Style View Count Overlay */}
              <div className="grid-views-overlay" style={{ position: 'absolute', bottom: '6px', left: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)', pointerEvents: 'none' }}>
                <Play size={13} fill="#fff" color="#fff" />
                <span>{formatCount(reel.views_count ?? reel.viewsCount ?? 0)}</span>
              </div>

              {/* Delete Reel Button for Own Profile */}
              {isOwnProfile && activeTab === 'uploads' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this reel?')) {
                      onDeleteReel && onDeleteReel(reel.id);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(225, 29, 72, 0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                  }}
                  title="Delete Reel"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
