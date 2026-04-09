type TableFooterProps = {
  from: number;
  to: number;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export default function TableFooter({
  from,
  to,
  total,
  page,
  totalPages,
  onPageChange,
  label = 'registro(s)',
}: TableFooterProps) {
  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages || totalPages === 0;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Exibindo {from}–{to} de {total} {label}
      </p>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={isPrevDisabled}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            isPrevDisabled
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          Anterior
        </button>

        <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
          {page} / {Math.max(totalPages, 1)}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={isNextDisabled}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            isNextDisabled
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
