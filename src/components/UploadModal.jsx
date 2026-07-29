import React, { useState, useRef } from 'react';
import { X, Upload, Video, CheckCircle2, AlertCircle, Film, Sparkles } from 'lucide-react';

export const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [songName, setSongName] = useState('🎵 Original Sound');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const popularHashtags = ['#Nepal', '#Kathmandu', '#Pokhara', '#NepaliTikTok', '#Momo', '#Dashain', '#VibeReels'];

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files[0];
    if (!file) return;

    // 1. Size check: Max 600MB (Supports 4K video clips)
    const MAX_SIZE_MB = 600;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`⚠️ File size exceeds ${MAX_SIZE_MB}MB limit! Please select a file under 600MB.`);
      return;
    }

    // 2. Duration check: Max 15 seconds
    const url = URL.createObjectURL(file);
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration > 15.5) { // 15 sec limit
        setErrorMsg(`⚠️ Video duration is ${Math.round(tempVideo.duration)}s. Maximum allowed duration is 15 seconds!`);
        URL.revokeObjectURL(url);
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(url);
    };
  };

  const toggleHashtag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setErrorMsg('Please select a video clip first!');
      return;
    }
    setIsUploading(true);
    await onUploadSuccess(videoFile, {
      caption: caption.trim(),
      hashtags: selectedTags,
      song: songName,
      previewUrl: videoPreviewUrl
    });
    setIsUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" style={{ maxHeight: '90%', borderRadius: '24px 24px 0 0' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={20} color="#e11d48" /> Upload 4K Reel
          </span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="upload-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {errorMsg && (
            <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.4)', color: '#fda4af', padding: '12px 14px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{errorMsg}</div>
            </div>
          )}

          {!videoPreviewUrl ? (
            <div
              className="file-dropzone"
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(225, 29, 72, 0.4)',
                background: 'rgba(225, 29, 72, 0.05)',
                borderRadius: '18px',
                padding: '36px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                <Video size={28} color="#e11d48" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#fff', marginBottom: '4px' }}>Select 4K Video Clip</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Supports up to 4K resolution • Max 15 sec • Max 600MB</div>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', maxHeight: '220px', background: '#000' }}>
              <video src={videoPreviewUrl} controls style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} />
              <button type="button" className="close-btn" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)' }} onClick={() => { setVideoFile(null); setVideoPreviewUrl(''); setErrorMsg(''); }}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Caption / Description</label>
            <textarea className="form-textarea" placeholder="Add a description..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Add Hashtags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {popularHashtags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button key={tag} type="button" onClick={() => toggleHashtag(tag)}
                    style={{ padding: '6px 12px', borderRadius: '16px', border: active ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.15)', background: active ? 'rgba(225, 29, 72, 0.25)' : 'rgba(255,255,255,0.05)', color: active ? '#fff' : '#cbd5e1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sound Title</label>
            <input type="text" className="form-input" value={songName} onChange={(e) => setSongName(e.target.value)} placeholder="🎵 e.g. Original Sound" />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            style={{
              background: isUploading ? 'rgba(225, 29, 72, 0.5)' : 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              color: '#fff',
              border: 'none',
              padding: '16px',
              borderRadius: '16px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '16px',
              fontWeight: '800',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 6px 24px rgba(225, 29, 72, 0.4)',
              marginTop: '8px'
            }}
          >
            {isUploading ? (
              <>⏳ Starting Live Upload...</>
            ) : (
              <><Upload size={20} /> Post Reel to Feed</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
