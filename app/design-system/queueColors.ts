export const queueColors = {
  immediate: {
    surface: 'bg-red-50',
    surfaceSoft: 'bg-red-50/80',
    surfaceCard: 'bg-red-50/70',
    surfaceStrong: 'bg-red-100',
    border: 'border-red-200',
    borderStrong: 'border-red-300',
    text: 'text-red-700',
    textStrong: 'text-red-800',
    textSoft: 'text-red-600',
    badge: 'border-red-300 bg-red-50 text-red-700',
    badgeStrong: 'border-red-300 bg-red-100 text-red-800',
    buttonGhost: 'border-red-300 text-red-700 hover:bg-red-100',
    dot: 'bg-red-500',
  },
  thisWeek: {
    surface: 'bg-amber-50',
    surfaceSoft: 'bg-amber-50/80',
    surfaceCard: 'bg-amber-50/70',
    surfaceStrong: 'bg-amber-100',
    border: 'border-amber-200',
    borderStrong: 'border-amber-300',
    text: 'text-amber-700',
    textStrong: 'text-amber-800',
    textSoft: 'text-amber-700',
    badge: 'border-amber-300 bg-amber-50 text-amber-700',
    badgeStrong: 'border-amber-300 bg-amber-100 text-amber-800',
    buttonGhost: 'border-amber-300 text-amber-700 hover:bg-amber-100',
    dot: 'bg-amber-500',
  },
  monitor: {
    surface: 'bg-emerald-50',
    surfaceSoft: 'bg-emerald-50/80',
    surfaceCard: 'bg-emerald-50/70',
    surfaceStrong: 'bg-emerald-100',
    border: 'border-emerald-200',
    borderStrong: 'border-emerald-300',
    text: 'text-emerald-700',
    textStrong: 'text-emerald-800',
    textSoft: 'text-emerald-700',
    badge: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    badgeStrong: 'border-emerald-300 bg-emerald-100 text-emerald-800',
    buttonGhost: 'border-emerald-300 text-emerald-700 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
  },
} as const;

export type QueueColorKey = keyof typeof queueColors;

export function getQueueColorKey(status: 'Ação imediata' | 'Ativar nesta semana' | 'Monitorar'): QueueColorKey {
  if (status === 'Ação imediata') return 'immediate';
  if (status === 'Ativar nesta semana') return 'thisWeek';
  return 'monitor';
}
