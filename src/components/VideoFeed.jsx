import React, { useState, useRef, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { Heart, MessageCircle, Share2, Music, CheckCircle2, Plus, RefreshCw } from 'lucide-react';

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
  onFollowToggle,
  onRefresh
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [followedJustNow, setFollowedJustNow] = useState(new Set());
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // Heart burst: { reelId, x, y }
  const [heartBurst, setHeartBurst] = useState(null);
  const heartBurstTimer = useRef(null);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const lastTapRef = useRef({});
  const PULL_THRESHOLD = 70;

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
    if (element) element.addEventListener('scroll', handleScroll, { passive: true });
    return () => { if (element) element.removeEventListener('scroll', handleScroll); };
  }, [activeIndex, reels.length]);

  // ── Pull-to-Refresh touch handlers ──
  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStartY.current) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && containerRef.current?.scrollTop === 0) {
      setIsPulling(true);
      setPullY(Math.min(delta, PULL_THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      if (onRefresh) await onRefresh();
      setTimeout(() => {
        setRefreshing(false);
        setActiveIndex(0);
      }, 600);
    }
    setIsPulling(false);
    setPullY(0);
    touchStartY.current = 0;
  };

  const handleFollowClick = (e, creatorId) => {
    e.stopPropagation();
    if (isGuest) {
      onGuestAction && onGuestAction('follow');
      return;
    }
    setFollowedJustNow((prev) => new Set(prev).add(creatorId));
    onFollowToggle && onFollowToggle(creatorId);
  };

  // ── Double-tap to like with heart burst ──
  const handleVideoTap = (e, reel) => {
    const now = Date.now();
    const last = lastTapRef.current[reel.id] || 0;
    if (now - last < 300) {
      // Double tap!
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setHeartBurst({ reelId: reel.id, x, y });
      if (!reel.isLiked) {
        if (isGuest) { onGuestAction && onGuestAction('like'); }
        else { onLike(reel.id); }
      }
      clearTimeout(heartBurstTimer.current);
      heartBurstTimer.current = setTimeout(() => setHeartBurst(null), 750);
    }
    lastTapRef.current[reel.id] = now;
  };

  return (
    <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
      {/* Pull-to-Refresh indicator */}
      {(isPulling || refreshing) && (
        <div className="ptr-indicator" style={{ opacity: pullY > 20 || refreshing ? 1 : 0 }}>
          <RefreshCw size={16} className={refreshing ? 'ptr-spinner' : ''} style={{ transition: 'transform 0.2s', transform: refreshing ? undefined : `rotate(${(pullY / PULL_THRESHOLD) * 180}deg)` }} />
          <span>{refreshing ? 'Refreshing...' : pullY >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
        </div>
      )}

      <div
        className="video-feed"
        ref={containerRef}
        style={{ transform: isPulling && pullY > 0 ? `translateY(${Math.min(pullY * 0.4, 28)}px)` : undefined, transition: isPulling ? 'none' : 'transform 0.3s ease' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {reels.map((reel, index) => {
          const isLiked = reel.isLiked;
          const creator = reel.profiles || reel.user || {};
          const avatarUrl = creator.avatar_url || creator.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`;
          const isOwnReel = currentUserId && (creator.id === currentUserId || reel.user_id === currentUserId);
          const isFollowingCreator = followingIds.has(creator.id) || followedJustNow.has(creator.id) || isOwnReel;
          const showBurst = heartBurst?.reelId === reel.id;

          return (
            <div key={reel.id} className="video-card video-item" onClick={(e) => handleVideoTap(e, reel)}>
              <VideoPlayer
                video={{ ...reel, videoUrl: reel.video_url || reel.videoUrl }}
                isActive={index === activeIndex}
                onLike={(reelId) => {
                  if (isGuest) { onGuestAction && onGuestAction('like'); }
                  else { onLike(reelId); }
                }}
              />

              {/* Double-tap heart burst */}
              {showBurst && (
                <div
                  className="heart-burst"
                  style={{ left: heartBurst.x, top: heartBurst.y }}
                >
                  ♥
                </div>
              )}

              <div className="video-overlay">
                {/* Creator Info & Caption */}
                <div className="video-details">
                  <div className="creator-handle" onClick={() => onSelectUser && onSelectUser(creator)}>
                    <span>{creator.name || creator.username}</span>
                    {creator.is_verified && <CheckCircle2 size={15} color="#38bdf8" fill="#0284c7" />}
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginLeft: '4px' }}>@{creator.username}</span>
                  </div>
                  <div className="video-caption">
                    {reel.caption}{' '}
                    {reel.hashtags?.map((tag, i) => <span key={i} className="hashtag">{tag}{' '}</span>)}
                  </div>
                  <div className="audio-track-info">
                    <Music size={14} />
                    <span>{reel.song || 'Original Nepali Sound'}</span>
                  </div>
                </div>

                {/* Side Action Buttons */}
                <div className="side-actions">
                  {/* Avatar + Follow */}
                  <div className="profile-avatar-btn" onClick={() => onSelectUser && onSelectUser(creator)} style={{ position: 'relative' }}>
                    <img
                      src={avatarUrl}
                      alt={creator.username}
                      className="profile-avatar-img"
                      onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.username}`; }}
                    />
                    {!isFollowingCreator && (
                      <div
                        className="follow-plus-btn"
                        onClick={(e) => handleFollowClick(e, creator.id)}
                        title="Follow"
                        style={{ cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                      >
                        <Plus size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Like */}
                  <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => { if (isGuest) { onGuestAction && onGuestAction('like'); } else { onLike(reel.id); } }}
                  >
                    <div className="icon-wrapper">
                      <Heart size={26} fill={isLiked ? '#e11d48' : 'none'} color={isLiked ? '#e11d48' : '#ffffff'} />
                    </div>
                    <span className="action-label">{reel.likes_count ?? 0}</span>
                  </button>

                  {/* Comments */}
                  <button className="action-btn" onClick={() => onOpenComments(reel)}>
                    <div className="icon-wrapper"><MessageCircle size={24} color="#ffffff" /></div>
                    <span className="action-label">{reel.comments_count ?? 0}</span>
                  </button>

                  {/* Share */}
                  <button className="action-btn" onClick={() => onOpenShare(reel)}>
                    <div className="icon-wrapper"><Share2 size={24} color="#ffffff" /></div>
                    <span className="action-label">{reel.shares_count ?? 'Share'}</span>
                  </button>

                  {/* Music Disc */}
                  <div className="music-disk">
                    <img src={avatarUrl} alt="track" className="music-disk-img" onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=music`; }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
