import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';

const PASSCODES: Record<string, string | undefined> = {
  exco: process.env.EXCO_PASSCODE,
  coordinator: process.env.STAFF_PASSCODE,
};

export async function POST(req: NextRequest) {
  try {
    // Who is actually asking — read from their real session cookie, never
    // from anything the client claims in the request body.
    const sessionClient = await createServerClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to request a role upgrade.' }, { status: 401 });
    }

    const payload = (await req.json()) as Record<string, unknown>;
    const { upgradeType, passcode, excoOffice, tenureSession } = payload;

    if (!['exco', 'coordinator', 'change-office'].includes(upgradeType as string)) {
      return NextResponse.json({ error: 'Invalid upgrade type' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server env values are missing.' }, { status: 500 });
    }
    const admin = createAdminClient(supabaseUrl, serviceRoleKey);

    const { data: currentProfile, error: fetchError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Could not find your profile.' }, { status: 400 });
    }

    // Already an Exco, just reassigning portfolio — no re-accreditation needed,
    // but still server-side only (executive_office isn't self-editable via RLS).
    if (upgradeType === 'change-office') {
      if (currentProfile.role !== 'STUDENT_EXECUTIVE') {
        return NextResponse.json({ error: 'Only a current Student Executive can change their office.' }, { status: 403 });
      }
      const { error: updateError } = await admin
        .from('profiles')
        .update({ executive_office: excoOffice ?? null, tenure_session: tenureSession ?? null })
        .eq('id', user.id);
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // Fresh accreditation into Exco or Coordinator — passcode required,
    // and only a General Student can take this path.
    const expected = PASSCODES[upgradeType as string];
    if (!expected || passcode !== expected) {
      return NextResponse.json({ error: 'Invalid accreditation passcode' }, { status: 403 });
    }
    if (currentProfile.role !== 'GENERAL_STUDENT') {
      return NextResponse.json(
        { error: `Only a General Student account can request this upgrade. Your account is currently: ${currentProfile.role}.` },
        { status: 403 }
      );
    }

    const update: Record<string, unknown> = {
      role: upgradeType === 'exco' ? 'STUDENT_EXECUTIVE' : 'ASSOCIATE_COORDINATOR',
    };
    if (upgradeType === 'exco') {
      update.executive_office = excoOffice ?? null;
      update.tenure_session = tenureSession ?? null;
    }

    const { error: updateError } = await admin.from('profiles').update(update).eq('id', user.id);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Role upgrade failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error during role upgrade.' },
      { status: 500 }
    );
  }
}
