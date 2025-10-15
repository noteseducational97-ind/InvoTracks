'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SipResult {
    futureValue: number;
    investedAmount: number;
    estimatedReturns: number;
    inflationAdjustedValue: number;
}

export default function SipCalculatorPage() {
    const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
    const [annualRate, setAnnualRate] = useState(12);
    const [years, setYears] = useState(10);
    const [inflationRate, setInflationRate] = useState(6);
    
    const [results, setResults] = useState<SipResult | null>(null);

    const calculateSip = () => {
        const P = monthlyInvestment;
        const i = (annualRate / 100) / 12; // monthly interest rate
        const n = years * 12; // total number of months
        const r_inf = inflationRate / 100;

        if (P > 0 && annualRate > 0 && years > 0) {
            const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
            const investedAmount = P * n;
            const estimatedReturns = futureValue - investedAmount;
            const inflationAdjustedValue = futureValue / Math.pow(1 + r_inf, years);

            setResults({
                futureValue,
                investedAmount,
                estimatedReturns,
                inflationAdjustedValue,
            });
        } else {
            setResults(null);
        }
    };
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const pieData = results ? [
        { name: 'Total Investment', value: results.investedAmount },
        { name: 'Estimated Returns', value: results.estimatedReturns },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">SIP Calculator</h1>
            <p className="text-muted-foreground">Estimate the total value of your monthly investments.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Systematic Investment Plan (SIP)</CardTitle>
                        <CardDescription>Enter your investment details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="inflation-rate">Expected Inflation Rate (%)</Label>
                            <Input id="inflation-rate" type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
                        </div>
                        <Button onClick={calculateSip} className="w-full">Calculate</Button>
                    </CardContent>
                </Card>
                <div className="flex items-start lg:col-span-2">
                    {results ? (
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="font-headline">Investment Projection</CardTitle>
                                <CardDescription>This chart shows the breakdown of your investment over {years} years.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className='h-[250px] w-full relative'>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-sm text-muted-foreground">Total Value</span>
                                        <span className="text-2xl font-bold">{formatCurrency(results.futureValue)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm pt-4 border-t">
                                     <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Invested Amount:</span>
                                            <span className="font-medium">{formatCurrency(results.investedAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Est. Returns:</span>
                                            <span className="font-medium">{formatCurrency(results.estimatedReturns)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Value:</span>
                                            <span>{formatCurrency(results.futureValue)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold text-primary">
                                            <span>After Inflation (Today's Value):</span>
                                            <span>{formatCurrency(results.inflationAdjustedValue)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <Card className="w-full bg-muted/80 flex items-center justify-center h-full min-h-[400px]">
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
