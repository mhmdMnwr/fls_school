import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(iso?: string | Date | null): string {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    if (isNaN(d.getTime())) return '—';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '—';
  }
}

export function formatLongDate(date: string | Date = new Date()): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const formatted = format(d, 'EEEE d MMMM yyyy', { locale: fr });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch {
    return '';
  }
}

export function formatTime(hhmm?: string | null): string {
  return hhmm || '—';
}

export function formatTimeRange(start?: string | null, end?: string | null): string {
  if (!start || !end) return '—';
  return `${start} - ${end}`;
}

export function formatMoney(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '0,00 DA';
  const formatted = n.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} DA`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return n.toLocaleString('fr-FR');
}

export function relativeTime(iso?: string | Date | null): string {
  if (!iso) return '';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    if (isNaN(d.getTime())) return '';
    const rel = formatDistanceToNow(d, { addSuffix: true, locale: fr });
    return rel.charAt(0).toUpperCase() + rel.slice(1);
  } catch {
    return '';
  }
}

export function fullName(p?: { firstName?: string; lastName?: string } | null): string {
  if (!p) return '—';
  const last = (p.lastName || '').trim();
  const first = (p.firstName || '').trim();
  return `${last} ${first}`.trim() || '—';
}

export function fullNameNatural(p?: { firstName?: string; lastName?: string } | null): string {
  if (!p) return '—';
  const first = (p.firstName || '').trim();
  const last = (p.lastName || '').trim();
  return `${first} ${last}`.trim() || '—';
}

export function ageFromBirthDate(iso?: string | Date | null): string {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    if (isNaN(d.getTime())) return '—';
    const age = differenceInYears(new Date(), d);
    return `${age} ans`;
  } catch {
    return '—';
  }
}

export const monthLabels = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Aoû',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];
