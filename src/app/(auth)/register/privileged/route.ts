import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/resend';

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
    return trimmed.toUpperCase();
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
      matricNo,
      tenureSession,
      coordinatorRoleTitle,
    } = payload;

    if (!email || !password || !fullName || !department) {
      return NextResponse.json({ error: 'Missing required registration fields' }, { status: 400 });
    }

    if (registrationType !== 'student' && registrationType !== 'exco' && registrationType !== 'coordinator') {
      return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 });
    }

    if (registrationType !== 'student') {
      const expected = PASSCODES[registrationType as string];
      if (!expected || passcode !== expected) {
        return NextResponse.json({ error: 'Invalid accreditation passcode' }, { status: 403 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server env values are missing. Restart Next after updating .env.local.' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const role = registrationType === 'student'
      ? 'GENERAL_STUDENT'
      : registrationType === 'exco'
        ? 'STUDENT_EXECUTIVE'
        : 'ASSOCIATE_COORDINATOR';

    // An account with this email already exists. Never reset someone else's
    // password or role from an unauthenticated request just because the
    // caller supplied a matching email — that's not proof of who's asking.
    // The real path for an existing user to gain a new role is
    // /api/account/upgrade-role, which requires their own active session.
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email as string)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Sign in and use "Apply for Executive / Associate Coordinator Access" in your Profile Settings instead.' },
        { status: 409 }
      );
    }

    // Create fresh user account
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: email as string,
      password: password as string,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
        department,
        role,
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? 'Could not create account' }, { status: 400 });
    }

    const profileInsert = {
      id: authData.user.id,
      email,
      full_name: fullName,
      phone_number: phone ?? null,
      department,
      current_level: registrationType === 'student' || registrationType === 'exco' ? normalizeLevel(level) : null,
      matric_number: registrationType === 'student' ? matricNo ?? null : null,
      role,
      executive_office:
        registrationType === 'exco'
          ? excoOffice ?? null
          : registrationType === 'coordinator'
            ? coordinatorRoleTitle ?? null
            : null,
      tenure_session: registrationType === 'exco' ? tenureSession ?? null : null,
      cgpa: registrationType === 'exco' ? Number(cgpa) || 0 : 0,
    };

    const { error: profileError } = await admin.from('profiles').insert(profileInsert);

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    sendWelcomeEmail({ toEmail: email as string, fullName: fullName as string, role }).catch((err) =>
      console.error('Welcome email failed (non-blocking):', err)
    );

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
