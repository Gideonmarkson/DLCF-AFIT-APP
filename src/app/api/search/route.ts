import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

type SearchResult = {
  id: string;
  title: string;
  description: string;
  category: 'People' | 'Forum' | 'Past Questions' | 'Scholarships';
  href: string;
  meta?: string;
};

const MAX_PER_CATEGORY = 6;
const MAX_QUERY_LENGTH = 80;

function cleanQuery(value: string) {
  return value
    .replace(/[%_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = cleanQuery(request.nextUrl.searchParams.get('q') ?? '');

  if (!q) {
    return NextResponse.json({ query: '', results: [] });
  }

  const pattern = `%${q}%`;

  // Important: forum_posts.target_unit is a Postgres enum
  // (church_unit_type), so it cannot safely be queried with ILIKE
  // through PostgREST. Searching title/content keeps the endpoint
  // compatible with the actual schema.
  //
  // The resources query intentionally does not select the optional
  // level column because search does not need it; this keeps search
  // resilient even while a level migration is being deployed.
  const [
    peopleResponse,
    forumResponse,
    resourcesResponse,
    scholarshipsResponse,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, department, current_level, executive_office')
      .or(
        `full_name.ilike.${pattern},department.ilike.${pattern},executive_office.ilike.${pattern}`
      )
      .order('full_name', { ascending: true })
      .limit(MAX_PER_CATEGORY),

    supabase
      .from('forum_posts')
      .select('id, title, content, created_at')
      .or(`title.ilike.${pattern},content.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(MAX_PER_CATEGORY),

    supabase
      .from('resources')
      .select('id, title, description, category')
      .eq('category', 'PAST_QUESTION')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('created_at', { ascending: false })
      .limit(MAX_PER_CATEGORY),

    supabase
      .from('scholarships')
      .select('id, title, description, deadline')
      .or(`title.ilike.${pattern},description.ilike.${pattern}`)
      .order('deadline', { ascending: true, nullsFirst: false })
      .limit(MAX_PER_CATEGORY),
  ]);

  const errors = [
    peopleResponse.error,
    forumResponse.error,
    resourcesResponse.error,
    scholarshipsResponse.error,
  ].filter(Boolean);

  if (errors.length) {
    console.error(
      'Search query error:',
      errors.map((error) => error?.message ?? error)
    );

    return NextResponse.json(
      { error: 'Search is temporarily unavailable.' },
      { status: 500 }
    );
  }

  const results: SearchResult[] = [
    ...(peopleResponse.data ?? []).map((row) => ({
      id: row.id,
      title: row.full_name ?? 'Unnamed member',
      description:
        [row.executive_office, row.department, row.current_level]
          .filter(Boolean)
          .join(' • ') || 'DLCF AFIT member',
      category: 'People' as const,
      href: '/fellowship/excos',
    })),

    ...(forumResponse.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description:
        row.content.length > 160
          ? `${row.content.slice(0, 157)}...`
          : row.content,
      category: 'Forum' as const,
      href: '/fellowship/forum',
    })),

    ...(resourcesResponse.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? 'AFIT past question resource',
      category: 'Past Questions' as const,
      href: '/academic/resources',
    })),

    ...(scholarshipsResponse.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? 'Scholarship opportunity',
      category: 'Scholarships' as const,
      href: '/academic/scholarships',
      meta: row.deadline
        ? new Date(row.deadline).toLocaleDateString()
        : undefined,
    })),
  ];

  return NextResponse.json({ query: q, results });
}
