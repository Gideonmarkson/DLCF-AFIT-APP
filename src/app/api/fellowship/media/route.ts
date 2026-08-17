import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MEDIA_BUCKET = 'media-files';
const ALLOWED_ROLES = ['ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE'] as const;
const ALLOWED_CATEGORIES = ['FLYER', 'SERMON_AUDIO', 'SPECIAL_VIDEO'] as const;

type Category = (typeof ALLOWED_CATEGORIES)[number];
type SourceType = 'FILE' | 'YOUTUBE';
type Row = Record<string, unknown>;

const FIELD_CANDIDATES = {
  title: ['title', 'media_title', 'name'],
  category: ['category', 'media_category', 'media_type', 'type'],
  speaker: ['speaker_or_unit', 'speaker', 'speaker_name', 'author'],
  description: ['description', 'details', 'summary'],
  url: ['media_url', 'file_url', 'url', 'source_url', 'youtube_url', 'youtube_link', 'link'],
  sourceType: ['source_type', 'source', 'media_source'],
  storagePath: ['storage_path', 'file_path', 'storage_key', 'path'],
  uploadedBy: ['uploaded_by', 'created_by', 'user_id', 'owner_id'],
  fileSize: ['file_size_bytes', 'file_size', 'size_bytes'],
  downloads: ['download_count', 'downloads'],
} as const;

function isAuthorizedRole(value: unknown): value is (typeof ALLOWED_ROLES)[number] {
  return ALLOWED_ROLES.includes(value as (typeof ALLOWED_ROLES)[number]);
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

function pickExistingKey(row: Row, candidates: readonly string[], fallback: string) {
  const key = candidates.find((candidate) =>
    Object.prototype.hasOwnProperty.call(row, candidate)
  );
  return key ?? fallback;
}

function firstRow(sample: Row[] | null | undefined) {
  return sample && sample.length > 0 ? sample[0] : {};
}

function findUnknownColumn(message: string, current: Row) {
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column [^ ]+\.([^ ]+) does not exist/i,
    /column "([^"]+)" of relation/i,
    /column '([^']+)' does not exist/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    const candidate = match?.[1];
    if (candidate && Object.prototype.hasOwnProperty.call(current, candidate)) {
      return candidate;
    }
  }

  return null;
}

async function insertMedia(supabase: Awaited<ReturnType<typeof createClient>>, payload: Row) {
  let current = { ...payload };

  // The current repository already has a media_items table, but its exact column
  // names have changed during the project's recovery work. Retry only when
  // PostgREST explicitly reports an unknown column, removing that field.
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const { data, error } = await supabase
      .from('media_items')
      .insert(current)
      .select('*')
      .single();

    if (!error) return { data, error: null };

    const unknownColumn = findUnknownColumn(error.message, current);
    if (!unknownColumn) return { data: null, error };

    delete current[unknownColumn];
  }

  return {
    data: null,
    error: new Error('Unable to determine the current media_items schema.'),
  };
}

async function getUserAndProfile() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { supabase, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  return { supabase, user, profile };
}

export async function GET() {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('media_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Keep the repository usable even if a historical migration did not create
    // created_at on the table yet.
    const fallback = await supabase.from('media_items').select('*');
    if (fallback.error) {
      return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    }

    return NextResponse.json({
      items: fallback.data ?? [],
      canManage: isAuthorizedRole(profile?.role),
    });
  }

  return NextResponse.json({
    items: data ?? [],
    canManage: isAuthorizedRole(profile?.role),
  });
}

export async function POST(request: Request) {
  const { supabase, user, profile } = await getUserAndProfile();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  if (!isAuthorizedRole(profile?.role)) {
    return NextResponse.json(
      { error: 'You are not authorized to publish fellowship media.' },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const category = String(formData.get('category') ?? '') as Category;
  const sourceType = String(formData.get('sourceType') ?? 'FILE') as SourceType;
  const title = String(formData.get('title') ?? '').trim();
  const speaker = String(formData.get('speaker') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim();
  const file = formData.get('file');

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid media category.' }, { status: 400 });
  }

  if (!title || !speaker) {
    return NextResponse.json(
      { error: 'Media title and speaker/unit are required.' },
      { status: 400 }
    );
  }

  if (category === 'FLYER' && sourceType !== 'FILE') {
    return NextResponse.json(
      { error: 'Flyers must be uploaded as files.' },
      { status: 400 }
    );
  }

  let mediaUrl = '';
  let storagePath: string | null = null;
  let fileSize: number | null = null;

  if (sourceType === 'YOUTUBE') {
    if (category === 'FLYER' || !isYouTubeUrl(youtubeUrl)) {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube URL for this recording.' },
        { status: 400 }
      );
    }

    mediaUrl = youtubeUrl;
  } else {
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: 'Please choose a media file to upload.' },
        { status: 400 }
      );
    }

    const maxBytes = 250 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: 'The selected file is larger than the 250 MB upload limit.' },
        { status: 400 }
      );
    }

    const allowedForCategory =
      category === 'FLYER'
        ? file.type.startsWith('image/')
        : category === 'SERMON_AUDIO'
          ? file.type.startsWith('audio/')
          : file.type.startsWith('video/');

    if (!allowedForCategory) {
      return NextResponse.json(
        { error: 'The selected file type does not match the media category.' },
        { status: 400 }
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    storagePath = `fellowship/${user.id}/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);

    mediaUrl = publicUrl;
    fileSize = file.size;
  }

  const { data: sample } = await supabase
    .from('media_items')
    .select('*')
    .limit(1);

  const row = firstRow(sample);
  const titleKey = pickExistingKey(row, FIELD_CANDIDATES.title, 'title');
  const categoryKey = pickExistingKey(row, FIELD_CANDIDATES.category, 'category');
  const speakerKey = pickExistingKey(row, FIELD_CANDIDATES.speaker, 'speaker');
  const descriptionKey = pickExistingKey(row, FIELD_CANDIDATES.description, 'description');
  const urlKey = pickExistingKey(row, FIELD_CANDIDATES.url, 'media_url');
  const sourceKey = pickExistingKey(row, FIELD_CANDIDATES.sourceType, 'source_type');
  const storageKey = pickExistingKey(row, FIELD_CANDIDATES.storagePath, 'storage_path');
  const uploadedByKey = pickExistingKey(row, FIELD_CANDIDATES.uploadedBy, 'uploaded_by');
  const fileSizeKey = pickExistingKey(row, FIELD_CANDIDATES.fileSize, 'file_size_bytes');

  const payload: Row = {
    [titleKey]: title,
    [categoryKey]: category,
    [speakerKey]: speaker,
    [urlKey]: mediaUrl,
    [uploadedByKey]: user.id,
  };

  if (description) payload[descriptionKey] = description;
  if (Object.keys(row).includes(sourceKey)) payload[sourceKey] = sourceType;
  if (sourceType === 'FILE' && storagePath) payload[storageKey] = storagePath;
  if (sourceType === 'FILE' && fileSize !== null) payload[fileSizeKey] = fileSize;

  const inserted = await insertMedia(supabase, payload);

  if (inserted.error) {
    if (storagePath) {
      await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    }

    return NextResponse.json(
      { error: inserted.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ item: inserted.data }, { status: 201 });
}
