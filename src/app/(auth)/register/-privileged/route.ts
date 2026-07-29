import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PASSCODES: Record<string, string | undefined> = {
  exco: process.env.EXCO_PASSCODE,
  coordinator: process.env.STAFF_PASSCODE,
};

export async function POST(req: NextRequest) {
  const { registrationType, passcode, email, password, fullName, phone, department, level, cgpa, excoOffice } = await req.json();

  if (registrationType !== 'exco' && registrationType !== 'coordinator') {
    return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 });
  }

  const expected = PASSCODES[registrationType];
  if (!expected || passcode !== expected) {
    return NextResponse.json({ error: 'Invalid accreditation passcode' }, { status: 403 });
  }

  // service-role client — never imported anywhere client-side, only used after the check above
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? 'Could not create account' }, { status: 400 });
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    phone_number: phone,
    department: department ?? 'DLCF Staff/Advisor',
    current_level: registrationType === 'exco' ? level : null,
    role: registrationType === 'exco' ? 'STUDENT_EXECUTIVE' : 'ASSOCIATE_COORDINATOR',
    ...(registrationType === 'exco' && { executive_office: excoOffice, cgpa: Number(cgpa) || 0 }),
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authData.user.id); // don't leave an orphaned auth user
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
