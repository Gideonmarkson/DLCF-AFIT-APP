'use client';

import React, { useState } from 'react';
import { MessageSquare, Pin, Send, ThumbsUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ForumPost {
  id: string;
  authorName: string;
  authorRole: string;
  unit: string;
  title: string;
  content: string;
  timeAgo: string;
  isAnnouncement: boolean;
  likesCount: number;
}

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    authorName: 'Brother Emmanuel (Choir Lead)',
    authorRole: 'STUDENT_EXECUTIVE',
    unit: 'CHOIR',
    title: 'Special Choir Rehearsal for AFIT Sunday Service',
    content: 'Grace and peace brethren! All Choir unit members are requested to assemble at the Fellowship Hall by 4:00 PM on Saturday for intensive rehearsal ahead of the Fellowship Service.',
    timeAgo: '2 hours ago',
    isAnnouncement: true,
    likesCount: 14,
  },
  {
    id: 'post-2',
    authorName: 'Sister Blessing (Academic Sec)',
    authorRole: 'STUDENT_EXECUTIVE',
    unit: 'ACADEMICS',
    title: 'AEE 311 Aerodynamics Study Group Session',
    content: 'We are organizing an intensive peer problem-solving session for AEE 311 and MET 201 on Wednesday evening at the AFIT Library Extension.',
    timeAgo: '5 hours ago',
    isAnnouncement: false,
    likesCount: 9,
  },
];

export function FellowshipNoticeFeed() {
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [targetUnit, setTargetUnit] = useState('CHOIR');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newPost: ForumPost = {
      id: Date.now().toString(),
      authorName: 'Brother Daniel (Choir / 300L)',
      authorRole: 'CHURCH_WORKER',
      unit: targetUnit,
      title: newTitle,
      content: newContent,
      timeAgo: 'Just now',
      isAnnouncement: true,
      likesCount: 1,
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <Card className="border-[#E2E8F0] bg-white shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#1D4ED8]" />
            Unit Notices & Departmental Forums
          </CardTitle>
          <Badge variant="blue">Supabase Realtime Sync</Badge>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Role-authenticated bulletin board for Choir, Prayer, Academics, and Unit Heads.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Create Post Form */}
        <form onSubmit={handleCreatePost} className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#E2E8F0] space-y-3">
          <div className="text-xs font-extrabold text-[#1F2937]">Post Unit Notice / Announcement</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <Input
                placeholder="Notice Title (e.g. Choir Rehearsal Update)"
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
                <option value="CHOIR">Unit: Choir</option>
                <option value="PRAYER">Unit: Prayer</option>
                <option value="ACADEMICS">Unit: Academics</option>
                <option value="PUBLICITY">Unit: Publicity</option>
              </select>
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="Write announcement or discussion detail..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" variant="primary" className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Publish Notice
            </Button>
          </div>
        </form>

        {/* Notice List */}
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="p-4 rounded-2xl bg-white border border-[#E2E8F0] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white font-extrabold flex items-center justify-center text-xs">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#1F2937]">{post.authorName}</div>
                    <div className="text-[10px] text-[#6B7280]">{post.timeAgo}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {post.isAnnouncement && (
                    <Badge variant="gold" className="gap-1 text-[10px]">
                      <Pin className="w-3 h-3" /> Pinned Notice
                    </Badge>
                  )}
                  <Badge variant="blue" className="text-[10px]">{post.unit}</Badge>
                </div>
              </div>

              <h4 className="text-sm font-extrabold text-[#1F2937]">{post.title}</h4>
              <p className="text-xs text-[#4B5563] leading-relaxed font-medium">{post.content}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                <button
                  onClick={() => {
                    setPosts(
                      posts.map((p) => (p.id === post.id ? { ...p, likesCount: p.likesCount + 1 } : p))
                    );
                  }}
                  className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1D4ED8] font-bold transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-[#1D4ED8]" /> {post.likesCount} Blessed
                </button>
                <span className="text-[11px] text-[#9CA3AF] font-semibold">Unit Channel</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
