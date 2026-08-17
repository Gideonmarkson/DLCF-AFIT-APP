import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MEDIA_BUCKET = 'media-files';
const ALLOWED_ROLES = ['ASSOCIATE_COORDINATOR', 'STUDENT_EXECUTIVE'] as const;

type Row = Record<string, unknown>;

const URL_KEYS = [
  'media_url',
  'file_url',
  'url',
  'source_url',
  'youtube_url',
  'youtube_link',
  'link',
] as const;

const STORAGE_KEYS = ['storage_path', 'file_path', 'storage_key', 'path'] as const;

function isAuthorizedRole(value: unknown) {
  return ALLOWED_ROLES.includes(value as (typeof ALLOWED_ROLES)[number]);
}

function pickString(row: Row, keys: readonly string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function extractStoragePath(row: Row) {
  const explicit = pickString(row, STORAGE_KEYS);
  if (explicit) {
    return explicit.replace(/^\/+/, '').replace(/^media-files\//, '');
  }

  const values = Object.values(row).filter((value): value is string => typeof value === 'string');
  const candidate = [...(URL_KEYS.map((key) => row[key]).filter((value): value is string => typeof value === 'string')), ...values]
    .find((value) => value.includes(`/storage/v1/object/public/${MEDIA_BUCKET}/`) || value.includes(`/storage/v1/object/sign/${MEDIA_BUCKET}/`));

  if (!candidate) return null;

  const publicMarker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const signedMarker = `/storage/v1/object/sign/${MEDIA_BUCKET}/`;
  const marker = candidate.includes(publicMarker) ? publicMarker : signedMarker;
  const index = candidate.indexOf(marker);
  if (index < 0) return null;

  try {
    return decodeURIComponent(candidate.slice(index + marker.length).split('?')[0]).replace(/^\/+/, '');
  } catch {
    return candidate.slice(index + marker.length).split('?')[0].replace(/^\/+/, '');
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!isAuthorizedRole(profile?.role)) {
    return NextResponse.json(
      { error: 'You are not authorized to delete fellowship media.' },
      { status: 403 }
    );
  }

  const { data: media, error: mediaError } = await supabase
    .from('media_items')
    .select('*')
    .eq('id', id)
    .single();

  if (mediaError || !media) {
    return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
  }

  const storagePath = extractStoragePath(media as Row);

  if (storagePath) {
    const { error: storageError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([storagePath]);

    if (storageError) {
      console.error('Fellowship media storage deletion failed:', storageError);
      return NextResponse.json(
        { error: 'The media file could not be removed from storage, so the database record was kept.' },
        { status: 500 }
      );
    }
  }

  const { error: deleteError } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Fellowship media database deletion failed:', deleteError);
    return NextResponse.json(
      { error: 'The media file was removed, but the database record could not be deleted.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
