'use client'

import { redirect, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Briefcase, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login') {
      redirect('/login');
    }
  }, [user, isUserLoading, pathname]);

  if (isUserLoading) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!user) {
    // This can happen briefly before the redirect kicks in
    return null; 
  }

  const appUser = {
      id: user.uid,
      name: user.displayName || 'User',
      email: user.email || 'No email',
      // This is a simplification. Role management should be handled properly.
      role: user.email === 'prasannawarade0204@gmail.com' ? 'admin' as const : 'user' as const
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b border-sidebar-border px-6">
            <Link href="/dashboard/overview" className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg text-sidebar-primary-foreground">InvoTrack</span>
            </Link>
          </div>
          <div className="flex-1 py-4">
            <MainNav user={appUser} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground p-0">
               <div className="flex h-16 items-center border-b border-sidebar-border px-6">
                  <Link href="/dashboard/overview" className="flex items-center gap-2 font-semibold">
                      <Briefcase className="h-6 w-6 text-primary" />
                      <span className="font-headline text-lg text-sidebar-primary-foreground">InvoTrack</span>
                  </Link>
              </div>
              <div className="flex-1 py-4">
                 <MainNav user={appUser} isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search investments..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <UserNav user={appUser} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
