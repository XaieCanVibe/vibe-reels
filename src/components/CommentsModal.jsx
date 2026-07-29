import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export const CommentsModal = ({ reel, onClose, onAddComment }) => {
  const [text, setText] = useState('');

  if (!reel) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(reel.id, text);
    setText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <span className="modal-title">
            Comments ({reel.commentsCount || reel.comments?.length || 0})
          </span>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {(!reel.comments || reel.comments.length === 0) ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>
              No comments yet. Be the first to comment! 💬
            </div>
          ) : (
            reel.comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img
                  src={comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={comment.user}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-user">{comment.user}</div>
                  <div className="comment-text">{comment.text}</div>
                  <div className="comment-time">{comment.timestamp || 'Recently'}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form className="comment-input-bar" onSubmit={handleSubmit}>
          <input
            type="text"
            className="comment-input"
            placeholder="Add a comment for your friends..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit" className="send-comment-btn">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
