
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, DollarSign, TrendingUp, Landmark, Receipt } from "lucide-react";
import Link from "next/link";

export default function AddDetailsPage() {

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
                <Input id="name" placeholder="Prasanna Warade" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
                <Input id="monthly-income" type="number" placeholder="150000" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="annual-bonus">Estimated Annual Bonus (₹)</Label>
                <Input id="annual-bonus" type="number" placeholder="200000" />
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
                <Input id="rent" type="number" placeholder="40000" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="utilities">Utilities</Label>
                <Input id="utilities" type="number" placeholder="5500" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="transport">Transportation</Label>
                <Input id="transport" type="number" placeholder="7000" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="food">Groceries & Food</Label>
                <Input id="food" type="number" placeholder="15000" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="insurance">Insurance Premiums</Label>
                <Input id="insurance" type="number" placeholder="8000" />
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

