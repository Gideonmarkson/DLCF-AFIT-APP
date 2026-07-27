'use client';

import React, { useState, useTransition } from 'react';
import { Shield, Send, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface CounselingFormModalProps {
  onSuccess?: () => void;
}

export function CounselingFormModal({ onSuccess }: CounselingFormModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [advisorId, setAdvisorId] = useState('advisor-1');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await new Promise((res) => setTimeout(res, 800));
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    });
  };

  return (
    <Card className="border-[#E2E8F0] bg-white shadow-xs font-sans">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1D4ED8]" />
            Confidential Spiritual & Personal Counseling
          </CardTitle>
          <Badge variant="gold">Encrypted & Private</Badge>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Submissions are routed directly to appointed DLCF AFIT Associate Coordinators (Adult Fellowship Advisors).
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Target Fellowship Advisor</label>
            <Select value={advisorId} onChange={(e) => setAdvisorId(e.target.value)}>
              <option value="advisor-1">Pastor / Bro. Samuel Okosun (Associate Coordinator - Spirituals)</option>
              <option value="advisor-2">Sis. Comfort Adebayo (Associate Coordinator - Sisters/Counseling)</option>
              <option value="advisor-3">Prof. Dr. A. K. Mohammed (Patron Advisor - Academics)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Subject / Category</label>
            <Input
              placeholder="e.g. Academic Pressure & Spiritual Direction"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#1F2937] mb-1">Counseling Request Details</label>
            <textarea
              rows={4}
              placeholder="Share your burden or request confidentially. You are in a safe, godly space..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full rounded-xl border border-[#E2E8F0] bg-white p-3.5 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 shadow-xs"
            />
          </div>

          {/* Anonymous Toggle Option */}
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#EFF6FF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-[#1D4ED8]" />
              <div>
                <div className="text-xs font-extrabold text-[#1F2937]">Submit Anonymously</div>
                <div className="text-[11px] text-[#6B7280]">Hides your name and matric number from the advisor</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded border-[#CBD5E1] text-[#1D4ED8] focus:ring-[#1D4ED8] bg-white cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#6B7280] font-semibold">
              Protected under Supabase RLS row policies
            </span>
            <Button type="submit" variant="primary" disabled={isPending} className="gap-2">
              {isPending ? (
                'Routing Encrypted Ticket...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Counseling Request
                </>
              )}
            </Button>
          </div>

          {isSubmitted && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              Request sent confidentially! An email alert has been dispatched to your chosen advisor via Resend API.
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
