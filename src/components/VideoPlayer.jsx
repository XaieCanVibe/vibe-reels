import React, { useRef, useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Heart } from 'lucide-react';

export const VideoPlayer = ({ video, isActive, onLike }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default muted for smooth auto-play
  const [progress, setProgress] = useState(0);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay prevented:', err);
            setIsPlaying(false);
          });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleVideoClick = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected -> Trigger Heart animation & Like
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const heartId = 'heart_' + Date.now();
      setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 800);

      if (onLike && !video.isLiked) {
        onLike(video.id);
      }
    } else {
      // Single tap -> Toggle Play / Pause
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
          setShowPlayIcon(true);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
          setShowPlayIcon(false);
        }
      }
    }
    lastTapRef.current = now;
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="video-card" onClick={handleVideoClick}>
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnail}
        className="video-element"
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Floating Hearts on Double Tap */}
      {floatingHearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{ left: `${heart.x}px`, top: `${heart.y}px` }}
        >
          <Heart size={80} fill="#e11d48" color="#e11d48" />
        </div>
      ))}

      {/* Single Tap Play Indicator */}
      {!isPlaying && (
        <div className="play-pause-indicator">
          <div className="play-icon-glow">
            <Play size={36} fill="#ffffff" style={{ marginLeft: '4px' }} />
          </div>
        </div>
      )}

      {/* Mute / Unmute Top Control */}
      <button className="action-btn" onClick={toggleMute} style={{ position: 'absolute', top: '70px', right: '16px', zIndex: 30 }}>
        <div className="icon-wrapper" style={{ width: '38px', height: '38px' }}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </div>
      </button>

      {/* Bottom Progress Bar */}
      <div className="video-progress-container">
        <div className="video-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
