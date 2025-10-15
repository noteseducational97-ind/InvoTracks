'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function AiPlanPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">AI Generated Plan</h1>
            <p className="text-muted-foreground">Let our AI help you create a personalized financial plan.</p>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="font-headline">Financial Plan Generator</CardTitle>
                    <CardDescription>Based on your profile, our AI can generate a custom investment and savings plan.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Click the button below to generate your plan.</p>
                        <Button>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate My Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
