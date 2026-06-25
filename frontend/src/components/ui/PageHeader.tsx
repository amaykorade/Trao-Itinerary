export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1.5 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Alert({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'info' }) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</p>
  );
}
