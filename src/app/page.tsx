'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Users,
  House,
  ShieldCheck,
  Youtube,
  Twitter,
  Facebook,
  Instagram,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpContactsButton from '@/components/landing/HelpContactsButton';


export default function WelcomeLandingPage() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#1F2937] font-sans selection:bg-[#1D4ED8]/10 selection:text-[#1D4ED8]">

      {/* Site-wide faded watermark, same as the dashboard */}
      <div
        className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.05] z-0"
        style={{
          backgroundImage: 'url(/fellowship/dlcf-logo-badge.png)',
          backgroundSize: '40%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10">
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
              <div className="text-base font-extrabold tracking-tight leading-tight">
                <span className="text-[#1F2937] mr-1">DLCF</span>
                <span className="text-[#1D4ED8]">AFIT</span>
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
            EMPOWERING <span className="text-[#1D4ED8]">SAINTLY INTELLECTUALS</span> AT DLCF <span className="text-[#1D4ED8]">AFIT</span> KADUNA
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

      <section className="py-10 bg-white border-b border-[#E2E8F0]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-extrabold text-[#1F2937] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
      >
        <House className="w-4 h-4" />
        Portal Home
      </Link>

      <Link
        href="/academic/course-registration"
        className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-extrabold text-[#1F2937] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
      >
        <GraduationCap className="w-4 h-4" />
        Academic Network
      </Link>

      <Link
        href="/fellowship/excos"
        className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-extrabold text-[#1F2937] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
      >
        <Users className="w-4 h-4" />
        Student Excos
      </Link>

      <Link
        href="/fellowship/coordinators"
        className="flex items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-xs font-extrabold text-[#1F2937] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
      >
        <ShieldCheck className="w-4 h-4" />
        Associate Coordinators
      </Link>
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

            <div className="flex items-center justify-center">
              <HelpContactsButton />
            </div>
          </div>

          <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] font-medium gap-2">
            <div>
              © 2026 Deeper Life Campus Fellowship (DLCF), Air Force Institute of Technology (AFIT), Kaduna.
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-bold">
  <a
    href="https://youtube.com/@dlcfafit?si=rW_nA0xM7bBbqoxb"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#1D4ED8] transition-colors"
  >
    <Youtube className="w-3.5 h-3.5" />
    YouTube
  </a>

  <a
    href="https://x.com/DLCF_AFIT"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#1D4ED8] transition-colors"
  >
    <Twitter className="w-3.5 h-3.5" />
    X / Twitter
  </a>

  <a
    href="https://www.facebook.com/share/1FSGTr8ZG1/"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#1D4ED8] transition-colors"
  >
    <Facebook className="w-3.5 h-3.5" />
    Facebook
  </a>

  <a
    href="https://www.instagram.com/dlcfafit?igsh=NXhocTJ5eDVvM3Fi"
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#1D4ED8] transition-colors"
  >
    <Instagram className="w-3.5 h-3.5" />
    Instagram
  </a>

  <span className="hidden sm:inline text-[#CBD5E1]">•</span>
              <div className="flex items-center gap-1 text-[#1D4ED8]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" />
                Built for Academic &amp; Spiritual Excellence
              </div>
            </div>
          </div>
        </div>
      </footer>

      </div>
    </div>
  );
}
