
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Shield, Landmark, TrendingUp, Wallet, PieChart as PieChartIcon, Briefcase, Building, Factory, Sprout, PiggyBank, Droplets, BrainCircuit, Scale, Anchor, Combine, Gem } from "lucide-react";
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
  largeCapAmount: number;
  midCapAmount: number;
  smallCapAmount: number;
  flexiCapAmount: number;
  goldFundAmount: number;
  midTermDebtAmount: number;
  liquidGoldFundAmount: number;
  multiCapLoanRepaymentAmount: number;
  corporateBondLoanRepaymentAmount: number;
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
        emergencyFund: InvestmentCategory;
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
                const monthlySIP = (financialProfile.investments.mutualFunds.invested === 'yes' ? Number(financialProfile.investments.mutualFunds.amount) : 0) || 0;
                const totalMonthlyIncome = Number(financialProfile?.monthlyIncome || 0) + (Number(financialProfile?.annualIncome || 0) / 12);
                const monthlyHealthInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.healthInsurance);
                const monthlyTermInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.termInsurance);
                const totalMonthlyInsurance = monthlyHealthInsurance + monthlyTermInsurance;
                const netMonthlyCashflow = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyEmi - totalMonthlyInsurance - monthlySIP;
                const age = calculateAge(financialProfile.dob);
                const riskPercentage = Number(financialProfile.riskPercentage) || 50;

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

                let loanRepaymentAmount = 0;
                let cashflowForDistribution = netMonthlyCashflow;
                
                if (totalMonthlyEmi > 0) {
                    loanRepaymentAmount = totalMonthlyEmi * 0.10;
                    cashflowForDistribution -= loanRepaymentAmount;
                }
                
                const emergencyFundAmount = cashflowForDistribution * 0.30;
                const mutualFundAmount = cashflowForDistribution * 0.70;

                const totalInvestable = emergencyFundAmount + mutualFundAmount + loanRepaymentAmount;

                const equityPercentage = (100 - age) / 100;
                const debtPercentage = age / 100;

                const equityAmount = mutualFundAmount * equityPercentage;
                const debtAmount = mutualFundAmount * debtPercentage;
                
                // Loan Repayment Fund Allocation
                let multiCapLoanRepaymentAmount = 0;
                let corporateBondLoanRepaymentAmount = 0;
                if (loanRepaymentAmount > 0) {
                    if (riskPercentage < 60) { // Lower risk
                        corporateBondLoanRepaymentAmount = loanRepaymentAmount * 0.70;
                        multiCapLoanRepaymentAmount = loanRepaymentAmount * 0.30;
                    } else { // Higher risk
                        multiCapLoanRepaymentAmount = loanRepaymentAmount * 0.70;
                        corporateBondLoanRepaymentAmount = loanRepaymentAmount * 0.30;
                    }
                }
                
                // Debt Allocation Logic based on risk profile
                let baseLiquidAllocation;
                if (riskPercentage > 60) {
                    baseLiquidAllocation = 0.60;
                } else {
                    baseLiquidAllocation = 0.30;
                }
                const ageAdjustment = Math.max(0, (age - 25) / 100) * 0.5;
                let liquidAllocationPercentage = baseLiquidAllocation + ageAdjustment;
                liquidAllocationPercentage = Math.max(0.20, Math.min(0.80, liquidAllocationPercentage)); 

                const liquidGoldFundAmount = debtAmount * liquidAllocationPercentage;
                const midTermDebtAmount = debtAmount * (1 - liquidAllocationPercentage);
                
                let largeCapAmount = 0;
                let midCapAmount = 0;
                let smallCapAmount = 0;
                let flexiCapAmount = 0;
                let goldFundAmount = 0;

                if (riskPercentage < 60) {
                    if (mutualFundAmount < 3000) {
                        largeCapAmount = equityAmount * 0.6;
                        flexiCapAmount = equityAmount * 0.4;
                    } else {
                        largeCapAmount = equityAmount * 0.5;
                        flexiCapAmount = equityAmount * 0.3;
                        goldFundAmount = equityAmount * 0.2;
                    }
                } else { // risk >= 60
                    const ageFactor = Math.max(0, (50 - age) / 50); 
                    const riskFactor = riskPercentage / 100;
                    
                    let baseLargeCap = 0.40;
                    let baseFlexiCap = 0.30;
                    let baseSmallCap = 0.30;
                    
                    const smallCapAdjustment = (riskFactor - 0.5) * 0.2 + ageFactor * 0.1;
                    const largeCapAdjustment = (0.5 - riskFactor) * 0.1;
                    
                    let largeCapPercentage = baseLargeCap + largeCapAdjustment - (smallCapAdjustment/2);
                    let flexiCapPercentage = baseFlexiCap - (smallCapAdjustment / 2);
                    let smallCapPercentage = baseSmallCap + smallCapAdjustment;
                    
                    const total = largeCapPercentage + flexiCapPercentage + smallCapPercentage;
                    largeCapPercentage /= total;
                    flexiCapPercentage /= total;
                    smallCapPercentage /= total;

                    largeCapAmount = equityAmount * largeCapPercentage;
                    flexiCapAmount = equityAmount * flexiCapPercentage;
                    smallCapAmount = equityAmount * smallCapPercentage;
                }


                const generatedPlan: InvestmentPlan = {
                    netMonthlyCashflow: totalInvestable,
                    loanRepaymentAmount,
                    emergencyFundAmount,
                    mutualFundAmount,
                    equityAmount,
                    debtAmount,
                    age,
                    largeCapAmount,
                    midCapAmount,
                    smallCapAmount,
                    flexiCapAmount,
                    goldFundAmount,
                    midTermDebtAmount,
                    liquidGoldFundAmount,
                    multiCapLoanRepaymentAmount,
                    corporateBondLoanRepaymentAmount,
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
        debt: { label: 'Debt', color: 'hsl(var(--chart-5))' },
        emergencyFund: { label: 'Emergency Fund', color: 'hsl(var(--chart-2))' },
        loanRepayment: { label: 'Loan Repayment', color: 'hsl(var(--chart-3))' },
    } : {};

    const chartData = plan ? [
        { name: 'equity', value: plan.mutualFundAmount, label: 'Mutual Fund SIP' },
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
            const isLowRisk = (Number(financialProfile.riskPercentage) || 0) < 60;
            const allocationChartData = [
                { name: 'equity', value: plan.equityAmount, label: 'Equity' },
                { name: 'debt', value: plan.debtAmount, label: 'Debt' },
            ].filter(item => item.value > 0);
            
            const equityCards = (
                <>
                    {plan.largeCapAmount > 0 && <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Nifty 50/100 Index Fund</CardTitle>
                            <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{formatCurrency(plan.largeCapAmount)}</div>
                            <p className="text-xs text-muted-foreground">{((plan.largeCapAmount / plan.equityAmount) * 100).toFixed(1)}% of Equity</p>
                        </CardContent>
                    </Card>}
                    {plan.flexiCapAmount > 0 && <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">Flexi Cap Fund</CardTitle>
                            <Combine className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">{formatCurrency(plan.flexiCapAmount)}</div>
                            <p className="text-xs text-muted-foreground">{((plan.flexiCapAmount / plan.equityAmount) * 100).toFixed(1)}% of Equity</p>
                        </CardContent>
                    </Card>}
                    {plan.smallCapAmount > 0 && <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Small Cap Fund</CardTitle>
                            <Sprout className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{formatCurrency(plan.smallCapAmount)}</div>
                            <p className="text-xs text-muted-foreground">{((plan.smallCapAmount / plan.equityAmount) * 100).toFixed(1)}% of Equity</p>
                        </CardContent>
                    </Card>}
                    {plan.goldFundAmount > 0 && (
                        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">Gold Fund</CardTitle>
                                <Gem className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">{formatCurrency(plan.goldFundAmount)}</div>
                                <p className="text-xs text-muted-foreground">{((plan.goldFundAmount / plan.equityAmount) * 100).toFixed(1)}% of Equity</p>
                            </CardContent>
                        </Card>
                    )}
                </>
            );


            return (
                <>
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Your Monthly Investment Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             <Card className="bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-sky-800 dark:text-sky-300">Total Amount</CardTitle>
                                    <Wallet className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-sky-900 dark:text-sky-200">{formatCurrency(plan.netMonthlyCashflow)}</div>
                                </CardContent>
                            </Card>
                            {plan.loanRepaymentAmount > 0 && (
                                <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-300">Loan Prepayment</CardTitle>
                                        <Landmark className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-900 dark:text-orange-200">{formatCurrency(plan.loanRepaymentAmount)}</div>
                                    </CardContent>
                                </Card>
                            )}
                            <Card className="bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-lime-800 dark:text-lime-300">Emergency Fund</CardTitle>
                                    <Shield className="h-4 w-4 text-lime-600 dark:text-lime-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-lime-900 dark:text-lime-200">{formatCurrency(plan.emergencyFundAmount)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Mutual Fund SIP</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{formatCurrency(plan.mutualFundAmount)}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className="my-4"/>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-2">
                                <div className="text-center">
                                    <h3 className="font-headline text-lg flex items-center justify-center gap-2 mb-1"><PieChartIcon className="h-5 w-5 text-primary"/>Allocation Breakdown</h3>
                                    <p className="text-sm text-muted-foreground">A visual breakdown of where your monthly savings are going.</p>
                                </div>
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
                            </div>

                            <div className="space-y-4">
                                {chartData.map((item) => {
                                    const config = chartConfig[item.name as keyof typeof chartConfig];
                                    return (
                                        <div key={item.name}>
                                            <div className="flex items-center gap-4">
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
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary"/>
                            Mutual Fund Breakdown
                        </CardTitle>
                        <CardDescription>
                            Allocation based on your age ({plan.age}) and risk profile ({financialProfile.riskPercentage}%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-6">
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-center">Equity Allocation</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {equityCards}
                            </div>
                        </div>
                         <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-4 text-center">Debt Allocation</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-teal-800 dark:text-teal-300">Mid-Term Debt Fund</CardTitle>
                                        <PiggyBank className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-teal-900 dark:text-teal-200">{formatCurrency(plan.midTermDebtAmount)}</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-cyan-800 dark:text-cyan-300">
                                            {plan.goldFundAmount > 0 ? "Liquid Fund" : "Gold Fund"}
                                        </CardTitle>
                                        <Droplets className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-200">{formatCurrency(plan.liquidGoldFundAmount)}</div>
                                    </CardContent>
                                </Card>
                             </div>
                        </div>
                         { plan.loanRepaymentAmount > 0 && (
                            <div className="border rounded-lg p-4">
                                <h4 className="font-semibold mb-4 text-center">Loan Repayment Allocation</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-rose-800 dark:text-rose-300">
                                                 {isLowRisk ? "Flexi Cap Fund" : "Multi Cap Fund"}
                                            </CardTitle>
                                            <Scale className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-rose-900 dark:text-rose-200">{formatCurrency(plan.multiCapLoanRepaymentAmount)}</div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-300">Corporate Bond/Mid term Debt fund</CardTitle>
                                            <Anchor className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-200">{formatCurrency(plan.corporateBondLoanRepaymentAmount)}</div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                         )}
                    </CardContent>
                </Card>
                </>
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

    