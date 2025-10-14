'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PlusCircle, Trash2 } from 'lucide-react';

interface InvestmentEntry {
    id: number;
    amount: number;
    year: number;
    inflationRate: number;
}

interface ChartDataPoint {
    year: number;
    value: number;
    invested: number;
}

export default function GoalCalculatorPage() {
    const [investments, setInvestments] = useState<InvestmentEntry[]>([
        { id: 1, amount: 100000, year: 0, inflationRate: 6 },
    ]);
    const [annualRate, setAnnualRate] = useState(12);
    const [totalYears, setTotalYears] = useState(20);
    const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);

    const handleInvestmentChange = (id: number, field: keyof InvestmentEntry, value: number) => {
        setInvestments(investments.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
    };

    const addInvestment = () => {
        const newId = (investments.length > 0 ? Math.max(...investments.map(i => i.id)) : 0) + 1;
        setInvestments([...investments, { id: newId, amount: 50000, year: investments.length * 5, inflationRate: 6 }]);
    };

    const removeInvestment = (id: number) => {
        setInvestments(investments.filter(inv => inv.id !== id));
    };
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const calculateGoal = () => {
        const r = annualRate / 100;
        const data: ChartDataPoint[] = [];
        let totalInvested = 0;

        for (let year = 0; year <= totalYears; year++) {
            let futureValue = 0;
            let currentYearInvested = 0;

            // Calculate FV for each investment up to the current year
            investments.forEach(inv => {
                if (year >= inv.year) {
                    futureValue += inv.amount * Math.pow(1 + r, year - inv.year);
                }
            });

             // Calculate total invested amount up to the current year
            totalInvested = investments
                .filter(inv => inv.year <= year)
                .reduce((sum, inv) => sum + inv.amount, 0);

            data.push({
                year: year,
                value: futureValue,
                invested: totalInvested,
            });
        }
        setChartData(data);
    };

    const finalResult = chartData ? chartData[chartData.length - 1] : null;

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Goal Based Calculator</h1>
            <p className="text-muted-foreground">Plan your financial goals by modeling variable investments over time.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Investment Plan</CardTitle>
                        <CardDescription>Define your global assumptions and add your investment entries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="annual-rate">Global Expected Annual Return (%)</Label>
                                <Input id="annual-rate" type="number" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="total-years">Total Investment Horizon (Years)</Label>
                                <Input id="total-years" type="number" value={totalYears} onChange={(e) => setTotalYears(Number(e.target.value))} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="font-medium">Investment Entries</Label>
                            {investments.map((inv, index) => (
                                <div key={inv.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end p-3 border rounded-lg bg-muted/30 relative">
                                     <div className="space-y-1">
                                        <Label htmlFor={`amount-${inv.id}`} className="text-xs">Amount (₹)</Label>
                                        <Input id={`amount-${inv.id}`} type="number" value={inv.amount} onChange={e => handleInvestmentChange(inv.id, 'amount', Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`year-${inv.id}`} className="text-xs">Invest in Year</Label>
                                        <Input id={`year-${inv.id}`} type="number" value={inv.year} onChange={e => handleInvestmentChange(inv.id, 'year', Number(e.target.value))} />
                                    </div>
                                     <div className="space-y-1">
                                        <Label htmlFor={`inflation-${inv.id}`} className="text-xs">Avg. Inflation (%)</Label>
                                        <Input id={`inflation-${inv.id}`} type="number" value={inv.inflationRate} onChange={e => handleInvestmentChange(inv.id, 'inflationRate', Number(e.target.value))} />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeInvestment(inv.id)} disabled={investments.length === 1}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        
                        <div className='flex gap-2'>
                           <Button onClick={addInvestment} variant="outline" size="sm">
                               <PlusCircle className="mr-2 h-4 w-4" /> Add Investment
                           </Button>
                           <Button onClick={calculateGoal} className="w-full">Calculate Projection</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-start lg:col-span-2">
                    {chartData && finalResult ? (
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="font-headline">Investment Projection</CardTitle>
                                <CardDescription>Growth of your investments over {totalYears} years.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className='h-[300px] w-full'>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" name="Year" unit="yr" />
                                            <YAxis tickFormatter={(value) => formatCurrency(value)} />
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                            <Line type="monotone" dataKey="value" name="Projected Value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="invested" name="Total Invested" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-2 text-sm pt-4 border-t">
                                     <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Amount Invested:</span>
                                            <span className="font-medium">{formatCurrency(finalResult.invested)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Projected Final Value:</span>
                                            <span>{formatCurrency(finalResult.value)}</span>
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
