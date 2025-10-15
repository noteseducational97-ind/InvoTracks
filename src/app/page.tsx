'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/app-logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BarChart, Calculator, FileText, Loader2, MoveRight } from 'lucide-react';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    redirect('/dashboard/overview');
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <AppLogo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started <MoveRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                   <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Financial Planning, Simplified</div>
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Intelligent Investment and Invoice Tracking
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    InvoTrack provides a seamless platform to manage your investments, track invoices, and plan your financial future with powerful, intuitive tools.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started for Free <MoveRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  data-ai-hint={heroImage.imageHint}
                  width={600}
                  height={400}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>
        <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    A powerful suite of tools to give you a clear view of your financial landscape.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <div className="grid gap-1 text-center">
                 <div className="mx-auto rounded-full bg-background p-3 shadow-sm">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold">Portfolio Management</h3>
                <p className="text-muted-foreground">
                  Track your investments in real-time with detailed performance metrics and analytics.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="mx-auto rounded-full bg-background p-3 shadow-sm">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold">Invoice Tracking</h3>
                <p className="text-muted-foreground">
                  Manage your investment-related invoices effortlessly, from creation to payment.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                 <div className="mx-auto rounded-full bg-background p-3 shadow-sm">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-xl font-bold">Financial Tools</h3>
                <p className="text-muted-foreground">
                  Utilize our built-in calculators to plan your financial strategies and estimate returns.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center p-6 md:px-8 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} InvoTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}
