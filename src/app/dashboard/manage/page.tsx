
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, DollarSign, TrendingUp, Landmark, Receipt, Pencil } from "lucide-react";

export default function ManagePage() {
  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">Manage Your Finances</h1>
      <p className="text-muted-foreground">A centralized view of your financial details and commitments.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">

        {/* Personal & Income Details Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Details
              </CardTitle>
              <CardDescription>Personal and income information.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">Prasanna Warade</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth:</span> <span className="font-medium">April 2, 1990</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Risk Profile:</span> <span className="font-medium">Aggressive (85%)</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Monthly Income:</span> <span className="font-medium">₹1,50,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Annual Income:</span> <span className="font-medium">₹18,00,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Est. Annual Bonus:</span> <span className="font-medium">₹2,00,000</span></div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
                <CardTitle className="font-headline flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Monthly Expenses
                </CardTitle>
                <CardDescription>A summary of your recurring monthly costs.</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Housing (Rent/EMI):</span> <span className="font-medium">₹40,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Utilities (Electricity, Water, Internet):</span> <span className="font-medium">₹5,500</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Transportation (Fuel/Public Transit):</span> <span className="font-medium">₹7,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Groceries & Food:</span> <span className="font-medium">₹15,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Insurance Premiums:</span> <span className="font-medium">₹8,000</span></div>
            <div className="flex justify-between font-semibold"><span className="text-foreground">Total Monthly Expenses:</span> <span>₹75,500</span></div>
          </CardContent>
        </Card>

        {/* Current Investments Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Investments
            </CardTitle>
            <CardDescription>A snapshot of your investment portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
             <div className="rounded-md border p-4">
                <p className="text-muted-foreground">Tech Innovators Fund</p>
                <p className="text-xl font-bold">₹15,25,050</p>
             </div>
             <div className="rounded-md border p-4">
                <p className="text-muted-foreground">Downtown Real Estate</p>
                <p className="text-xl font-bold">₹25,50,000</p>
             </div>
             <div className="rounded-md border p-4">
                <p className="text-muted-foreground">Green Energy Bonds</p>
                <p className="text-xl font-bold">₹5,12,075</p>
             </div>
          </CardContent>
        </Card>

        {/* Loan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Active Loans
            </CardTitle>
            <CardDescription>Details of your outstanding loans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Home Loan:</span> <span className="font-medium">₹45,00,000</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Car Loan:</span> <span className="font-medium">₹3,50,000</span></div>
             <div className="flex justify-between font-semibold"><span className="text-foreground">Total Outstanding:</span> <span>₹48,50,000</span></div>
          </CardContent>
        </Card>

        {/* EMI Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Monthly EMIs
            </CardTitle>
            <CardDescription>Your equated monthly installments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Home Loan EMI:</span> <span className="font-medium">₹38,500</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Car Loan EMI:</span> <span className="font-medium">₹12,500</span></div>
             <div className="flex justify-between font-semibold"><span className="text-foreground">Total Monthly EMI:</span> <span>₹51,000</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
