'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Calculator,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/app/actions';

const navItems = [
  { href: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/investments', label: 'Investments', icon: Briefcase },
  { href: '/dashboard/manage', label: 'Manage', icon: Settings },
  { href: '/dashboard/calculator', label: 'Calculator', icon: Calculator },
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
    <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isMobile && "gap-4 pt-4")}>
      {allNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent',
              isActive && 'bg-sidebar-accent'
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
