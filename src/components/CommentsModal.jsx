import React, { useState, useRef } from 'react';
import { X, Send, Lock, ChevronDown, ChevronRight } from 'lucide-react';

export const CommentsModal = ({ reel, comments = [], isGuest, onClose, onAddComment, onOpenAuth }) => {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // { id, username }
  const [expandedReplies, setExpandedReplies] = useState(new Set()); // track which comment's replies are expanded
  const inputRef = useRef(null);

  if (!reel) return null;

  // Separate top-level comments and replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId) => comments.filter((c) => c.parent_id === parentId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!text.trim()) return;
    onAddComment(reel.id, text, replyingTo?.id || null);
    setText('');
    setReplyingTo(null);
  };

  const handleReplyClick = (comment) => {
    if (isGuest) {
      onOpenAuth && onOpenAuth();
      return;
    }
    setReplyingTo({ id: comment.id, username: comment.profiles?.username || 'user' });
    setText(`@${comment.profiles?.username || 'user'} `);
    if (inputRef.current) inputRef.current.focus();
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const renderComment = (comment, isReply = false) => {
    const replies = getReplies(comment.id);
    const repliesExpanded = expandedReplies.has(comment.id);
    const avatarSeed = comment.profiles?.username || 'user';
    const avatarUrl = comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

    return (
      <div key={comment.id}>
        {/* Comment Row */}
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          paddingLeft: isReply ? '40px' : '0',
          marginBottom: '12px'
        }}>
          <img
            src={avatarUrl}
            alt={avatarSeed}
            style={{ width: isReply ? '28px' : '36px', height: isReply ? '28px' : '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`; }}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0' }}>
              @{comment.profiles?.username || 'user'}
            </span>
            <div style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: 1.4, marginTop: '2px' }}>
              {comment.text}
            </div>
            {/* Reply Button row */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '6px', alignItems: 'center' }}>
              {!isGuest && (
                <button
                  type="button"
                  onClick={() => handleReplyClick(comment)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                >
                  Reply
                </button>
              )}
            </div>

            {/* Show/Hide Replies Button */}
            {!isReply && replies.length > 0 && (
              <button
                type="button"
                onClick={() => toggleReplies(comment.id)}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {repliesExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                {repliesExpanded ? 'Hide' : 'View'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>

        {/* Nested Replies */}
        {!isReply && repliesExpanded && replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Comments ({comments.length || reel.comments_count || 0})</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Comments List */}
        <div className="comments-list" style={{ gap: '4px' }}>
          {topLevel.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '14px' }}>
              No comments yet. Be the first to comment! 💬
            </div>
          ) : (
            topLevel.map((comment) => renderComment(comment, false))
          )}
        </div>

        {/* Replying-to context banner */}
        {replyingTo && (
          <div style={{ padding: '8px 16px', background: 'rgba(56,189,248,0.08)', borderTop: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#38bdf8' }}>
            <span>Replying to <strong>@{replyingTo.username}</strong></span>
            <button onClick={() => { setReplyingTo(null); setText(''); }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>✕ Cancel</button>
          </div>
        )}

        {/* Comment Input or Guest Login Prompt */}
        {isGuest ? (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <button
              onClick={onOpenAuth}
              style={{ width: '100%', background: 'linear-gradient(135deg, #e11d48, #be123c)', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
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
              placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
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
