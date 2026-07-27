'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BookOpen, RefreshCw } from 'lucide-react';
import { generateDevotionalReflection } from '@/lib/gemini';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DevotionalBannerProps {
  topic?: string;
  memoryVerse?: string;
  bibleText?: string;
  content?: string;
}

export function DevotionalBanner({
  topic = 'Saintly Intellectuals: Walking in Divine Wisdom',
  memoryVerse = 'Daniel 1:17 - "As for these four children, God gave them knowledge and skill in all learning and wisdom."',
  bibleText = 'Daniel 1:1-20',
  content = 'True intellectual greatness on a military campus like AFIT comes from divine illumination. Like Daniel and his companions, standing saintly in holiness unlocks supernatural academic insights.',
}: DevotionalBannerProps) {
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReflection = async () => {
    setLoading(true);
    const result = await generateDevotionalReflection(topic, bibleText);
    setReflection(result);
    setLoading(false);
  };

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
              <h2 className="text-xl font-extrabold text-[#1F2937] tracking-tight">{topic}</h2>
              <div className="mt-1 text-xs font-mono font-bold text-[#1D4ED8]">{memoryVerse}</div>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed font-medium">{content}</p>

            {/* Reflection Summary Box */}
            {reflection && (
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#1D4ED8]/30 text-xs text-[#1F2937] space-y-1.5 shadow-xs animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[#1D4ED8] font-extrabold">
                  <BookOpen className="w-4 h-4 text-[#1D4ED8]" /> Devotional Reflection
                </div>
                <p className="leading-relaxed text-[#4B5563] font-medium">{reflection}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <span className="text-[11px] text-[#6B7280] font-semibold">Passage: {bibleText}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateReflection}
                disabled={loading}
                className="text-xs gap-1.5 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />
                )}
                {reflection ? 'Regenerate Devotional Insight' : 'Get Devotional Insight'}
              </Button>
            </div>
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
