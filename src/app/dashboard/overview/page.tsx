'use client'
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const chartData = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 1500 },
  { month: 'Mar', value: 1300 },
  { month: 'Apr', value: 1800 },
  { month: 'May', value: 2100 },
  { month: 'Jun', value: 2500 },
];

export default function OverviewPage() {
    const { user } = useUser();

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground">Here&apos;s a snapshot of your financial world.</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$51,024.12</div>
                        <p className="text-xs text-muted-foreground">+18.3% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Totaling $1,250.00</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Annualized Return</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+12.2%</div>
                        <p className="text-xs text-muted-foreground">Based on current performance</p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className='font-headline'>Investment Growth</CardTitle>
                        <CardDescription>Your portfolio value over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--background))', 
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: 'var(--radius)'
                                    }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="col-span-4 md:col-span-3">
                    <CardHeader>
                        <CardTitle className='font-headline'>Recent Activity</CardTitle>
                        <CardDescription>Recent transactions and invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Placeholder for recent activity */}
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Activity className="h-5 w-5 text-green-500 mr-3"/>
                                <div>
                                    <p className="text-sm font-medium">Dividend Received - AAPL</p>
                                    <p className="text-xs text-muted-foreground">June 20, 2024</p>
                                </div>
                                <div className="ml-auto font-medium">+$55.40</div>
                            </div>
                            <div className="flex items-center">
                                <FileText className="h-5 w-5 text-blue-500 mr-3"/>
                                <div>
                                    <p className="text-sm font-medium">Invoice #INV-007 Paid</p>
                                    <p className="text-xs text-muted-foreground">June 18, 2024</p>
                                </div>
                                <div className="ml-auto font-medium">$250.00</div>
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-red-500 mr-3"/>
                                <div>
                                    <p className="text-sm font-medium">Bought - TSLA</p>
                                    <p className="text-xs text-muted-foreground">June 15, 2024</p>
                                </div>
                                <div className="ml-auto font-medium">-$2,000.00</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
