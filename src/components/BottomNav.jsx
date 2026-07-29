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
        <div className="upload-btn-container">
          <div className="upload-btn-bg-cyan" />
          <div className="upload-btn-bg-pink" />
          <div className="upload-btn-inner">
            <Plus size={18} strokeWidth={3} color="#000" />
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
            top: '2px',
            right: 'calc(50% - 18px)',
            background: 'var(--primary-nepal)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '800',
            padding: '2px 5px',
            minWidth: '16px',
            height: '16px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px var(--primary-nepal)',
            lineHeight: 1
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
