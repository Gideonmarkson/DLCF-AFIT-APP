'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    router.push('/login');
  };

  return (
    <div className="w-full max-w-md space-y-4 font-sans">
      <div className="text-center space-y-1.5">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#1E3A8A] shadow-md mx-auto">
          <Image src="/dlcf_afit_logo.png" alt="DLCF AFIT Official Logo" fill className="object-contain p-0.5" />
        </div>
        <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">DLCF AFIT</h1>
        <p className="text-xs font-extrabold text-[#1D4ED8]">Saintly Intellectuals Hub</p>
      </div>

      <Card className="border-[#E2E8F0] bg-white shadow-lg rounded-3xl">
        <CardHeader className="text-center space-y-1 pb-3">
          <CardTitle className="text-lg font-extrabold text-[#1F2937]">Set a New Password</CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold text-center">{error}</p>}

            <Button type="submit" variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
