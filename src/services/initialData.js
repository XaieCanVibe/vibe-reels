// Curated initial reels with Nepali themes, landscapes, and culture
export const INITIAL_REELS = [
  {
    id: 'reel-1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-mountain-landscape-with-snowy-peaks-41584-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop',
    user: {
      id: 'usr-1',
      username: '@himalayan_vibes',
      name: 'Aarav Sharma 🇳🇵',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop'
    },
    caption: 'Breathtaking sunrise over the Himalayas! Nothing beats mornings in Nepal 🏔️✨',
    hashtags: ['#Nepal', '#Himalayas', '#Annapurna', '#Ramailo'],
    song: '🎵 Original Sound - Aarav Sharma (Himalayan Flute)',
    likesCount: 1420,
    isLiked: false,
    commentsCount: 89,
    comments: [
      { id: 'c1', user: '@smarika_ktm', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', text: 'Jai Nepal! Stunning views brother! ❤️', timestamp: '2h ago' },
      { id: 'c2', user: '@bipin_pokhara', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'Where exact location is this? Poonhill?', timestamp: '1h ago' }
    ],
    sharesCount: 340,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'reel-2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-foggy-green-valley-41581-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop',
    user: {
      id: 'usr-2',
      username: '@kathmandu_diaries',
      name: 'Pooja Thapa',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop'
    },
    caption: 'Foggy morning in Pokhara valley! Tea time with lake view ☕🌿',
    hashtags: ['#Pokhara', '#FewaLake', '#NepaliVibes'],
    song: '🎵 Resham Firiri - Modern Acoustic Mix',
    likesCount: 2890,
    isLiked: true,
    commentsCount: 154,
    comments: [
      { id: 'c3', user: '@nischal_grg', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', text: 'Pokhara is always super peaceful 🙏', timestamp: '3h ago' }
    ],
    sharesCount: 512,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'reel-3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-preparing-food-in-a-kitchen-41578-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop',
    user: {
      id: 'usr-3',
      username: '@momo_lover_ktm',
      name: 'Rohan Shrestha',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop'
    },
    caption: 'Making fresh steamed Buff Momos with spicy Achar! Who wants some? 🥟🌶️',
    hashtags: ['#MomoNepal', '#FoodieKTM', '#NepaliFood'],
    song: '🎵 Original Sound - Momo Lover KTM',
    likesCount: 4120,
    isLiked: false,
    commentsCount: 310,
    comments: [
      { id: 'c4', user: '@anusha_kc', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100', text: 'Mouthwatering!! Achar recipe please! 🤤', timestamp: '30m ago' }
    ],
    sharesCount: 890,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export const CURRENT_USER = {
  id: 'my-user-id',
  username: '@nepal_creator',
  name: 'Me & Friends 🇳🇵',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
  bio: 'Testing our custom Nepali TikTok clone! 🚀 Creating content with friends.',
  followers: 42,
  following: 18,
  likesCount: 1560
};
