import React from 'react';

export const TopNav = ({ activeFeedTab, onFeedTabChange }) => {
  return (
    <div className="top-nav">
      {/* Sleek VibeReels Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #e11d48, #fb923c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '900',
          fontSize: '14px',
          color: '#fff',
          fontFamily: 'Outfit, sans-serif'
        }}>
          V
        </div>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: '800',
          fontSize: '16px',
          background: 'linear-gradient(135deg, #ffffff, #cbd5e1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          VibeReels
        </span>
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

      <div style={{ width: '40px' }} /> {/* Spacer */}
    </div>
  );
};
