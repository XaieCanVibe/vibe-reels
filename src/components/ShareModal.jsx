import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle } from 'lucide-react';

export const ShareModal = ({ reel, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!reel) return null;

  const shareUrl = window.location.origin + '?reel=' + reel.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this reel on Ramailo Reels: ${reel.caption} ${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Share Reel with Friends 🇳🇵</span>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Share Channels */}
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button
              onClick={handleWhatsAppShare}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MessageCircle size={24} color="#fff" />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>WhatsApp</span>
            </button>

            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {copied ? <Check size={24} color="#10b981" /> : <Copy size={24} color="#fff" />}
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Direct Copy Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '6px 12px'
            }}
          >
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#10b981' : '#e11d48',
                border: 'none',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
