import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// wa.me needs the FULL international number (country code, no leading 0,
// no '+', no spaces). A Nigerian number typed as "0801 234 5678" or
// "+234 801 234 5678" both need to become "2348012345678" — if a local
// "0..." number is sent as-is, wa.me can't resolve a contact and just
// opens WhatsApp's own home screen instead of the person's chat, which
// looks exactly like the link "not working."
export function toWhatsAppNumber(phone: string | null | undefined, defaultCountryCode = '234'): string {
  const digits = (phone ?? '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith(defaultCountryCode)) return digits;
  if (digits.startsWith('0')) return defaultCountryCode + digits.slice(1);
  if (digits.length <= 10) return defaultCountryCode + digits;
  return digits;
}

// An Exco can hold more than one portfolio (e.g. General Coordinator who
// is also Asst Choir Master). executive_office is always their primary
// office; additional_offices holds anything extra. Anywhere the app checks
// "does this person hold office X" (permissions, display, filtering)
// should use this instead of a bare === comparison, so it's correct
// regardless of whether X is their primary or an additional portfolio.
export function holdsOffice(
  executiveOffice: string | null | undefined,
  additionalOffices: string[] | null | undefined,
  office: string
): boolean {
  return executiveOffice === office || !!additionalOffices?.includes(office);
}

// All portfolios a person holds, primary first, for display purposes.
export function allOffices(
  executiveOffice: string | null | undefined,
  additionalOffices: string[] | null | undefined
): string[] {
  return [executiveOffice, ...(additionalOffices ?? [])].filter((o): o is string => !!o);
}
