
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Shield, Banknote, Landmark, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState, useEffect } from "react";

// Define simpler, local types for the plan
type InvestmentPlan = {
  netMonthlyCashflow: number;
  loanRepaymentAmount: number;
  emergencyFundAmount: number;
  mutualFundAmount: number;
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
                const loanRepaymentAmount = totalMonthlyEmi * 0.10;
                const amountAfterLoanRepayment = netMonthlyCashflow - loanRepaymentAmount;
                
                const emergencyFundAmount = amountAfterLoanRepayment > 0 ? amountAfterLoanRepayment * 0.30 : 0;
                const mutualFundAmount = amountAfterLoanRepayment > 0 ? amountAfterLoanRepayment - emergencyFundAmount : 0;

                const generatedPlan: InvestmentPlan = {
                    netMonthlyCashflow,
                    loanRepaymentAmount,
                    emergencyFundAmount,
                    mutualFundAmount,
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
                <div className="mt-6 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Your Monthly Investment Allocation</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Investable Amount</CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(plan.netMonthlyCashflow)}</div>
                                        <p className="text-xs text-muted-foreground">Your net monthly savings.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Loan Prepayment</CardTitle>
                                        <Landmark className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(plan.loanRepaymentAmount)}</div>
                                         <p className="text-xs text-muted-foreground">10% of your total monthly EMIs.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Emergency Fund</CardTitle>
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(plan.emergencyFundAmount)}</div>
                                        <p className="text-xs text-muted-foreground">30% of remaining amount.</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Mutual Fund SIP</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(plan.mutualFundAmount)}</div>
                                        <p className="text-xs text-muted-foreground">Final remaining amount.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
