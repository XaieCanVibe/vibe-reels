import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export const CommentsModal = ({ reel, comments = [], onClose, onAddComment }) => {
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
        <div className="modal-header">
          <span className="modal-title">Comments ({reel.comments_count || comments.length || 0})</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>
              No comments yet. Be the first! 💬
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
      </div>
    </div>
  );
};
