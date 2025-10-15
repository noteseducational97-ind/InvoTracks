

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LumpsumResult {
    futureValue: number;
    investedAmount: number;
    estimatedReturns: number;
    inflationAdjustedValue: number;
}

interface MultiInvestmentResult {
    chartData: { year: number; value: number }[];
    totalValue: number;
    totalInvestment: number;
    inflationAdjustedTotalValue: number;
}

interface YearlyData {
    year: number;
    value: number;
}

export default function LumpsumCalculatorPage() {
    // State for one-time investment
    const [principalAmount, setPrincipalAmount] = useState(100000);
    const [annualRate, setAnnualRate] = useState(12);
    const [years, setYears] = useState(10);
    const [inflationRate, setInflationRate] = useState(6);
    const [results, setResults] = useState<LumpsumResult | null>(null);

    // State for multiple investments
    const [initialLumpsum, setInitialLumpsum] = useState(50000);
    const [reinvestmentAmount, setReinvestmentAmount] = useState(10000);
    const [reinvestmentFrequency, setReinvestmentFrequency] = useState<'quarterly' | 'half-yearly' | 'yearly'>('yearly');
    const [multiYears, setMultiYears] = useState(20);
    const [multiAnnualRate, setMultiAnnualRate] = useState(12);
    const [multiInflationRate, setMultiInflationRate] = useState(6);
    const [multiResults, setMultiResults] = useState<MultiInvestmentResult | null>(null);

    // State for calculator type
    const [investmentType, setInvestmentType] = useState('one-time');

    const calculateLumpsum = () => {
        const P = principalAmount;
        const r = annualRate / 100;
        const n = years;
        const r_inf = inflationRate / 100;

        if (P > 0 && r > 0 && n > 0) {
            const futureValue = P * Math.pow(1 + r, n);
            const investedAmount = P;
            const estimatedReturns = futureValue - investedAmount;
            const inflationAdjustedValue = futureValue / Math.pow(1 + r_inf, n);

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
    
    const calculateMultipleLumpsum = () => {
        const r = multiAnnualRate / 100; // annual rate
        const r_inf = multiInflationRate / 100;
        const yearlyData: YearlyData[] = [];
        let totalInvestment = initialLumpsum;
        let finalValue = 0;

        const periodsPerYear = {
            'yearly': 1,
            'half-yearly': 2,
            'quarterly': 4,
        };
        const ppy = periodsPerYear[reinvestmentFrequency];
        const periodicRate = r / ppy;
        const totalPeriods = multiYears * ppy;

        let runningValue = initialLumpsum;
        for (let year = 1; year <= multiYears; year++) {
             runningValue = runningValue * (1 + r); // lumpsum growth for a year
             
             // Calculate future value of recurring investments made up to this year
             let recurringFv = 0;
             if (reinvestmentAmount > 0) {
                const periodsSoFar = year * ppy;
                recurringFv = reinvestmentAmount * ((Math.pow(1 + periodicRate, periodsSoFar) - 1) / periodicRate) * (1+periodicRate);
             }
             
             const yearEndValue = (initialLumpsum * Math.pow(1 + r, year)) + recurringFv;
             
             yearlyData.push({ year, value: yearEndValue });
        }
        
        const lumpsumFv = initialLumpsum * Math.pow(1 + r, multiYears);
        let recurringFv = 0;
        if (reinvestmentAmount > 0) {
            recurringFv = reinvestmentAmount * ((Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate) * (1+periodicRate);
        }
        
        finalValue = lumpsumFv + recurringFv;
        totalInvestment = initialLumpsum + (reinvestmentAmount * multiYears * ppy);
        const inflationAdjustedTotalValue = finalValue / Math.pow(1 + r_inf, multiYears);

        setMultiResults({
            chartData: yearlyData,
            totalValue: finalValue,
            totalInvestment,
            inflationAdjustedTotalValue,
        });
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
            <h1 className="font-headline text-3xl font-bold tracking-tight">Lumpsum Calculator</h1>
            <p className="text-muted-foreground">Estimate the total value of your investments.</p>
            
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Investment Details</CardTitle>
                        <div className="pt-2">
                            <Label>Investment Type</Label>
                            <Select value={investmentType} onValueChange={(value) => setInvestmentType(value as 'one-time' | 'multiple-times')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select investment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one-time">One Time Investment</SelectItem>
                                    <SelectItem value="multiple-times">Recurring Investments</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    {investmentType === 'one-time' ? (
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="principal-amount">Total Investment Amount (₹)</Label>
                                <Input id="principal-amount" type="number" value={principalAmount} onChange={(e) => setPrincipalAmount(Number(e.target.value))} />
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
                            <Button onClick={calculateLumpsum} className="w-full">Calculate</Button>
                        </CardContent>
                    ) : (
                         <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="initial-lumpsum">Initial Lumpsum Investment (₹)</Label>
                                <Input id="initial-lumpsum" type="number" value={initialLumpsum} onChange={(e) => setInitialLumpsum(Number(e.target.value))} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reinvestment-amount">Recurring Reinvestment (₹)</Label>
                                    <Input id="reinvestment-amount" type="number" value={reinvestmentAmount} onChange={(e) => setReinvestmentAmount(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reinvestment Frequency</Label>
                                    <Select value={reinvestmentFrequency} onValueChange={(value) => setReinvestmentFrequency(value as 'quarterly' | 'half-yearly' | 'yearly')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                            <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="multi-annual-rate">Expected Annual Return (%)</Label>
                                    <Input id="multi-annual-rate" type="number" value={multiAnnualRate} onChange={(e) => setMultiAnnualRate(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="multi-years">Investment Period (Years)</Label>
                                    <Input id="multi-years" type="number" value={multiYears} onChange={(e) => setMultiYears(Number(e.target.value))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="multi-inflation-rate">Expected Inflation Rate (%)</Label>
                                <Input id="multi-inflation-rate" type="number" value={multiInflationRate} onChange={(e) => setMultiInflationRate(Number(e.target.value))} />
                            </div>
                             <Button onClick={calculateMultipleLumpsum} className="w-full">Calculate</Button>
                         </CardContent>
                    )}
                </Card>
                <div className="flex items-start lg:col-span-2">
                    {investmentType === 'one-time' && (
                        results ? (
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="font-headline">Investment Projection</CardTitle>
                                    <CardDescription>Breakdown of your investment over {years} years.</CardDescription>
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
                                    <p className="text-center text-muted-foreground">Enter details and click calculate.</p>
                                </CardContent>
                            </Card>
                        )
                    )}
                    {investmentType === 'multiple-times' && (
                        multiResults ? (
                            <Card className="w-full">
                                <CardHeader>
                                    <CardTitle className="font-headline">Investment Projection</CardTitle>
                                    <CardDescription>Growth of your investments over {multiYears} years.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className='h-[300px] w-full'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={multiResults.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                                                <YAxis tickFormatter={(value) => `₹${(Number(value) / 100000).toFixed(0)}L`} />
                                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Legend />
                                                <Line type="monotone" dataKey="value" name="Portfolio Value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                     <div className="space-y-2 text-sm pt-4 border-t">
                                         <div className="grid grid-cols-1 gap-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Total Invested Amount:</span>
                                                <span className="font-medium">{formatCurrency(multiResults.totalInvestment)}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold">
                                                <span>Projected Total Value:</span>
                                                <span>{formatCurrency(multiResults.totalValue)}</span>
                                            </div>
                                            <div className="flex justify-between font-semibold text-primary">
                                                <span>After Inflation (Today's Value):</span>
                                                <span>{formatCurrency(multiResults.inflationAdjustedTotalValue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                             <Card className="w-full bg-muted/80 flex items-center justify-center h-full min-h-[400px]">
                                <CardContent className="pt-6">
                                    <p className="text-center text-muted-foreground">Enter your investment details and click calculate.</p>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

    

    
