import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// In a real app, this would come from your database via a server action.
const mockUsers = [
    { id: '1', name: 'Prasanna Warade', email: 'prasannawarade0204@gmail.com', role: 'admin' },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
    { id: '3', name: 'John Smith', email: 'john@example.com', role: 'user' },
];

export default function AdminPage() {
    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and system settings.</p>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="font-headline">User Management</CardTitle>
                    <CardDescription>A list of all users in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
