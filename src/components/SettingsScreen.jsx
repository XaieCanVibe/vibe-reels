import React, { useState } from 'react';
import {
  ArrowLeft, User, ShieldCheck, FileText, Star, Mail, Trash2,
  ChevronRight, Smartphone, AlertTriangle, ExternalLink, Heart, Send, CheckCircle2
} from 'lucide-react';
import { deleteAccount } from '../services/supabaseService';

export const SettingsScreen = ({ user, onBack, onSignOut, onEditProfile }) => {
  const [subView, setSubView] = useState('main'); // 'main' | 'privacy' | 'terms'
  const [starRating, setStarRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isGuest = user?.isGuest || user?.id?.toString().startsWith('guest-');

  const handleDeleteAccount = async () => {
    const confirmMsg = "⚠️ PERMANENT ACCOUNT DELETION WARNING:\n\nAre you sure you want to permanently delete your VibeReels account?\n\nThis will instantly wipe:\n• Your profile details & avatar\n• All your uploaded videos\n• All comments, likes, and followers\n\nThis action CANNOT be undone!";
    if (window.confirm(confirmMsg)) {
      setIsDeleting(true);
      const { error } = await deleteAccount(user.id);
      if (!error) {
        alert('Your account and all associated data have been permanently deleted.');
        onSignOut();
      } else {
        alert('Failed to delete account: ' + (error.message || 'Error'));
        setIsDeleting(false);
      }
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviewSubmitted(true);
    const mailto = `mailto:reedweveen@gmail.com?subject=VibeReels%20${starRating}%20Star%20Review&body=${encodeURIComponent(reviewText)}`;
    window.location.href = mailto;
  };

  // ── Privacy Policy Full Page Sub-View ──
  if (subView === 'privacy') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: '#ffffff', color: '#0f172a', padding: '20px' }}>
        <button
          onClick={() => setSubView('main')}
          style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '12px', color: '#0f172a', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}
        >
          <ArrowLeft size={16} /> Back to Settings
        </button>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          🔒 Privacy Policy
        </h1>
        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p><strong>Effective Date:</strong> July 29, 2026</p>
          <p>Welcome to <strong>VibeReels</strong> ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.</p>
          
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>1. Data We Collect</h3>
          <p>We only collect information necessary to provide video reel sharing services: username, display name, bio, uploaded video files, profile picture avatar, and interactions (likes, comments, followers).</p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>2. Media Storage & File Limits</h3>
          <p>Uploaded profile pictures are capped at 5MB, and video reels are capped at 20 seconds / 100MB to ensure optimal streaming performance.</p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>3. Data Deletion & User Control</h3>
          <p>You have full ownership of your data. You can delete individual reels at any time, or use the <strong>"Delete Account Permanently"</strong> feature to permanently wipe your profile and all associated media from our database.</p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>4. Contact Us</h3>
          <p>For any privacy inquiries or data requests, contact Developer <strong>Devin Rai</strong> at <a href="mailto:reedweveen@gmail.com" style={{ color: '#e11d48', fontWeight: '700' }}>reedweveen@gmail.com</a>.</p>
        </div>
      </div>
    );
  }

  // ── Terms & Conditions Full Page Sub-View ──
  if (subView === 'terms') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', background: '#ffffff', color: '#0f172a', padding: '20px' }}>
        <button
          onClick={() => setSubView('main')}
          style={{ background: '#f1f5f9', border: 'none', padding: '8px 14px', borderRadius: '12px', color: '#0f172a', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px' }}
        >
          <ArrowLeft size={16} /> Back to Settings
        </button>

        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
          📜 Terms & Conditions
        </h1>
        <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p><strong>Last Updated:</strong> July 29, 2026</p>
          
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>1. Acceptance of Terms</h3>
          <p>By accessing or using VibeReels, you agree to comply with these Terms & Conditions. If you do not agree, please do not use the app.</p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>2. Content Guidelines</h3>
          <p>Users are solely responsible for videos and comments posted. Hate speech, illegal content, harassment, or copyright infringement will result in instant content removal and account termination.</p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>3. Guest Accounts</h3>
          <p>Guest sessions are provided for temporary browsing and auto-expire after 1 hour. Guest accounts cannot post videos, like reels, or post comments.</p>

          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>4. Contact Developer</h3>
          <p>Developer: <strong>Devin Rai</strong> (<a href="mailto:reedweveen@gmail.com" style={{ color: '#e11d48', fontWeight: '700' }}>reedweveen@gmail.com</a>).</p>
        </div>
      </div>
    );
  }

  // ── Main Full Page Settings (Clean White Theme) ──
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', color: '#0f172a', padding: '20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '10px',
            borderRadius: '50%',
            color: '#0f172a',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
            Settings & Privacy
          </h1>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Account controls, legal, & developer info</div>
        </div>
      </div>

      {/* 🚀 Mobile Apps Coming Soon Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #e11d48, #be123c)',
        color: '#ffffff',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 8px 24px rgba(225, 29, 72, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Smartphone size={24} />
          <span style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>
            VibeReels Apps Coming Soon!
          </span>
        </div>
        <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.4, marginBottom: '14px' }}>
          Official VibeReels mobile apps are currently under development and launching soon on <strong>Google Play Store</strong> & <strong>Apple App Store</strong>!
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🤖 Play Store
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
            🍏 App Store
          </div>
        </div>
      </div>

      {/* Account Settings Group */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          Account Settings
        </div>

        {!isGuest && (
          <div
            onClick={onEditProfile}
            style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Edit Profile</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Change name, bio, and avatar</div>
              </div>
            </div>
            <ChevronRight size={18} color="#94a3b8" />
          </div>
        )}

        <div
          onClick={onSignOut}
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#e11d48' }}>Sign Out</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Log out of this device</div>
            </div>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </div>
      </div>

      {/* Contact Developer & App Info */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          Developer Information
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '14px', color: '#334155' }}>
            <strong>Developer:</strong> Devin Rai
          </div>
          <div style={{ fontSize: '14px', color: '#334155' }}>
            <strong>Email:</strong> <a href="mailto:reedweveen@gmail.com" style={{ color: '#e11d48', fontWeight: '700', textDecoration: 'none' }}>reedweveen@gmail.com</a>
          </div>
          <div style={{ fontSize: '14px', color: '#334155' }}>
            <strong>Phone:</strong> <em>Contact via Email</em>
          </div>
        </div>
      </div>

      {/* Rate & Review Section */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} color="#f59e0b" fill="#f59e0b" /> Rate App & Send Review
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
          Your feedback will be emailed directly to <strong>reedweveen@gmail.com</strong>
        </p>

        {/* 5-Star Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={28}
              onClick={() => setStarRating(star)}
              style={{ cursor: 'pointer' }}
              color="#f59e0b"
              fill={star <= starRating ? '#f59e0b' : 'none'}
            />
          ))}
        </div>

        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea
            placeholder="Write your review or feature suggestion..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#0f172a', outline: 'none', resize: 'none', minHeight: '70px' }}
          />
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Send size={15} /> Send Feedback Email
          </button>
        </form>
      </div>

      {/* Legal & Policy Pages */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          Legal & Safety
        </div>

        <div
          onClick={() => setSubView('privacy')}
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={20} color="#22c55e" />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Privacy Policy</span>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </div>

        <div
          onClick={() => setSubView('terms')}
          style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={20} color="#3b82f6" />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Terms & Conditions</span>
          </div>
          <ChevronRight size={18} color="#94a3b8" />
        </div>
      </div>

      {/* Delete Account Permanently (Red Zone) */}
      {!isGuest && (
        <div style={{ background: '#fff5f5', border: '1px solid #fecdd3', borderRadius: '16px', padding: '18px', marginBottom: '30px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', color: '#e11d48', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> Danger Zone
          </div>
          <p style={{ fontSize: '12px', color: '#9f1239', lineHeight: 1.4, marginBottom: '14px' }}>
            Permanently delete your account and wipe all your uploaded videos, likes, comments, and followers from the database.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            style={{
              width: '100%',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)'
            }}
          >
            <Trash2 size={16} /> {isDeleting ? 'Deleting Data...' : 'Delete Account Permanently'}
          </button>
        </div>
      )}
    </div>
  );
};
