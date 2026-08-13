'use client';

import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, BookOpenCheck, GraduationCap, MessageSquare, Search, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SearchResult = {
  id: string;
  title: string;
  description: string;
  category: 'People' | 'Forum' | 'Past Questions' | 'Scholarships';
  href: string;
  meta?: string;
};

const categoryIcon = {
  People: Users,
  Forum: MessageSquare,
  'Past Questions': BookOpenCheck,
  Scholarships: GraduationCap,
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState('');

  const grouped = useMemo(() => results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    (acc[result.category] ??= []).push(result);
    return acc;
  }, {}), [results]);

  useEffect(() => {
    const q = initialQuery.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? 'Search failed.');
        return payload;
      })
      .then((payload) => setResults(payload.results ?? []))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message ?? 'Search failed.');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [initialQuery]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const cleaned = query.trim();
    router.push(cleaned ? `/search?q=${encodeURIComponent(cleaned)}` : '/search');
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
          <Search className="w-5 h-5 text-[#1D4ED8]" /> Search Saintly Intellectuals Hub
        </h1>
        <p className="text-xs text-[#6B7280] font-medium">
          Search members, forum discussions, past questions, and scholarship opportunities.
        </p>
      </div>

      <form onSubmit={submitSearch} className="flex gap-2">
        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, department, topic, resource, or scholarship..."
          className="text-xs"
        />
        <Button type="submit" variant="primary" className="shrink-0 gap-1.5">
          <Search className="w-3.5 h-3.5" /> Search
        </Button>
      </form>

      {!initialQuery && (
        <Card className="border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <Search className="w-8 h-8 mx-auto text-[#CBD5E1]" />
          <p className="mt-3 text-sm font-extrabold text-[#1F2937]">Start with a keyword</p>
          <p className="mt-1 text-xs text-[#6B7280]">Try a member's name, a forum topic, a course code, or a scholarship name.</p>
        </Card>
      )}

      {loading && <p className="text-xs text-[#6B7280]">Searching the fellowship hub...</p>}
      {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

      {!loading && initialQuery && results.length === 0 && !error && (
        <Card className="border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <Search className="w-8 h-8 mx-auto text-[#CBD5E1]" />
          <p className="mt-3 text-sm font-extrabold text-[#1F2937]">No matches found</p>
          <p className="mt-1 text-xs text-[#6B7280]">Try a different spelling, broader keyword, or course code.</p>
        </Card>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => {
          const Icon = categoryIcon[category as keyof typeof categoryIcon];
          return (
            <section key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#1D4ED8]" />
                <h2 className="text-sm font-extrabold text-[#1F2937]">{category}</h2>
                <Badge variant="slate" className="text-[10px]">{items.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((result) => (
                  <button key={`${result.category}-${result.id}`} type="button" onClick={() => router.push(result.href)} className="text-left">
                    <Card className="h-full border-[#E2E8F0] bg-white p-4 shadow-xs transition-colors hover:border-[#93C5FD] hover:bg-[#F8FAFC]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-[#1F2937]">{result.title}</p>
                          <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">{result.description}</p>
                          {result.meta && <p className="mt-2 text-[10px] font-bold text-[#1D4ED8]">{result.meta}</p>}
                        </div>
                        <ArrowRight className="w-4 h-4 shrink-0 text-[#94A3B8]" />
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
