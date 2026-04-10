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
    <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0 max-w-4xl">
        {eyebrow ? <p className="text-sm font-medium text-emerald-600">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      {actions || meta ? (
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start xl:w-auto xl:max-w-[42rem] xl:justify-end">
          {meta}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
