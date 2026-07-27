'use client';

import React, { useState } from 'react';
import { Download, Folder, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';

interface ResourceItem {
  id: string;
  title: string;
  category: 'PAST_QUESTION' | 'DEVOTIONAL' | 'UNIT_RESOURCE';
  courseCode?: string;
  level: number;
  downloadCount: number;
  fileSize: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'AEE 311 Aerodynamics I Past Questions (2019 - 2024)',
    category: 'PAST_QUESTION',
    courseCode: 'AEE 311',
    level: 300,
    downloadCount: 142,
    fileSize: '3.4 MB',
  },
  {
    id: 'res-2',
    title: 'MET 201 Thermodynamics Solved Exam Solutions',
    category: 'PAST_QUESTION',
    courseCode: 'MET 201',
    level: 200,
    downloadCount: 198,
    fileSize: '5.1 MB',
  },
  {
    id: 'res-3',
    title: 'DLCF Weekly Devotional Guide - Month of Wisdom',
    category: 'DEVOTIONAL',
    level: 100,
    downloadCount: 88,
    fileSize: '1.2 MB',
  },
  {
    id: 'res-4',
    title: 'EEE 301 Electric Circuit Theory Tutorial Question Bank',
    category: 'PAST_QUESTION',
    courseCode: 'EEE 301',
    level: 300,
    downloadCount: 112,
    fileSize: '2.8 MB',
  },
];

export function ResourceBank() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [items, setItems] = useState<ResourceItem[]>(RESOURCES);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.courseCode && item.courseCode.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesLevel = levelFilter === 'ALL' || item.level.toString() === levelFilter;
    return matchesSearch && matchesCat && matchesLevel;
  });

  const handleDownload = (id: string) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, downloadCount: i.downloadCount + 1 } : i))
    );
  };

  return (
    <Card className="border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-[#1F2937] flex items-center gap-2">
            <Folder className="w-5 h-5 text-[#FF3D4A]" />
            Academic Past Questions & Fellowship Repository
          </CardTitle>
          <Badge variant="red">{filteredItems.length} Files Found</Badge>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Search and download past exam papers, tutorial solutions, devotionals, and unit guides.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
            <Input
              placeholder="Search course code or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs font-semibold">
              <option value="ALL">All Categories</option>
              <option value="PAST_QUESTION">Past Questions</option>
              <option value="DEVOTIONAL">Devotionals</option>
              <option value="UNIT_RESOURCE">Unit Resources</option>
            </Select>
          </div>
          <div>
            <Select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="text-xs font-semibold">
              <option value="ALL">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
            </Select>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-[#FFF5F5]/60 border border-[#E5E7EB] flex flex-col justify-between space-y-3 shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant={item.category === 'PAST_QUESTION' ? 'red' : 'gold'} className="text-[10px]">
                    {item.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] font-mono text-[#6B7280] font-bold">{item.level}L</span>
                </div>
                <h4 className="text-xs font-bold text-[#1F2937]">{item.title}</h4>
                <div className="text-[11px] text-[#6B7280] mt-1">Size: {item.fileSize}</div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                <span className="text-[11px] text-[#6B7280] font-mono font-medium">
                  {item.downloadCount} Downloads
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(item.id)}
                  className="text-xs gap-1 border-[#FF3D4A] text-[#FF3D4A] hover:bg-[#FFF0F1]"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
