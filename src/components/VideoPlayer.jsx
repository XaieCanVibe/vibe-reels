import React, { useRef, useState, useEffect } from 'react';
import { Play, Heart } from 'lucide-react';

export const VideoPlayer = ({ video, isActive, onLike }) => {
  const videoRef = useRef(null);
  const progressContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [progress, setProgress] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Scrubber seeking state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (isActive && videoRef.current) {
      setIsBuffering(true);
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
          })
          .catch((err) => {
            console.log('Autoplay unmuted blocked by browser policy, attempting muted fallback:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  setIsBuffering(false);
                })
                .catch(() => setIsPlaying(false));
            }
          });
      }
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 1;
      setProgress((current / dur) * 100);
      setDuration(dur);
    }
  };

  const handleSeek = (clientX) => {
    if (!progressContainerRef.current || !videoRef.current) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const dur = videoRef.current.duration || 1;
    const targetTime = pos * dur;
    videoRef.current.currentTime = targetTime;
    setProgress(pos * 100);
    setScrubTime(targetTime);
    setDuration(dur);
  };

  const handleSeekStart = (e) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handleSeek(clientX);
  };

  const handleSeekMove = (e) => {
    if (!isScrubbing) return;
    e.stopPropagation();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handleSeek(clientX);
  };

  const handleSeekEnd = (e) => {
    if (isScrubbing) {
      e.stopPropagation();
      setIsScrubbing(false);
    }
  };

  const handleVideoClick = (e) => {
    if (isScrubbing) return;
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
    }

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
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
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => { setIsBuffering(false); setIsPlaying(true); }}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedData={() => setIsBuffering(false)}
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

      {/* Video Buffering / Loading Spinner */}
      {isBuffering && isActive && !isScrubbing && (
        <div className="play-pause-indicator" style={{ pointerEvents: 'none' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTopColor: '#e11d48',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        </div>
      )}

      {/* Single Tap Play Indicator (only if not buffering, not scrubbing, and paused) */}
      {!isPlaying && !isBuffering && !isScrubbing && (
        <div className="play-pause-indicator">
          <div className="play-icon-glow">
            <Play size={36} fill="#ffffff" style={{ marginLeft: '4px' }} />
          </div>
        </div>
      )}

      {/* Interactive Bottom Progress Scrubber Bar */}
      <div
        ref={progressContainerRef}
        className={`video-progress-container ${isScrubbing ? 'scrubbing' : ''}`}
        onMouseDown={handleSeekStart}
        onMouseMove={handleSeekMove}
        onMouseUp={handleSeekEnd}
        onTouchStart={handleSeekStart}
        onTouchMove={handleSeekMove}
        onTouchEnd={handleSeekEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Tooltip Bubble attached directly to Handle / Mouse position (as drawn in canvas) */}
        {isScrubbing && (
          <div
            className="scrub-handle-tooltip"
            style={{
              position: 'absolute',
              bottom: '28px',
              left: `clamp(50px, ${progress}%, calc(100% - 50px))`,
              transform: 'translateX(-50%)',
              background: 'rgba(15, 15, 20, 0.94)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(225, 29, 72, 0.7)',
              borderRadius: '16px',
              padding: '6px 14px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              zIndex: 50,
              boxShadow: '0 6px 20px rgba(0,0,0,0.85), 0 0 16px rgba(225, 29, 72, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              pointerEvents: 'none',
              animation: 'tooltipPop 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <span style={{ color: '#e11d48' }}>{formatTime(scrubTime)}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>/</span>
            <span style={{ color: '#cbd5e1' }}>{formatTime(duration)}</span>
            
            {/* Downward Pointer Arrow Pointing to Drag Handle */}
            <div style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '10px',
              height: '10px',
              background: 'rgba(15, 15, 20, 0.94)',
              borderRight: '1.5px solid rgba(225, 29, 72, 0.7)',
              borderBottom: '1.5px solid rgba(225, 29, 72, 0.7)'
            }} />
          </div>
        )}

        <div className="video-progress-track">
          <div className="video-progress-bar" style={{ width: `${progress}%` }} />
          <div className="video-progress-handle" style={{ left: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};
