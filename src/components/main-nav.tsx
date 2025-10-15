
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Calculator,
  ShieldCheck,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/investments', label: 'Investment Plan', icon: Briefcase },
  { href: '/dashboard/manage', label: 'Manage Finances', icon: Tags },
  { href: '/dashboard/calculator', label: 'Calculators', icon: Calculator },
];

const adminNavItem = {
  href: '/dashboard/admin',
  label: 'Admin',
  icon: ShieldCheck,
};

type User = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
}

type MainNavProps = {
  user: User;
  isMobile?: boolean;
};

export function MainNav({ user, isMobile = false }: MainNavProps) {
  const pathname = usePathname();
  const allNavItems = user.role === 'admin' ? [...navItems, adminNavItem] : navItems;

  return (
    <nav className={cn("grid items-start gap-1 px-2 text-sm font-medium lg:px-4", isMobile && "gap-2 pt-2")}>
      {allNavItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
