import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Heart, MessageCircle, Share2, Music, CheckCircle2, Plus } from 'lucide-react';

export const VideoFeed = ({
  reels,
  onLike,
  onOpenComments,
  onOpenShare,
  onSelectUser
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const height = containerRef.current.clientHeight;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / height);
      if (index !== activeIndex && index >= 0 && index < reels.length) {
        setActiveIndex(index);
      }
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (element) element.removeEventListener('scroll', handleScroll);
    };
  }, [activeIndex, reels.length]);

  return (
    <div className="video-feed" ref={containerRef}>
      {reels.map((reel, index) => {
        const isLiked = reel.isLiked;

        return (
          <div key={reel.id} className="video-card">
            {/* Main Video Component */}
            <VideoPlayer
              video={reel}
              isActive={index === activeIndex}
              onLike={onLike}
            />

            {/* Video Dark Gradient Overlay */}
            <div className="video-overlay">
              {/* Creator Info & Caption (Bottom Left) */}
              <div className="video-details">
                <div
                  className="creator-handle"
                  onClick={() => onSelectUser && onSelectUser(reel.user)}
                >
                  <span>{reel.user.name}</span>
                  <CheckCircle2 size={15} color="#38bdf8" fill="#0284c7" />
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>
                    {reel.user.username}
                  </span>
                </div>

                <div className="video-caption">
                  {reel.caption}{' '}
                  {reel.hashtags?.map((tag, i) => (
                    <span key={i} className="hashtag">
                      {tag}{' '}
                    </span>
                  ))}
                </div>

                <div className="audio-track-info">
                  <Music size={14} className="music-icon-anim" />
                  <span>{reel.song || 'Original Nepali Sound'}</span>
                </div>
              </div>

              {/* Side Actions (Bottom Right) */}
              <div className="side-actions">
                {/* User Avatar */}
                <div
                  className="profile-avatar-btn"
                  onClick={() => onSelectUser && onSelectUser(reel.user)}
                >
                  <img
                    src={reel.user.avatar}
                    alt={reel.user.name}
                    className="profile-avatar-img"
                  />
                  <div className="follow-plus-btn">
                    <Plus size={12} strokeWidth={3} />
                  </div>
                </div>

                {/* Like Button */}
                <button
                  className={`action-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => onLike(reel.id)}
                >
                  <div className="icon-wrapper">
                    <Heart
                      size={26}
                      fill={isLiked ? '#e11d48' : 'none'}
                      color={isLiked ? '#e11d48' : '#ffffff'}
                    />
                  </div>
                  <span className="action-label">{reel.likesCount}</span>
                </button>

                {/* Comments Button */}
                <button
                  className="action-btn"
                  onClick={() => onOpenComments(reel)}
                >
                  <div className="icon-wrapper">
                    <MessageCircle size={24} color="#ffffff" />
                  </div>
                  <span className="action-label">{reel.commentsCount}</span>
                </button>

                {/* Share Button */}
                <button
                  className="action-btn"
                  onClick={() => onOpenShare(reel)}
                >
                  <div className="icon-wrapper">
                    <Share2 size={24} color="#ffffff" />
                  </div>
                  <span className="action-label">{reel.sharesCount || 'Share'}</span>
                </button>

                {/* Spinning Music Disc */}
                <div className="music-disk">
                  <img
                    src={reel.user.avatar}
                    alt="Audio track"
                    className="music-disk-img"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
