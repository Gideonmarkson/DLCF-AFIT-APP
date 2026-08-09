'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Pin, Send, ThumbsUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

const UNIT_OPTIONS = [
  { value: 'NONE', label: 'General / All Units' },
  { value: 'CHOIR', label: 'Choir' },
  { value: 'PRAYER', label: 'Prayer' },
  { value: 'USHERING', label: 'Ushering' },
  { value: 'ACADEMICS', label: 'Academics' },
  { value: 'PUBLICITY', label: 'Publicity' },
  { value: 'EVANGELISM', label: 'Evangelism' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'SANCTUARY', label: 'Sanctuary' },
];

const TOP_LEADERSHIP_OFFICES = ['General Coordinator', 'Assistant General Coordinator', 'Secretarial Coordinator'];

interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content: string;
  target_unit: string;
  is_announcement: boolean;
  is_pinned: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function FellowshipNoticeFeed() {
  const { userRole, profile } = useRole();
  const canPostAnnouncement = userRole === 'STUDENT_EXECUTIVE' || userRole === 'ASSOCIATE_COORDINATOR';
  const canPin = TOP_LEADERSHIP_OFFICES.includes(profile.executiveOffice ?? '');

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [targetUnit, setTargetUnit] = useState('NONE');
  const [postAsAnnouncement, setPostAsAnnouncement] = useState(canPostAnnouncement);
  const [error, setError] = useState('');

  const loadFeed = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);

    const { data: postRows } = await supabase
      .from('forum_posts')
      .select('id, author_id, title, content, target_unit, is_announcement, is_pinned, created_at')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    const rows = postRows ?? [];
    setPosts(rows);

    const authorIds = [...new Set(rows.map((p) => p.author_id))];
    if (authorIds.length > 0) {
      const { data: authorRows } = await supabase.from('profiles').select('id, full_name').in('id', authorIds);
      const nameMap: Record<string, string> = {};
      (authorRows ?? []).forEach((a) => { nameMap[a.id] = a.full_name ?? 'Unnamed'; });
      setAuthorNames(nameMap);
    }

    const postIds = rows.map((p) => p.id);
    if (postIds.length > 0) {
      const { data: likeRows } = await supabase.from('forum_post_likes').select('post_id, user_id').in('post_id', postIds);
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      (likeRows ?? []).forEach((l) => {
        counts[l.post_id] = (counts[l.post_id] ?? 0) + 1;
        if (user && l.user_id === user.id) mine.add(l.post_id);
      });
      setLikeCounts(counts);
      setMyLikes(mine);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newTitle || !newContent) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Your session expired — please sign in again.');
      return;
    }

    const { error: insertError } = await supabase.from('forum_posts').insert({
      author_id: user.id,
      title: newTitle,
      content: newContent,
      target_unit: targetUnit,
      is_announcement: canPostAnnouncement && postAsAnnouncement,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNewTitle('');
    setNewContent('');
    loadFeed();
  };

  const toggleLike = async (postId: string) => {
    if (!userId) return;
    const supabase = createClient();
    if (myLikes.has(postId)) {
      await supabase.from('forum_post_likes').delete().eq('post_id', postId).eq('user_id', userId);
      setMyLikes((prev) => { const s = new Set(prev); s.delete(postId); return s; });
      setLikeCounts((prev) => ({ ...prev, [postId]: Math.max(0, (prev[postId] ?? 1) - 1) }));
    } else {
      await supabase.from('forum_post_likes').insert({ post_id: postId, user_id: userId });
      setMyLikes((prev) => new Set(prev).add(postId));
      setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
    }
  };

  const togglePin = async (post: ForumPost) => {
    const supabase = createClient();
    const { error: pinError } = await supabase.from('forum_posts').update({ is_pinned: !post.is_pinned }).eq('id', post.id);
    if (!pinError) loadFeed();
  };

  return (
    <Card className="border-[#E2E8F0] bg-white shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1D4ED8]" />
            Unit Notices &amp; Departmental Forums
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Anyone can start a discussion. Official Unit Notices are posted by Excos and Associate Coordinators only.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#E2E8F0] space-y-3">
          <div className="text-xs font-extrabold text-[#1F2937]">
            {canPostAnnouncement ? 'Post a Notice or Discussion' : 'Start a Discussion'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <Input
                placeholder="Title (e.g. Choir Rehearsal Update)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs"
                required
              />
            </div>
            <div>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#1F2937] px-3 font-semibold focus:border-[#1D4ED8]"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>Unit: {u.label}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="Write your announcement or discussion detail..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            required
          />
          {canPostAnnouncement && (
            <label className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <input type="checkbox" checked={postAsAnnouncement} onChange={(e) => setPostAsAnnouncement(e.target.checked)} />
              Post as an official Unit Notice (pinned styling, marked official)
            </label>
          )}
          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="primary" className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Publish
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-[#6B7280]">Loading posts...</p>
          ) : posts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#6B7280] font-medium">
              No posts yet — be the first to start a discussion.
            </div>
          ) : (
            posts.map((post) => {
              const authorName = authorNames[post.author_id] ?? 'Unnamed';
              const liked = myLikes.has(post.id);
              return (
                <div key={post.id} className="p-4 rounded-2xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-xs">
                        {authorName[0]}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#1F2937]">{authorName}</div>
                        <div className="text-[10px] text-[#6B7280]">{timeAgo(post.created_at)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {post.is_pinned && (
                        <Badge variant="gold" className="gap-1 text-[10px]">
                          <Pin className="w-3 h-3" /> Pinned
                        </Badge>
                      )}
                      {post.is_announcement && <Badge variant="blue" className="text-[10px]">Official Notice</Badge>}
                      <Badge variant="slate" className="text-[10px]">{post.target_unit}</Badge>
                    </div>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#1F2937]">{post.title}</h4>
                  <p className="text-xs text-[#4B5563] leading-relaxed font-medium">{post.content}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1.5 font-bold transition-colors ${liked ? 'text-[#1D4ED8]' : 'text-[#6B7280] hover:text-[#1D4ED8]'}`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> {likeCounts[post.id] ?? 0} Blessed
                    </button>
                    {canPin && (
                      <button
                        onClick={() => togglePin(post)}
                        className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-amber-600 font-semibold"
                      >
                        <Pin className="w-3.5 h-3.5" /> {post.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
