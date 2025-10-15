'use client';
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
    const { user } = useUser();
    const avatarImage = PlaceHolderImages.find(p => p.id === 'user-avatar');
    
    const userInitials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('');

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Your Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information.</p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                                {user.photoURL ? (
                                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                                ) : avatarImage && (
                                    <AvatarImage src={avatarImage.imageUrl} alt={user.displayName || 'User'} data-ai-hint={avatarImage.imageHint} />
                                )}
                                <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold font-headline">{user.displayName}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Button variant="outline" size="sm" className="mt-4">Change Picture</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Account Details</CardTitle>
                            <CardDescription>Details about your InvoTrack account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">User ID</span>
                                <span className="font-mono text-sm">{user.uid}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Account Created</span>
                                <span className="text-sm">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Last Signed In</span>
                                <span className="text-sm">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Email Verified</span>
                                <span className={`text-sm font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                                    {user.emailVerified ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="font-headline">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-2">
                           <Button asChild>
                                <Link href="/dashboard/settings">Edit Profile & Settings</Link>
                           </Button>
                           <Button variant="outline">Change Password</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
