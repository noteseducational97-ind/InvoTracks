import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { File, ListFilter, PlusCircle } from 'lucide-react';

const invoices = [
    { id: 'INV-001', client: 'Alpha Corp', amount: '$2,500.00', due: '2024-07-30', status: 'Paid' },
    { id: 'INV-002', client: 'Beta Inc.', amount: '$1,500.00', due: '2024-08-15', status: 'Pending' },
    { id: 'INV-003', client: 'Gamma LLC', amount: '$350.00', due: '2024-06-25', status: 'Overdue' },
    { id: 'INV-004', client: 'Delta Co.', amount: '$450.00', due: '2024-07-22', status: 'Pending' },
    { id: 'INV-005', client: 'Epsilon Ltd.', amount: '$5,600.00', due: '2024-05-30', status: 'Paid' },
    { id: 'INV-006', client: 'Zeta Solutions', amount: '$750.00', due: '2024-08-01', status: 'Draft' },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Paid: 'default',
    Pending: 'secondary',
    Overdue: 'destructive',
    Draft: 'outline',
};

export default function InvoicesPage() {
    return (
        <Tabs defaultValue="all">
            <div className="flex items-center">
                <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Filter
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem checked>Paid</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Overdue</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Export
                        </span>
                    </Button>
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Invoice
                        </span>
                    </Button>
                </div>
            </div>
            <TabsContent value="all">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Invoices</CardTitle>
                        <CardDescription>Manage your investment-related invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>{invoice.client}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant[invoice.status] || 'secondary'}>{invoice.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{invoice.amount}</TableCell>
                                        <TableCell className="text-right">{invoice.due}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
