import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from './DashboardShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, cgpa, email')
    .eq('id', user.id)
    .single();

  return (
    <DashboardShell
      initialRole={profile?.role ?? 'GENERAL_STUDENT'}
      userName={profile?.full_name ?? user.email ?? 'User'}
      userEmail={profile?.email ?? user.email ?? ''}
      cgpa={profile?.cgpa ?? 0}
    >
      {children}
    </DashboardShell>
  );
}