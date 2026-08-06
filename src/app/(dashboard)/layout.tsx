import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, cgpa, email, current_level, department, executive_office, phone_number, matric_number, tenure_session, avatar_url, fellowship_units')
    .eq('id', user.id)
    .single();

  return (
    <DashboardShell
      initialRole={profile?.role ?? 'GENERAL_STUDENT'}
      profile={{
        fullName: profile?.full_name ?? user.email ?? 'User',
        email: profile?.email ?? user.email ?? '',
        phone: profile?.phone_number ?? null,
        matricNumber: profile?.matric_number ?? null,
        cgpa: profile?.cgpa ?? 0,
        currentLevel: profile?.current_level ?? null,
        department: profile?.department ?? null,
        executiveOffice: profile?.executive_office ?? null,
        tenureSession: profile?.tenure_session ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        fellowshipUnits: profile?.fellowship_units ?? [],
      }}
    >
      {children}
    </DashboardShell>
  );
}
