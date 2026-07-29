import React, { useRef, useState, useEffect } from 'react';
import { Play, Heart } from 'lucide-react';

export const VideoPlayer = ({ video, isActive, onLike }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]);
  
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      // Ensure sound is enabled (unmuted)
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay unmuted blocked by browser policy, attempting muted fallback:', err);
            // If browser blocks unmuted autoplay without user interaction:
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            }
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

    // Unmute video explicitly on click if browser muted it earlier
    if (videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap -> Trigger Heart animation & Like
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const heartId = 'heart_' + Date.now();
      setFloatingHearts((prev) => [...prev, { id: heartId, x, y }]);
      setTimeout(() => {
        setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 800);

      if (onLike) {
        onLike(video.id);
      }
    } else {
      // Single tap -> Toggle Play / Pause
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
    }
    lastTapRef.current = now;
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
        muted={false}
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

      {/* Bottom Progress Bar */}
      <div className="video-progress-container">
        <div className="video-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};
