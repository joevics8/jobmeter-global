"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Bell, LogOut, ChevronRight, Mail, Shield, HelpCircle, LogIn, Info, Trash2, RefreshCw, CheckCircle, AlertTriangle, Briefcase, Send, LayoutDashboard, ExternalLink } from 'lucide-react';
import { theme } from '@/lib/theme';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';

interface ProfileData {
  full_name: string | null;
  email: string;
}

type BustStatus = 'idle' | 'loading' | 'success' | 'error';


const CLIENT_CACHE_KEYS = [
  'latest_jobs_cache',
  'latest_jobs_cache_ts',
  'latest_jobs_cache_version',
  'jobs_cache',
  'jobs_cache_timestamp',
  'jobs_cache_user_id',
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Admin panel state
  const [isAdmin, setIsAdmin] = useState(false);
  const [bustStatus, setBustStatus] = useState<BustStatus>('idle');
  const [bustMessage, setBustMessage] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [showSecretInput, setShowSecretInput] = useState(false);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Force a full page reload so all state — profile, apply stage, etc — is fresh
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfileData();
      loadSettings();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error || !authUser) { setLoading(false); return; }
      setUser(authUser);
      setLoading(false);
    } catch (error) {
      console.error('Error in checkAuth:', error);
      setLoading(false);
    }
  };

  const loadProfileData = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') { console.error('Error loading profile:', error); return; }
      setProfileData({ full_name: data?.full_name || null, email: data?.email || user.email || '' });
      setIsAdmin(data?.role === 'admin');
    } catch (error) { console.error('Error loading profile:', error); }
  };


  const loadSettings = () => {
    if (typeof window === 'undefined' || !user) return;
    try {
      const notifications = localStorage.getItem(`notificationsEnabled:${user.id}`);
      const emailPrefs = localStorage.getItem('emailUpdatesEnabled');
      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
      if (emailPrefs !== null) setEmailUpdates(JSON.parse(emailPrefs));
    } catch (error) { console.error('Error loading settings:', error); }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      setNotificationsEnabled(enabled);
      localStorage.setItem(`notificationsEnabled:${user?.id || 'anonymous'}`, JSON.stringify(enabled));
    } catch (error) { console.error('Error saving notification setting:', error); }
  };

  const handleEmailToggle = async (enabled: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      setEmailUpdates(enabled);
      localStorage.setItem('emailUpdatesEnabled', JSON.stringify(enabled));
    } catch (error) { console.error('Error saving email setting:', error); }
  };

  const handleSignOut = async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null); setProfileData(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profileData) return;
    try {
      const { error } = await supabase.from('profiles').upsert(
        { id: user.id, full_name: profileData.full_name, email: profileData.email, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );
      if (error) throw error;
      if (profileData.email !== user.email) {
        const { error: updateError } = await supabase.auth.updateUser({ email: profileData.email });
        if (updateError) console.error('Error updating auth email:', updateError);
      }
      setShowProfileEdit(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAdminCacheBust = async () => {
    if (!adminSecret.trim()) { setBustMessage('Please enter the admin secret.'); return; }
    setBustStatus('loading');
    setBustMessage('');
    try {
      const res = await fetch(`/api/jobs?action=bust_cache&admin_secret=${encodeURIComponent(adminSecret.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setBustStatus('error');
        setBustMessage(data.error || 'Failed to clear Redis cache. Check your secret.');
        return;
      }
      CLIENT_CACHE_KEYS.forEach(key => {
        try { localStorage.removeItem(key); } catch { }
        try { sessionStorage.removeItem(key); } catch { }
      });
      if (data.version) {
        try { localStorage.setItem('jobs_cache_bust_version', data.version); } catch { }
      }
      setBustStatus('success');
      setBustMessage(`Redis cleared ✓ · New version: ${data.version || 'n/a'} · All users will get fresh data on next load.`);
      setAdminSecret('');
      setShowSecretInput(false);
    } catch (err) {
      console.error('Cache bust error:', err);
      setBustStatus('error');
      setBustMessage('Network error — could not reach the cache API.');
    }
  };

  const handleClearMyCache = () => {
    CLIENT_CACHE_KEYS.forEach(key => {
      try { localStorage.removeItem(key); } catch { }
      try { sessionStorage.removeItem(key); } catch { }
    });
    alert('Your local job cache has been cleared. Reload the jobs page to fetch fresh data.');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background.muted }}>
        <p style={{ color: theme.colors.text.secondary }}>Loading...</p>
      </div>
    );
  }

  // ── Apply for Me links — always show all 3 to logged-in users ─────────────
  // Each page guards itself: submit requires payment, dashboard requires submission
  const applyLinks = [
    {
      href: '/apply-for-me',
      icon: <Briefcase size={18} style={{ color: theme.colors.accent.gold }} />,
      label: 'Apply for Me',
      desc: 'Learn about the service and get started',
    },
    {
      href: '/apply-for-me/submit',
      icon: <Send size={18} style={{ color: theme.colors.accent.gold }} />,
      label: 'Submit Your Details',
      desc: 'Provide your Gmail and WhatsApp to activate',
    },
    {
      href: '/apply-for-me/dashboard',
      icon: <LayoutDashboard size={18} style={{ color: theme.colors.accent.gold }} />,
      label: 'My Dashboard',
      desc: 'Track jobs applied on your behalf',
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div className="pt-12 pb-8 px-6" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
        <Link href="/jobs" className="text-sm text-white/80 hover:text-white transition-colors self-start">← Back to Jobs</Link>
        <h1 className="text-xl font-bold mb-2 text-white">Settings</h1>
        <p className="text-sm text-white/80">Manage your account and preferences</p>
      </div>

      <div className="px-6 pt-5 pb-32 max-w-4xl mx-auto">

        {/* Profile card */}
        {user ? (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-15 h-15 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: '60px', height: '60px', backgroundColor: theme.colors.primary.DEFAULT }}>
                <span className="text-lg font-bold text-white">{getInitials(profileData?.full_name || null)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold mb-1 text-gray-900">{profileData?.full_name || 'Profile'}</h3>
                {profileData?.email && <p className="text-sm text-gray-600 truncate">{profileData.email}</p>}
              </div>
            </div>
            <button onClick={() => setShowProfileEdit(!showProfileEdit)}
              className="px-4 py-2 rounded-lg border text-sm font-semibold transition-colors"
              style={{ backgroundColor: theme.colors.primary.light + '20', borderColor: theme.colors.primary.DEFAULT, color: theme.colors.primary.DEFAULT }}>
              {showProfileEdit ? 'Cancel' : 'Edit'}
            </button>
          </div>
        ) : (
          <div className="mb-6 border-b" style={{ backgroundColor: theme.colors.primary.DEFAULT + '10', borderColor: theme.colors.border.DEFAULT }}>
            <div className="flex items-center justify-between gap-4 p-4">
              <span className="text-sm font-medium flex-1" style={{ color: theme.colors.primary.DEFAULT }}>Sign up to access your settings and personalized features.</span>
              <Button onClick={() => setAuthModalOpen(true)} size="sm" style={{ backgroundColor: theme.colors.primary.DEFAULT }} className="flex-shrink-0">
                <LogIn size={16} className="mr-2" />Sign Up
              </Button>
            </div>
          </div>
        )}

        {/* Profile edit form */}
        {user && showProfileEdit && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Edit Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={profileData?.full_name || ''}
                  onChange={(e) => { if (profileData) setProfileData({ ...profileData, full_name: e.target.value }); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={profileData?.email || ''}
                  onChange={(e) => { if (profileData) setProfileData({ ...profileData, email: e.target.value }); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" />
              </div>
              <button onClick={handleSaveProfile} className="w-full px-4 py-3 rounded-lg font-semibold text-sm text-white" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Admin Cache Control */}
        {isAdmin && (
          <div className="mb-6">
            <h2 className="text-base font-semibold mb-2 px-1 flex items-center gap-2" style={{ color: '#DC2626' }}>
              <Shield size={16} />
              Admin Cache Control
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
              <div className="p-5 border-b border-red-100">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5">Force Clear Redis Cache</h3>
                    <p className="text-xs text-gray-500">
                      Deletes the Redis primary + stale cache and bumps the global version number.
                      All users will get fresh data from Supabase on their next page load.
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                    REDIS
                  </span>
                </div>
                {!showSecretInput ? (
                  <button
                    onClick={() => { setShowSecretInput(true); setBustStatus('idle'); setBustMessage(''); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all text-white"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    <Trash2 size={14} />
                    Clear Redis Cache
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Admin Secret (set in ADMIN_CACHE_SECRET env var)</label>
                      <input
                        type="password"
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAdminCacheBust(); }}
                        placeholder="Enter admin secret..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAdminCacheBust}
                        disabled={bustStatus === 'loading'}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all disabled:opacity-60"
                        style={{ backgroundColor: '#DC2626' }}
                      >
                        {bustStatus === 'loading' ? <><RefreshCw size={14} className="animate-spin" />Clearing...</> : <><Trash2 size={14} />Confirm Clear</>}
                      </button>
                      <button
                        onClick={() => { setShowSecretInput(false); setAdminSecret(''); setBustStatus('idle'); setBustMessage(''); }}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                    {bustMessage && (
                      <div className={`flex items-start gap-2 p-3 rounded-lg text-xs font-medium ${bustStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {bustStatus === 'success' ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />}
                        {bustMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-0.5">Clear My Local Cache</h3>
                    <p className="text-xs text-gray-500">
                      Clears only this browser's localStorage/sessionStorage job cache.
                      Does not affect Redis or other users.
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                    LOCAL
                  </span>
                </div>
                <button
                  onClick={handleClearMyCache}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all border"
                  style={{ borderColor: '#EA580C', color: '#EA580C', backgroundColor: '#FFF7ED' }}
                >
                  <RefreshCw size={14} />
                  Clear Local Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Apply for Me — only shown to logged-in users ── */}
        {user && (
          <div className="mb-6">
            <h2 className="text-base font-semibold mb-2 px-1 text-gray-700">Services</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {applyLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${i < applyLinks.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: theme.colors.accent.gold + '15' }}>
                      {link.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{link.label}</h3>
                      <p className="text-xs text-gray-500">{link.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-2 px-1 text-gray-700">Notifications</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.colors.accent.blue + '15' }}>
                  <Bell size={20} style={{ color: theme.colors.accent.blue }} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                  <p className="text-xs text-gray-600">Get notified about new job matches</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={notificationsEnabled} onChange={(e) => handleNotificationToggle(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.colors.accent.gold + '15' }}>
                  <Mail size={20} style={{ color: theme.colors.accent.gold }} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-gray-900">Email Updates</h3>
                  <p className="text-xs text-gray-600">Receive weekly job digest via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={emailUpdates} onChange={(e) => handleEmailToggle(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-2 px-1 text-gray-700">Support</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {[
              { href: '/about', icon: <Info size={20} style={{ color: theme.colors.primary.DEFAULT }} />, bg: theme.colors.primary.DEFAULT + '15', label: 'About Us', desc: 'Learn more about JobMeter' },
              { href: '/privacy-policy', icon: <Shield size={20} style={{ color: theme.colors.text.secondary }} />, bg: theme.colors.text.secondary + '15', label: 'Privacy Policy', desc: 'Learn how we protect your data' },
              { href: '/contact', icon: <Mail size={20} style={{ color: theme.colors.success }} />, bg: theme.colors.success + '15', label: 'Contact Us', desc: 'Get help and support' },
              { href: '/terms-of-service', icon: <HelpCircle size={20} style={{ color: theme.colors.text.secondary }} />, bg: theme.colors.text.secondary + '15', label: 'Terms of Service', desc: 'Read our terms and conditions' },
              { href: '/disclaimer', icon: <HelpCircle size={20} style={{ color: theme.colors.accent.gold }} />, bg: theme.colors.accent.gold + '15', label: 'Disclaimer', desc: 'Important legal disclaimers' },
            ].map((item, i, arr) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.bg }}>{item.icon}</div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{item.label}</h3>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </Link>
            ))}
          </div>
        </div>

        {/* Account */}
        {user && (
          <div className="mb-6">
            <h2 className="text-base font-semibold mb-2 px-1 text-gray-700">Account</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button onClick={handleSignOut} className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut size={20} style={{ color: theme.colors.error }} />
                  <div className="text-left">
                    <h3 className="font-semibold" style={{ color: theme.colors.error }}>Sign Out</h3>
                    <p className="text-xs text-gray-600">Sign out of your account</p>
                  </div>
                </div>
                <ChevronRight size={20} style={{ color: theme.colors.error }} />
              </button>
            </div>
          </div>
        )}

        {/* App info */}
        <div className="text-center py-8">
          <p className="text-xs text-gray-500 font-medium mb-1">JobPilot v1.0.0</p>
          <p className="text-xs text-gray-400">Your smart career companion</p>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}