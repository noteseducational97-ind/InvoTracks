
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Shield, Landmark, TrendingUp, Wallet, PieChart as PieChartIcon, Target, Sprout } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Separator } from "@/components/ui/separator";


// Define simpler, local types for the plan
type InvestmentPlan = {
  netMonthlyCashflow: number;
  loanRepaymentAmount: number;
  emergencyFundAmount: number;
  mutualFundAmount: number;
  equityAmount: number;
  debtAmount: number;
  age: number;
};

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
        termInsurance: InsuranceCategory;
        healthInsurance: InsuranceCategory;
    };
}


export default function InvestmentsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [plan, setPlan] = useState<InvestmentPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const financialProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'financial_profile', 'default');
    }, [user, firestore]);

    const { data: financialProfile, isLoading: isProfileLoading } = useDoc<FinancialProfile>(financialProfileRef);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    const calculateAge = (dobString: string) => {
      if (!dobString) return 0;
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
    
    useEffect(() => {
        if (!financialProfile) {
            setPlan(null);
            setError(null);
            return;
        };

        const generatePlan = () => {
            try {
                const totalMonthlyExpenses = Object.values(financialProfile.expenses).reduce((acc, val) => acc + (Number(val) || 0), 0);
                const totalMonthlyEmi = financialProfile.loans.reduce((acc, loan) => acc + (Number(loan.emi) || 0), 0);
                const totalMonthlyIncome = Number(financialProfile?.monthlyIncome || 0) + (Number(financialProfile?.annualIncome || 0) / 12);
                const monthlyHealthInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.healthInsurance);
                const monthlyTermInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.termInsurance);
                const totalMonthlyInsurance = monthlyHealthInsurance + monthlyTermInsurance;
                const netMonthlyCashflow = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyEmi - totalMonthlyInsurance;
                const age = calculateAge(financialProfile.dob);

                if (totalMonthlyIncome <= 0) {
                     setError("Your income details are not provided. Please update your profile to generate a plan.");
                     setPlan(null);
                     return;
                }
                
                if (netMonthlyCashflow <= 0) {
                    setError("Your net monthly cashflow is not positive. Adjust your expenses or income to generate an investment plan.");
                    setPlan(null);
                    return;
                }

                // New calculation logic
                const loanRepaymentAmount = totalMonthlyEmi > 0 ? totalMonthlyEmi * 0.10 : 0;
                const amountAfterLoanRepayment = netMonthlyCashflow - loanRepaymentAmount;
                
                const emergencyFundAmount = amountAfterLoanRepayment > 0 ? amountAfterLoanRepayment * 0.30 : 0;
                const mutualFundAmount = amountAfterLoanRepayment > 0 ? amountAfterLoanRepayment - emergencyFundAmount : 0;

                const equityPercentage = (100 - age) / 100;
                const debtPercentage = age / 100;

                const equityAmount = mutualFundAmount * equityPercentage;
                const debtAmount = mutualFundAmount * debtPercentage;


                const generatedPlan: InvestmentPlan = {
                    netMonthlyCashflow,
                    loanRepaymentAmount,
                    emergencyFundAmount,
                    mutualFundAmount,
                    equityAmount,
                    debtAmount,
                    age,
                };

                setPlan(generatedPlan);
                setError(null);
            } catch (e) {
                setError("An unexpected error occurred while generating the plan.");
                console.error(e);
            }
        };

        generatePlan();

    }, [financialProfile]);
    
    const chartConfig = plan ? {
        equity: { label: 'Equity', color: 'hsl(var(--chart-1))' },
        debt: { label: 'Debt', color: 'hsl(var(--chart-2))' },
        emergencyFund: { label: 'Emergency Fund', color: 'hsl(var(--chart-3))' },
        loanRepayment: { label: 'Loan Repayment', color: 'hsl(var(--chart-4))' },
    } : {};
    
    const chartData = plan ? [
        { name: 'equity', value: plan.equityAmount, label: 'Equity' },
        { name: 'debt', value: plan.debtAmount, label: 'Debt' },
        { name: 'emergencyFund', value: plan.emergencyFundAmount, label: 'Emergency Fund' },
        { name: 'loanRepayment', value: plan.loanRepaymentAmount, label: 'Loan Repayment' },
    ].filter(item => item.value > 0) : [];


    const renderContent = () => {
        if (isUserLoading || isProfileLoading) {
            return (
                <div className="flex min-h-[400px] w-full items-center justify-center rounded-lg border border-dashed">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            );
        }

        if (!financialProfile) {
            return (
                 <Card className="mt-6 text-center">
                    <CardHeader>
                        <CardTitle className="font-headline">Create Your Personalized Investment Plan</CardTitle>
                        <CardDescription>To create your personalized investment plan, please add your financial details first.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 pt-6">
                        <Button asChild>
                            <Link href="/dashboard/manage/add-details">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Financial Details
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (error) {
            return (
                <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
                    <p className="font-semibold text-destructive">Could Not Generate Plan</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                     <Button asChild className="mt-4" variant="outline">
                        <Link href="/dashboard/manage/edit">Review Your Details</Link>
                     </Button>
                </div>
            );
        }
        
        if (plan) {
            return (
                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Your Monthly Investment Plan</CardTitle>
                        <CardDescription>A summary of your monthly savings allocation and investment strategy.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Investable Amount</CardTitle>
                                    <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{formatCurrency(plan.netMonthlyCashflow)}</div>
                                    <p className="text-xs text-blue-700 dark:text-blue-400/80">Your net monthly savings.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300">Loan Prepayment</CardTitle>
                                    <Landmark className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{formatCurrency(plan.loanRepaymentAmount)}</div>
                                     <p className="text-xs text-orange-700 dark:text-orange-400/80">10% of your total monthly EMIs.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Emergency Fund</CardTitle>
                                    <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{formatCurrency(plan.emergencyFundAmount)}</div>
                                    <p className="text-xs text-indigo-700 dark:text-indigo-400/80">30% of remaining amount.</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Mutual Fund SIP</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-900 dark:text-green-200">{formatCurrency(plan.mutualFundAmount)}</div>
                                    <p className="text-xs text-green-700 dark:text-green-400/80">Final remaining amount for investment.</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator />

                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="font-headline text-lg flex items-center justify-center gap-2 mb-1"><PieChartIcon className="h-5 w-5 text-primary"/>Allocation Breakdown</h3>
                                <p className="text-sm text-muted-foreground">A visual breakdown of where your monthly savings are going.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                 <ChartContainer config={chartConfig} className="relative mx-auto aspect-square h-64">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                                {chartData.map((entry) => (
                                                    <Cell key={entry.name} fill={chartConfig[entry.name as keyof typeof chartConfig]?.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-sm text-muted-foreground">Total Amount</span>
                                        <span className="text-2xl font-bold">{formatCurrency(plan.netMonthlyCashflow)}</span>
                                    </div>
                                </ChartContainer>

                                <div className="space-y-4">
                                    {chartData.map((item) => {
                                        const config = chartConfig[item.name as keyof typeof chartConfig];
                                        return(
                                            <div key={item.name} className="flex items-center gap-4">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: config?.color }} />
                                                <div className="flex-1">
                                                    <p className="font-medium">{config?.label}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency(item.value)}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {((item.value / plan.netMonthlyCashflow) * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <Separator />

                        <div>
                            <h3 className="font-headline text-lg flex items-center gap-2 mb-4 justify-center">
                                <TrendingUp className="h-5 w-5 text-primary"/>
                                Mutual Fund SIP Breakdown
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Equity Investment</CardTitle>
                                        <Sprout className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{formatCurrency(plan.equityAmount)}</div>
                                        <p className="text-xs text-emerald-700 dark:text-emerald-400/80">
                                            {100 - plan.age}% of your mutual fund SIP (100-age rule).
                                        </p>
                                    </CardContent>
                                </Card>
                                 <Card className="bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-sky-800 dark:text-sky-300">Debt Investment</CardTitle>
                                        <Target className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-sky-900 dark:text-sky-200">{formatCurrency(plan.debtAmount)}</div>
                                        <p className="text-xs text-sky-700 dark:text-sky-400/80">
                                            {plan.age}% of your mutual fund SIP (your age).
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // Default fallback, could be a loading state for plan generation itself
        return (
             <div className="flex min-h-[400px] w-full items-center justify-center rounded-lg border border-dashed">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">Investment Plan</h1>
                <p className="text-muted-foreground">A personalized plan based on your financial profile and goals.</p>
            </div>

            {renderContent()}
        </div>
    );
}


    