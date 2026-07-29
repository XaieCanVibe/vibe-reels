import React from 'react';
import { Home, Compass, Plus, MessageSquare, User } from 'lucide-react';

export const BottomNav = ({ activeTab, onTabChange, onOpenUpload }) => {
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
        className="nav-item"
        onClick={onOpenUpload}
        style={{ width: 'auto' }}
      >
        <div className="upload-btn-container">
          <div className="upload-btn-bg" />
          <div className="upload-btn-inner">
            <Plus size={20} strokeWidth={3} />
          </div>
        </div>
      </button>

      <button
        className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
        onClick={() => onTabChange('inbox')}
      >
        <MessageSquare size={22} />
        <span>Inbox</span>
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
