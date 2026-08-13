'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  HelpCircle,
  Mail,
  Phone,
  X,
} from 'lucide-react';

interface LeadershipContact {
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  executive_office: string | null;
}

export default function HelpContactsButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<LeadershipContact[]>([]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    const loadContacts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/public/leadership-contacts', {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error ?? 'Unable to load fellowship contacts.');
        }

        setContacts(Array.isArray(payload?.contacts) ? payload.contacts : []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setContacts([]);
        setError(err instanceof Error ? err.message : 'Unable to load fellowship contacts.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadContacts();

    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 hover:text-[#1D4ED8] transition-colors"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <HelpCircle className="w-3.5 h-3.5" />
        Help
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1F2937]/55 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-contacts-title"
            className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-[#E2E8F0] bg-white p-5 sm:p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#1D4ED8]">
                  Need assistance?
                </p>
                <h2 id="help-contacts-title" className="mt-1 text-lg font-extrabold text-[#1F2937]">
                  Contact DLCF AFIT Leadership
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                  Reach the fellowship officers responsible for coordination, administration, and follow-up.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[#9CA3AF] hover:bg-[#F8FAFC] hover:text-[#1F2937] transition-colors"
                aria-label="Close help contacts"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-4">
              {loading && (
                <div className="py-10 text-center text-xs font-semibold text-[#6B7280]">
                  Loading current fellowship contacts…
                </div>
              )}

              {!loading && error && (
                <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!loading && !error && contacts.length === 0 && (
                <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-xs font-semibold text-[#6B7280]">
                  No public leadership contacts are currently available. Please try again later.
                </div>
              )}

              {!loading && !error && contacts.length > 0 && (
                <div className="space-y-3">
                  {contacts.map((contact, index) => (
                    <div
                      key={`${contact.executive_office ?? 'office'}-${contact.email ?? 'contact'}-${index}`}
                      className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-extrabold text-[#1F2937]">
                            {contact.full_name || 'DLCF AFIT Officer'}
                          </p>
                          <p className="mt-0.5 text-[11px] font-bold text-[#1D4ED8]">
                            {contact.executive_office || 'Fellowship Leadership'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-[11px] font-extrabold text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                          </a>
                        )}
                        {contact.phone_number && (
                          <a
                            href={`tel:${contact.phone_number}`}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD5E1] bg-white px-3 py-2 text-[11px] font-extrabold text-[#374151] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
