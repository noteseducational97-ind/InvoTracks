
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, DollarSign, TrendingUp, Landmark, Receipt, Pencil, PlusCircle, Loader2, Wallet, Info, Shield } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { cn } from "@/lib/utils";


type Frequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

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

interface InsuranceCategory extends InvestmentCategory {
    frequency: Frequency;
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
        emergencyFund: InvestmentCategory;
        termInsurance: InsuranceCategory;
        healthInsurance: InsuranceCategory;
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

  const calculateMonthlyInsurancePremium = (insurance: InsuranceCategory | undefined): number => {
    if (!insurance || insurance.invested !== 'yes' || !insurance.amount) {
        return 0;
    }
    const amount = Number(insurance.amount) || 0;
    const frequency = insurance.frequency || 'yearly';

    switch (frequency) {
        case 'monthly':
            return amount;
        case 'quarterly':
            return amount / 3;
        case 'half-yearly':
            return amount / 6;
        case 'yearly':
            return amount / 12;
        default:
            return 0;
    }
  };
  

  const totalMonthlyExpenses = financialProfile ? Object.values(financialProfile.expenses).reduce((acc, val) => acc + (Number(val) || 0), 0) : 0;
  const totalOutstandingLoan = financialProfile ? financialProfile.loans.reduce((acc, loan) => acc + (Number(loan.amount) || 0), 0) : 0;
  const totalMonthlyEmi = financialProfile ? financialProfile.loans.reduce((acc, loan) => acc + (Number(loan.emi) || 0), 0) : 0;

  const monthlySIP = (financialProfile?.investments.mutualFunds.invested === 'yes' ? Number(financialProfile.investments.mutualFunds.amount) : 0) || 0;
  const totalMonthlyIncome = Number(financialProfile?.monthlyIncome || 0) + (Number(financialProfile?.annualIncome || 0) / 12);
  const monthlyHealthInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.healthInsurance);
  const monthlyTermInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.termInsurance);
  
  const totalMonthlyInsurance = monthlyHealthInsurance + monthlyTermInsurance;
  const netMonthlyCashflow = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyEmi - totalMonthlyInsurance - monthlySIP;

  // 50-30-20 Rule Calculations
  const expensePercentage = totalMonthlyIncome > 0 ? ((totalMonthlyExpenses) / totalMonthlyIncome) * 100 : 0;
  const emiPercentage = totalMonthlyIncome > 0 ? (totalMonthlyEmi / totalMonthlyIncome) * 100 : 0;
  const investmentPercentage = totalMonthlyIncome > 0 ? ((monthlySIP + totalMonthlyInsurance) / totalMonthlyIncome) * 100 : 0;

  // Emergency Fund Calculations
  const currentEmergencyFund = Number(financialProfile?.investments.emergencyFund?.amount || 0);
  const minRecommendedFund = totalMonthlyIncome * 6;
  const maxRecommendedFund = totalMonthlyIncome * 18;
  let emergencyFundStatus: 'low' | 'good' | 'high' = 'low';
  if (currentEmergencyFund >= minRecommendedFund && currentEmergencyFund <= maxRecommendedFund) {
    emergencyFundStatus = 'good';
  } else if (currentEmergencyFund > maxRecommendedFund) {
    emergencyFundStatus = 'high';
  }
  

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
         const isInsurance = key === 'termInsurance' || key === 'healthInsurance';
         const insuranceValue = value as InsuranceCategory;
         const label = {
            stocks: "Stocks",
            mutualFunds: "Mutual Funds (SIP)",
            bonds: "Bonds",
            realEstate: "Real Estate",
            commodities: "Commodities",
            other: "Other Investments",
            emergencyFund: "Emergency Fund",
            termInsurance: "Term Insurance Premium",
            healthInsurance: "Health Insurance Premium"
        }[key as keyof FinancialProfile['investments']] || "Investment";
        
        let displayValue;
        if (key === 'mutualFunds') {
            displayValue = `${formatCurrency(value.amount)} (monthly)`;
        } else if (isInsurance) {
             displayValue = `${formatCurrency(value.amount)} (${insuranceValue.frequency})`;
        } else {
            displayValue = formatCurrency(value.amount);
        }

        return { name: label, value: displayValue };
    });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Manage Your Finances</h1>
            <p className="text-muted-foreground">A centralized view of your financial details and commitments.</p>
        </div>
        <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/manage/edit"><Pencil className="h-4 w-4 mr-2" />Edit Details</Link>
        </Button>
      </div>


      <div className="mt-6 grid gap-6">

        {/* Personal & Income Details Card */}
        <Card>
          <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal & Income Details
              </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
            <div><span className="text-muted-foreground block">Name</span> <span className="font-medium">{financialProfile.name}</span></div>
            <div>
              <span className="text-muted-foreground block">Date of Birth</span> 
              <span className="font-medium">{financialProfile.dob} {financialProfile.dob && `(Age: ${calculateAge(financialProfile.dob)})`}</span>
            </div>
            <div><span className="text-muted-foreground block">Risk Profile</span> <span className="font-medium">{financialProfile.riskPercentage}%</span></div>
            <div><span className="text-muted-foreground block">Monthly Income</span> <span className="font-medium">{formatCurrency(financialProfile.monthlyIncome)}</span></div>
            <div><span className="text-muted-foreground block">Annual Income</span> <span className="font-medium">{formatCurrency(financialProfile.annualIncome)}</span></div>
            <div><span className="text-muted-foreground block">Overall Monthly Income</span> <span className="font-medium">{formatCurrency(totalMonthlyIncome)}</span></div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Expenses Card */}
            <Card>
              <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Monthly Expenses
                    </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {Object.entries(financialProfile.expenses).filter(([, value]) => Number(value) > 0).length > 0 ?
                    Object.entries(financialProfile.expenses).filter(([, value]) => Number(value) > 0).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> 
                        <span className="font-medium">{formatCurrency(value)}</span>
                        </div>
                    ))
                    : <p className="text-muted-foreground text-sm">No expenses provided.</p>
                }
                <div className="flex justify-between font-semibold pt-2 border-t"><span className="text-foreground">Total Monthly Expenses:</span> <span>{formatCurrency(totalMonthlyExpenses)}</span></div>
              </CardContent>
            </Card>

            {/* Current Investments Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Investments & Insurance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                 {existingInvestments.length > 0 ? existingInvestments.map(investment => (
                    <div key={investment.name} className="flex justify-between">
                        <p className="text-muted-foreground">{investment.name}</p>
                        <p className="font-medium">{investment.value}</p>
                    </div>
                 )) : <p className="text-muted-foreground">No investments or insurance details provided.</p>}
              </CardContent>
            </Card>
        </div>


        {/* Loan Card */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Active Loans & EMIs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {financialProfile.loans.filter(loan => Number(loan.amount) > 0).length > 0 ? (
                <>
                {financialProfile.loans.filter(loan => Number(loan.amount) > 0).map(loan => (
                     <div key={loan.id} className="p-4 rounded-lg border">
                        <h4 className="font-semibold capitalize mb-2">{loan.type} Loan</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div><span className="text-muted-foreground block">Loan Amount</span> <span className="font-medium">{formatCurrency(loan.amount)}</span></div>
                            <div><span className="text-muted-foreground block">Monthly EMI</span> <span className="font-medium">{formatCurrency(loan.emi)}</span></div>
                            <div><span className="text-muted-foreground block">Interest Rate</span> <span className="font-medium">{loan.rate}%</span></div>
                            <div><span className="text-muted-foreground block">Tenure</span> <span className="font-medium">{loan.tenure} Years</span></div>
                        </div>
                     </div>
                ))}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold pt-4 border-t">
                    <div className="flex justify-between"><span className="text-foreground">Total Outstanding Loan:</span> <span>{formatCurrency(totalOutstandingLoan)}</span></div>
                    <div className="flex justify-between"><span className="text-foreground">Total Monthly EMI:</span> <span>{formatCurrency(totalMonthlyEmi)}</span></div>
                </div>
                </>
            ): (
                 <p className="text-muted-foreground">No active loan details provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    Financial Summary
                </CardTitle>
                 <CardDescription>A breakdown of your monthly cashflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Monthly Income</span>
                    <span className="font-medium text-green-600">{formatCurrency(totalMonthlyIncome)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Monthly Expenses</span>
                    <span className="font-medium text-red-600">-{formatCurrency(totalMonthlyExpenses)}</span>
                </div>
                 {totalMonthlyInsurance > 0 && (
                   <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Insurance Premiums</span>
                        <span className="font-medium text-red-600">-{formatCurrency(totalMonthlyInsurance)}</span>
                    </div>
                )}
                 {monthlySIP > 0 && (
                   <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly SIP Investment</span>
                        <span className="font-medium text-red-600">-{formatCurrency(monthlySIP)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Monthly Loan EMI</span>
                    <span className="font-medium text-red-600">-{formatCurrency(totalMonthlyEmi)}</span>
                </div>
                <div className="flex justify-between font-bold pt-4 border-t text-base">
                    <span className="text-foreground">Net Monthly Cashflow</span>
                    <span className={netMonthlyCashflow >= 0 ? 'text-green-700' : 'text-red-700'}>
                        {formatCurrency(netMonthlyCashflow)}
                    </span>
                </div>
            </CardContent>
        </Card>

        {/* Emergency Fund Plan Card */}
        {totalMonthlyIncome > 0 && (
            <Card className={cn(
                emergencyFundStatus === 'low'
                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
            )}>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Emergency Fund Plan
                    </CardTitle>
                    <CardDescription className={cn(
                        emergencyFundStatus === 'low' ? 'text-red-900/80 dark:text-red-200/80' : 'text-green-900/80 dark:text-green-200/80'
                    )}>
                        An emergency fund should cover 6 to 18 months of your monthly income.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <Card>
                        <CardHeader className="p-4">
                            <CardDescription>Current Fund</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(currentEmergencyFund)}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="p-4">
                            <CardDescription>Recommended Range</CardDescription>
                            <CardTitle className="text-2xl">{formatCurrency(minRecommendedFund)} - {formatCurrency(maxRecommendedFund)}</CardTitle>
                             <p className="text-xs text-muted-foreground mt-1">Minimum 6x and maximum 18x of your monthly salary.</p>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="p-4">
                            <CardDescription>Status</CardDescription>
                            <CardTitle className={cn("text-2xl capitalize", 
                                emergencyFundStatus === 'low' ? 'text-red-600' : 'text-green-600'
                            )}>
                                {emergencyFundStatus === 'low' && 'Below Recommended'}
                                {emergencyFundStatus === 'good' && 'Within Range'}
                                {emergencyFundStatus === 'high' && 'Above Recommended'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </CardContent>
            </Card>
        )}
        
        {/* 50-30-20 Rule Analysis Card */}
        {totalMonthlyIncome > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        50-30-20 Rule Analysis
                    </CardTitle>
                    <CardDescription>
                        A popular guideline for budgeting: allocate 50% of your income to needs, 30% to wants/loans, and 20% to savings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <Card className={cn(
                        expensePercentage <= 50
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                    )}>
                        <CardHeader className="p-4">
                            <CardDescription>Needs (Expenses)</CardDescription>
                            <CardTitle className="text-2xl">{expensePercentage.toFixed(1)}%</CardTitle>
                            <p className={cn("font-semibold", expensePercentage <= 50 ? 'text-green-600' : 'text-red-600')}>
                                {expensePercentage <= 50 ? 'On Track (<= 50%)' : 'High (> 50%)'}
                            </p>
                        </CardHeader>
                    </Card>
                     <Card className={cn(
                        emiPercentage <= 30
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                    )}>
                        <CardHeader className="p-4">
                            <CardDescription>Wants (EMIs/Debts)</CardDescription>
                            <CardTitle className="text-2xl">{emiPercentage.toFixed(1)}%</CardTitle>
                            <p className={cn("font-semibold", emiPercentage <= 30 ? 'text-green-600' : 'text-red-600')}>
                                {emiPercentage <= 30 ? 'On Track (<= 30%)' : 'High (> 30%)'}
                            </p>
                        </CardHeader>
                    </Card>
                    <Link href="/dashboard/manage/edit" className="group">
                        <Card className={cn(
                            "transition-all group-hover:ring-2 group-hover:ring-primary h-full",
                            investmentPercentage >= 20
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700"
                        )}>
                            <CardHeader className="p-4">
                                <CardDescription>Savings (Investments)</CardDescription>
                                <CardTitle className="text-2xl">{investmentPercentage.toFixed(1)}%</CardTitle>
                                <p className={cn("font-semibold", investmentPercentage >= 20 ? 'text-green-600' : 'text-red-600')}>
                                    {investmentPercentage >= 20 ? 'On Track (>= 20%)' : 'Low (< 20%)'}
                                </p>
                            </CardHeader>
                        </Card>
                    </Link>
                </CardContent>
                <CardFooter>
                     <div className="text-center text-muted-foreground text-sm w-full">
                        {expensePercentage > 50 && <p>Your expenses are higher than the recommended 50%. Consider reviewing your spending on non-essential items.</p>}
                        {emiPercentage > 30 && <p>Your loan EMIs are taking up a significant portion of your income. Focusing on prepayments could be beneficial.</p>}
                        {investmentPercentage < 20 && <p>Your investment rate is below the recommended 20%. Try to increase your savings to build wealth faster.</p>}
                        {expensePercentage <= 50 && emiPercentage <= 30 && investmentPercentage >= 20 && <p className="text-green-600 font-medium">Great job! Your budget aligns well with the 50-30-20 rule.</p>}
                    </div>
                </CardFooter>
            </Card>
        )}

      </div>
    </div>
  );
}
