'use client';

import React, { useEffect, useState } from 'react';
import { AcademicSubNav } from '@/components/academic/AcademicSubNav';
import { BookOpenCheck, Download, Upload, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/context/RoleContext';
import { createClient } from '@/lib/supabase/client';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  download_count: number;
  created_at: string;
}

export default function PastQuestionsPage() {
  const { profile } = useRole();
  const isAcademicDirector = profile.executiveOffice === 'Academic Director';

  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const loadResources = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('resources').select('*').eq('category', 'PAST_QUESTION').order('created_at', { ascending: false });
    setResources(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadResources(); }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newTitle || !newFile) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const path = `past-questions/${Date.now()}-${newFile.name}`;
    const { error: uploadError } = await supabase.storage.from('resources-files').upload(path, newFile);
    if (uploadError) { setError(uploadError.message); return; }
    const { data: publicUrlData } = supabase.storage.from('resources-files').getPublicUrl(path);

    const { error: insertError } = await supabase.from('resources').insert({
      uploaded_by: user.id,
      title: newTitle,
      description: newDescription || null,
      category: 'PAST_QUESTION',
      file_url: publicUrlData.publicUrl,
    });
    if (insertError) { setError(insertError.message); return; }

    setNewTitle('');
    setNewDescription('');
    setNewFile(null);
    loadResources();
  };

  const handleDownload = async (resource: Resource) => {
    const supabase = createClient();
    await supabase.from('resources').update({ download_count: resource.download_count + 1 }).eq('id', resource.id);
    window.open(resource.file_url, '_blank');
  };

  const filtered = resources.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 font-sans">
      <AcademicSubNav />
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
          <BookOpenCheck className="w-5 h-5 text-[#1D4ED8]" /> AFIT Past Questions Repository
        </h1>
        <p className="text-xs text-[#6B7280] font-medium">
          Uploaded and managed by the Academic Director.
        </p>
      </div>

      {isAcademicDirector && (
        <Card className="border-[#E2E8F0] bg-white p-5 space-y-3 shadow-xs">
          <div className="text-xs font-extrabold text-[#1D4ED8]">Upload a Past Question File</div>
          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input placeholder="Title (e.g. AEE 311 - 2023/2024)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="text-xs" required />
            <Input placeholder="Description (optional)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="text-xs" />
            <div className="sm:col-span-2 relative border-2 border-dashed border-[#CBD5E1] rounded-2xl p-3 text-center bg-[#F8FAFC]">
              <input type="file" onChange={(e) => setNewFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <span className="text-xs font-bold text-[#1F2937]">{newFile ? newFile.name : 'Click to select a file'}</span>
            </div>
            {error && <p className="text-xs text-red-600 font-bold sm:col-span-2">{error}</p>}
            <Button type="submit" variant="primary" size="sm" className="sm:col-span-2 text-xs font-bold gap-1.5">
              <Upload className="w-3.5 h-3.5" /> Upload
            </Button>
          </form>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search past questions..." className="pl-9 text-xs" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          <p className="text-xs text-[#6B7280]">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="sm:col-span-2 p-8 rounded-3xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] text-center text-xs text-[#6B7280]">
            No past questions uploaded yet.
          </div>
        ) : (
          filtered.map((r) => (
            <Card key={r.id} className="border-[#E2E8F0] bg-white p-4 space-y-2 shadow-xs">
              <div className="text-xs font-extrabold text-[#1F2937]">{r.title}</div>
              {r.description && <p className="text-[11px] text-[#6B7280]">{r.description}</p>}
              <div className="flex items-center justify-between pt-1">
                <Badge variant="slate" className="text-[10px]">{r.download_count} downloads</Badge>
                <Button size="sm" variant="outline" onClick={() => handleDownload(r)} className="text-[11px] gap-1 border-[#1D4ED8] text-[#1D4ED8]">
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
