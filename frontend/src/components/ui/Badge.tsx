const styles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 ring-slate-200',
  generating: 'bg-amber-50 text-amber-800 ring-amber-200',
  generated: 'bg-teal-50 text-teal-800 ring-teal-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
  finalized: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  budget: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  'mid-range': 'bg-blue-50 text-blue-800 ring-blue-200',
  luxury: 'bg-violet-50 text-violet-800 ring-violet-200',
  default: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function Badge({
  children,
  tone = 'default',
  className = '',
}: {
  children: React.ReactNode;
  tone?: keyof typeof styles;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${styles[tone] || styles.default} ${className}`}
    >
      {children}
    </span>
  );
}
