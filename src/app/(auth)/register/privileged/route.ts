import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PASSCODES: Record<string, string | undefined> = {
  exco: process.env.EXCO_PASSCODE,
  coordinator: process.env.STAFF_PASSCODE,
};

function normalizeLevel(level: unknown) {
  if (typeof level === 'number') return String(level);
  if (typeof level === 'string') {
    const trimmed = level.trim();
    const levelValue = Number(trimmed);
    if (Number.isFinite(levelValue)) {
      return String(levelValue);
    }

    const normalizedLabel = trimmed.toUpperCase();
    return normalizedLabel;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    console.log('Privileged registration raw body:', rawBody);

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const {
      registrationType,
      passcode,
      email,
      password,
      fullName,
      phone,
      department,
      level,
      cgpa,
      excoOffice,
    } = payload;

    if (!email || !password || !fullName || !department) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    if (registrationType === 'student') {
      // Standard student registrations use the same secure flow so the dashboard can read the profile row on sign-in.
    } else if (registrationType !== 'exco' && registrationType !== 'coordinator') {
      return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 });
    }

    if (registrationType !== 'student') {
      const expected = PASSCODES[registrationType];
      if (!expected || passcode !== expected) {
        return NextResponse.json({ error: 'Invalid accreditation passcode' }, { status: 403 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server env values are missing. Restart Next after updating .env.local.' }, { status: 500 });
    }

    const admin = createClient(
      supabaseUrl,
      serviceRoleKey
    );

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: email as string,
      password: password as string,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        department,
        role: registrationType === 'student' ? 'GENERAL_STUDENT' : registrationType === 'exco' ? 'STUDENT_EXECUTIVE' : 'ASSOCIATE_COORDINATOR',
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Could not create account' }, { status: 400 });
    }

    const role = registrationType === 'student'
      ? 'GENERAL_STUDENT'
      : registrationType === 'exco'
        ? 'STUDENT_EXECUTIVE'
        : 'ASSOCIATE_COORDINATOR';

    const profileInsert = {
      id: authData.user.id,
      email,
      full_name: fullName,
      phone_number: phone ?? null,
      department,
      current_level: registrationType === 'student' || registrationType === 'exco' ? normalizeLevel(level) : null,
      role,
      executive_office: registrationType === 'exco' ? excoOffice ?? null : null,
      cgpa: registrationType === 'exco' ? Number(cgpa) || 0 : 0,
    };

    const { error: profileError } = await admin.from('profiles').insert(profileInsert);

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Privileged registration failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected server error during registration.',
      },
      { status: 500 }
    );
  }
}
