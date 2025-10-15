// This layout ensures all nested routes are dynamically rendered on the client.
export const dynamic = 'force-dynamic';

export default function DashboardPagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
