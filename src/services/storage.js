import { INITIAL_REELS, CURRENT_USER } from './initialData';

const REELS_KEY = 'ramailo_reels_data_v1';
const USER_KEY = 'ramailo_user_data_v1';

// Get all reels from storage or set initial data
export const getReels = () => {
  try {
    const data = localStorage.getItem(REELS_KEY);
    if (!data) {
      localStorage.setItem(REELS_KEY, JSON.stringify(INITIAL_REELS));
      return INITIAL_REELS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading reels:', e);
    return INITIAL_REELS;
  }
};

// Save reel toggle like status
export const toggleLikeReel = (reelId) => {
  const reels = getReels();
  const updated = reels.map((reel) => {
    if (reel.id === reelId) {
      const isLiked = !reel.isLiked;
      const likesCount = isLiked ? reel.likesCount + 1 : Math.max(0, reel.likesCount - 1);
      return { ...reel, isLiked, likesCount };
    }
    return reel;
  });
  localStorage.setItem(REELS_KEY, JSON.stringify(updated));
  return updated;
};

// Add a new comment to a reel
export const addComment = (reelId, text) => {
  const user = getCurrentUser();
  const reels = getReels();
  const updated = reels.map((reel) => {
    if (reel.id === reelId) {
      const newComment = {
        id: 'c_' + Date.now(),
        user: user.username,
        avatar: user.avatar,
        text: text.trim(),
        timestamp: 'Just now'
      };
      const comments = [newComment, ...(reel.comments || [])];
      return { ...reel, comments, commentsCount: comments.length };
    }
    return reel;
  });
  localStorage.setItem(REELS_KEY, JSON.stringify(updated));
  return updated;
};

// Save uploaded new reel (pushes to feed)
export const saveNewReel = (reelData) => {
  const user = getCurrentUser();
  const reels = getReels();
  
  const newReel = {
    id: 'reel_' + Date.now(),
    videoUrl: reelData.videoUrl,
    thumbnail: reelData.thumbnail || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar
    },
    caption: reelData.caption || 'New reel created with Ramailo Reels! 🇳🇵',
    hashtags: reelData.hashtags || ['#Ramailo', '#Nepal'],
    song: reelData.song || `🎵 Original Sound - ${user.name}`,
    likesCount: 0,
    isLiked: false,
    commentsCount: 0,
    comments: [],
    sharesCount: 0,
    createdAt: new Date().toISOString()
  };

  const updatedReels = [newReel, ...reels];
  localStorage.setItem(REELS_KEY, JSON.stringify(updatedReels));
  return updatedReels;
};

// Get current user details
export const getCurrentUser = () => {
  try {
    const data = localStorage.getItem(USER_KEY);
    if (!data) {
      localStorage.setItem(USER_KEY, JSON.stringify(CURRENT_USER));
      return CURRENT_USER;
    }
    return JSON.parse(data);
  } catch (e) {
    return CURRENT_USER;
  }
};

// Update user profile details
export const updateUserProfile = (newDetails) => {
  const user = { ...getCurrentUser(), ...newDetails };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};
