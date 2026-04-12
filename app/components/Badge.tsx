'use client';

import React from 'react';
import { queueColors } from '../design-system/queueColors';

export type BadgeVariant =
  | 'risk-high'
  | 'risk-medium'
  | 'risk-low'
  | 'alert-critical'
  | 'alert-high'
  | 'alert-medium'
  | 'alert-low'
  | 'status-scheduled'
  | 'status-today'
  | 'status-done'
  | 'event-consulta'
  | 'event-pa'
  | 'event-exame'
  | 'event-procedimento'
  | 'tag-redundancia'
  | 'tag-evitavel'
  | 'tag-baixa-resolutividade'
  | 'efficiency-pa'
  | 'efficiency-exame'
  | 'efficiency-consulta'
  | 'efficiency-repeticao'
  | 'flow-human'
  | 'flow-ia'
  | 'flow-preventive'
  | 'queue-immediate'
  | 'queue-week'
  | 'queue-monitor'
  | 'neutral';

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

const variantMap: Record<BadgeVariant, string> = {
  'risk-high': 'border-red-200 bg-red-100 text-red-700',
  'risk-medium': 'border-amber-200 bg-amber-100 text-amber-700',
  'risk-low': 'border-emerald-200 bg-emerald-100 text-emerald-700',
  'alert-critical': 'border-red-200 bg-red-100 text-red-700',
  'alert-high': 'border-orange-200 bg-orange-100 text-orange-700',
  'alert-medium': 'border-amber-200 bg-amber-100 text-amber-700',
  'alert-low': 'border-emerald-200 bg-emerald-100 text-emerald-700',
  'status-scheduled': 'border-blue-300 bg-blue-100 text-blue-700',
  'status-today': 'border-sky-300 bg-sky-100 text-sky-700',
  'status-done': 'border-slate-300 bg-slate-100 text-slate-700',
  'event-consulta': 'border-blue-200 bg-blue-100 text-blue-700',
  'event-pa': 'border-red-200 bg-red-100 text-red-700',
  'event-exame': 'border-orange-200 bg-orange-100 text-orange-700',
  'event-procedimento': 'border-emerald-200 bg-emerald-100 text-emerald-700',
  'tag-redundancia': 'border-slate-900 bg-slate-900 text-white',
  'tag-evitavel': 'border-slate-900 bg-slate-900 text-white',
  'tag-baixa-resolutividade': 'border-slate-900 bg-slate-900 text-white',
  'efficiency-pa': 'border-red-200 bg-red-100 text-red-700',
  'efficiency-exame': 'border-orange-200 bg-orange-100 text-orange-700',
  'efficiency-consulta': 'border-amber-200 bg-amber-100 text-amber-700',
  'efficiency-repeticao': 'border-emerald-200 bg-emerald-100 text-emerald-700',
  'flow-human': 'border-red-300 bg-red-50 text-red-700',
  'flow-ia': 'border-orange-300 bg-orange-50 text-orange-700',
  'flow-preventive': 'border-emerald-300 bg-emerald-50 text-emerald-700',
  'queue-immediate': queueColors.immediate.badgeStrong,
  'queue-week': queueColors.thisWeek.badgeStrong,
  'queue-monitor': queueColors.monitor.badgeStrong,
  neutral: 'border-slate-200 bg-slate-100 text-slate-700',
};

export default function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${variantMap[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function getRiskBadgeVariant(risk: 'Alto' | 'Médio' | 'Baixo'): BadgeVariant {
  if (risk === 'Alto') return 'risk-high';
  if (risk === 'Médio') return 'risk-medium';
  return 'risk-low';
}

export function getAlertBadgeVariant(level: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'): BadgeVariant {
  if (level === 'Crítico') return 'alert-critical';
  if (level === 'Alto') return 'alert-high';
  if (level === 'Médio') return 'alert-medium';
  return 'alert-low';
}

export function getEventBadgeVariant(type: 'Consulta' | 'Pronto atendimento' | 'Exame' | 'Procedimento' | 'Internação'): BadgeVariant {
  if (type === 'Consulta') return 'event-consulta';
  if (type === 'Pronto atendimento') return 'event-pa';
  if (type === 'Exame') return 'event-exame';
  return 'event-procedimento';
}

export function getFlowBadgeVariant(flow: 'Humano prioritário' | 'IA assistida' | 'Preventivo automatizado'): BadgeVariant {
  if (flow === 'Humano prioritário') return 'flow-human';
  if (flow === 'IA assistida') return 'flow-ia';
  return 'flow-preventive';
}


export function getStatusBadgeVariant(status: 'Agendado' | 'Hoje' | 'Realizado'): BadgeVariant {
  if (status === 'Agendado') return 'status-scheduled';
  if (status === 'Hoje') return 'status-today';
  return 'status-done';
}

export function getClinicalTagVariant(tag?: string | null): BadgeVariant {
  const valor = (tag ?? '').toLowerCase().trim();

  if (valor.includes('redund')) return 'tag-redundancia';
  if (valor.includes('evit')) return 'tag-evitavel';
  return 'tag-baixa-resolutividade';
}

export function getEfficiencyBadgeVariant(tipo: string): BadgeVariant {
  const valor = tipo.toLowerCase().trim();

  if (valor.includes('pa evit')) return 'efficiency-pa';
  if (valor.includes('redund')) return 'efficiency-exame';
  if (valor.includes('baixa resolut')) return 'efficiency-consulta';
  return 'efficiency-repeticao';
}


export function getQueueBadgeVariant(status: 'Ação imediata' | 'Ativar nesta semana' | 'Monitorar'): BadgeVariant {
  if (status === 'Ação imediata') return 'queue-immediate';
  if (status === 'Ativar nesta semana') return 'queue-week';
  return 'queue-monitor';
}
