'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

interface SipResult {
    futureValue: number;
    investedAmount: number;
    estimatedReturns: number;
}

export default function SipCalculatorPage() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [annualRate, setAnnualRate] = useState(12);
    const [years, setYears] = useState(10);
    
    const [results, setResults] = useState<SipResult | null>(null);

    const calculateSip = () => {
        const P = monthlyInvestment;
        const i = (annualRate / 100) / 12; // monthly interest rate
        const n = years * 12; // number of months

        if (P > 0 && i > 0 && n > 0) {
            const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const investedAmount = P * n;
            const estimatedReturns = futureValue - investedAmount;

            setResults({
                futureValue,
                investedAmount,
                estimatedReturns,
            });
        } else {
            setResults(null);
        }
    };
    
    const chartData = results ? [
        { name: 'Total Investment', value: results.investedAmount },
        { name: 'Estimated Returns', value: results.estimatedReturns },
    ] : [];

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

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
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="font-headline">Projected Value</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className='h-[200px] w-full'>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 text-sm pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Invested Amount:</span>
                                        <span className="font-medium">{formatCurrency(results.investedAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Est. Returns:</span>
                                        <span className="font-medium">{formatCurrency(results.estimatedReturns)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Future Value:</span>
                                        <span>{formatCurrency(results.futureValue)}</span>
                                    </div>
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