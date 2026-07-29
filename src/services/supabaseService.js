import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const signUp = async (email, password, username, name) => {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
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
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
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
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return error ? null : data;
};

export const updateProfile = async (userId, updates) => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const uploadAvatar = async (userId, file) => {
  if (!isSupabaseConfigured) return null;
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
  if (error) return { error };
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
  return { url: publicUrl, error: null };
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
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };

  // Upload video to storage
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('reels')
    .upload(fileName, file);

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(fileName);

  // Insert reel record in DB
  const { data, error } = await supabase
    .from('reels')
    .insert({
      user_id: userId,
      video_url: publicUrl,
      caption: metadata.caption || '',
      hashtags: metadata.hashtags || [],
      song: metadata.song || '🎵 Original Sound'
    })
    .select(`*, profiles(id, username, name, avatar_url)`)
    .single();

  return { data, error };
};

export const deleteReel = async (reelId) => {
  if (!isSupabaseConfigured) return;
  await supabase.from('reels').delete().eq('id', reelId);
};

// ─── LIKES ───────────────────────────────────────────────────────────────────

export const getLikedReelIds = async (userId) => {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('likes')
    .select('reel_id')
    .eq('user_id', userId);
  return error ? [] : data.map((l) => l.reel_id);
};

export const likeReel = async (userId, reelId) => {
  if (!isSupabaseConfigured) return;
  await supabase.from('likes').insert({ user_id: userId, reel_id: reelId });
  await supabase.rpc('increment', { table: 'reels', id: reelId, column: 'likes_count' });
};

export const unlikeReel = async (userId, reelId) => {
  if (!isSupabaseConfigured) return;
  await supabase.from('likes').delete().match({ user_id: userId, reel_id: reelId });
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
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };
  const { data, error } = await supabase
    .from('comments')
    .insert({ user_id: userId, reel_id: reelId, text })
    .select(`*, profiles(username, avatar_url)`)
    .single();
  return { data, error };
};
