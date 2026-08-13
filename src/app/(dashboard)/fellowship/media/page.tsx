'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  ExternalLink,
} from 'lucide-react';
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
import { Select } from '@/components/ui/select';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

type MediaCategory = 'FLYER' | 'SERMON_AUDIO' | 'SPECIAL_VIDEO';
type SourceType = 'UPLOAD' | 'YOUTUBE';

interface MediaItem {
  id: string;
  title: string;
  category: MediaCategory;
  speakerOrUnit: string;
  createdAt: string;
  description: string;
  mediaUrl: string;
  thumbnailUrl: string;
  sourceType: SourceType;
  downloadsCount: number;
}

const FALLBACK_THUMBNAIL = '/sermon_thumb.jpg';

function formatFileSize(bytes?: number) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function isVideo(item: MediaItem) {
  return item.category === 'SPECIAL_VIDEO';
}

export default function MediaRepositoryPage() {
  const { userRole } = useRole();
  const isAdmin = userRole === 'SYSTEM_ADMINISTRATOR';
  const isMediaOrSecretarialStaff =
    userRole === 'ASSOCIATE_COORDINATOR' || userRole === 'STUDENT_EXECUTIVE';
  const canUploadMedia = isAdmin || isMediaOrSecretarialStaff;

  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] =
    useState<MediaCategory>('SERMON_AUDIO');
  const [newSpeaker, setNewSpeaker] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('UPLOAD');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMedia() {
      setLoading(true);
      setError('');

      const { data, error: loadError } = await supabase
        .from('media_items')
        .select(
          'id,title,category,speaker_or_unit,created_at,description,media_url,thumbnail_url,source_type,download_count'
        )
        .order('created_at', { ascending: false });

      if (cancelled) return;

      if (loadError) {
        setError(loadError.message);
        setItems([]);
        setLoading(false);
        return;
      }

      setItems(
        (data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category as MediaCategory,
          speakerOrUnit: row.speaker_or_unit,
          createdAt: row.created_at,
          description:
            row.description || 'Uploaded fellowship media recording.',
          mediaUrl: row.media_url,
          thumbnailUrl: row.thumbnail_url || FALLBACK_THUMBNAIL,
          sourceType: row.source_type as SourceType,
          downloadsCount: row.download_count ?? 0,
        }))
      );
      setLoading(false);
    }

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const resetUploadForm = () => {
    setNewTitle('');
    setNewSpeaker('');
    setNewDescription('');
    setNewCategory('SERMON_AUDIO');
    setSourceType('UPLOAD');
    setYoutubeUrl('');
    setUploadedFile(null);
  };

  const togglePlay = (item: MediaItem) => {
    if (item.category === 'FLYER') {
      window.open(item.mediaUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    setPlayingId((current) => (current === item.id ? null : item.id));
  };

  const handleDownload = async (item: MediaItem) => {
    const nextCount = item.downloadsCount + 1;
    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, downloadsCount: nextCount }
          : entry
      )
    );

    await supabase
      .from('media_items')
      .update({ download_count: nextCount })
      .eq('id', item.id);

    window.open(item.mediaUrl, '_blank', 'noopener,noreferrer');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTitle || !newSpeaker) return;

    if (sourceType === 'UPLOAD' && !uploadedFile) {
      setError('Please select a media file to upload.');
      return;
    }

    if (sourceType === 'YOUTUBE' && !youtubeUrl.trim()) {
      setError('Please provide the YouTube URL.');
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Your session has expired. Please sign in again.');
        return;
      }

      let mediaUrl = '';
      let storagePath: string | null = null;

      if (sourceType === 'YOUTUBE') {
        mediaUrl = youtubeUrl.trim();
      } else {
        const safeName = uploadedFile!.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        storagePath = `${user.id}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from('media-files')
          .upload(storagePath, uploadedFile!, {
            upsert: false,
            contentType: uploadedFile!.type || undefined,
          });

        if (uploadError) {
          setError(uploadError.message);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('media-files')
          .getPublicUrl(storagePath);

        mediaUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase.from('media_items').insert({
        title: newTitle.trim(),
        category: newCategory,
        speaker_or_unit: newSpeaker.trim(),
        description: newDescription.trim() || null,
        media_url: mediaUrl,
        thumbnail_url: FALLBACK_THUMBNAIL,
        source_type: sourceType,
        storage_path: storagePath,
        created_by: user.id,
        download_count: 0,
      });

      if (insertError) {
        if (storagePath) {
          await supabase.storage.from('media-files').remove([storagePath]);
        }
        setError(insertError.message);
        return;
      }

      const { data: freshItems, error: reloadError } = await supabase
        .from('media_items')
        .select(
          'id,title,category,speaker_or_unit,created_at,description,media_url,thumbnail_url,source_type,download_count'
        )
        .order('created_at', { ascending: false });

      if (reloadError) {
        setError(reloadError.message);
        return;
      }

      setItems(
        (freshItems ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category as MediaCategory,
          speakerOrUnit: row.speaker_or_unit,
          createdAt: row.created_at,
          description:
            row.description || 'Uploaded fellowship media recording.',
          mediaUrl: row.media_url,
          thumbnailUrl: row.thumbnail_url || FALLBACK_THUMBNAIL,
          sourceType: row.source_type as SourceType,
          downloadsCount: row.download_count ?? 0,
        }))
      );

      setUploadSuccess(true);
      window.setTimeout(() => {
        setUploadSuccess(false);
        setShowUploadModal(false);
        resetUploadForm();
      }, 1200);
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search) ||
      item.speakerOrUnit.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const renderMediaControl = (item: MediaItem) => {
    if (item.category === 'FLYER') {
      return (
        <button
          onClick={() => togglePlay(item)}
          className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label={`Open ${item.title}`}
        >
          <FileImage className="w-6 h-6" />
        </button>
      );
    }

    if (item.sourceType === 'YOUTUBE') {
      return (
        <button
          onClick={() => togglePlay(item)}
          className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label={`Open ${item.title}`}
        >
          {playingId === item.id ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>
      );
    }

    return (
      <button
        onClick={() => togglePlay(item)}
        className="w-12 h-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label={`${playingId === item.id ? 'Pause' : 'Play'} ${item.title}`}
      >
        {playingId === item.id ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-0.5" />
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6 font-sans">
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
                Stream sermon recordings and access official fellowship media.
              </p>
            </div>
          </div>

          {canUploadMedia && (
            <Button
              onClick={() => setShowUploadModal(true)}
              variant="primary"
              className="gap-2 shrink-0 rounded-xl font-bold text-xs"
            >
              <Upload className="w-4 h-4" />
              Upload Media / Flyer
            </Button>
          )}
        </div>
      </div>

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
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold"
          >
            <option value="ALL">All Media Types ({items.length})</option>
            <option value="SERMON_AUDIO">Audio Sermons &amp; Messages</option>
            <option value="FLYER">Program Flyers &amp; Posters</option>
            <option value="SPECIAL_VIDEO">Video Special Service Recordings</option>
          </Select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-[#E2E8F0] text-center text-xs text-[#6B7280]">
            Loading fellowship media...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="md:col-span-2 p-8 rounded-3xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#6B7280]">
            No media has been published yet.
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              className="border-[#E2E8F0] bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
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
                    {item.category === 'SERMON_AUDIO' && (
                      <Headphones className="w-3 h-3" />
                    )}
                    {item.category === 'FLYER' && (
                      <FileImage className="w-3 h-3" />
                    )}
                    {item.category === 'SPECIAL_VIDEO' && (
                      <Film className="w-3 h-3" />
                    )}
                    {item.category.replace('_', ' ')}
                  </Badge>
                  <span className="text-[11px] font-mono text-[#6B7280] font-semibold">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <CardTitle className="text-sm font-extrabold text-[#1F2937] leading-tight">
                  {item.title}
                </CardTitle>

                <CardDescription className="text-xs font-bold text-[#1D4ED8] mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {item.speakerOrUnit}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC]">
                  <Image
                    src={item.thumbnailUrl || FALLBACK_THUMBNAIL}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[#1F2937]/30 flex items-center justify-center">
                    {renderMediaControl(item)}
                  </div>
                </div>

                {playingId === item.id && item.sourceType === 'YOUTUBE' && (
                  <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#1D4ED8]/30">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          item.mediaUrl,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      className="text-xs gap-1 border-[#1D4ED8] text-[#1D4ED8]"
                    >
                      Open YouTube Recording
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                {playingId === item.id &&
                  item.sourceType === 'UPLOAD' &&
                  item.category === 'SERMON_AUDIO' && (
                    <audio
                      controls
                      autoPlay
                      src={item.mediaUrl}
                      className="w-full"
                    />
                  )}

                {playingId === item.id &&
                  item.sourceType === 'UPLOAD' &&
                  item.category === 'SPECIAL_VIDEO' && (
                    <video
                      controls
                      autoPlay
                      src={item.mediaUrl}
                      className="w-full rounded-xl"
                    />
                  )}

                <p className="text-xs text-[#4B5563] leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[11px] text-[#6B7280] font-mono font-semibold">
                    {item.sourceType === 'YOUTUBE' ? 'YouTube' : 'Stored media'} •{' '}
                    {item.downloadsCount} Downloads
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(item)}
                    className="text-xs gap-1 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF] font-bold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open / Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showUploadModal && canUploadMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="text-base font-extrabold text-[#1F2937]">
                  Publish Fellowship Media
                </h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#9CA3AF] hover:text-[#1F2937]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                  Media Category
                </label>
                <Select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as MediaCategory)
                  }
                >
                  <option value="SERMON_AUDIO">
                    Audio Sermon / Recording (MP3)
                  </option>
                  <option value="FLYER">
                    Program Flyer / Announcement Poster
                  </option>
                  <option value="SPECIAL_VIDEO">
                    Video Special Service Recording (MP4)
                  </option>
                </Select>
              </div>

              {newCategory === 'SERMON_AUDIO' && (
                <div>
                  <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                    Source
                  </label>
                  <Select
                    value={sourceType}
                    onChange={(e) =>
                      setSourceType(e.target.value as SourceType)
                    }
                  >
                    <option value="UPLOAD">Upload audio to fellowship storage</option>
                    <option value="YOUTUBE">Use a YouTube recording link</option>
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                  Media Title
                </label>
                <Input
                  placeholder="e.g. AFIT Fellowship Service Message"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                  Speaker / Unit Lead
                </label>
                <Input
                  placeholder="e.g. Pastor / Bro. Samuel Okosun or Media Unit"
                  value={newSpeaker}
                  onChange={(e) => setNewSpeaker(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                  Brief Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Add details about the sermon, event theme, or service notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3 text-xs text-[#1F2937] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20"
                />
              </div>

              {sourceType === 'YOUTUBE' ? (
                <div>
                  <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                    YouTube URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-extrabold text-[#1F2937] mb-1">
                    Select File to Upload
                  </label>
                  <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#1D4ED8] rounded-xl p-4 text-center cursor-pointer bg-[#F8FAFC]">
                    <input
                      type="file"
                      accept={
                        newCategory === 'SERMON_AUDIO'
                          ? '.mp3,.wav,.m4a'
                          : newCategory === 'SPECIAL_VIDEO'
                            ? '.mp4,.webm,.mov'
                            : '.png,.jpg,.jpeg,.pdf'
                      }
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        setUploadedFile(e.target.files[0])
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Upload className="w-6 h-6 text-[#1D4ED8]" />
                      <div className="text-xs font-extrabold text-[#1F2937]">
                        {uploadedFile
                          ? uploadedFile.name
                          : 'Click to choose a file'}
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        {uploadedFile
                          ? formatFileSize(uploadedFile.size)
                          : 'Stored securely in Supabase Storage'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  Media published successfully.
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                  disabled={uploading}
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploading ? 'Publishing...' : 'Publish to Repository'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
