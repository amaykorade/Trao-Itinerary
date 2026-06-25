export default function LoadingSpinner({
  label = 'Loading...',
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${fullPage ? 'min-h-[50vh]' : 'py-16'}`}
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      </div>
      <p className="max-w-sm text-center text-sm text-slate-500 animate-pulse-soft">{label}</p>
    </div>
  );
}
