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

export const deleteAccount = async (userId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return { error: null };
  // Deletes profile from database, triggering cascading deletes for all reels, likes, comments, follows
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  return { error };
};

// Upload profile picture (Max 5MB)
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
    .select(`*, profiles(id, username, name, avatar_url, bio, is_verified, followers_count, following_count)`)
    .order('created_at', { ascending: false })
    .limit(50);
  return error ? [] : data;
};

export const getUserReels = async (userId) => {
  if (!isSupabaseConfigured || !userId) return [];
  const { data, error } = await supabase
    .from('reels')
    .select(`*, profiles(id, username, name, avatar_url, bio, is_verified, followers_count, following_count)`)
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
    .select(`*, profiles(id, username, name, avatar_url, bio, is_verified, followers_count, following_count)`)
    .single();
  return { data, error };
};

export const deleteReel = async (userId, reelId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) {
    return { error: { message: 'Guests cannot delete reels' } };
  }
  const { error } = await supabase
    .from('reels')
    .delete()
    .eq('id', reelId)
    .eq('user_id', userId);
  return { error };
};

// Increment unique view count — called whenever a reel becomes active
export const incrementViews = async (reelId, viewerId = 'anonymous') => {
  if (!isSupabaseConfigured || !reelId) return;
  try {
    await supabase.rpc('increment_views', { reel_id: reelId, viewer_id: viewerId });
  } catch (_) {
    // Silently fail if views fails
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

export const likeReel = async (userId, reelId, reelOwnerId = null) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return;
  const { error } = await supabase.from('likes').insert({ user_id: userId, reel_id: reelId });
  if (!error) {
    await supabase.rpc('increment_likes', { reel_id: reelId });
    if (reelOwnerId && reelOwnerId !== userId) {
      await createNotification(reelOwnerId, userId, 'like', reelId);
    }
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
    .select(`*, profiles(username, avatar_url, name)`)
    .eq('reel_id', reelId)
    .order('created_at', { ascending: false });
  return error ? [] : data;
};

export const addComment = async (userId, reelId, text, reelOwnerId = null, parentId = null) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) {
    return { error: { message: 'Guests cannot comment. Please log in!' } };
  }
  const insertObj = { user_id: userId, reel_id: reelId, text };
  if (parentId) insertObj.parent_id = parentId;
  const { data, error } = await supabase
    .from('comments')
    .insert(insertObj)
    .select(`*, profiles(username, avatar_url, name)`)
    .single();
  if (!error) {
    if (!parentId) await supabase.rpc('increment_comments', { reel_id: reelId });
    if (reelOwnerId && reelOwnerId !== userId) {
      await createNotification(reelOwnerId, userId, 'comment', reelId);
    }
  }
  return { data, error };
};

// ─── FOLLOWS ─────────────────────────────────────────────────────────────────

export const followUser = async (followerId, followingId) => {
  if (!isSupabaseConfigured || !followerId || followerId.startsWith('guest-')) return false;
  if (followerId === followingId) return false;
  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (!error) {
    await supabase.rpc('increment_followers', { target_user_id: followingId });
    await supabase.rpc('increment_following', { target_user_id: followerId });
    await createNotification(followingId, followerId, 'follow', null);
    return true;
  }
  return false;
};

export const unfollowUser = async (followerId, followingId) => {
  if (!isSupabaseConfigured || !followerId || followerId.startsWith('guest-')) return false;
  const { error } = await supabase.from('follows').delete().match({ follower_id: followerId, following_id: followingId });
  if (!error) {
    await supabase.rpc('decrement_followers', { target_user_id: followingId });
    await supabase.rpc('decrement_following', { target_user_id: followerId });
    return true;
  }
  return false;
};

export const getFollowingIds = async (followerId) => {
  if (!isSupabaseConfigured || !followerId || followerId.startsWith('guest-')) return [];
  const { data, error } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', followerId);
  return error ? [] : data.map((f) => f.following_id);
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

export const createNotification = async (userId, actorId, type, reelId = null) => {
  if (!isSupabaseConfigured || !userId || !actorId || userId === actorId || actorId.startsWith('guest-')) return;
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      actor_id: actorId,
      type,
      reel_id: reelId
    });
  } catch (_) {}
};

export const getNotifications = async (userId) => {
  if (!isSupabaseConfigured || !userId || userId.startsWith('guest-')) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select(`*, actor:profiles!actor_id(username, name, avatar_url), reel:reels(video_url)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  return error ? [] : data;
};
