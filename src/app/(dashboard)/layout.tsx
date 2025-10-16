import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import heavy components to reduce initial load
const DashboardLayout = dynamic(() => import('@/app/(dashboard)/dashboard/layout'), {
  loading: () => <div className="flex min-h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>,
  ssr: false,
});

export default function DashboardPagesLayout({ children }: { children: React.ReactNode }) {
  // Although the filename is layout.tsx, we are using a dynamic import
  // to effectively treat the main dashboard layout as a client-side only component
  // that is code-split. This helps in reducing the initial JS payload.
  // The actual layout logic is in `dashboard/layout.tsx`.
  return <DashboardLayout>{children}</DashboardLayout>;
}
