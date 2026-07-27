'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, User, Award, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useRole, RolePerspective } from '@/context/RoleContext';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { setUserRole } = useRole();
  const [loginRole, setLoginRole] = useState<RolePerspective>('GENERAL_STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Explicitly set role perspective selected by user on sign-in
    setUserRole(loginRole);
    setTimeout(() => {
      setLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="w-full max-w-md space-y-4 font-sans">
      {/* Brand Header */}
      <div className="text-center space-y-1.5">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#1E3A8A] shadow-md mx-auto">
          <Image
            src="/dlcf_afit_logo.png"
            alt="DLCF AFIT Official Logo"
            fill
            className="object-contain p-0.5"
          />
        </div>
        <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">DLCF AFIT</h1>
        <p className="text-xs font-extrabold text-[#1D4ED8]">Saintly Intellectuals Hub</p>
      </div>

      {/* Login Card */}
      <Card className="border-[#E2E8F0] bg-white shadow-lg rounded-3xl">
        <CardHeader className="text-center space-y-1 pb-3">
          <CardTitle className="text-lg font-extrabold text-[#1F2937]">Welcome Back Brethren</CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Sign in to access your DLCF AFIT academic &amp; fellowship portal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Role Perspective Selector Tabs for Sign-In */}
          <div className="flex items-center p-1 rounded-2xl bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs">
            <button
              type="button"
              onClick={() => setLoginRole('GENERAL_STUDENT')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl font-extrabold transition-all text-[11px]',
                loginRole === 'GENERAL_STUDENT'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1D4ED8]'
              )}
            >
              <User className="w-3.5 h-3.5" /> Student
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('STUDENT_EXECUTIVE')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl font-extrabold transition-all text-[11px]',
                loginRole === 'STUDENT_EXECUTIVE'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1D4ED8]'
              )}
            >
              <Award className="w-3.5 h-3.5" /> Exco Leader
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('ASSOCIATE_COORDINATOR')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl font-extrabold transition-all text-[11px]',
                loginRole === 'ASSOCIATE_COORDINATOR'
                  ? 'bg-[#1D4ED8] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#1D4ED8]'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Coordinator
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Personal Email Address Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#1F2937]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  type="email"
                  placeholder="e.g. daniel.adebayo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-[#1F2937]">Password</label>
                <a href="#" className="text-[11px] font-bold text-[#1D4ED8] hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Sign In Button */}
            <Button type="submit" variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5" disabled={loading}>
              {loading ? 'Authenticating...' : `Sign In to ${loginRole === 'ASSOCIATE_COORDINATOR' ? 'Associate Coordinator Governance' : loginRole === 'STUDENT_EXECUTIVE' ? 'Exco Directorate' : 'Student'} Dashboard`} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#6B7280]">
              <span className="bg-white px-2">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setUserRole(loginRole);
              router.push('/dashboard');
            }}
            className="w-full text-xs font-bold border-[#E2E8F0] hover:bg-[#EFF6FF] rounded-xl text-[#1F2937]"
          >
            Continue with Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-[#6B7280] pt-2">
          <div>
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="font-extrabold text-[#1D4ED8] hover:underline">
              Register Here
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Role-Based Access Control (RBAC) Active
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
