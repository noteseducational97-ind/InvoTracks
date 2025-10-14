import { redirect } from 'next/navigation';
import { getUser } from '@/app/actions';
import { AppLogo } from '@/components/app-logo';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar text-sidebar-foreground md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:px-6">
            <Link href="/dashboard/overview" className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-headline text-lg text-primary">InvoTrack</span>
            </Link>
          </div>
          <div className="flex-1 py-2">
            <MainNav user={user} />
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
                      <span className="font-headline text-lg text-primary">InvoTrack</span>
                  </Link>
              </div>
              <div className="py-2">
                 <MainNav user={user} isMobile={true} />
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
          <UserNav user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}
