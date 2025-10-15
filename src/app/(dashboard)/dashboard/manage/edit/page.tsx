
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, DollarSign, Landmark, TrendingUp, PlusCircle, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser, useFirestore, useMemoFirebase, useDoc } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Loan = {
  id: number;
  type: string;
  amount: string;
  emi: string;
  rate: string;
  tenure: string;
};

type InvestmentCategory = 'stocks' | 'mutualFunds' | 'bonds' | 'realEstate' | 'commodities' | 'other' | 'termInsurance' | 'healthInsurance';

type InvestmentsState = {
  [key in InvestmentCategory]: {
    invested: 'yes' | 'no';
    amount: string;
  }
};

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
    investments: InvestmentsState;
}

const defaultExpenses = {
    rent: '',
    utilities: '',
    transport: '',
    food: '',
    entertainment: '',
    healthcare: '',
    other: ''
};

const defaultLoans = [
    { id: Date.now(), type: '', amount: '', emi: '', rate: '', tenure: '' }
];

const defaultInvestments: InvestmentsState = {
    stocks: { invested: 'no', amount: '' },
    mutualFunds: { invested: 'no', amount: '' },
    bonds: { invested: 'no', amount: '' },
    realEstate: { invested: 'no', amount: '' },
    commodities: { invested: 'no', amount: '' },
    other: { invested: 'no', amount: '' },
    termInsurance: { invested: 'no', amount: '' },
    healthInsurance: { invested: 'no', amount: '' },
};


export default function EditDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const financialProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'financial_profile', 'default');
  }, [user, firestore]);

  const { data: financialProfile, isLoading: isProfileLoading } = useDoc<FinancialProfile>(financialProfileRef);


  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [riskPercentage, setRiskPercentage] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number | string>("");
  const [annualIncome, setAnnualIncome] = useState<number | string>("");
  const [overallMonthlyIncome, setOverallMonthlyIncome] = useState(0);

  const [expenses, setExpenses] = useState(defaultExpenses);
  const [loans, setLoans] = useState<Loan[]>(defaultLoans);
  const [investments, setInvestments] = useState<InvestmentsState>(defaultInvestments);

  useEffect(() => {
    if (financialProfile) {
        setName(financialProfile.name || user?.displayName || "");
        setDob(financialProfile.dob || "");
        setRiskPercentage(financialProfile.riskPercentage || "");
        setMonthlyIncome(financialProfile.monthlyIncome || "");
        setAnnualIncome(financialProfile.annualIncome || "");
        setExpenses(financialProfile.expenses || defaultExpenses);
        setLoans(financialProfile.loans && financialProfile.loans.length > 0 ? financialProfile.loans : defaultLoans);
        setInvestments(financialProfile.investments || defaultInvestments);
    } else if (user) {
      setName(user.displayName || "");
    }
  }, [financialProfile, user]);


  useEffect(() => {
    const monthly = Number(monthlyIncome) || 0;
    const annual = Number(annualIncome) || 0;
    const calculatedOverall = monthly + (annual / 12);
    setOverallMonthlyIncome(calculatedOverall);
  }, [monthlyIncome, annualIncome]);

  const handleExpenseChange = (field: keyof typeof expenses, value: string) => {
    setExpenses(prev => ({...prev, [field]: value}));
  }
  
  const handleLoanChange = (id: number, field: keyof Omit<Loan, 'id'>, value: string) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => loan.id === id ? { ...loan, [field]: value } : loan)
    );
  };

  const addLoan = () => {
    setLoans(prevLoans => [
      ...prevLoans,
      { id: Date.now(), type: '', amount: '', emi: '', rate: '', tenure: '' }
    ]);
  };

  const removeLoan = (id: number) => {
    setLoans(prevLoans => prevLoans.filter(loan => loan.id !== id));
  };
  
  const handleInvestmentToggle = (category: InvestmentCategory, value: 'yes' | 'no') => {
    setInvestments(prev => ({
      ...prev,
      [category]: { ...prev[category], invested: value, amount: value === 'no' ? '' : prev[category].amount }
    }));
  };

  const handleInvestmentAmountChange = (category: InvestmentCategory, amount: string) => {
    setInvestments(prev => ({
      ...prev,
      [category]: { ...prev[category], amount }
    }));
  };

  const handleSaveDetails = async () => {
    if (!user || !firestore || !financialProfileRef) {
        toast({
            title: "Error",
            description: "You must be logged in to save details.",
            variant: "destructive",
        });
        return;
    }
    
    const profileData = {
        name,
        dob,
        riskPercentage,
        monthlyIncome,
        annualIncome,
        expenses,
        loans,
        investments,
    };
    
    try {
        await setDoc(financialProfileRef, profileData, { merge: true });
        toast({
            title: "Success",
            description: "Your financial details have been updated.",
        });
        router.push('/dashboard/manage');
    } catch (error) {
        console.error("Error saving details: ", error);
        toast({
            title: "Update Failed",
            description: "Could not update your details. Please try again.",
            variant: "destructive",
        });
    }
  };


  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  if (isProfileLoading) {
    return (
        <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div>
      <h1 className="font-headline text-3xl font-bold tracking-tight">Edit Your Financial Details</h1>
      <p className="text-muted-foreground">Update the form below to keep your financial view current.</p>

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
                <Input id="risk-percentage" type="number" placeholder="" value={riskPercentage} onChange={e => setRiskPercentage(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
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
                <Input id="rent" type="number" placeholder="" value={expenses.rent} onChange={e => handleExpenseChange('rent', e.target.value)}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="utilities">Utilities</Label>
                <Input id="utilities" type="number" placeholder="" value={expenses.utilities} onChange={e => handleExpenseChange('utilities', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="transport">Transportation</Label>
                <Input id="transport" type="number" placeholder="" value={expenses.transport} onChange={e => handleExpenseChange('transport', e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="food">Groceries & Food</Label>
                <Input id="food" type="number" placeholder="" value={expenses.food} onChange={e => handleExpenseChange('food', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="entertainment">Entertainment</Label>
                <Input id="entertainment" type="number" placeholder="" value={expenses.entertainment} onChange={e => handleExpenseChange('entertainment', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="healthcare">Healthcare</Label>
                <Input id="healthcare" type="number" placeholder="" value={expenses.healthcare} onChange={e => handleExpenseChange('healthcare', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="other-expenses">Other</Label>
                <Input id="other-expenses" type="number" placeholder="" value={expenses.other} onChange={e => handleExpenseChange('other', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Loan Card */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-primary" />
                    Loans
                </CardTitle>
                <CardDescription>Enter the details for each active loan or credit card debt.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loans.map((loan) => (
                <div key={loan.id} className="p-4 border rounded-lg relative">
                    {loans.length > 1 && (
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeLoan(loan.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                          <Label>Loan Type</Label>
                          <Select value={loan.type} onValueChange={(value) => handleLoanChange(loan.id, 'type', value)}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select loan type" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="home">Home Loan</SelectItem>
                                  <SelectItem value="car">Car Loan</SelectItem>
                                  <SelectItem value="personal">Personal Loan</SelectItem>
                                  <SelectItem value="credit-card">Credit Card Debt</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`loan-amount-${loan.id}`}>Loan Amount (₹)</Label>
                          <Input id={`loan-amount-${loan.id}`} type="number" placeholder="" value={loan.amount} onChange={e => handleLoanChange(loan.id, 'amount', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`monthly-emi-${loan.id}`}>Monthly EMI (₹)</Label>
                          <Input id={`monthly-emi-${loan.id}`} type="number" placeholder="" value={loan.emi} onChange={e => handleLoanChange(loan.id, 'emi', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`interest-rate-${loan.id}`}>Interest Rate (%)</Label>
                          <Input id={`interest-rate-${loan.id}`} type="number" placeholder="" value={loan.rate} onChange={e => handleLoanChange(loan.id, 'rate', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`tenure-${loan.id}`}>Tenure (Years)</Label>
                          <Input id={`tenure-${loan.id}`} type="number" placeholder="" value={loan.tenure} onChange={e => handleLoanChange(loan.id, 'tenure', e.target.value)} />
                      </div>
                    </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
               <Button variant="outline" onClick={addLoan}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Another Loan
                </Button>
            </CardFooter>
        </Card>

        {/* Existing Investment Card */}
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Existing Investments & Insurance
                </CardTitle>
                <CardDescription>Enter the current value of your existing investments and insurance policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid gap-6 md:grid-cols-2">
                    {Object.keys(investments).map((key) => {
                      const category = key as InvestmentCategory;
                      const label = {
                        stocks: "Stocks",
                        mutualFunds: "Mutual Funds",
                        bonds: "Bonds",
                        realEstate: "Real Estate",
                        commodities: "Commodities",
                        other: "Other Investments",
                        termInsurance: "Term Insurance",
                        healthInsurance: "Health Insurance"
                      }[category];
                      
                      const question = {
                        stocks: "Do you invest in Stocks?",
                        mutualFunds: "Do you invest in Mutual Funds?",
                        bonds: "Do you invest in Bonds?",
                        realEstate: "Do you invest in Real Estate?",
                        commodities: "Do you invest in Commodities?",
                        other: "Do you have Other Investments?",
                        termInsurance: "Do you have any Term Insurance?",
                        healthInsurance: "Do you have any Health Insurance?"
                      }[category];

                      const valueLabel = {
                        termInsurance: "Premium Amount (₹)",
                        healthInsurance: "Premium Amount (₹)",
                      }[category] || `Current Value of ${label} (₹)`;


                      return (
                        <div key={category} className="p-4 border rounded-lg space-y-3">
                          <div className="space-y-2">
                            <Label>{question}</Label>
                            <RadioGroup value={investments[category].invested} onValueChange={(value) => handleInvestmentToggle(category, value as 'yes' | 'no')} className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id={`${category}-yes`} />
                                    <Label htmlFor={`${category}-yes`}>Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id={`${category}-no`} />
                                    <Label htmlFor={`${category}-no`}>No</Label>
                                </div>
                            </RadioGroup>
                          </div>
                          {investments[category].invested === 'yes' && (
                            <div className="space-y-2 pt-2 border-t">
                                <Label htmlFor={`${category}-amount`}>{valueLabel}</Label>
                                <Input 
                                  id={`${category}-amount`} 
                                  type="number" 
                                  placeholder="Enter amount"
                                  value={investments[category].amount}
                                  onChange={(e) => handleInvestmentAmountChange(category, e.target.value)}
                                />
                            </div>
                          )}
                        </div>
                      )
                    })}
                 </div>
            </CardContent>
        </Card>


        <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
                <Link href="/dashboard/manage">Cancel</Link>
            </Button>
            <Button onClick={handleSaveDetails}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
