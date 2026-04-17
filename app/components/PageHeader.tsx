import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions, meta }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-medium text-emerald-600">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions || meta ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {meta}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
