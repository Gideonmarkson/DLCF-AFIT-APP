'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ShieldCheck, GraduationCap, Phone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { DepartmentSelect } from '@/components/shared/DepartmentSelect';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [matricNo, setMatricNo] = useState('');
  const [department, setDepartment] = useState('B.Eng Aerospace Engineering');
  const [level, setLevel] = useState('300');
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
          registrationType: 'student',
          email,
          password,
          fullName,
          phone,
          department,
          level,
          matricNo,
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
        throw new Error(result.error || 'An error occurred during registration.');
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
        <h1 className="text-xl font-extrabold text-[#1F2937] tracking-tight">DLCF AFIT</h1>
        <p className="text-xs font-extrabold text-[#1D4ED8]">Saintly Intellectuals Hub</p>
      </div>

      {/* Register Card */}
      <Card className="border-[#E2E8F0] bg-white shadow-lg rounded-3xl">
        <CardHeader className="text-center space-y-1 pb-4">
          <CardTitle className="text-lg font-extrabold text-[#1F2937]">Create Student / Member Account</CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Sign up to access your DLCF AFIT academic &amp; fellowship portal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Executive & Associate Coordinator Portal Switcher Banners */}
          <div className="grid grid-cols-2 gap-2">
            <Link href="/register/exco" className="w-full">
              <Button size="sm" variant="outline" className="w-full text-[10px] font-extrabold border-[#1D4ED8] text-[#1D4ED8] bg-[#EFF6FF]">
                Exco Portal →
              </Button>
            </Link>

            <Link href="/register/coordinator" className="w-full">
              <Button size="sm" variant="outline" className="w-full text-[10px] font-extrabold border-[#1D4ED8] text-[#1D4ED8] bg-white">
                Associate Coordinator Portal →
              </Button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="e.g. Brother Daniel Adebayo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Email Address & WhatsApp / Phone Number */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Email Address</label>
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

            {/* Matriculation / Registration No */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">AFIT Matriculation / Reg No</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="e.g. AFIT/ENG/AEE/2021/042"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  className="pl-9 text-xs font-mono uppercase"
                  required
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">AFIT Department</label>
              <DepartmentSelect value={department} onChange={setDepartment} className="text-xs" showCategory />
            </div>

            {/* Level Dropdown */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Current Level</label>
              <Select value={level} onChange={(e) => setLevel(e.target.value)} className="text-xs font-bold">
                <option value="Remedial">Remedial Studies</option>
                <option value="IJMB">IJMB Programme</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="500">500 Level</option>
                <option value="ND1">ND 1</option>
                <option value="ND2">ND 2</option>
                <option value="HND1">HND 1</option>
                <option value="HND2">HND 2</option>
              </Select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Password</label>
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

            {/* Error Message Display */}
            {error && (
              <p className="text-xs text-red-600 font-bold text-center mb-2">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5 mt-2" disabled={loading}>
              {loading ? 'Registering Account...' : 'Register & Enter Student Dashboard'} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 text-center text-xs text-[#6B7280] pt-2">
          <div>
            Already registered?{' '}
            <Link href="/login" className="font-extrabold text-[#1D4ED8] hover:underline">
              Sign In Here
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Standard Student Dashboard Access
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}