'use client';

import React, { useEffect, useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { Award, Plus, Trash2, ExternalLink, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

interface Scholarship {
  id: string;
  title: string;
  description: string | null;
  amount: string | null;
  deadline: string | null;
  application_url: string | null;
}

function countdown(deadline: string | null) {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  if (diffMs <= 0) return 'Closed';
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return `${days}d ${hours}h left`;
}

export default function ScholarshipsPage() {
  const { profile } = useRole();
  const isAcademicDirector = profile.executiveOffice === 'Academic Director';

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [error, setError] = useState('');

  const loadScholarships = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('scholarships').select('*').order('deadline', { ascending: true });
    setScholarships(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadScholarships(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: insertError } = await supabase.from('scholarships').insert({
      title,
      description: description || null,
      amount: amount || null,
      deadline: deadline || null,
      application_url: applicationUrl || null,
      created_by: user.id,
    });
    if (insertError) { setError(insertError.message); return; }

    setTitle(''); setDescription(''); setAmount(''); setDeadline(''); setApplicationUrl('');
    setShowForm(false);
    loadScholarships();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from('scholarships').delete().eq('id', id);
    loadScholarships();
  };

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1D4ED8]" /> Scholarships &amp; Grants Hub
          </h1>
          <p className="text-xs text-[#6B7280] font-medium">Managed by the Academic Director.</p>
        </div>
        {isAcademicDirector && (
          <Button size="sm" variant="primary" onClick={() => setShowForm(!showForm)} className="gap-1.5 text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Scholarship
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-[#E2E8F0] bg-white p-5 space-y-3 shadow-xs">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input placeholder="Title (e.g. PTDF Scholarship)" value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" required />
            <Input placeholder="Amount (e.g. ₦250,000)" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-xs" />
            <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="text-xs" />
            <Input placeholder="Application URL" value={applicationUrl} onChange={(e) => setApplicationUrl(e.target.value)} className="text-xs" />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-[#E2E8F0] p-2.5 text-xs"
              rows={2}
            />
            {error && <p className="text-xs text-red-600 font-bold sm:col-span-2">{error}</p>}
            <Button type="submit" variant="primary" size="sm" className="sm:col-span-2 text-xs font-bold">Save Scholarship</Button>
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
          scholarships.map((s) => (
            <Card key={s.id} className="border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#1F2937]">{s.title}</h3>
                {isAcademicDirector && (
                  <button onClick={() => handleDelete(s.id)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {s.amount && <div className="text-xs font-mono font-extrabold text-[#1D4ED8]">{s.amount}</div>}
              {s.description && <p className="text-[11px] text-[#6B7280] leading-relaxed">{s.description}</p>}
              <div className="flex items-center justify-between pt-1.5 border-t border-[#E2E8F0]">
                {s.deadline && (
                  <Badge variant={countdown(s.deadline) === 'Closed' ? 'slate' : 'gold'} className="gap-1 text-[10px]">
                    <Clock className="w-3 h-3" /> {countdown(s.deadline)}
                  </Badge>
                )}
                {s.application_url && (
                  <a href={s.application_url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-[#1D4ED8] flex items-center gap-1">
                    Apply <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
