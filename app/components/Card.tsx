import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export default function Card({ children, className = '', padded = true }: any) {
  return (
    <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${padded ? 'p-6' : ''} ${className}`}>
      {children}
    </section>
  );
}
