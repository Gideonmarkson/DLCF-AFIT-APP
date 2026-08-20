'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Pin, Send, ThumbsUp } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRole } from '@/context/RoleContext';
import { allOffices } from '@/lib/utils';
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

const TOP_LEADERSHIP_OFFICES = [
  'General Coordinator',
  'Assistant General Coordinator',
  'Secretarial Coordinator',
];

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

interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  comment: string;
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

  const canPostAnnouncement =
    userRole === 'STUDENT_EXECUTIVE' ||
    userRole === 'ASSOCIATE_COORDINATOR';

  const canPin = allOffices(profile.executiveOffice, profile.additionalOffices).some((office) =>
    TOP_LEADERSHIP_OFFICES.includes(office)
  );

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());

  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, ForumComment[]>
  >({});
  const [commentAuthorNames, setCommentAuthorNames] = useState<
    Record<string, string>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {}
  );
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [commentSubmitting, setCommentSubmitting] = useState<
    Record<string, boolean>
  >({});

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [targetUnit, setTargetUnit] = useState('NONE');
  const [postAsAnnouncement, setPostAsAnnouncement] =
    useState(canPostAnnouncement);
  const [error, setError] = useState('');

  const supabase = createClient();

  const loadComments = async (postIds: string[]) => {
    if (postIds.length === 0) return;

    const { data: rows, error: commentsError } = await supabase
      .from('forum_comments')
      .select('id, post_id, author_id, comment, created_at')
      .in('post_id', postIds)
      .order('created_at', { ascending: true });

    if (commentsError) {
      setError(commentsError.message);
      return;
    }

    const grouped: Record<string, ForumComment[]> = {};
    const authorIds = new Set<string>();

    (rows ?? []).forEach((comment) => {
      (grouped[comment.post_id] ??= []).push(comment);
      authorIds.add(comment.author_id);
    });

    setCommentsByPost(grouped);

    if (authorIds.size > 0) {
      const { data: authors, error: authorsError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', [...authorIds]);

      if (authorsError) {
        setError(authorsError.message);
        return;
      }

      const names: Record<string, string> = {};
      (authors ?? []).forEach((author) => {
        names[author.id] = author.full_name ?? 'Unnamed';
      });
      setCommentAuthorNames(names);
    }
  };

  const loadFeed = async () => {
    setLoading(true);
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data: postRows, error: postError } = await supabase
      .from('forum_posts')
      .select(
        'id, author_id, title, content, target_unit, is_announcement, is_pinned, created_at'
      )
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (postError) {
      setError(postError.message);
      setLoading(false);
      return;
    }

    const rows = (postRows ?? []) as ForumPost[];
    setPosts(rows);

    const authorIds = [...new Set(rows.map((post) => post.author_id))];

    if (authorIds.length > 0) {
      const { data: authorRows, error: authorError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', authorIds);

      if (authorError) {
        setError(authorError.message);
        setLoading(false);
        return;
      }

      const nameMap: Record<string, string> = {};
      (authorRows ?? []).forEach((author) => {
        nameMap[author.id] = author.full_name ?? 'Unnamed';
      });
      setAuthorNames(nameMap);
    }

    const postIds = rows.map((post) => post.id);

    if (postIds.length > 0) {
      const { data: likeRows, error: likesError } = await supabase
        .from('forum_post_likes')
        .select('post_id, user_id')
        .in('post_id', postIds);

      if (likesError) {
        setError(likesError.message);
        setLoading(false);
        return;
      }

      const counts: Record<string, number> = {};
      const mine = new Set<string>();

      (likeRows ?? []).forEach((like) => {
        counts[like.post_id] = (counts[like.post_id] ?? 0) + 1;
        if (user && like.user_id === user.id) {
          mine.add(like.post_id);
        }
      });

      setLikeCounts(counts);
      setMyLikes(mine);

      await loadComments(postIds);
    } else {
      setCommentsByPost({});
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreatePost = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!newTitle.trim() || !newContent.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('Your session expired — please sign in again.');
      return;
    }

    const { error: insertError } = await supabase.from('forum_posts').insert({
      author_id: user.id,
      title: newTitle.trim(),
      content: newContent.trim(),
      target_unit: targetUnit,
      is_announcement: canPostAnnouncement && postAsAnnouncement,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNewTitle('');
    setNewContent('');
    await loadFeed();
  };

  const toggleLike = async (postId: string) => {
    if (!userId) return;

    if (myLikes.has(postId)) {
      const { error: unlikeError } = await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (unlikeError) {
        setError(unlikeError.message);
        return;
      }

      setMyLikes((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
      setLikeCounts((current) => ({
        ...current,
        [postId]: Math.max(0, (current[postId] ?? 1) - 1),
      }));
      return;
    }

    const { error: likeError } = await supabase
      .from('forum_post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      });

    if (likeError) {
      setError(likeError.message);
      return;
    }

    setMyLikes((current) => new Set(current).add(postId));
    setLikeCounts((current) => ({
      ...current,
      [postId]: (current[postId] ?? 0) + 1,
    }));
  };

  const togglePin = async (post: ForumPost) => {
    const { error: pinError } = await supabase
      .from('forum_posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', post.id);

    if (pinError) {
      setError(pinError.message);
      return;
    }

    await loadFeed();
  };

  const toggleComments = async (postId: string) => {
    setOpenComments((current) => {
      const next = new Set(current);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });

    if (!commentsByPost[postId]) {
      await loadComments([postId]);
    }
  };

  const handleCommentSubmit = async (
    event: React.FormEvent,
    postId: string
  ) => {
    event.preventDefault();

    const draft = (commentDrafts[postId] ?? '').trim();
    if (!draft || !userId) return;

    setCommentSubmitting((current) => ({ ...current, [postId]: true }));
    setError('');

    const { data, error: insertError } = await supabase
      .from('forum_comments')
      .insert({
        post_id: postId,
        author_id: userId,
        comment: draft,
      })
      .select('id, post_id, author_id, comment, created_at')
      .single();

    if (insertError) {
      setError(insertError.message);
      setCommentSubmitting((current) => ({ ...current, [postId]: false }));
      return;
    }

    setCommentsByPost((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), data as ForumComment],
    }));

    const { data: author } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (author) {
      setCommentAuthorNames((current) => ({
        ...current,
        [author.id]: author.full_name ?? 'Unnamed',
      }));
    }

    setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    setCommentSubmitting((current) => ({ ...current, [postId]: false }));
    setOpenComments((current) => new Set(current).add(postId));
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
          Anyone can start a discussion. Official Unit Notices are posted by
          Excos and Associate Coordinators only.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <Input
                placeholder="Title (e.g. Choir Rehearsal Update)"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div>
              <select
                value={targetUnit}
                onChange={(event) => setTargetUnit(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-white text-xs text-[#1F2937] px-3 font-semibold focus:border-[#1D4ED8]"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    Unit: {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            rows={2}
            placeholder="Write your announcement or discussion detail..."
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            required
          />

          {canPostAnnouncement && (
            <label className="flex items-center gap-2 text-xs font-bold text-[#1F2937]">
              <input
                type="checkbox"
                checked={postAsAnnouncement}
                onChange={(event) => setPostAsAnnouncement(event.target.checked)}
              />
              Post as an official Unit Notice (pinned styling, marked official)
            </label>
          )}

          {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="gap-1.5"
            >
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
              const comments = commentsByPost[post.id] ?? [];
              const commentsOpen = openComments.has(post.id);

              return (
                <div
                  key={post.id}
                  className="p-4 rounded-2xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-xs">
                        {authorName[0]}
                      </div>

                      <div>
                        <div className="text-xs font-extrabold text-[#1F2937]">
                          {authorName}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          {timeAgo(post.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {post.is_pinned && (
                        <Badge variant="gold" className="gap-1 text-[10px]">
                          <Pin className="w-3 h-3" /> Pinned
                        </Badge>
                      )}
                      {post.is_announcement && (
                        <Badge variant="blue" className="text-[10px]">
                          Official Notice
                        </Badge>
                      )}
                      <Badge variant="slate" className="text-[10px]">
                        {post.target_unit}
                      </Badge>
                    </div>
                  </div>

                  <h4 className="text-sm font-extrabold text-[#1F2937]">
                    {post.title}
                  </h4>

                  <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] text-xs">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 font-bold transition-colors ${
                          liked
                            ? 'text-[#1D4ED8]'
                            : 'text-[#6B7280] hover:text-[#1D4ED8]'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {likeCounts[post.id] ?? 0} Blessed
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 font-bold text-[#6B7280] hover:text-[#1D4ED8]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                      </button>
                    </div>

                    {canPin && (
                      <button
                        onClick={() => togglePin(post)}
                        className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-amber-600 font-semibold"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        {post.is_pinned ? 'Unpin' : 'Pin'}
                      </button>
                    )}
                  </div>

                  {commentsOpen && (
                    <div className="pt-2 space-y-3 border-t border-[#E2E8F0]">
                      {comments.length === 0 ? (
                        <p className="text-[11px] text-[#6B7280]">
                          No comments yet. Start the conversation.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {comments.map((comment) => {
                            const name =
                              commentAuthorNames[comment.author_id] ??
                              'Unnamed';

                            return (
                              <div
                                key={comment.id}
                                className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-extrabold text-[#1F2937]">
                                    {name}
                                  </span>
                                  <span className="text-[10px] text-[#6B7280]">
                                    {timeAgo(comment.created_at)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-[#4B5563] leading-relaxed">
                                  {comment.comment}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <form
                        onSubmit={(event) =>
                          handleCommentSubmit(event, post.id)
                        }
                        className="flex items-end gap-2"
                      >
                        <textarea
                          rows={2}
                          value={commentDrafts[post.id] ?? ''}
                          onChange={(event) =>
                            setCommentDrafts((current) => ({
                              ...current,
                              [post.id]: event.target.value,
                            }))
                          }
                          placeholder="Write a comment..."
                          className="flex-1 rounded-xl border border-[#E2E8F0] bg-white p-2.5 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                        />

                        <Button
                          type="submit"
                          size="sm"
                          variant="primary"
                          className="gap-1.5"
                          disabled={
                            commentSubmitting[post.id] ||
                            !(commentDrafts[post.id] ?? '').trim()
                          }
                        >
                          <Send className="w-3.5 h-3.5" />
                          Reply
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
