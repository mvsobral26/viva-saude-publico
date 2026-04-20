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
      <div className="min-w-0 flex-1">
        {eyebrow ? <p className="text-sm font-medium text-emerald-600">{eyebrow}</p> : null}
        <h1 className="mt-1 break-words text-3xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>

      {actions || meta ? (
        <div className="flex min-w-0 max-w-full flex-col gap-3 xl:w-auto xl:max-w-[48%] xl:items-end">
          {meta ? <div className="max-w-full">{meta}</div> : null}
          {actions ? <div className="flex max-w-full flex-wrap gap-3 xl:justify-end">{actions}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
