'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, Search, ChevronDown, User, ShieldCheck, Award, Server, LogOut, Check, HeartHandshake, GraduationCap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { RolePerspective } from '@/context/RoleContext';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title?: string;
  userRole?: RolePerspective;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string | null;
  onRoleChange?: (role: RolePerspective) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  read_at: string | null;
  type: 'ACADEMIC' | 'COUNSELING' | 'SCHOLARSHIP' | 'GOVERNANCE' | 'FELLOWSHIP';
  link_url: string | null;
}

export function Header({
  title = 'Saintly Intellectuals Hub',
  userRole = 'GENERAL_STUDENT',
  userName = 'User',
  userEmail = '',
  userAvatarUrl = null,
}: HeaderProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const isStaff = userRole === 'ASSOCIATE_COORDINATOR';
  const isExco = userRole === 'STUDENT_EXECUTIVE';
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';

  const loadNotifications = useCallback(async () => {
    const supabase = createClient();
    setNotificationsLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, description, created_at, read_at, type, link_url')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      setNotificationsError('Notifications are not available yet.');
      setNotificationsLoading(false);
      return;
    }

    setNotifications((data ?? []) as NotificationItem[]);
    setNotificationsError(null);
    setNotificationsLoading(false);
  }, []);

  useEffect(() => {
    loadNotifications();
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((current) => [payload.new as NotificationItem, ...current].slice(0, 30));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadNotifications]);

  const hasUnread = notifications.some((n) => !n.read_at);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProfileSnippet = () => {
    const roleLabel = isAdmin ? 'System Administrator' : isStaff ? 'Associate Coordinator' : isExco ? 'Student Executive' : 'Student';
    const parts = userName.trim().split(/\s+/).filter(Boolean);
    const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (userName.slice(0, 2) || 'U').toUpperCase();
    return { initials, name: userName, email: userEmail, roleLabel };
  };

  const profile = getProfileSnippet();

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read_at).map((n) => n.id);
    if (unreadIds.length === 0) return;

    const supabase = createClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from('notifications').update({ read_at: now }).in('id', unreadIds);
    if (error) return;

    setNotifications((current) => current.map((n) => unreadIds.includes(n.id) ? { ...n, read_at: now } : n));
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.read_at) {
      const now = new Date().toISOString();
      const supabase = createClient();
      await supabase.from('notifications').update({ read_at: now }).eq('id', item.id);
      setNotifications((current) => current.map((n) => n.id === item.id ? { ...n, read_at: now } : n));
    }
    setIsNotificationsOpen(false);
    if (item.link_url) router.push(item.link_url);
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const iconForType = (type: NotificationItem['type']) => {
    if (type === 'ACADEMIC') return <GraduationCap className="w-3.5 h-3.5 text-[#1D4ED8]" />;
    if (type === 'COUNSELING') return <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />;
    if (type === 'SCHOLARSHIP') return <Award className="w-3.5 h-3.5 text-[#D97706]" />;
    if (type === 'GOVERNANCE') return <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />;
    return <Bell className="w-3.5 h-3.5 text-[#1D4ED8]" />;
  };

  const formatTimestamp = (value: string) => {
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 sm:h-20 items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-6 md:px-8 shadow-xs font-sans">
      <div className="flex items-center gap-2.5">
        <div className="lg:hidden relative w-9 h-9 rounded-full overflow-hidden bg-white p-0.5 border border-[#1E3A8A] shadow-2xs shrink-0">
          <Image src="/dlcf_afit_logo.png" alt="DLCF AFIT Official Logo" fill className="object-contain p-0.5" />
        </div>
        <div>
          <h1 className="text-base sm:text-2xl font-extrabold text-[#1F2937] tracking-tight line-clamp-1">{title}</h1>
          <p className="lg:hidden text-[9px] font-extrabold text-[#1D4ED8]">DLCF AFIT</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" className="p-2 sm:p-2.5 text-[#6B7280] hover:text-[#1D4ED8] rounded-full hover:bg-[#EFF6FF] transition-colors" aria-label="Search">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75px]" />
        </button>

        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((open) => !open)}
            aria-label="Notifications"
            className="relative p-2 sm:p-2.5 text-[#6B7280] hover:text-[#1D4ED8] rounded-full hover:bg-[#EFF6FF] transition-colors cursor-pointer active:scale-95"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75px]" />
            {hasUnread && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#1D4ED8] ring-2 ring-white animate-pulse" />}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl p-4 space-y-3 z-50 animate-fadeIn font-sans">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-[#1F2937]">Fellowship Notifications</h3>
                  {hasUnread && <Badge variant="blue" className="text-[10px]">Unread Alerts</Badge>}
                </div>
                {hasUnread && (
                  <button onClick={handleMarkAllRead} className="text-[11px] font-bold text-[#1D4ED8] hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {notificationsLoading ? (
                  <div className="p-6 text-center text-xs text-[#6B7280]">Loading notifications…</div>
                ) : notificationsError ? (
                  <div className="p-6 text-center text-xs text-[#6B7280]">{notificationsError}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#6B7280]">You’re all caught up. No notifications yet.</div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNotificationClick(item)}
                      className={cn(
                        'w-full text-left p-3 rounded-2xl border transition-all text-xs space-y-1',
                        !item.read_at ? 'bg-[#EFF6FF]/70 border-[#1D4ED8]/30' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-[#1F2937] flex items-center gap-1.5">
                          {iconForType(item.type)} {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280] shrink-0">{formatTimestamp(item.created_at)}</span>
                      </div>
                      <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">{item.description}</p>
                    </button>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-[#E2E8F0] text-center text-[10px] font-bold text-[#6B7280]">
                Notifications are generated from real fellowship activity.
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pl-2.5 rounded-full border border-[#E2E8F0] bg-white hover:border-[#1D4ED8] transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold text-[11px] sm:text-xs shadow-xs ring-2 ring-[#1D4ED8]/20 overflow-hidden">
              {userAvatarUrl ? <Image src={userAvatarUrl} alt={profile.name} fill className="object-cover" /> : profile.initials}
            </div>
            <div className="text-left hidden lg:block pr-1">
              <div className="text-xs font-extrabold text-[#1F2937] leading-tight">{profile.name}</div>
              <div className="text-[10px] text-[#6B7280] font-semibold leading-tight">{profile.roleLabel}</div>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-[#6B7280] transition-transform duration-200', isProfileOpen && 'rotate-180')} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E2E8F0] shadow-xl p-3 space-y-2 z-50 animate-fadeIn font-sans">
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#1D4ED8]/20 space-y-1">
                <div className="text-xs font-extrabold text-[#1F2937]">{profile.name}</div>
                <div className="text-[10px] text-[#1D4ED8] font-mono font-bold truncate">{profile.email}</div>
                <div className="text-[10px] text-[#6B7280] font-semibold">{profile.roleLabel}</div>
              </div>
              <div className="space-y-1 text-xs font-bold text-[#1F2937] pt-1">
                <Link href="/profile/setup" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[#4B5563] hover:text-[#1D4ED8]">
                  <User className="w-4 h-4 text-[#1D4ED8]" /> Profile Photo & Settings
                </Link>
                <Link href="/academic/results/upload" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[#4B5563] hover:text-[#1D4ED8]">
                  <GraduationCap className="w-4 h-4 text-[#1D4ED8]" /> Academic Results & CGPA
                </Link>
                {isAdmin && (
                  <Link href="/admin/system-management" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8FAFC] transition-colors text-[#4B5563] hover:text-[#1D4ED8]">
                    <Server className="w-4 h-4 text-[#1D4ED8]" /> System Control Center
                  </Link>
                )}
              </div>
              <div className="pt-2 border-t border-[#E2E8F0]">
                <button type="button" onClick={handleSignOut} className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-extrabold text-rose-600 hover:bg-rose-50 transition-colors">
                  <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Log Out</span>
                  <span className="text-[10px] font-mono">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#1E3A8A] shadow-sm hover:scale-105 transition-transform">
            <Image src="/dlcf_afit_logo.png" alt="DLCF AFIT Official Logo" fill className="object-contain p-0.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
