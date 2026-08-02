'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Key, Phone, Building, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ASSOCIATE_COORDINATOR_ROLES = [
  'Sub-Group Associate coordinator',
  'Associate Coordinator (Brother)',
  'Associate Coordinator (Sister)',
];

export default function AssociateCoordinatorRegistrationPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleTitle, setRoleTitle] = useState('Sub-Group Associate coordinator');
  const [afitPosition, setAfitPosition] = useState('');
  const [authorizationKey, setAuthorizationKey] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/register/privileged', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationType: 'coordinator',
          passcode: authorizationKey,
          email,
          password,
          fullName,
          phone,
          department: afitPosition,
          level: null,
        }),
      });

      const contentType = response.headers.get('content-type');
      let result: any = {};
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON server response:', text);
        throw new Error('Registration failed. Please check your credentials or Supabase keys in .env.local.');
      }

      if (!response.ok) {
        throw new Error(result.error || 'Account creation failed.');
      }

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">DLCF AFIT</h1>
          <Badge variant="blue" className="text-[10px]">Staff Portal</Badge>
        </div>
        <p className="text-xs font-extrabold text-[#1D4ED8]">Associate Coordinator &amp; Patron Accreditation</p>
      </div>

      {/* Coordinator Register Card */}
      <Card className="border-[#E2E8F0] bg-white shadow-lg rounded-3xl">
        <CardHeader className="text-center space-y-1 pb-4">
          <CardTitle className="text-lg font-extrabold text-[#1F2937] flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
            Associate Coordinator Registration
          </CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Accreditation portal for appointed DLCF AFIT adult advisors &amp; staff patrons
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Associate Coordinator Role Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Associate Coordinator Role</label>
              <Select value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className="text-xs font-bold text-[#1D4ED8]">
                {ASSOCIATE_COORDINATOR_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Full Name &amp; Title</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="e.g. Pastor / Bro. Samuel Okosun"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 text-xs font-bold"
                  required
                />
              </div>
            </div>

            {/* Official AFIT Position / Staff Title */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">AFIT Staff Designation / Department</label>
              <div className="relative">
                <Building className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="e.g. Senior AFIT Academic Staff Patron"
                  value={afitPosition}
                  onChange={(e) => setAfitPosition(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Email Address & Phone Grid */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="email"
                    placeholder="e.g. samuel.okosun@afit.edu.ng or gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">WhatsApp / Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="tel"
                    placeholder="e.g. +234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Staff Passcode / Security Token */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Associate Coordinator Security Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="DLCF-STAFF-PASSCODE-2026"
                  value={authorizationKey}
                  onChange={(e) => setAuthorizationKey(e.target.value)}
                  className="pl-9 pr-10 text-xs font-mono uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-2.5 text-[#9CA3AF] hover:text-[#1D4ED8] transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Create Password */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#9CA3AF] hover:text-[#1D4ED8] transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-bold text-center mb-2">{error}</p>
            )}

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5 mt-2" disabled={loading}>
              {loading ? 'Accrediting Associate Coordinator...' : 'Register & Enter Governance Dashboard'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-[#6B7280] pt-2">
          <div>
            Student or Student Leader?{' '}
            <Link href="/register" className="font-extrabold text-[#1D4ED8] hover:underline">
              Standard Student Registration
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Associate Coordinator Governance Dashboard Access
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
