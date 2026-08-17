import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function getSignedInUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

async function ensureMediaExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mediaId: string,
) {
  const { data, error } = await supabase
    .from('media_items')
    .select('id')
    .eq('id', mediaId)
    .single();

  if (error || !data) return false;
  return true;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user } = await getSignedInUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  if (!(await ensureMediaExists(supabase, id))) {
    return NextResponse.json({ error: 'Media item not found.' }, { status: 404 });
  }

  const { error } = await supabase
    .from('media_likes')
    .upsert(
      {
        media_id: id,
        user_id: user.id,
      },
      { onConflict: 'media_id,user_id', ignoreDuplicates: true },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user } = await getSignedInUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('media_likes')
    .delete()
    .eq('media_id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ liked: false });
}
