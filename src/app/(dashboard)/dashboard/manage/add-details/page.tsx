
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, DollarSign, Landmark, TrendingUp, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Loan = {
  id: number;
  type: string;
  amount: string;
  emi: string;
  rate: string;
  tenure: string;
};

type InvestmentCategory = 'stocks' | 'mutualFunds' | 'bonds' | 'realEstate' | 'commodities' | 'other';

type InvestmentsState = {
  [key in InvestmentCategory]: {
    invested: 'yes' | 'no';
    amount: string;
  }
};


export default function AddDetailsPage() {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState<number | string>("");
  const [annualIncome, setAnnualIncome] = useState<number | string>("");
  const [overallMonthlyIncome, setOverallMonthlyIncome] = useState(0);
  const [loans, setLoans] = useState<Loan[]>([
    { id: Date.now(), type: '', amount: '', emi: '', rate: '', tenure: '' }
  ]);
  
  const [investments, setInvestments] = useState<InvestmentsState>({
    stocks: { invested: 'no', amount: '' },
    mutualFunds: { invested: 'no', amount: '' },
    bonds: { invested: 'no', amount: '' },
    realEstate: { invested: 'no', amount: '' },
    commodities: { invested: 'no', amount: '' },
    other: { invested: 'no', amount: '' },
  });


  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    const monthly = Number(monthlyIncome) || 0;
    const annual = Number(annualIncome) || 0;
    const calculatedOverall = monthly + (annual / 12);
    setOverallMonthlyIncome(calculatedOverall);
  }, [monthlyIncome, annualIncome]);
  
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
      [category]: { ...prev[category], invested: value }
    }));
  };

  const handleInvestmentAmountChange = (category: InvestmentCategory, amount: string) => {
    setInvestments(prev => ({
      ...prev,
      [category]: { ...prev[category], amount }
    }));
  };


  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="risk-percentage">Risk Percentage (%)</Label>
                <Input id="risk-percentage" type="number" placeholder="" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" />
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
                <Input id="rent" type="number" placeholder="" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="utilities">Utilities</Label>
                <Input id="utilities" type="number" placeholder="" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="transport">Transportation</Label>
                <Input id="transport" type="number" placeholder="" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="food">Groceries & Food</Label>
                <Input id="food" type="number" placeholder="" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="entertainment">Entertainment</Label>
                <Input id="entertainment" type="number" placeholder="" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="healthcare">Healthcare</Label>
                <Input id="healthcare" type="number" placeholder="" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="other-expenses">Other</Label>
                <Input id="other-expenses" type="number" placeholder="" />
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
                          <Input id={`loan-amount-${loan.id}`} type="number" placeholder="e.g., 500000" value={loan.amount} onChange={e => handleLoanChange(loan.id, 'amount', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`monthly-emi-${loan.id}`}>Monthly EMI (₹)</Label>
                          <Input id={`monthly-emi-${loan.id}`} type="number" placeholder="e.g., 12000" value={loan.emi} onChange={e => handleLoanChange(loan.id, 'emi', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`interest-rate-${loan.id}`}>Interest Rate (%)</Label>
                          <Input id={`interest-rate-${loan.id}`} type="number" placeholder="e.g., 8.5" value={loan.rate} onChange={e => handleLoanChange(loan.id, 'rate', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`tenure-${loan.id}`}>Tenure (Years)</Label>
                          <Input id={`tenure-${loan.id}`} type="number" placeholder="e.g., 5" value={loan.tenure} onChange={e => handleLoanChange(loan.id, 'tenure', e.target.value)} />
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
                    Existing Investments
                </CardTitle>
                <CardDescription>Enter the current value of your existing investments.</CardDescription>
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
                        other: "Other Investments"
                      }[category];

                      return (
                        <div key={category} className="p-4 border rounded-lg space-y-3">
                          <div className="space-y-2">
                            <Label>Do you invest in {label}?</Label>
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
                                <Label htmlFor={`${category}-amount`}>Current Value of {label} (₹)</Label>
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
            <Button>Save Details</Button>
        </div>
      </div>
    </div>
  );
}
