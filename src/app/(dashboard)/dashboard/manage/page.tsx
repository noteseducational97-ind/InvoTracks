
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, DollarSign, TrendingUp, Landmark, Receipt, Pencil, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

interface Loan {
  id: number;
  type: string;
  amount: string;
  emi: string;
  rate: string;
  tenure: string;
};

interface InvestmentCategory {
  invested: 'yes' | 'no';
  amount: string;
}

interface FinancialProfile {
    id: string;
    name: string;
    dob: string;
    riskPercentage: string;
    monthlyIncome: string;
    annualIncome: string;
    expenses: {
        rent: string;
        utilities: string;
        transport: string;
        food: string;
        entertainment: string;
        healthcare: string;
        other: string;
    },
    loans: Loan[];
    investments: {
        stocks: InvestmentCategory;
        mutualFunds: InvestmentCategory;
        bonds: InvestmentCategory;
        realEstate: InvestmentCategory;
        commodities: InvestmentCategory;
        other: InvestmentCategory;
        termInsurance: InvestmentCategory;
        healthInsurance: InvestmentCategory;
    };
}


export default function ManagePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const financialProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'financial_profile', 'default');
  }, [user, firestore]);

  const { data: financialProfile, isLoading: isProfileLoading } = useDoc<FinancialProfile>(financialProfileRef);

  const formatCurrency = (value: number | string) => {
    const numValue = Number(value) || 0;
    return numValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
  };

  const totalMonthlyExpenses = financialProfile ? Object.values(financialProfile.expenses).reduce((acc, val) => acc + (Number(val) || 0), 0) : 0;
  const totalOutstandingLoan = financialProfile ? financialProfile.loans.reduce((acc, loan) => acc + (Number(loan.amount) || 0), 0) : 0;
  const totalMonthlyEmi = financialProfile ? financialProfile.loans.reduce((acc, loan) => acc + (Number(loan.emi) || 0), 0) : 0;

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!financialProfile) {
    return (
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Manage Your Finances</h1>
        <p className="text-muted-foreground">A centralized view of your financial details and commitments.</p>
        <Card className="mt-6 text-center">
            <CardHeader>
                <CardTitle className="font-headline">Welcome to Your Financial Hub</CardTitle>
                <CardDescription>Get started by adding your financial details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/dashboard/manage/add-details">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Details
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    )
  }

  const existingInvestments = Object.entries(financialProfile.investments)
    .filter(([, value]) => value.invested === 'yes' && Number(value.amount) > 0)
    .map(([key, value]) => {
         const label = {
            stocks: "Stocks",
            mutualFunds: "Mutual Funds",
            bonds: "Bonds",
            realEstate: "Real Estate",
            commodities: "Commodities",
            other: "Other Investments",
            termInsurance: "Term Insurance",
            healthInsurance: "Health Insurance"
        }[key as keyof FinancialProfile['investments']] || "Investment";
        return { name: label, value: value.amount };
    });

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">Manage Your Finances</h1>
      <p className="text-muted-foreground">A centralized view of your financial details and commitments.</p>

      <div className="mt-6 grid gap-6">

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1.5">
                <CardTitle className="font-headline flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Financial Profile
                </CardTitle>
                <CardDescription>Your personal, income, expenses and loan details.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/manage/edit"><Pencil className="h-4 w-4 mr-2" />Edit</Link>
                </Button>
            </CardHeader>
        </Card>


        {/* Personal & Income Details Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="space-y-1.5">
              <CardTitle className="font-headline flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Details
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{financialProfile.name}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth:</span> 
              <span className="font-medium">{financialProfile.dob} {financialProfile.dob && `(Age: ${calculateAge(financialProfile.dob)})`}</span>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Risk Profile:</span> <span className="font-medium">{financialProfile.riskPercentage}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Monthly Income:</span> <span className="font-medium">{formatCurrency(financialProfile.monthlyIncome)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Annual Income:</span> <span className="font-medium">{formatCurrency(financialProfile.annualIncome)}</span></div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="space-y-1.5">
                <CardTitle className="font-headline flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Monthly Expenses
                </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Object.entries(financialProfile.expenses).filter(([, value]) => Number(value) > 0).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span> 
                  <span className="font-medium">{formatCurrency(value)}</span>
                </div>
            ))}
            <div className="flex justify-between font-semibold pt-2 border-t"><span className="text-foreground">Total Monthly Expenses:</span> <span>{formatCurrency(totalMonthlyExpenses)}</span></div>
          </CardContent>
        </Card>

        {/* Current Investments Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Current Investments & Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
             {existingInvestments.length > 0 ? existingInvestments.map(investment => (
                <div key={investment.name} className="rounded-md border p-4">
                    <p className="text-muted-foreground">{investment.name}</p>
                    <p className="text-xl font-bold">{formatCurrency(investment.value)}</p>
                </div>
             )) : <p className="text-muted-foreground md:col-span-3">No investments or insurance details provided.</p>}
          </CardContent>
        </Card>

        {/* Loan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {financialProfile.loans.map(loan => (
                 <div key={loan.id} className="flex justify-between"><span className="text-muted-foreground capitalize">{loan.type} Loan:</span> <span className="font-medium">{formatCurrency(loan.amount)}</span></div>
            ))}
             <div className="flex justify-between font-semibold pt-2 border-t"><span className="text-foreground">Total Outstanding:</span> <span>{formatCurrency(totalOutstandingLoan)}</span></div>
          </CardContent>
        </Card>

        {/* EMI Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Monthly EMIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {financialProfile.loans.map(loan => (
                 <div key={loan.id} className="flex justify-between"><span className="text-muted-foreground capitalize">{loan.type} Loan EMI:</span> <span className="font-medium">{formatCurrency(loan.emi)}</span></div>
            ))}
             <div className="flex justify-between font-semibold pt-2 border-t"><span className="text-foreground">Total Monthly EMI:</span> <span>{formatCurrency(totalMonthlyEmi)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
