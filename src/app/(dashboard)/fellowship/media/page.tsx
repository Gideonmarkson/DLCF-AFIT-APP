'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ExternalLink,
  FileAudio,
  FileImage,
  FileVideo,
  Heart,
  Loader2,
  Play,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type MediaCategory = 'ALL' | 'FLYER' | 'SERMON_AUDIO' | 'SPECIAL_VIDEO';
type UploadCategory = Exclude<MediaCategory, 'ALL'>;
type SourceType = 'FILE' | 'YOUTUBE';
type MediaRow = Record<string, unknown>;

const CANDIDATES = {
  title: ['title', 'media_title', 'name'],
  category: ['category', 'media_category', 'media_type', 'type'],
  speaker: ['speaker_or_unit', 'speaker', 'speaker_name', 'author'],
  description: ['description', 'details', 'summary'],
  url: ['media_url', 'file_url', 'url', 'source_url', 'youtube_url', 'youtube_link', 'link'],
  source: ['source_type', 'source', 'media_source'],
  createdAt: ['created_at', 'uploaded_at', 'created_on', 'date'],
  downloads: ['download_count', 'downloads'],
} as const;

function getString(row: MediaRow, keys: readonly string[], fallback = '') {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return fallback;
}

function getNumber(row: MediaRow, keys: readonly string[], fallback = 0) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return fallback;
}

function normalizeCategory(row: MediaRow): UploadCategory {
  const value = getString(row, CANDIDATES.category).toUpperCase();
  if (value === 'FLYER') return 'FLYER';
  if (value === 'SERMON_AUDIO' || value === 'SERMON AUDIO' || value === 'AUDIO') return 'SERMON_AUDIO';
  return 'SPECIAL_VIDEO';
}

function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    return (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be' ||
      host === 'www.youtu.be'
    );
  } catch {
    return false;
  }
}

function youtubeId(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      return url.pathname.replace(/^\//, '').split('/')[0] || null;
    }

    const watchId = url.searchParams.get('v');
    if (watchId) return watchId;

    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'shorts' || parts[0] === 'embed') return parts[1] ?? null;
  } catch {
    return null;
  }

  return null;
}

function youtubeThumbnail(value: string) {
  const id = youtubeId(value);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '/sermon_thumb.jpg';
}

function categoryLabel(category: UploadCategory) {
  if (category === 'FLYER') return 'FLYER';
  if (category === 'SERMON_AUDIO') return 'SERMON AUDIO';
  return 'SPECIAL VIDEO';
}

function categoryIcon(category: UploadCategory) {
  if (category === 'FLYER') return FileImage;
  if (category === 'SERMON_AUDIO') return FileAudio;
  return FileVideo;
}

function formatDate(row: MediaRow) {
  const value = getString(row, CANDIDATES.createdAt);
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}



export default function FellowshipMediaPage() {
  const [items, setItems] = useState<MediaRow[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MediaCategory>('ALL');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [saving, setSaving] = useState(false);

  const [uploadCategory, setUploadCategory] = useState<UploadCategory>('SPECIAL_VIDEO');
  const [sourceType, setSourceType] = useState<SourceType>('FILE');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fellowship/media', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to load fellowship media.');
      setItems(Array.isArray(result.items) ? result.items : []);
      setCanManage(Boolean(result.canManage));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load fellowship media.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMedia();
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...items]
      .filter((item) => filter === 'ALL' || normalizeCategory(item) === filter)
      .filter((item) => {
        if (!query) return true;
        const haystack = [
          getString(item, CANDIDATES.title),
          getString(item, CANDIDATES.speaker),
          getString(item, CANDIDATES.description),
          categoryLabel(normalizeCategory(item)),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .sort((a, b) => formatDate(b).localeCompare(formatDate(a)));
  }, [items, filter, search]);

  const resetUploadForm = () => {
    setUploadCategory('SPECIAL_VIDEO');
    setSourceType('FILE');
    setTitle('');
    setSpeaker('');
    setDescription('');
    setYoutubeUrl('');
    setSelectedFile(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!title.trim() || !speaker.trim()) {
        throw new Error('Media title and speaker/unit are required.');
      }

      if (sourceType === 'YOUTUBE') {
        if (uploadCategory === 'FLYER' || !isYouTubeUrl(youtubeUrl)) {
          throw new Error('Please enter a valid YouTube URL for the recording.');
        }
      } else if (!selectedFile) {
        throw new Error('Please choose a file to upload.');
      }

      const formData = new FormData();
      formData.set('category', uploadCategory);
      formData.set('sourceType', sourceType);
      formData.set('title', title.trim());
      formData.set('speaker', speaker.trim());
      formData.set('description', description.trim());

      if (sourceType === 'YOUTUBE') {
        formData.set('youtubeUrl', youtubeUrl.trim());
      } else if (selectedFile) {
        formData.set('file', selectedFile);
      }

      const response = await fetch('/api/fellowship/media', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Media upload failed.');
      }

      resetUploadForm();
      setShowUpload(false);
      await loadMedia();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Media upload failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((entry) => String(entry.id ?? '') === id);
    const itemTitle = item ? getString(item, CANDIDATES.title, 'this media') : 'this media';

    if (!window.confirm(`Delete “${itemTitle}” from the fellowship media repository? This action is permanent.`)) {
      return;
    }

    setDeletingId(id);
    setError('');

    try {
      const response = await fetch(`/api/fellowship/media/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Media deletion failed.');

      if (playingId === id) setPlayingId(null);
      setItems((current) => current.filter((entry) => String(entry.id ?? '') !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Media deletion failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const openExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleLike = (id: string) => {
    setLikedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-5 pb-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fellowship Media</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              A central repository for fellowship flyers, sermon audio and special-service recordings.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <Upload className="h-4 w-4" />
              Upload Media / Flyer
            </button>
          )}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search media by title, speaker or description..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as MediaCategory)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="ALL">All Media Types</option>
          <option value="FLYER">Flyers</option>
          <option value="SERMON_AUDIO">Sermon Audio</option>
          <option value="SPECIAL_VIDEO">Special Videos</option>
        </select>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-60 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading fellowship media...
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-slate-700">No media found</p>
          <p className="mt-1 text-sm text-slate-500">Try another search or media category.</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const id = String(item.id ?? getString(item, CANDIDATES.title, 'media-item'));
            const category = normalizeCategory(item);
            const Icon = categoryIcon(category);
            const titleValue = getString(item, CANDIDATES.title, 'Untitled media');
            const speakerValue = getString(item, CANDIDATES.speaker, 'Fellowship Media');
            const descriptionValue = getString(item, CANDIDATES.description);
            const mediaUrl = getString(item, CANDIDATES.url);
            const youtube = isYouTubeUrl(mediaUrl);
            const playing = playingId === id;
            const dateValue = formatDate(item);
            const downloads = getNumber(item, CANDIDATES.downloads);
            const thumbnail = youtube
              ? youtubeThumbnail(mediaUrl)
              : category === 'FLYER'
                ? mediaUrl
                : getString(item, ['thumbnail_url', 'thumbnail', 'poster_url'], '/sermon_thumb.jpg');
            const liked = likedIds.has(id);

            return (
              <article key={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3 sm:px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-blue-700">
                        <Icon className="h-3.5 w-3.5" />
                        {categoryLabel(category)}
                      </div>
                      <h2 className="mt-1.5 truncate text-base font-bold text-slate-900">{titleValue}</h2>
                      <p className="mt-1 text-sm text-slate-600">{speakerValue}</p>
                    </div>
                    {dateValue && <span className="shrink-0 text-xs text-slate-400">{dateValue}</span>}
                  </div>
                </div>

                <div className={"relative h-56 overflow-hidden sm:h-60 " + (category === 'FLYER' ? 'bg-slate-50' : 'bg-slate-900') + ""}>
                  {playing && category === 'SPECIAL_VIDEO' && !youtube ? (
                    <>
                      <video
                        key={`${id}-video`}
                        src={mediaUrl}
                        controls
                        autoPlay
                        playsInline
                        className="absolute inset-0 h-full w-full bg-black object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setPlayingId(null)}
                        className="absolute right-3 top-3 z-10 rounded-full bg-black/70 p-2 text-white shadow-lg transition hover:bg-black"
                        aria-label="Close video player"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : playing && category === 'SERMON_AUDIO' && !youtube ? (
                    <div className="flex h-full items-center justify-center bg-slate-900 px-6">
                      <audio src={mediaUrl} controls autoPlay className="w-full" />
                      <button
                        type="button"
                        onClick={() => setPlayingId(null)}
                        className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white shadow-lg transition hover:bg-black"
                        aria-label="Close audio player"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <img
                        src={thumbnail}
                        alt=""
                        className={"absolute inset-0 h-full w-full " + (category === 'FLYER' ? 'object-contain p-1' : 'object-cover') + ""}
                        onError={(event) => {
                          event.currentTarget.src = '/sermon_thumb.jpg';
                        }}
                      />

                      {youtube && (
                        <button
                          type="button"
                          onClick={() => openExternal(mediaUrl)}
                          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
                          aria-label={`Open ${titleValue} on YouTube`}
                        />
                      )}

                      {category === 'SPECIAL_VIDEO' && !youtube && (
                        <button
                          type="button"
                          onClick={() => setPlayingId(id)}
                          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl transition hover:scale-105 hover:bg-blue-800"
                          aria-label={`Play ${titleValue}`}
                        >
                          <Play className="ml-0.5 h-6 w-6 fill-current" />
                        </button>
                      )}

                      {category === 'SERMON_AUDIO' && !youtube && (
                        <button
                          type="button"
                          onClick={() => setPlayingId(id)}
                          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl transition hover:scale-105 hover:bg-blue-800"
                          aria-label={`Play ${titleValue}`}
                        >
                          <Play className="ml-0.5 h-6 w-6 fill-current" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-3 px-4 py-3 sm:px-4">
                  {descriptionValue && <p className="text-sm leading-6 text-slate-600">{descriptionValue}</p>}

                  <div className="flex flex-wrap items-center gap-2">
                    {category === 'FLYER' && mediaUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => openExternal(mediaUrl)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Flyer
                        </button>
                        <a
                          href={mediaUrl}
                          download
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5 rotate-180" />
                          Download Flyer
                        </a>
                      </>
                    )}

                    {category !== 'FLYER' && youtube && (
                      <button
                        type="button"
                        onClick={() => openExternal(mediaUrl)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Watch on YouTube
                      </button>
                    )}

                    {category !== 'FLYER' && !youtube && mediaUrl && (
                      <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Media
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleLike(id)}
                      className={"inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition " + (liked ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50') + ""}
                      aria-pressed={liked}
                      aria-label={liked ? `Remove like from ${titleValue}` : `Like ${titleValue}`}
                    >
                      <Heart className={"h-3.5 w-3.5 " + (liked ? 'fill-current' : '') + ""} />
                      {liked ? 'Liked' : 'Like'}
                    </button>

                    {category !== 'FLYER' && youtube ? null : mediaUrl ? (
                      <a
                        href={mediaUrl}
                        download={category !== 'SPECIAL_VIDEO' || !youtube}
                        target={category === 'SPECIAL_VIDEO' && youtube ? '_blank' : undefined}
                        rel={category === 'SPECIAL_VIDEO' && youtube ? 'noreferrer' : undefined}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5 rotate-180" />
                        Download
                      </a>
                    ) : null}

                    <span className="ml-auto text-xs text-slate-400">{downloads} download{downloads === 1 ? '' : 's'}</span>

                    {canManage && (
                      <button
                        type="button"
                        disabled={deletingId === id}
                        onClick={() => void handleDelete(id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        {deletingId === id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 pt-6 sm:pt-8">
          <div className="w-full max-w-xl max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-4rem)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Media / Flyer</h2>
                <p className="mt-0.5 text-xs text-slate-500">Publish a fellowship resource to the media repository.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUpload(false);
                  resetUploadForm();
                }}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close upload modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Media Category</label>
                <select
                  value={uploadCategory}
                  onChange={(event) => {
                    const next = event.target.value as UploadCategory;
                    setUploadCategory(next);
                    if (next === 'FLYER') setSourceType('FILE');
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="SPECIAL_VIDEO">Special Service Video Recording</option>
                  <option value="SERMON_AUDIO">Sermon Audio / Recording</option>
                  <option value="FLYER">Program Flyer / Announcement Poster</option>
                </select>
              </div>

              {uploadCategory !== 'FLYER' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Media Source</label>
                  <select
                    value={sourceType}
                    onChange={(event) => setSourceType(event.target.value as SourceType)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="FILE">Upload a file</option>
                    <option value="YOUTUBE">Use a YouTube link</option>
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Media Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. AFIT Fellowship Service Message"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Speaker / Unit Lead</label>
                <input
                  value={speaker}
                  onChange={(event) => setSpeaker(event.target.value)}
                  placeholder="e.g. Pastor / Bro. Samuel Okosun or Media Unit"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Brief Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Add details about the sermon, event theme, or service notes..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {sourceType === 'YOUTUBE' && uploadCategory !== 'FLYER' ? (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">YouTube Link</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Select File to Upload</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    required
                    accept={
                      uploadCategory === 'FLYER'
                        ? 'image/*'
                        : uploadCategory === 'SERMON_AUDIO'
                          ? 'audio/*'
                          : 'video/*'
                    }
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">Stored in the existing Supabase media-files bucket.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpload(false);
                    resetUploadForm();
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? 'Publishing...' : 'Publish to Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
