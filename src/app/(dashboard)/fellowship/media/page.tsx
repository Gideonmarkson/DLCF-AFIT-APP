'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Film,
  Headphones,
  FileImage,
  Upload,
  Download,
  Play,
  Pause,
  Search,
  User,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useRole } from '@/context/RoleContext';

interface MediaItem {
  id: string;
  title: string;
  category: 'FLYER' | 'SERMON_AUDIO' | 'SPECIAL_VIDEO';
  speakerOrUnit: string;
  dateStr: string;
  fileSize: string;
  duration?: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  downloadsCount: number;
}

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'm-1',
    title: 'AFIT Sunday Service: Walking in Divine Excellence',
    category: 'SERMON_AUDIO',
    speakerOrUnit: 'Pastor / Bro. Samuel Okosun',
    dateStr: 'July 26, 2026',
    fileSize: '14.2 MB',
    duration: '45 mins',
    description: 'Anointing for academic breakthrough and saintly living on campus.',
    mediaUrl: '/open_bible_realistic.jpg',
    thumbnailUrl: '/open_bible_realistic.jpg',
    downloadsCount: 184,
  },
  {
    id: 'm-2',
    title: 'Official Flyer: AFIT Academic Excellence & Prayer Retreat',
    category: 'FLYER',
    speakerOrUnit: 'DLCF AFIT Publicity & Academic Directorate',
    dateStr: 'August 02, 2026',
    fileSize: '3.8 MB',
    description: 'Official HD program flyer for the upcoming semester exam prep retreat.',
    mediaUrl: '/open_bible_realistic.jpg',
    thumbnailUrl: '/open_bible_realistic.jpg',
    downloadsCount: 312,
  },
  {
    id: 'm-3',
    title: 'Special Video: Calvary Voices Choir Ministration',
    category: 'SPECIAL_VIDEO',
    speakerOrUnit: 'Calvary Voices Choir (AFIT Chapter)',
    dateStr: 'July 19, 2026',
    fileSize: '85.4 MB',
    duration: '18 mins',
    description: 'Live worship ministration recorded during AFIT Fellowship Service.',
    mediaUrl: '/open_bible_realistic.jpg',
    thumbnailUrl: '/open_bible_realistic.jpg',
    downloadsCount: 245,
  },
  {
    id: 'm-4',
    title: 'Sermon: The Master Student - Overcoming Exam Anxiety',
    category: 'SERMON_AUDIO',
    speakerOrUnit: 'Prof. Dr. A. K. Mohammed (Patron Advisor)',
    dateStr: 'July 12, 2026',
    fileSize: '18.5 MB',
    duration: '52 mins',
    description: 'Practical and spiritual strategies for topping engineering and science courses at AFIT.',
    mediaUrl: '/open_bible_realistic.jpg',
    thumbnailUrl: '/open_bible_realistic.jpg',
    downloadsCount: 298,
  },
];

export default function MediaRepositoryPage() {
  const { userRole } = useRole();
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';
  const isMediaOrSecretarialStaff = userRole === 'ASSOCIATE_COORDINATOR' || userRole === 'STUDENT_EXECUTIVE';

  // Permitted to upload media: System Administrator, Media Coordinator, Assistant Media Coordinator, Secretarial Coordinator
  const canUploadMedia = isAdmin || isMediaOrSecretarialStaff;

  const [items, setItems] = useState<MediaItem[]>(INITIAL_MEDIA_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Upload Form Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'FLYER' | 'SERMON_AUDIO' | 'SPECIAL_VIDEO'>('SERMON_AUDIO');
  const [newSpeaker, setNewSpeaker] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const handleDownload = (id: string) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, downloadsCount: item.downloadsCount + 1 } : item))
    );
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSpeaker) return;

    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      speakerOrUnit: newSpeaker,
      dateStr: 'Just now',
      fileSize: uploadedFile ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB` : '5.0 MB',
      duration: newCategory === 'SERMON_AUDIO' ? '40 mins' : newCategory === 'SPECIAL_VIDEO' ? '25 mins' : undefined,
      description: newDescription || 'Uploaded fellowship media recording.',
      mediaUrl: '/open_bible_realistic.jpg',
      thumbnailUrl: '/open_bible_realistic.jpg',
      downloadsCount: 1,
    };

    setItems([newItem, ...items]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setNewTitle('');
      setNewSpeaker('');
      setNewDescription('');
      setUploadedFile(null);
    }, 1200);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.speakerOrUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-white via-[#EFF6FF] to-white border border-[#E2E8F0] shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-white flex items-center justify-center font-extrabold shadow-sm flex-shrink-0">
              <Film className="w-6 h-6 stroke-[1.75px]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">
                Fellowship Media &amp; Special Service Recordings
              </h1>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Stream sermon audio recordings, watch special service videos, and download official event flyers.
              </p>
            </div>
          </div>

          {/* Upload Button: PERMITTED FOR MEDIA, ASSISTANT MEDIA, SECRETARIAL COORDINATORS & SYSTEM ADMIN */}
          {canUploadMedia && (
            <Button
              onClick={() => setShowUploadModal(true)}
              variant="primary"
              className="gap-2 shrink-0 rounded-xl font-bold text-xs"
            >
              <Upload className="w-4 h-4" /> Upload Media / Flyer ({isAdmin ? 'System Admin' : 'Media / Secretarial Lead'})
            </Button>
          )}
        </div>
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder="Search sermons, flyers, speakers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="text-xs font-semibold">
            <option value="ALL">All Media Types ({items.length})</option>
            <option value="SERMON_AUDIO">Audio Sermons &amp; Messages</option>
            <option value="FLYER">Program Flyers &amp; Posters</option>
            <option value="SPECIAL_VIDEO">Video Special Service Recordings</option>
          </Select>
        </div>
      </div>

      {/* Media Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-[#E2E8F0] bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge
                  variant={
                    item.category === 'SERMON_AUDIO'
                      ? 'blue'
                      : item.category === 'FLYER'
                      ? 'gold'
                      : 'slate'
                  }
                  className="gap-1 text-[10px]"
                >
                  {item.category === 'SERMON_AUDIO' && <Headphones className="w-3 h-3" />}
                  {item.category === 'FLYER' && <FileImage className="w-3 h-3" />}
                  {item.category === 'SPECIAL_VIDEO' && <Film className="w-3 h-3" />}
                  {item.category.replace('_', ' ')}
                </Badge>
                <span className="text-[11px] font-mono text-[#6B7280] font-semibold">{item.dateStr}</span>
              </div>

              <CardTitle className="text-sm font-extrabold text-[#1F2937] leading-tight">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs font-bold text-[#1D4ED8] mt-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {item.speakerOrUnit}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Media Thumbnail & Player Preview */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC]">
                <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-[#1F2937]/30 flex items-center justify-center">
                  {item.category === 'SERMON_AUDIO' ? (
                    <button
                      onClick={() => togglePlay(item.id)}
                      className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      {playingId === item.id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                  ) : item.category === 'SPECIAL_VIDEO' ? (
                    <button
                      onClick={() => togglePlay(item.id)}
                      className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Play className="w-6 h-6 ml-0.5" />
                    </button>
                  ) : (
                    <Badge variant="role" className="bg-[#1F2937]/80 backdrop-blur-xs">
                      <FileImage className="w-3.5 h-3.5 mr-1" /> View Program Flyer
                    </Badge>
                  )}
                </div>

                {item.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                    {item.duration}
                  </span>
                )}
              </div>

              {/* Audio Stream Bar (If currently playing) */}
              {playingId === item.id && (
                <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#1D4ED8]/30 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1D4ED8]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-ping" /> Streaming Sermon Audio...
                    </span>
                    <span>12:45 / {item.duration}</span>
                  </div>
                  <div className="w-full bg-[#CBD5E1] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1D4ED8] h-full w-[35%] rounded-full" />
                  </div>
                </div>
              )}

              <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                {item.description}
              </p>

              {/* Download & File Info Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                <span className="text-[11px] text-[#6B7280] font-mono font-semibold">
                  Size: {item.fileSize} • {item.downloadsCount} Downloads
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(item.id)}
                  className="text-xs gap-1 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF] font-bold"
                >
                  <Download className="w-3.5 h-3.5" /> Download Media
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Media Modal (PERMITTED ROLES) */}
      {showUploadModal && canUploadMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-extrabold text-[#1F2937]">
                  Upload Fellowship Media / Flyer ({isAdmin ? 'System Admin' : 'Media / Secretarial Lead'})
                </h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Media Category</label>
                <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value as any)}>
                  <option value="SERMON_AUDIO">Audio Sermon / Recording (MP3)</option>
                  <option value="FLYER">Program Flyer / Announcement Poster (PNG, JPG)</option>
                  <option value="SPECIAL_VIDEO">Video Special Service Recording (MP4)</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Media Title</label>
                <Input
                  placeholder="e.g. AFIT Fellowship Service Message"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Speaker / Unit Lead</label>
                <Input
                  placeholder="e.g. Pastor / Bro. Samuel Okosun or Media Unit"
                  value={newSpeaker}
                  onChange={(e) => setNewSpeaker(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  placeholder="Add details about the sermon, event theme, or service notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1F2937] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                />
              </div>

              {/* Drag & Drop File Upload Box */}
              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Select File to Upload</label>
                <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#1D4ED8] rounded-xl p-4 text-center cursor-pointer bg-[#F8FAFC]">
                  <input
                    type="file"
                    accept=".mp3,.mp4,.png,.jpg,.jpeg,.pdf"
                    onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-6 h-6 text-[#1D4ED8]" />
                    <div className="text-xs font-extrabold text-[#1F2937]">
                      {uploadedFile ? uploadedFile.name : 'Click to Upload Audio (MP3), Video (MP4) or Flyer'}
                    </div>
                    <div className="text-[10px] text-[#6B7280]">Supports MP3, MP4, PNG, JPG</div>
                  </div>
                </div>
              </div>

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  Media file uploaded successfully! Saved to fellowship repository.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Publish to Repository
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
