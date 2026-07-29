import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const signUp = async (email, password, username, name) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, name }
    }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInAnonymously = async () => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  // Supabase anonymous sign in or local guest profile
  const guestUser = {
    id: 'guest-' + Math.random().toString(36).substr(2, 9),
    email: 'guest@vibereels.nepal',
    user_metadata: {
      username: 'guest_' + Math.floor(1000 + Math.random() * 9000),
      name: 'Nepali Guest 🇳🇵'
    },
    isGuest: true
  };
  return { user: guestUser, error: null };
};

export const signOut = async () => {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session;
};

export const onAuthStateChange = (callback) => {
  if (!isSupabaseConfigured) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

// ─── PROFILES ────────────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  if (!isSupabaseConfigured || userId?.startsWith('guest-')) {
    return {
      id: userId || 'guest',
      username: 'guest_' + Math.floor(1000 + Math.random() * 9000),
      name: 'Nepali Guest 🇳🇵',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest`,
      followers_count: 0,
      following_count: 0,
      likes_count: 0
    };
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return error ? null : data;
};

export const updateProfile = async (userId, updates) => {
  if (!isSupabaseConfigured || userId?.startsWith('guest-')) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// ─── REELS ───────────────────────────────────────────────────────────────────

export const getFeedReels = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('reels')
    .select(`
      *,
      profiles(id, username, name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(30);
  return error ? [] : data;
};

export const getUserReels = async (userId) => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('reels')
    .select(`
      *,
      profiles(id, username, name, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return error ? [] : data;
};

export const uploadReel = async (userId, file, metadata) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };

  // Upload video to storage
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('reels')
    .upload(fileName, file);

  if (uploadError) return { error: uploadError };

  const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(fileName);

  // Insert reel record in DB
  const { data, error } = await supabase
    .from('reels')
    .insert({
      user_id: userId.startsWith('guest-') ? '00000000-0000-0000-0000-000000000000' : userId,
      video_url: publicUrl,
      caption: metadata.caption || '',
      hashtags: metadata.hashtags || [],
      song: metadata.song || '🎵 Original Sound'
    })
    .select(`*, profiles(id, username, name, avatar_url)`)
    .single();

  return { data, error };
};

// ─── LIKES & COMMENTS ────────────────────────────────────────────────────────

export const getLikedReelIds = async (userId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return [];
  const { data, error } = await supabase
    .from('likes')
    .select('reel_id')
    .eq('user_id', userId);
  return error ? [] : data.map((l) => l.reel_id);
};

export const likeReel = async (userId, reelId) => {
  if (!isSupabaseConfigured || userId?.startsWith('guest-')) return;
  await supabase.from('likes').insert({ user_id: userId, reel_id: reelId });
};

export const unlikeReel = async (userId, reelId) => {
  if (!isSupabaseConfigured || userId?.startsWith('guest-')) return;
  await supabase.from('likes').delete().match({ user_id: userId, reel_id: reelId });
};

export const getComments = async (reelId) => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('comments')
    .select(`*, profiles(username, avatar_url)`)
    .eq('reel_id', reelId)
    .order('created_at', { ascending: false });
  return error ? [] : data;
};

export const addComment = async (userId, reelId, text) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  if (userId?.startsWith('guest-')) {
    return {
      data: {
        id: 'guest-comment-' + Date.now(),
        text,
        created_at: new Date().toISOString(),
        profiles: { username: 'guest', avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=guest` }
      },
      error: null
    };
  }
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, reel_id: reelId, text })
    .select(`*, profiles(username, avatar_url)`)
    .single();
  return { data, error };
};
