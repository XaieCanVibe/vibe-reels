import React from 'react';

export const TopNav = ({ activeFeedTab, onFeedTabChange }) => {
  return (
    <div className="top-nav">
      <div className="nepal-badge">
        <span>🇳🇵</span> Ramailo
      </div>

      <div className="top-tabs">
        <span
          className={`top-tab ${activeFeedTab === 'following' ? 'active' : ''}`}
          onClick={() => onFeedTabChange('following')}
        >
          Following
        </span>
        <span
          className={`top-tab ${activeFeedTab === 'foryou' ? 'active' : ''}`}
          onClick={() => onFeedTabChange('foryou')}
        >
          For You
        </span>
      </div>

      <div style={{ width: '60px' }} /> {/* Spacer for balance */}
    </div>
  );
};
