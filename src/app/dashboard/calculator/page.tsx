'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Financial Calculators</h1>
            <p className="text-muted-foreground">Tools to help you plan your financial future.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Calculator className="h-6 w-6" />
                            SIP Calculator
                        </CardTitle>
                        <CardDescription>Estimate the future value of your Systematic Investment Plan (SIP).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Calculate the returns on your monthly investments over a period of time.
                        </p>
                    </CardContent>
                    <CardContent>
                         <Button asChild>
                            <Link href="/dashboard/calculator/sip">Use Calculator</Link>
                        </Button>
                    </CardContent>
                </Card>
                {/* Future calculators can be added here as new cards */}
            </div>
        </div>
    );
}
