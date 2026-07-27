'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomeLandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">
      
      {/* ================= 1. TOP NAVIGATION BAR ================= */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#1E3A8A] shadow-sm group-hover:scale-105 transition-transform">
              <Image
                src="/dlcf_afit_logo.png"
                alt="DLCF AFIT Official Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#1F2937] tracking-tight leading-tight">
                DLCF AFIT
              </div>
              <div className="text-[10px] font-extrabold text-[#1D4ED8]">
                Air Force Institute of Technology
              </div>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold text-[#4B5563]">
            <Link href="/dashboard" className="hover:text-[#1D4ED8] transition-colors">
              Home Dashboard
            </Link>
            <Link href="/academic/course-registration" className="hover:text-[#1D4ED8] transition-colors">
              Academic Excellence
            </Link>
            <Link href="/spiritual/counseling" className="hover:text-[#1D4ED8] transition-colors">
              Counseling
            </Link>
            <Link href="/fellowship/excos" className="hover:text-[#1D4ED8] transition-colors">
              Student Excos
            </Link>
            <Link href="/fellowship/coordinators" className="hover:text-[#1D4ED8] transition-colors">
              Associate Coordinators
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="outline" size="sm" className="text-xs border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF] rounded-xl font-bold">
                Sign In
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="text-xs gap-1.5 rounded-xl font-bold">
                Access Hub Portal <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= 2. HERO BANNER SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#EFF6FF]/40 to-[#F8FAFC] py-16 lg:py-24 border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFF6FF] border border-[#1D4ED8]/20 text-xs font-extrabold text-[#1D4ED8] shadow-2xs animate-fadeIn">
            Official DLCF AFIT Academic &amp; Spiritual Hub
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1F2937] tracking-tight max-w-4xl mx-auto leading-tight">
            EMPOWERING <span className="text-[#1D4ED8]">SAINTLY INTELLECTUALS</span> AT AFIT KADUNA
          </h1>

          <p className="text-sm sm:text-base text-[#4B5563] max-w-2xl mx-auto font-medium leading-relaxed">
            A unified digital ecosystem combining academic peer-mentorship, confidential Counseling, daily devotionals, past questions repository, and executive fellowship governance.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-sm gap-2 rounded-2xl font-bold px-8 shadow-md">
                Enter Fellowship Hub Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/academic/course-registration" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm gap-2 rounded-2xl font-bold px-8 border-[#1D4ED8] text-[#1D4ED8] hover:bg-[#EFF6FF]">
                <GraduationCap className="w-4 h-4" /> Explore Academic Excellence
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 3. IMPACT & PERFORMANCE METRICS GRID ================= */}
      <section className="py-12 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#1D4ED8]">
              HUB METRICS &amp; PERFORMANCE
            </h2>
            <p className="text-xl font-extrabold text-[#1F2937] mt-1">
              Built to foster academic distinction and spiritual integrity across all AFIT departments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1 shadow-2xs hover:border-[#1D4ED8] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1D4ED8]">100%</div>
              <div className="text-xs font-extrabold text-[#1F2937]">Confidential RLS Security</div>
              <p className="text-[11px] text-[#6B7280] font-medium">Protected Result Slips &amp; Counseling</p>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1 shadow-2xs hover:border-[#1D4ED8] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#D97706]">4.82</div>
              <div className="text-xs font-extrabold text-[#1F2937]">Top Senior Mentor CGPA</div>
              <p className="text-[11px] text-[#6B7280] font-medium">Grade &apos;A&apos; Senior Brethren Paired</p>
            </div>

            {/* Metric 3 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1 shadow-2xs hover:border-[#1D4ED8] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1F2937]">248+</div>
              <div className="text-xs font-extrabold text-[#1F2937]">Tracked AFIT Students</div>
              <p className="text-[11px] text-[#6B7280] font-medium">Degree, ND &amp; HND Programmes</p>
            </div>

            {/* Metric 4 */}
            <div className="p-6 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-1 shadow-2xs hover:border-[#1D4ED8] transition-colors">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-600">100%</div>
              <div className="text-xs font-extrabold text-[#1F2937]">Intervention Resolution</div>
              <p className="text-[11px] text-[#6B7280] font-medium">Early CGPA &amp; Academic Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FOOTER ================= */}
      <footer className="bg-white border-t border-[#E2E8F0] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 border border-[#1E3A8A]">
                <Image src="/dlcf_afit_logo.png" alt="DLCF AFIT Logo" fill className="object-contain" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-[#1F2937]">DLCF AFIT Kaduna</div>
                <div className="text-xs text-[#6B7280]">Saintly Intellectuals Hub</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold text-[#4B5563]">
              <Link href="/dashboard" className="hover:text-[#1D4ED8]">Portal Home</Link>
              <Link href="/academic/course-registration" className="hover:text-[#1D4ED8]">Academic Network</Link>
              <Link href="/fellowship/excos" className="hover:text-[#1D4ED8]">Student Excos</Link>
              <Link href="/fellowship/coordinators" className="hover:text-[#1D4ED8]">Associate Coordinators</Link>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] font-medium gap-2">
            <div>
              © 2026 Deeper Life Campus Fellowship (DLCF), Air Force Institute of Technology (AFIT), Kaduna.
            </div>
            <div className="flex items-center gap-1 text-[#1D4ED8] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Built for Academic &amp; Spiritual Excellence
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
