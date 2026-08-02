'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
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
          <CardTitle className="text-lg font-extrabold text-[#1F2937]">Reset Your Password</CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Enter the email on your account and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {sent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 text-center">
              Check your inbox — a password reset link has been sent to {email}.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-[#1F2937]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              {error && <p className="text-xs text-red-600 font-bold text-center">{error}</p>}

              <Button type="submit" variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-[#6B7280] pt-2">
          <Link href="/login" className="flex items-center gap-1 font-extrabold text-[#1D4ED8] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
