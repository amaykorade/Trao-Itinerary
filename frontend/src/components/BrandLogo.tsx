import Link from 'next/link';
import { Compass } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  iconSizeClassName?: string;
  showTagline?: boolean;
}

export function BrandLogo({
  className = '',
  iconClassName = 'h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md shadow-teal-600/25',
  iconSizeClassName = 'h-5 w-5',
  showTagline = true,
}: BrandLogoProps) {
  return (
    <Link
      href="/"
      className={`group flex min-w-0 shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 ${className}`}
      aria-label="Trao, go to home"
    >
      <span
        className={`flex shrink-0 items-center justify-center text-white ${iconClassName}`}
      >
        <Compass className={iconSizeClassName} />
      </span>
      <span className="hidden leading-tight sm:block" suppressHydrationWarning>
        <span className="block text-base font-bold text-slate-900 group-hover:text-teal-800">
          Trao
        </span>
        {showTagline && (
          <span className="block text-[11px] font-medium text-slate-500">Travel planner</span>
        )}
      </span>
    </Link>
  );
}
