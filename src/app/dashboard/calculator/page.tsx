
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CalculatorPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Financial Calculators</h1>
            <p className="text-muted-foreground">Tools to help you plan your financial future.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/dashboard/calculator/sip" className="group">
                    <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Calculator className="h-6 w-6" />
                                    SIP Calculator
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Calculate the returns on your monthly investments over a period of time.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/calculator/lumpsum" className="group">
                    <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center justify-between">
                                 <span className="flex items-center gap-2">
                                    <Calculator className="h-6 w-6" />
                                    Lumpsum Calculator
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Calculate the returns on a one-time or recurring investment.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/calculator/mutual-fund" className="group">
                    <Card className="h-full transition-all group-hover:border-primary group-hover:shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center justify-between">
                                 <span className="flex items-center gap-2">
                                    <Calculator className="h-6 w-6" />
                                    Mutual Fund Calculator
                                </span>
                                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Estimate returns on mutual fund SIPs, including expense ratio.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
