import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Heart, MessageCircle, Share2, Music, CheckCircle2, Plus, Check } from 'lucide-react';

export const VideoFeed = ({
  reels,
  onLike,
  onOpenComments,
  onOpenShare,
  onSelectUser,
  onVideoChange,
  isGuest = false,
  onGuestAction,
  followingIds = new Set(),
  currentUserId,
  onFollowToggle
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [followedJustNow, setFollowedJustNow] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const height = containerRef.current.clientHeight;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / height);
      if (index !== activeIndex && index >= 0 && index < reels.length) {
        setActiveIndex(index);
        if (onVideoChange && reels[index]) onVideoChange(reels[index].id);
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

  const handleFollowClick = (e, creatorId) => {
    e.stopPropagation();
    if (isGuest) {
      onGuestAction && onGuestAction('follow');
      return;
    }
    setFollowedJustNow((prev) => new Set(prev).add(creatorId));
    onFollowToggle && onFollowToggle(creatorId);
  };

  return (
    <div className="video-feed" ref={containerRef}>
      {reels.map((reel, index) => {
        const isLiked = reel.isLiked;
        const creator = reel.profiles || reel.user || {};
        const avatarUrl = creator.avatar_url || creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`;

        const isOwnReel = currentUserId && (creator.id === currentUserId || reel.user_id === currentUserId);
        const isFollowingCreator = followingIds.has(creator.id) || followedJustNow.has(creator.id) || isOwnReel;

        return (
          <div key={reel.id} className="video-card">
            {/* Main Video Component */}
            <VideoPlayer
              video={{ ...reel, videoUrl: reel.video_url || reel.videoUrl }}
              isActive={index === activeIndex}
              onLike={(reelId) => {
                if (isGuest) {
                  onGuestAction && onGuestAction('like');
                } else {
                  onLike(reelId);
                }
              }}
            />

            {/* Video Dark Gradient Overlay */}
            <div className="video-overlay">
              {/* Creator Info & Caption (Bottom Left) */}
              <div className="video-details">
                <div
                  className="creator-handle"
                  onClick={() => onSelectUser && onSelectUser(creator)}
                >
                  <span>{creator.name || creator.username}</span>
                  {creator.is_verified && <CheckCircle2 size={15} color="#38bdf8" fill="#0284c7" />}
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>
                    @{creator.username}
                  </span>
                </div>

                <div className="video-caption">
                  {reel.caption}{' '}
                  {reel.hashtags?.map((tag, i) => (
                    <span key={i} className="hashtag">{tag}{' '}</span>
                  ))}
                </div>

                <div className="audio-track-info">
                  <Music size={14} />
                  <span>{reel.song || 'Original Nepali Sound'}</span>
                </div>
              </div>

              {/* Side Actions (Bottom Right) */}
              <div className="side-actions">
                {/* User Avatar & Follow Plus Button */}
                <div
                  className="profile-avatar-btn"
                  onClick={() => onSelectUser && onSelectUser(creator)}
                  style={{ position: 'relative' }}
                >
                  <img
                    src={avatarUrl}
                    alt={creator.username}
                    className="profile-avatar-img"
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`; }}
                  />

                  {/* Show + Follow Button only if NOT already following */}
                  {!isFollowingCreator && (
                    <div
                      className="follow-plus-btn"
                      onClick={(e) => handleFollowClick(e, creator.id)}
                      style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#e11d48',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}
                      title="Follow"
                    >
                      <Plus size={13} strokeWidth={3} />
                    </div>
                  )}
                </div>

                {/* Like Button */}
                <button
                  className={`action-btn ${isLiked ? 'liked' : ''}`}
                  onClick={() => {
                    if (isGuest) {
                      onGuestAction && onGuestAction('like');
                    } else {
                      onLike(reel.id);
                    }
                  }}
                >
                  <div className="icon-wrapper">
                    <Heart size={26} fill={isLiked ? '#e11d48' : 'none'} color={isLiked ? '#e11d48' : '#ffffff'} />
                  </div>
                  <span className="action-label">{reel.likes_count ?? reel.likesCount ?? 0}</span>
                </button>

                {/* Comments Button */}
                <button className="action-btn" onClick={() => onOpenComments(reel)}>
                  <div className="icon-wrapper"><MessageCircle size={24} color="#ffffff" /></div>
                  <span className="action-label">{reel.comments_count ?? reel.commentsCount ?? 0}</span>
                </button>

                {/* Share Button */}
                <button className="action-btn" onClick={() => onOpenShare(reel)}>
                  <div className="icon-wrapper"><Share2 size={24} color="#ffffff" /></div>
                  <span className="action-label">{reel.shares_count ?? reel.sharesCount ?? 'Share'}</span>
                </button>

                {/* Spinning Music Disc */}
                <div className="music-disk">
                  <img src={avatarUrl} alt="Audio track" className="music-disk-img" onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=music`; }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
