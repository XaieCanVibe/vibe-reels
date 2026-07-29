import React from 'react';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

export const BottomNav = ({ activeTab, onTabChange, onOpenUpload, unreadNotifCount = 0 }) => {
  return (
    <div className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => onTabChange('discover')}
      >
        <Compass size={22} />
        <span>Discover</span>
      </button>

      <button
        className="nav-item upload-nav-item"
        onClick={onOpenUpload}
      >
        <div className="vibe-upload-btn">
          <div className="vibe-upload-glow" />
          <div className="vibe-upload-inner">
            <Plus size={20} strokeWidth={2.8} color="#ffffff" />
          </div>
        </div>
      </button>

      <button
        className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
        onClick={() => onTabChange('inbox')}
        style={{ position: 'relative' }}
      >
        <MessageSquare size={22} />
        <span>Inbox</span>
        {unreadNotifCount > 0 && (
          <div className="notif-badge" style={{
            position: 'absolute',
            top: '-4px',
            right: 'calc(50% - 20px)',
            background: 'linear-gradient(135deg, #e11d48, #be123c)',
            border: '2px solid #000',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '1px 5px',
            minWidth: '17px',
            height: '17px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(225, 29, 72, 0.6)',
            lineHeight: 1,
            zIndex: 10
          }}>
            {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
          </div>
        )}
      </button>

      <button
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        <User size={22} />
        <span>Profile</span>
      </button>
    </div>
  );
};
