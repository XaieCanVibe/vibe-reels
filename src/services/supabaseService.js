import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const signUp = async (email, password, username, name) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, name } }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
};

export const onAuthStateChange = (callback) => {
  if (!isSupabaseConfigured) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
};

// ─── PROFILES ────────────────────────────────────────────────────────────────

export const getProfile = async (userId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return error ? null : data;
};

export const updateProfile = async (userId, updates) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return { data: null, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Upload profile picture (Max 5MB enforced on client side too)
export const uploadAvatar = async (userId, file) => {
  if (!isSupabaseConfigured || !userId) return { url: null, error: { message: 'Not configured' } };
  const ext = file.name.split('.').pop();
  const fileName = `avatars/${userId}_${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true });
  if (uploadError) return { url: null, error: uploadError };
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
  return { url: publicUrl, error: null };
};

// ─── REELS ───────────────────────────────────────────────────────────────────

export const getFeedReels = async () => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('reels')
    .select(`*, profiles(id, username, name, avatar_url, bio, is_verified)`)
    .order('created_at', { ascending: false })
    .limit(50);
  return error ? [] : data;
};

export const getUserReels = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('reels')
    .select(`*, profiles(id, username, name, avatar_url, bio, is_verified)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return error ? [] : data;
};

export const uploadReel = async (userId, file, metadata) => {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('reels').upload(fileName, file);
  if (uploadError) return { error: uploadError };
  const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(fileName);
  const { data, error } = await supabase
    .from('reels')
    .insert({
      user_id: userId,
      video_url: publicUrl,
      caption: metadata.caption || '',
      hashtags: metadata.hashtags || [],
      song: metadata.song || '🎵 Original Sound'
    })
    .select(`*, profiles(id, username, name, avatar_url, bio, is_verified)`)
    .single();
  return { data, error };
};

// Increment view count — called whenever a reel becomes active (works for guests too)
export const incrementViews = async (reelId) => {
  if (!isSupabaseConfigured || !reelId) return;
  try {
    await supabase.rpc('increment_views', { reel_id: reelId });
  } catch (_) {
    // Silently fail — views are non-critical
  }
};

// ─── LIKES ───────────────────────────────────────────────────────────────────

export const getLikedReelIds = async (userId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return [];
  const { data, error } = await supabase
    .from('likes')
    .select('reel_id')
    .eq('user_id', userId);
  return error ? [] : data.map((l) => l.reel_id);
};

export const likeReel = async (userId, reelId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return;
  const { error } = await supabase.from('likes').insert({ user_id: userId, reel_id: reelId });
  if (!error) {
    // Increment likes_count on reel
    await supabase.rpc('increment_likes', { reel_id: reelId });
  }
};

export const unlikeReel = async (userId, reelId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return;
  await supabase.from('likes').delete().match({ user_id: userId, reel_id: reelId });
  await supabase.rpc('decrement_likes', { reel_id: reelId });
};

// ─── COMMENTS ────────────────────────────────────────────────────────────────

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
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) {
    return { error: { message: 'Guests cannot comment. Please log in!' } };
  }
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, reel_id: reelId, text })
    .select(`*, profiles(username, avatar_url)`)
    .single();
  if (!error) {
    await supabase.rpc('increment_comments', { reel_id: reelId });
  }
  return { data, error };
};
