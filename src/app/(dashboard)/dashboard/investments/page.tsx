'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, ResponsiveContainer } from "recharts";

// Define simpler, local types for the plan
type InvestmentPlan = {
  assetAllocation: {
    [key: string]: { percentage: number };
  };
  suggestions: {
    category: string;
    description: string;
    suggestedAmount: string;
  }[];
  reasoning: string;
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


const chartConfig = {
  amount: {
    label: "Amount",
  },
  mutualFunds: {
    label: "Mutual Funds",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function InvestmentsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [plan, setPlan] = useState<InvestmentPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false); // Kept for UI feedback, though generation is instant
    const [error, setError] = useState<string | null>(null);

    const financialProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'financial_profile', 'default');
    }, [user, firestore]);

    const { data: financialProfile, isLoading: isProfileLoading } = useDoc<FinancialProfile>(financialProfileRef);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
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

    const handleGeneratePlan = () => {
        if (!financialProfile) {
            setError("Financial profile is not available.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        
        // --- Start of local calculation ---
        const totalMonthlyExpenses = Object.values(financialProfile.expenses).reduce((acc, val) => acc + (Number(val) || 0), 0);
        const totalMonthlyEmi = financialProfile.loans.reduce((acc, loan) => acc + (Number(loan.emi) || 0), 0);
        const totalMonthlyIncome = Number(financialProfile?.monthlyIncome || 0) + (Number(financialProfile?.annualIncome || 0) / 12);
        const monthlyHealthInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.healthInsurance);
        const monthlyTermInsurance = calculateMonthlyInsurancePremium(financialProfile?.investments.termInsurance);
        const totalMonthlyInsurance = monthlyHealthInsurance + monthlyTermInsurance;
        const netMonthlyCashflow = totalMonthlyIncome - totalMonthlyExpenses - totalMonthlyEmi - totalMonthlyInsurance;

        if (netMonthlyCashflow <= 0) {
            setError("Your net monthly cashflow is not positive. Adjust your expenses or income to generate an investment plan.");
            setIsGenerating(false);
            setPlan(null);
            return;
        }

        const generatedPlan: InvestmentPlan = {
            assetAllocation: {
                mutualFunds: { percentage: 100 },
            },
            suggestions: [
                {
                    category: "Equity Mutual Funds",
                    description: "Investing your entire net monthly cashflow in equity mutual funds via a Systematic Investment Plan (SIP) is a great strategy for long-term wealth creation, leveraging the power of compounding.",
                    suggestedAmount: formatCurrency(netMonthlyCashflow),
                }
            ],
            reasoning: `Based on your profile, you have a net monthly cashflow of ${formatCurrency(netMonthlyCashflow)}. This plan allocates 100% of this amount to mutual funds, which is a suitable starting point for disciplined, long-term growth.`
        };
        // --- End of local calculation ---

        setPlan(generatedPlan);
        setIsGenerating(false);
    };
    
    const chartData = plan ? Object.entries(plan.assetAllocation).map(([key, value]) => ({
        asset: key,
        amount: value.percentage,
        fill: `var(--color-${key})`
    })) : [];

    if (isUserLoading || isProfileLoading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Investment Plan</h1>
            <p className="text-muted-foreground">Here is a detailed view of your portfolio.</p>

            <div className="mt-6">
                {!financialProfile ? (
                     <Card className="mt-6 text-center">
                        <CardHeader>
                            <CardTitle className="font-headline">Create Your Personalized Investment Plan</CardTitle>
                            <CardDescription>To create your personalized investment plan, please add your financial details first.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            <Button asChild>
                                <Link href="/dashboard/manage/add-details">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Financial Details
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : !plan && !isGenerating && !error ? (
                     <Card className="mt-6 text-center">
                        <CardHeader>
                            <CardTitle className="font-headline">Generate Your Investment Plan</CardTitle>
                            <CardDescription>You have added your financial details. You can now generate your personalized investment plan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleGeneratePlan}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Investment Plan
                            </Button>
                        </CardContent>
                    </Card>
                ) : null}

                {isGenerating && (
                    <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                            <p className="text-muted-foreground">Generating your personalized plan...</p>
                        </div>
                    </div>
                )}

                 {error && (
                    <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-md">
                        <p>{error}</p>
                        <Button onClick={handleGeneratePlan} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                )}

                {plan && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="font-headline text-lg font-semibold mb-2">Asset Allocation</h3>
                            <Card>
                                 <CardContent className="pt-6">
                                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                                         <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent nameKey="amount" hideLabel />} />
                                                <Pie data={chartData} dataKey="amount" nameKey="asset" innerRadius={60} strokeWidth={5}>
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                            <h3 className="font-headline text-lg font-semibold mt-6 mb-2">Reasoning</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{plan.reasoning}</p>
                        </div>
                        <div>
                            <h3 className="font-headline text-lg font-semibold mb-2">Investment Suggestions</h3>
                            <div className="space-y-4">
                                {plan.suggestions.map((suggestion, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{suggestion.category}</CardTitle>
                                            <CardDescription>Recommended monthly investment: <span className="font-bold text-primary">{suggestion.suggestedAmount}</span></CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                             <Button onClick={handleGeneratePlan} className="mt-6">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Re-generate Plan
                             </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
