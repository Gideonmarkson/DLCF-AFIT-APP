'use client';

import React, { useEffect, useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { Award, Plus, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/context/RoleContext';
import { holdsOffice } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Scholarship {
  id: string;
  title: string;
  description: string | null;
  amount: string | null;
  deadline: string | null;
  application_url: string | null;
}

function getCountdown(deadline: string | null, nowMs: number) {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - nowMs;
  if (Number.isNaN(diffMs)) return 'Invalid deadline';
  if (diffMs <= 0) return 'Closed';
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return `${days}d ${hours}h left`;
}

export default function ScholarshipsPage() {
  const { profile } = useRole();
  const isAcademicDirector = holdsOffice(
    profile.executiveOffice,
    profile.additionalOffices,
    'Academic Director'
  );

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [error, setError] = useState('');

  const loadScholarships = async () => {
    const supabase = createClient();
    const { data, error: loadError } = await supabase
      .from('scholarships')
      .select('*')
      .order('deadline', { ascending: true });

    if (loadError) {
      setActionError(loadError.message);
      setLoading(false);
      return;
    }

    setScholarships(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void loadScholarships();
  }, []);

  // Keep countdown/status current without touching the database.
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionError('');

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Scholarship title is required.');
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be signed in to add a scholarship.');
      return;
    }

    const { error: insertError } = await supabase.from('scholarships').insert({
      title: cleanTitle,
      description: description.trim() || null,
      amount: amount.trim() || null,
      deadline: deadline || null,
      application_url: applicationUrl.trim() || null,
      created_by: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle('');
    setDescription('');
    setAmount('');
    setDeadline('');
    setApplicationUrl('');
    setShowForm(false);
    await loadScholarships();
  };

  const handleDelete = async (scholarship: Scholarship) => {
    if (!isAcademicDirector || deletingId) return;

    const confirmed = window.confirm(
      `Delete “${scholarship.title}”?\n\nThis permanently removes the scholarship posting for all users. This action cannot be undone.`
    );
    if (!confirmed) return;

    setActionError('');
    setDeletingId(scholarship.id);

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from('scholarships')
        .delete()
        .eq('id', scholarship.id);

      if (deleteError) {
        setActionError(`Could not delete “${scholarship.title}”: ${deleteError.message}`);
        return;
      }

      setScholarships((current) => current.filter((item) => item.id !== scholarship.id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1D4ED8]" /> Scholarships &amp; Grants Hub
          </h1>
          <p className="text-xs text-[#6B7280] font-medium">
            Managed by the Academic Director.
          </p>
        </div>

        {isAcademicDirector && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowForm((current) => !current)}
            className="gap-1.5 text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5" /> Add Scholarship
          </Button>
        )}
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {actionError}
        </div>
      )}

      {showForm && (
        <Card className="border-[#E2E8F0] bg-white p-5 space-y-3 shadow-xs">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              placeholder="Title (e.g. PTDF Scholarship)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
              required
            />
            <Input
              placeholder="Amount (e.g. ₦250,000)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xs"
            />
            <Input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="text-xs"
            />
            <Input
              placeholder="Application URL"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              className="text-xs"
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-[#E2E8F0] p-2.5 text-xs"
              rows={2}
            />
            {error && (
              <p className="text-xs text-red-600 font-bold sm:col-span-2">{error}</p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="sm:col-span-2 text-xs font-bold"
            >
              Save Scholarship
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          <p className="text-xs text-[#6B7280]">Loading...</p>
        ) : scholarships.length === 0 ? (
          <div className="sm:col-span-2 p-8 rounded-3xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#6B7280]">
            No scholarships posted yet.
          </div>
        ) : (
          scholarships.map((scholarship) => {
            const status = getCountdown(scholarship.deadline, nowMs);
            const closed = status === 'Closed';
            const deleting = deletingId === scholarship.id;

            return (
              <Card
                key={scholarship.id}
                className="border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-[#1F2937] break-words">
                      {scholarship.title}
                    </h3>
                    {closed && (
                      <span className="mt-1 inline-block text-[10px] font-semibold text-[#6B7280]">
                        Application deadline has passed.
                      </span>
                    )}
                  </div>

                  {isAcademicDirector && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(scholarship)}
                      disabled={deleting}
                      aria-label={`Delete ${scholarship.title}`}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>

                {scholarship.amount && (
                  <div className="text-xs font-mono font-extrabold text-[#1D4ED8]">
                    {scholarship.amount}
                  </div>
                )}
                {scholarship.description && (
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    {scholarship.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0] gap-2">
                  {scholarship.deadline && status && (
                    <Badge
                      variant={closed ? 'slate' : 'gold'}
                      className="gap-1 text-[10px]"
                    >
                      <Clock className="w-3 h-3" /> {status}
                    </Badge>
                  )}

                  {scholarship.application_url && !closed && (
                    <a
                      href={scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-[#1D4ED8] flex items-center gap-1 ml-auto"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
