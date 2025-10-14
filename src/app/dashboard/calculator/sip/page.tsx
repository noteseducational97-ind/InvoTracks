'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SipCalculatorPage() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [annualRate, setAnnualRate] = useState(12);
    const [years, setYears] = useState(10);
    
    const [results, setResults] = useState<{
        futureValue: string;
        investedAmount: string;
        estimatedReturns: string;
    } | null>(null);

    const calculateSip = () => {
        const P = monthlyInvestment;
        const i = (annualRate / 100) / 12; // monthly interest rate
        const n = years * 12; // number of months

        if (P > 0 && i > 0 && n > 0) {
            const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const investedAmount = P * n;
            const estimatedReturns = futureValue - investedAmount;

            setResults({
                futureValue: futureValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                investedAmount: investedAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                estimatedReturns: estimatedReturns.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
            });
        } else {
            setResults(null);
        }
    };

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">SIP Calculator</h1>
            <p className="text-muted-foreground">Estimate the future value of your monthly investments.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Systematic Investment Plan (SIP)</CardTitle>
                        <CardDescription>Enter your investment details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="monthly-investment">Monthly Investment ($)</Label>
                            <Input id="monthly-investment" type="number" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="annual-rate">Expected Annual Return (%)</Label>
                            <Input id="annual-rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="years">Investment Period (Years)</Label>
                            <Input id="years" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
                        </div>
                        <Button onClick={calculateSip} className="w-full">Calculate</Button>
                    </CardContent>
                </Card>
                <div className="flex items-start">
                    {results ? (
                        <Card className="w-full bg-primary text-primary-foreground">
                            <CardHeader>
                                <CardTitle className="font-headline">Projected Value</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-lg">
                                <div className="flex justify-between">
                                    <span className="text-primary-foreground/80">Invested Amount:</span>
                                    <span className="font-bold">{results.investedAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-primary-foreground/80">Est. Returns:</span>
                                    <span className="font-bold">{results.estimatedReturns}</span>
                                </div>
                                <div className="flex justify-between text-xl">
                                    <span className="text-primary-foreground/80">Future Value:</span>
                                    <span className="font-bold">{results.futureValue}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <Card className="w-full bg-muted/80 flex items-center justify-center h-full">
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">Enter your details and click calculate to see your projection.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}