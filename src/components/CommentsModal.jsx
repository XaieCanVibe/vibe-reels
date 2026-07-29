import React, { useState, useRef } from 'react';
import { X, Send, Lock, Reply } from 'lucide-react';

export const CommentsModal = ({ reel, comments = [], isGuest, onClose, onAddComment, onOpenAuth }) => {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  if (!reel) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!text.trim()) return;
    onAddComment(reel.id, text);
    setText('');
  };

  const handleReplyClick = (username) => {
    if (isGuest) {
      onOpenAuth && onOpenAuth();
      return;
    }
    setText(`@${username} `);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Comments ({comments.length || reel.comments_count || 0})</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>
              No comments yet. Be the first to comment! 💬
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img
                  src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles?.username}`}
                  alt={comment.profiles?.username}
                  className="comment-avatar"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles?.username}`; }}
                />
                <div className="comment-content">
                  <div className="comment-user">@{comment.profiles?.username}</div>
                  <div className="comment-text">{comment.text}</div>
                  
                  {/* Reply option button (Date/time removed) */}
                  <div style={{ marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleReplyClick(comment.profiles?.username || 'user')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Reply size={12} /> Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input or Guest Login Prompt */}
        {isGuest ? (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <button
              onClick={onOpenAuth}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #e11d48, #be123c)',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(225, 29, 72, 0.35)'
              }}
            >
              <Lock size={16} /> Log in to comment 💬
            </button>
          </div>
        ) : (
          <form className="comment-input-bar" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="comment-input"
              placeholder="Add a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button type="submit" className="send-comment-btn"><Send size={16} /></button>
          </form>
        )}
      </div>
    </div>
  );
};
