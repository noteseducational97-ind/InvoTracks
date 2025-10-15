
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, DollarSign, Landmark, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";

export default function AddDetailsPage() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number | string>("");
  const [annualIncome, setAnnualIncome] = useState<number | string>("");
  const [overallMonthlyIncome, setOverallMonthlyIncome] = useState(0);

  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    const monthly = Number(monthlyIncome) || 0;
    const annual = Number(annualIncome) || 0;
    const calculatedOverall = monthly + (annual / 12);
    setOverallMonthlyIncome(calculatedOverall);
  }, [monthlyIncome, annualIncome]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">Add Your Financial Details</h1>
      <p className="text-muted-foreground">Fill out the form below to get a complete view of your finances.</p>

      <div className="mt-6 grid gap-6">

        {/* Personal & Income Details Card */}
        <Card>
          <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Details
              </CardTitle>
              <CardDescription>Personal and income information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="risk-percentage">Risk Percentage (%)</Label>
                <Input id="risk-percentage" type="number" placeholder="" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
                <Input id="monthly-income" type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="annual-income">Annual Income (₹)</Label>
                    <Input id="annual-income" type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="overall-monthly-income">Overall Monthly Income</Label>
                    <Input id="overall-monthly-income" type="text" value={formatCurrency(overallMonthlyIncome)} disabled readOnly />
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Monthly Expenses
            </CardTitle>
            <CardDescription>A summary of your recurring monthly costs.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <div className="space-y-2">
                <Label htmlFor="rent">Housing (Rent/EMI)</Label>
                <Input id="rent" type="number" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="utilities">Utilities</Label>
                <Input id="utilities" type="number" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="transport">Transportation</Label>
                <Input id="transport" type="number" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="food">Groceries & Food</Label>
                <Input id="food" type="number" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="entertainment">Entertainment</Label>
                <Input id="entertainment" type="number" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="healthcare">Healthcare</Label>
                <Input id="healthcare" type="number" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="other-expenses">Other</Label>
                <Input id="other-expenses" type="number" />
            </div>
          </CardContent>
        </Card>

        {/* Debt Card */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    Debt
                </CardTitle>
                <CardDescription>Enter the outstanding balance for any active loans.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="home-loan">Home Loan</Label>
                    <Input id="home-loan" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="car-loan">Car Loan</Label>
                    <Input id="car-loan" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="personal-loan">Personal Loan</Label>
                    <Input id="personal-loan" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="credit-card-debt">Credit Card Debt</Label>
                    <Input id="credit-card-debt" type="number" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="other-debt">Other Loan</Label>
                    <Input id="other-debt" type="number" />
                </div>
            </CardContent>
        </Card>

        {/* Existing Investment Card */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Existing Investments
                </CardTitle>
                <CardDescription>Enter the current value of your existing investments.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="stocks">Stocks</Label>
                    <Input id="stocks" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bonds">Bonds</Label>
                    <Input id="bonds" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mutual-funds">Mutual Funds</Label>
                    <Input id="mutual-funds" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="real-estate">Real Estate</Label>
                    <Input id="real-estate" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="commodities">Commodities</Label>
                    <Input id="commodities" type="number" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="other-investments">Other</Label>
                    <Input id="other-investments" type="number" />
                </div>
            </CardContent>
        </Card>


        <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/dashboard/manage">Cancel</Link>
            </Button>
            <Button>Save Details</Button>
        </div>
      </div>
    </div>
  );
}
