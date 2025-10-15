'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

// Re-using the interface from the manage page. This could be moved to a shared types file.
interface FinancialProfile {
    id: string;
    // Add other properties as needed for calculations
}

export default function InvestmentsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const financialProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'financial_profile', 'default');
    }, [user, firestore]);

    const { data: financialProfile, isLoading: isProfileLoading } = useDoc<FinancialProfile>(financialProfileRef);

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

            {!financialProfile ? (
                 <Card className="mt-6 text-center">
                    <CardHeader>
                        <CardTitle className="font-headline">Generate Your Investment Plan</CardTitle>
                        <CardDescription>First, we need your financial details to create a personalized plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <p className="text-sm text-muted-foreground">Click below to add your financial information.</p>
                        <div className="flex items-center gap-4">
                            <Button asChild>
                                <Link href="/dashboard/manage/add-details">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Information
                                </Link>
                            </Button>
                            <Button disabled>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Plan
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="mt-6">
                    {/* Placeholder for when the user HAS filled in details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Suggested Plan</CardTitle>
                            <CardDescription>Based on your remaining monthly income, here are some suggestions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Plan
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
