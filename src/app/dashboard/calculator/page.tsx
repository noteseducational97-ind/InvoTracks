'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CalculatorPage() {
    const [principal, setPrincipal] = useState(10000);
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(10);
    const [compounding, setCompounding] = useState(12);
    const [futureValue, setFutureValue] = useState<string | null>(null);

    const calculateFutureValue = () => {
        // A = P(1 + r/n)^(nt)
        const P = principal;
        const r = rate / 100;
        const n = compounding;
        const t = years;

        const amount = P * Math.pow((1 + r / n), n * t);
        setFutureValue(amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
    };

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Financial Calculator</h1>
            <p className="text-muted-foreground">Estimate your investment returns.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Compound Interest Calculator</CardTitle>
                        <CardDescription>Calculate the future value of your investment.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="principal">Initial Investment ($)</Label>
                            <Input id="principal" type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                            <Input id="rate" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="years">Years to Grow</Label>
                            <Input id="years" type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="compounding">Compounding Frequency</Label>
                            <Select onValueChange={(val) => setCompounding(Number(val))} defaultValue={String(compounding)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Annually</SelectItem>
                                    <SelectItem value="2">Semi-Annually</SelectItem>
                                    <SelectItem value="4">Quarterly</SelectItem>
                                    <SelectItem value="12">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={calculateFutureValue} className="w-full">Calculate</Button>
                    </CardContent>
                </Card>
                <div className="flex items-center justify-center">
                    <Card className="w-full bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="font-headline">Projected Future Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {futureValue ? (
                                <p className="text-5xl font-bold">{futureValue}</p>
                            ) : (
                                <p className="text-xl text-primary-foreground/70">Enter your details and calculate.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
