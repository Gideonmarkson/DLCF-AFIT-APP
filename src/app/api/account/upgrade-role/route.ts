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
    const { upgradeType, passcode, excoOffice } = payload;

    if (upgradeType !== 'exco' && upgradeType !== 'coordinator') {
      return NextResponse.json({ error: 'Invalid upgrade type' }, { status: 400 });
    }

    const expected = PASSCODES[upgradeType];
    if (!expected || passcode !== expected) {
      return NextResponse.json({ error: 'Invalid accreditation passcode' }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase server env values are missing.' }, { status: 500 });
    }
    const admin = createAdminClient(supabaseUrl, serviceRoleKey);

    // Only a GENERAL_STUDENT can self-upgrade this way. Anything else
    // (already Exco, already Coordinator, or an Admin) needs a different,
    // deliberately more manual process — not built yet, on purpose.
    const { data: currentProfile, error: fetchError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: 'Could not find your profile.' }, { status: 400 });
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
