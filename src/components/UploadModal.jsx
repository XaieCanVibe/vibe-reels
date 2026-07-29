import React, { useState, useRef } from 'react';
import { X, Upload, Video, CheckCircle2 } from 'lucide-react';

export const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState(['#VibeReels', '#Nepal']);
  const [songName, setSongName] = useState('🎵 Original Sound');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const popularHashtags = ['#Nepal', '#Kathmandu', '#Pokhara', '#NepaliTikTok', '#Momo', '#Dashain', '#VibeReels'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const toggleHashtag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      alert('Please select a video clip first!');
      return;
    }
    setIsUploading(true);
    await onUploadSuccess(videoFile, {
      caption: caption || 'My new reel! 🇳🇵',
      hashtags: selectedTags,
      song: songName
    });
    setIsSuccess(true);
    setIsUploading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" style={{ maxHeight: '88%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create Reel (रील बनाउनुहोस्)</span>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form className="upload-form" onSubmit={handleSubmit}>
          {!videoPreviewUrl ? (
            <div className="file-dropzone" onClick={() => fileInputRef.current?.click()}>
              <Video size={42} color="#e11d48" />
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>Tap to Select Video from Phone</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>MP4, MOV, WebM (short videos work best)</div>
              <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', maxHeight: '220px', background: '#000' }}>
              <video src={videoPreviewUrl} controls style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} />
              <button type="button" className="close-btn" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)' }} onClick={() => { setVideoFile(null); setVideoPreviewUrl(''); }}>
                <X size={16} />
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Caption</label>
            <textarea className="form-textarea" placeholder="What's this reel about? Add a description..." value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Hashtags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
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
            <label className="form-label">Audio / Sound Title</label>
            <input type="text" className="form-input" value={songName} onChange={(e) => setSongName(e.target.value)} placeholder="🎵 e.g. Resham Firiri or Original Sound" />
          </div>

          <button type="submit" className="submit-btn" disabled={isUploading}>
            {isUploading ? '⏳ Uploading to cloud...' : isSuccess ? <><CheckCircle2 size={18} /> Uploaded & Pushed!</> : <><Upload size={18} /> Post Reel to Feed</>}
          </button>
        </form>
      </div>
    </div>
  );
};
