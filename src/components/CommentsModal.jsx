import React, { useState } from 'react';
import { X, Send, Lock } from 'lucide-react';

export const CommentsModal = ({ reel, comments = [], isGuest, onClose, onAddComment, onOpenAuth }) => {
  const [text, setText] = useState('');

  if (!reel) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!text.trim()) return;
    onAddComment(reel.id, text);
    setText('');
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
                  <div className="comment-time">
                    {new Date(comment.created_at).toLocaleString()}
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
