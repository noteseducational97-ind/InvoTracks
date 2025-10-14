
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EmiResult {
    monthlyEmi: number;
    totalInterest: number;
    totalPayment: number;
    principalAmount: number;
}

export default function LoanCalculatorPage() {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20); // in years
    
    const [results, setResults] = useState<EmiResult | null>(null);

    const calculateEmi = () => {
        const P = loanAmount;
        const r = (interestRate / 100) / 12; // monthly interest rate
        const n = loanTenure * 12; // total number of months

        if (P > 0 && interestRate > 0 && n > 0) {
            const emi = P * r * (Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
            const totalPayment = emi * n;
            const totalInterest = totalPayment - P;

            setResults({
                monthlyEmi: emi,
                totalInterest,
                totalPayment,
                principalAmount: P,
            });
        } else {
            setResults(null);
        }
    };
    
    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    const pieData = results ? [
        { name: 'Principal Amount', value: results.principalAmount },
        { name: 'Total Interest', value: results.totalInterest },
    ] : [];

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Loan Calculator</h1>
            <p className="text-muted-foreground">Calculate your Equated Monthly Installment for loans.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="font-headline">Loan Details</CardTitle>
                        <CardDescription>Enter your loan details below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="loan-amount">Loan Amount (₹)</Label>
                            <Input id="loan-amount" type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="interest-rate">Annual Interest Rate (%)</Label>
                            <Input id="interest-rate" type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="loan-tenure">Loan Tenure (Years)</Label>
                            <Input id="loan-tenure" type="number" value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value))} />
                        </div>
                        <Button onClick={calculateEmi} className="w-full">Calculate EMI</Button>
                    </CardContent>
                </Card>
                <div className="flex items-start lg:col-span-2">
                    {results ? (
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="font-headline">Loan Breakdown</CardTitle>
                                <CardDescription>Your monthly payment and total costs.</CardDescription>
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
                                        <span className="text-sm text-muted-foreground">Monthly EMI</span>
                                        <span className="text-2xl font-bold">{formatCurrency(results.monthlyEmi)}</span>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm pt-4 border-t">
                                     <div className="grid grid-cols-1 gap-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Principal Amount:</span>
                                            <span className="font-medium">{formatCurrency(results.principalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Total Interest Payable:</span>
                                            <span className="font-medium">{formatCurrency(results.totalInterest)}</span>
                                        </div>
                                        <div className="flex justify-between font-semibold">
                                            <span>Total Payment (Principal + Interest):</span>
                                            <span>{formatCurrency(results.totalPayment)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                         <Card className="w-full bg-muted/80 flex items-center justify-center h-full min-h-[400px]">
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">Enter your loan details and click calculate.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
