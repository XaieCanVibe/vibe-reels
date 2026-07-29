import React, { useState, useRef } from 'react';
import { X, Upload, Video, Sparkles, CheckCircle2 } from 'lucide-react';

export const UploadModal = ({ onClose, onUploadSuccess }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedTags, setSelectedTags] = useState(['#Ramailo', '#Nepal']);
  const [songName, setSongName] = useState('🎵 Original Nepali Sound');
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const popularHashtags = ['#Nepal', '#Kathmandu', '#Pokhara', '#NepaliTikTok', '#Momo', '#Dashain', '#Ramailo'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
    }
  };

  const toggleHashtag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!videoPreviewUrl) {
      alert('Please select or upload a video clip first!');
      return;
    }

    setIsUploading(true);

    setTimeout(() => {
      onUploadSuccess({
        videoUrl: videoPreviewUrl,
        caption: caption || 'Check out my new video reel! 🇳🇵',
        hashtags: selectedTags,
        song: songName
      });
      setIsUploading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bottom-sheet"
        style={{ maxHeight: '85%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <span className="modal-title">Create New Reel (रील्स हाल्नुहोस्)</span>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Content Form */}
        <form className="upload-form" onSubmit={handleSubmit}>
          {/* Video Selector Dropzone */}
          {!videoPreviewUrl ? (
            <div
              className="file-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <Video size={42} color="#e11d48" />
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>
                Select Video from Phone or PC
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Supports MP4, MOV, WebM short videos (Max 100MB)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', maxHeight: '220px', background: '#000' }}>
              <video
                src={videoPreviewUrl}
                controls
                style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }}
              />
              <button
                type="button"
                className="close-btn"
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)' }}
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreviewUrl('');
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Caption Input */}
          <div className="form-group">
            <label className="form-label">Caption / Description</label>
            <textarea
              className="form-textarea"
              placeholder="What's on your mind? Add caption for friends..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          {/* Popular Nepali Hashtags */}
          <div className="form-group">
            <label className="form-label">Add Nepali Hashtags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
              {popularHashtags.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleHashtag(tag)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      border: active ? '1px solid #e11d48' : '1px solid rgba(255,255,255,0.15)',
                      background: active ? 'rgba(225, 29, 72, 0.25)' : 'rgba(255,255,255,0.05)',
                      color: active ? '#fff' : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Track Name */}
          <div className="form-group">
            <label className="form-label">Audio / Sound Title</label>
            <input
              type="text"
              className="form-input"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              placeholder="e.g. 🎵 Resham Firiri or Original Sound"
            />
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isUploading}>
            {isUploading ? (
              <span>Publishing Reel... 🚀</span>
            ) : isSuccess ? (
              <span>
                <CheckCircle2 size={18} /> Uploaded & Pushed to Feed!
              </span>
            ) : (
              <span>
                <Upload size={18} /> Post to Feed (रील्स पोस्ट गर्नुहोस)
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
