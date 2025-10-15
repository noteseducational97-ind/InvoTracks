'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Shield, Banknote, Landmark, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";

// Define simpler, local types for the plan
type AssetAllocation = {
  largeCap?: { percentage: number };
  midCap?: { percentage: number };
  smallCap?: { percentage: number };
  emergencyFund?: { percentage: number };
};

type InvestmentPlan = {
  assetAllocation: AssetAllocation;
  suggestions: {
    icon: React.ElementType;
    category: string;
    description: string;
    suggestedAmount?: string;
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
  largeCap: {
    label: "Large Cap",
    color: "hsl(var(--chart-1))",
  },
  midCap: {
    label: "Mid Cap",
    color: "hsl(var(--chart-2))",
  },
  smallCap: {
    label: "Small Cap",
    color: "hsl(var(--chart-3))",
  },
  emergencyFund: {
      label: "Emergency Fund",
      color: "hsl(var(--chart-4))",
  }
} satisfies ChartConfig


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
    
    const calculateAge = (dobString: string) => {
        if (!dobString) return 35; // Default age if not provided
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (!financialProfile) {
            setPlan(null);
            setError(null);
            return;
        };

        const generatePlan = () => {
            try {
                // --- Start of local calculation ---
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

                const age = calculateAge(financialProfile.dob);
                const risk = Number(financialProfile.riskPercentage) || 50;

                const suggestions: InvestmentPlan['suggestions'] = [];
                
                // Insurance suggestions
                if (financialProfile.investments.healthInsurance.invested === 'no') {
                    suggestions.push({
                        icon: Shield,
                        category: "Health Insurance",
                        description: "Crucial for protecting against medical emergencies without draining your savings. It's recommended to get a family floater plan of at least ₹10 Lakhs.",
                    });
                }
                if (financialProfile.investments.termInsurance.invested === 'no') {
                     suggestions.push({
                        icon: Shield,
                        category: "Term Insurance",
                        description: "Essential for securing your family's financial future. Aim for a cover of at least 10-15 times your annual income.",
                    });
                }
                
                // Emergency Fund
                const emergencyFundTarget = totalMonthlyIncome * 6;
                 suggestions.push({
                    icon: Banknote,
                    category: "Emergency Fund",
                    description: `Build an emergency fund to cover at least 6 months of your current salary (${formatCurrency(totalMonthlyIncome)}/month). Your target should be at least ${formatCurrency(emergencyFundTarget)}. This fund provides a safety net for unexpected financial events.`,
                });
                
                // Loan Repayment
                if(financialProfile.loans.some(loan => Number(loan.amount) > 0)){
                    suggestions.push({
                        icon: Landmark,
                        category: "Loan Repayment",
                        description: "Consider making prepayments on high-interest loans (like personal loans or credit cards) to save on interest and become debt-free faster."
                    })
                }
                
                // Mutual Fund allocation
                let largeCap = 0, midCap = 0, smallCap = 0;
                if (age < 30) {
                    largeCap = 100 - risk;
                    smallCap = risk * 0.7;
                    midCap = risk * 0.3;
                } else if (age >= 30 && age < 45) {
                    largeCap = 110 - risk;
                    smallCap = risk * 0.5;
                    midCap = risk * 0.5;
                } else {
                    largeCap = 120 - risk;
                    smallCap = risk * 0.3;
                    midCap = risk * 0.7;
                }

                const total = largeCap + midCap + smallCap;
                const allocation: AssetAllocation = {
                    largeCap: { percentage: Math.round((largeCap/total) * 100) },
                    midCap: { percentage: Math.round((midCap/total) * 100) },
                    smallCap: { percentage: Math.round((smallCap/total) * 100) },
                };
                
                const totalAllocation = Object.values(allocation).reduce((sum, p) => sum + (p?.percentage || 0), 0);
                if(totalAllocation !== 100 && allocation.largeCap) {
                    allocation.largeCap.percentage += (100 - totalAllocation);
                }

                suggestions.push({
                    icon: TrendingUp,
                    category: "Mutual Fund SIP",
                    description: `Invest your net monthly savings via SIP for long-term growth. Based on your profile, a suggested breakdown is provided in the asset allocation chart.`,
                    suggestedAmount: formatCurrency(netMonthlyCashflow)
                });


                const generatedPlan: InvestmentPlan = {
                    assetAllocation: allocation,
                    suggestions: suggestions,
                    reasoning: `This plan is tailored for a ${age}-year-old with a ${risk}% risk tolerance. It prioritizes foundational security with insurance and an emergency fund. The mutual fund allocation is designed to balance growth and risk according to your age and profile, while also suggesting efficient loan repayment.`
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
    
    const chartData = plan?.assetAllocation ? Object.entries(plan.assetAllocation).map(([key, value]) => ({
        asset: chartConfig[key as keyof typeof chartConfig]?.label || key,
        amount: value?.percentage || 0,
        fill: chartConfig[key as keyof typeof chartConfig]?.color || "hsl(var(--muted))"
    })).filter(d => d.amount > 0) : [];

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
                <div className="mt-6 grid gap-6">
                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline text-lg">Asset Allocation</CardTitle>
                            <CardDescription>Suggested mutual fund SIP breakdown for your investable amount.</CardDescription>
                        </CardHeader>
                         <CardContent className="grid gap-6 lg:grid-cols-2">
                             <div className="flex items-center justify-center">
                                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px] max-w-[250px]">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="amount" formatter={(value) => `${value}%`} hideLabel />} />
                                            <Pie data={chartData} dataKey="amount" nameKey="asset" innerRadius={60} strokeWidth={5}>
                                                 {chartData.map((entry) => (
                                                    <Cell key={`cell-${entry.asset}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                             <Legend content={<ChartTooltipContent hideIndicator />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                             </div>
                             <div className="flex flex-col justify-center">
                                <h3 className="font-headline font-semibold">Plan Reasoning</h3>
                                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{plan.reasoning}</p>
                             </div>
                        </CardContent>
                    </Card>

                    <div>
                        <h3 className="font-headline text-xl font-semibold mb-4">Actionable Suggestions</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            {plan.suggestions.map((suggestion, index) => (
                                <Card key={index} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <suggestion.icon className="h-5 w-5 text-primary" />
                                            {suggestion.category}
                                        </CardTitle>
                                        {suggestion.category === 'Mutual Fund SIP' && suggestion.suggestedAmount && (
                                            <CardDescription>Overall investable amount: <span className="font-bold text-primary">{suggestion.suggestedAmount}</span></CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
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
        <div className="space-y-2">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Investment Plan</h1>
            <p className="text-muted-foreground">A personalized plan based on your financial profile and goals.</p>

            {renderContent()}
        </div>
    );
}
