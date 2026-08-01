'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Award, Key, GraduationCap, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFIT_DEPARTMENTS, DLCF_EXCO_PORTFOLIOS } from '@/lib/constants';

export default function ExcoRegistrationPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [excoOffice, setExcoOffice] = useState('General Coordinator');
  const [department, setDepartment] = useState('B.Eng Aerospace Engineering');
  const [level, setLevel] = useState('400');
  const [cgpa, setCgpa] = useState('4.75');
  const [accreditationToken, setAccreditationToken] = useState('');
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
          registrationType: 'exco',
          passcode: accreditationToken,
          email,
          password,
          fullName,
          phone,
          department,
          level,
          cgpa,
          excoOffice,
        }),
      });

      const result = await response.json();
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
          <Badge variant="role" className="text-[10px]">Exco Portal</Badge>
        </div>
        <p className="text-xs font-extrabold text-[#1D4ED8]">Student Executive Leadership Accreditation</p>
      </div>

      {/* Exco Register Card */}
      <Card className="border-[#E2E8F0] bg-white shadow-lg rounded-3xl">
        <CardHeader className="text-center space-y-1 pb-4">
          <CardTitle className="text-lg font-extrabold text-[#1F2937] flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-[#1D4ED8]" />
            Student Leader Registration
          </CardTitle>
          <CardDescription className="text-xs text-[#6B7280]">
            Accreditation portal for appointed DLCF AFIT student executive leaders
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Executive Office Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Executive Office / Portfolio</label>
              <Select value={excoOffice} onChange={(e) => setExcoOffice(e.target.value)} className="text-xs font-bold text-[#1D4ED8]">
                {DLCF_EXCO_PORTFOLIOS.map((office) => (
                  <option key={office} value={office}>
                    {office}
                  </option>
                ))}
              </Select>
            </div>

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

            {/* Email Address & Phone Number Grid */}
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

            {/* Department & Level Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Department</label>
                <Select value={department} onChange={(e) => setDepartment(e.target.value)} className="text-xs">
                  {AFIT_DEPARTMENTS.slice(0, 10).map((dept) => (
                    <option key={dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Level</label>
                <Select value={level} onChange={(e) => setLevel(e.target.value)} className="text-xs font-bold">
                  <option value="200">200L</option>
                  <option value="300">300L</option>
                  <option value="400">400L</option>
                  <option value="500">500L</option>
                  <option value="ND2">ND 2</option>
                  <option value="HND1">HND 1</option>
                  <option value="HND2">HND 2</option>
                </Select>
              </div>
            </div>

            {/* CGPA & Exco Accreditation Passcode */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Current CGPA</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="5.00"
                    placeholder="4.75"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="pl-9 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-extrabold text-[#1F2937]">Exco Passcode</label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
                  <Input
                    type="password"
                    placeholder="DLCF-EXCO-2026"
                    value={accreditationToken}
                    onChange={(e) => setAccreditationToken(e.target.value)}
                    className="pl-9 text-xs font-mono uppercase"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-[#1F2937]">Create Password</label>
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

          {/* Submit Button */}
              {error && <p className="text-xs text-red-600 font-bold text-center mb-2">{error}</p>}
              <Button type="submit" variant="primary" className="w-full text-xs font-bold gap-2 rounded-xl py-2.5 mt-2" disabled={loading}>
                {loading ? 'Accrediting Exco Leadership...' : 'Register & Enter Student Exco Dashboard'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
    
          <CardFooter className="flex flex-col space-y-2 text-center text-xs text-[#6B7280] pt-2">
            <div>
              Regular student member?{' '}
              <Link href="/register" className="font-extrabold text-[#1D4ED8] hover:underline">
                Standard Student Registration
              </Link>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Student Executive Directorate Dashboard Access
            </div>
          </CardFooter>
        </Card>
      </div>
      );
    }
