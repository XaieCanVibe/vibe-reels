import React, { useState } from 'react';
import { signIn, signUp, signInAnonymously } from '../services/supabaseService';
import { Eye, EyeOff, User, Lock, Mail, Loader2, UserCheck, Sparkles } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (mode === 'login') {
      const { data, error } = await signIn(email, password);
      if (error) {
        if (error.message?.includes('Email not confirmed')) {
          setError('⚠️ Email not confirmed. Please check your inbox OR ask admin to disable "Confirm email" in Supabase settings!');
        } else {
          setError(error.message || 'Login failed. Check your email and password.');
        }
      } else {
        onAuthSuccess(data.user);
      }
    } else {
      if (!username.trim() || username.length < 3) {
        setError('Username must be at least 3 characters.');
        setLoading(false);
        return;
      }
      const { data, error } = await signUp(email, password, username.toLowerCase().replace(/\s/g, ''), name);
      if (error) {
        setError(error.message || 'Sign up failed.');
      } else {
        if (data.session) {
          // Direct login without confirmation required
          onAuthSuccess(data.user);
        } else {
          setMessage('🎉 Account created! You can now log in (if email confirmation is disabled in Supabase).');
          setMode('login');
        }
      }
    }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    const { user } = await signInAnonymously();
    onAuthSuccess(user);
    setGuestLoading(false);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, #09090b 0%, #1a0a0f 50%, #09090b 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '48px', marginBottom: '6px' }}>🇳🇵</div>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '32px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #e11d48, #fb923c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '4px'
        }}>
          Vibe Reels
        </div>
        <div style={{ color: '#64748b', fontSize: '14px' }}>Short videos by Nepalis, for Nepalis</div>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '24px',
        backdropFilter: 'blur(16px)'
      }}>
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', padding: '4px', marginBottom: '20px' }}>
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setMessage(''); }}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: mode === m ? '#e11d48' : 'transparent',
                color: '#fff',
                fontWeight: '700',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s'
              }}
            >
              {m === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <>
              <InputField
                icon={<User size={16} />}
                placeholder="Your full name (e.g. Aarav Sharma)"
                value={name}
                onChange={setName}
              />
              <InputField
                icon={<span style={{ fontSize: '13px' }}>@</span>}
                placeholder="Username (e.g. aarav_ktm)"
                value={username}
                onChange={setUsername}
              />
            </>
          )}

          <InputField
            icon={<Mail size={16} />}
            placeholder="Email address"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <InputField
            icon={<Lock size={16} />}
            placeholder="Password (min 6 characters)"
            type={showPass ? 'text' : 'password'}
            value={password}
            onChange={setPassword}
            rightIcon={
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {error && (
            <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid rgba(225, 29, 72, 0.4)', borderRadius: '10px', padding: '10px 14px', color: '#fda4af', fontSize: '13px', lineHeight: 1.4 }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', padding: '10px 14px', color: '#6ee7b7', fontSize: '13px', lineHeight: 1.4 }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'rgba(225,29,72,0.5)' : 'linear-gradient(135deg, #e11d48, #be123c)',
              color: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(225, 29, 72, 0.35)',
              marginTop: '4px'
            }}
          >
            {loading
              ? <><Loader2 size={18} className="spin" /> Processing...</>
              : mode === 'login' ? '🚀 Log In' : '🎉 Create Account'
            }
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0', color: '#475569', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Guest Mode Button */}
        <button
          onClick={handleGuestLogin}
          disabled={guestLoading}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#38bdf8',
            padding: '12px',
            borderRadius: '12px',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            cursor: guestLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {guestLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
          Continue as Guest (गेस्ट एकाउन्ट)
        </button>
      </div>

      <div style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '20px', lineHeight: 1.5 }}>
        100% Free & Made in Nepal 🇳🇵<br />
        Test with friends — Guest mode needs no email
      </div>
    </div>
  );
};

const InputField = ({ icon, placeholder, type = 'text', value, onChange, rightIcon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    padding: '12px 14px'
  }}>
    <span style={{ color: '#64748b', flexShrink: 0 }}>{icon}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      style={{
        flex: 1,
        background: 'none',
        border: 'none',
        color: '#f8fafc',
        fontSize: '14px',
        outline: 'none'
      }}
    />
    {rightIcon}
  </div>
);
