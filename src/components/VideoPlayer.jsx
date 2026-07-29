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

      {/* Scrubbing Timestamp & Mini Timeline Overlay Card (YouTube Shorts / TikTok style) */}
      {isScrubbing && (
        <div
          className="scrub-popup-card"
          style={{
            position: 'absolute',
            top: '48%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15, 15, 20, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(225, 29, 72, 0.5)',
            borderRadius: '20px',
            padding: '14px 22px',
            color: '#ffffff',
            zIndex: 60,
            pointerEvents: 'none',
            boxShadow: '0 12px 40px rgba(0,0,0,0.9), 0 0 20px rgba(225,29,72,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            minWidth: '150px',
            animation: 'scaleIn 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          {/* Timestamp Numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '16px', fontWeight: '800' }}>
            <span style={{ color: '#e11d48', textShadow: '0 0 10px rgba(225,29,72,0.6)' }}>{formatTime(scrubTime)}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>/</span>
            <span style={{ color: '#cbd5e1' }}>{formatTime(duration)}</span>
          </div>

          {/* Mini Scrubber Line Inside Center Popup: ==========O--------- */}
          <div style={{
            width: '120px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            position: 'relative',
            marginTop: '2px'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8, #e11d48)',
              borderRadius: '2px',
              boxShadow: '0 0 8px #e11d48'
            }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '2px solid #e11d48',
              boxShadow: '0 0 10px rgba(225,29,72,0.9)'
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
        <div className="video-progress-track">
          <div className="video-progress-bar" style={{ width: `${progress}%` }} />
          <div className="video-progress-handle" style={{ left: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};
