import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export function AppLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold text-sidebar-foreground"
      prefetch={false}
    >
      <Briefcase className="h-6 w-6 text-primary" />
      <span className="font-headline text-primary">InvoTrack</span>
    </Link>
  );
}
