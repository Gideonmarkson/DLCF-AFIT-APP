'use client';

import React from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DevotionalBannerProps {
  content?: string;
}

export function DevotionalBanner({
  content = 'True intellectual greatness on a military campus like AFIT comes from divine illumination. Like Daniel and his companions, standing saintly in holiness unlocks supernatural academic insights.',
}: DevotionalBannerProps) {
  return (
    <Card className="relative overflow-hidden border-[#1D4ED8]/20 bg-white shadow-xs">
      <CardContent className="p-6 font-sans">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          {/* Devotional Text Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <Badge variant="blue" className="gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Daily Fellowship Devotional
              </Badge>
              <span className="text-xs font-mono font-bold text-[#6B7280]">AFIT Kaduna Chapter</span>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-[#1F2937] tracking-tight">Daily Fellowship With God</h2>
              <p className="mt-1 text-xs text-[#1D4ED8] font-semibold">
                A few quiet minutes with God each day shapes a saintly, excellent life — in the Word, in prayer, in gratitude.
              </p>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed font-medium">{content}</p>
          </div>

          {/* Visual Open Holy Bible Image Container */}
          <div className="relative w-full lg:w-64 h-44 rounded-2xl overflow-hidden shadow-sm border border-[#E2E8F0] shrink-0">
            <Image
              src="/open_bible_realistic.jpg"
              alt="Visual Open Holy Bible"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
              Holy Scriptures
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
