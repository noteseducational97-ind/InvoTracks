
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

interface LumpsumResult {
    futureValue: number;
    investedAmount: number;
    estimatedReturns: number;
    inflationAdjustedValue: number;
}

interface MultipleInvestment {
    id: number;
    amount: number;
    year: number;
    inflation: number;
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
    const [investments, setInvestments] = useState<MultipleInvestment[]>([
        { id: 1, amount: 50000, year: 0, inflation: 6 },
    ]);
    const [totalYears, setTotalYears] = useState(20);
    const [multiResults, setMultiResults] = useState<{ chartData: YearlyData[], totalValue: number, totalInvestment: number } | null>(null);
    const [overallAnnualRate, setOverallAnnualRate] = useState(12);

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
        const r = overallAnnualRate / 100;
        const yearlyData: YearlyData[] = [];
        let totalInvestment = 0;

        for (let year = 0; year <= totalYears; year++) {
            let yearValue = 0;
            investments.forEach(inv => {
                if (year >= inv.year) {
                    const inflation = inv.inflation / 100;
                    const investmentAge = year - inv.year;
                    const futureValue = inv.amount * Math.pow(1 + r, investmentAge);
                    yearValue += futureValue / Math.pow(1 + inflation, investmentAge);
                }
            });
            yearlyData.push({ year, value: yearValue });
        }
        
        totalInvestment = investments.reduce((acc, inv) => acc + inv.amount, 0);

        setMultiResults({
            chartData: yearlyData,
            totalValue: yearlyData[yearlyData.length-1].value,
            totalInvestment,
        });
    };
    
    const addInvestment = () => {
        setInvestments([...investments, { id: Date.now(), amount: 10000, year: 1, inflation: 6 }]);
    };

    const removeInvestment = (id: number) => {
        setInvestments(investments.filter(inv => inv.id !== id));
    };

    const handleInvestmentChange = (id: number, field: keyof Omit<MultipleInvestment, 'id'>, value: number) => {
        setInvestments(investments.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
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
                            <Select value={investmentType} onValueChange={setInvestmentType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select investment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="one-time">One Time Investment</SelectItem>
                                    <SelectItem value="multiple-times">Multiple Investments</SelectItem>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="overall-annual-rate">Expected Annual Return (%)</Label>
                                    <Input id="overall-annual-rate" type="number" value={overallAnnualRate} onChange={(e) => setOverallAnnualRate(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total-years">Total Investment Period (Years)</Label>
                                    <Input id="total-years" type="number" value={totalYears} onChange={(e) => setTotalYears(Number(e.target.value))} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {investments.map((inv, index) => (
                                    <div key={inv.id} className="p-4 border rounded-lg space-y-3 relative">
                                        <h4 className="font-medium text-sm">Investment #{index + 1}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`amount-${inv.id}`}>Amount (₹)</Label>
                                                <Input id={`amount-${inv.id}`} type="number" value={inv.amount} onChange={(e) => handleInvestmentChange(inv.id, 'amount', Number(e.target.value))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`year-${inv.id}`}>Invest in Year</Label>
                                                <Input id={`year-${inv.id}`} type="number" value={inv.year} onChange={(e) => handleInvestmentChange(inv.id, 'year', Number(e.target.value))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor={`inflation-${inv.id}`}>Inflation (%)</Label>
                                                <Input id={`inflation-${inv.id}`} type="number" value={inv.inflation} onChange={(e) => handleInvestmentChange(inv.id, 'inflation', Number(e.target.value))} />
                                            </div>
                                        </div>
                                         {investments.length > 1 && (
                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeInvestment(inv.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                             <Button variant="outline" onClick={addInvestment}>Add Another Investment</Button>
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
                                    <CardDescription>Growth of your investments over {totalYears} years (inflation-adjusted).</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className='h-[300px] w-full'>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={multiResults.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                                                <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
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
                                                <span>Projected Total Value (Inflation Adjusted):</span>
                                                <span>{formatCurrency(multiResults.totalValue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                             <Card className="w-full bg-muted/80 flex items-center justify-center h-full min-h-[400px]">
                                <CardContent className="pt-6">
                                    <p className="text-center text-muted-foreground">Add investments, set your time period, and click calculate.</p>
                                </CardContent>
                            </Card>
                        )
                    )}
                </div>
            </div>
        </div>
    );

    