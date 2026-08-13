import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const PUBLIC_LEADERSHIP_OFFICES = [
  'General Coordinator',
  'Assistant General Coordinator',
  'Secretarial Coordinator',
  'Follow-Up Coordinator',
] as const;

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Public leadership contacts: required Supabase environment variables are missing.');
    return NextResponse.json(
      { error: 'Leadership contacts are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, email, phone_number, executive_office')
    .in('executive_office', [...PUBLIC_LEADERSHIP_OFFICES])
    .order('executive_office', { ascending: true });

  if (error) {
    console.error('Public leadership contacts query failed:', error);
    return NextResponse.json(
      { error: 'Leadership contacts are temporarily unavailable.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const contacts = (data ?? []).map((contact) => ({
    full_name: contact.full_name,
    email: contact.email,
    phone_number: contact.phone_number,
    executive_office: contact.executive_office,
  }));

  return NextResponse.json(
    { contacts },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
