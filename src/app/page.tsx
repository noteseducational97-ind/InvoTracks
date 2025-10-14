import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/app-logo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BarChart, Calculator, FileText } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <AppLogo />
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Intelligent Investment and Invoice Tracking
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    InvoTrack provides a seamless platform to manage your investments, track invoices, and plan your financial future with powerful tools.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#">Learn More</Link>
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
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-background p-4 shadow-sm">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-2xl font-bold">Portfolio Management</h3>
                <p className="text-muted-foreground">
                  Track your investments in real-time with detailed performance metrics and analytics.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-background p-4 shadow-sm">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-2xl font-bold">Invoice Tracking</h3>
                <p className="text-muted-foreground">
                  Manage your investment-related invoices effortlessly, from creation to payment.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="rounded-full bg-background p-4 shadow-sm">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-headline text-2xl font-bold">Financial Tools</h3>
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
