
'use client';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, AuthError } from 'firebase/auth';

function SignupButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return <Button onClick={onClick} className="w-full" disabled={disabled}>{disabled ? 'Creating Account...' : 'Create an account'}</Button>;
}

function GoogleSignInButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
    return (
        <Button onClick={onClick} variant="outline" className="w-full" disabled={disabled}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.3 54.7l-73.2 67.7C313.6 99.8 283.7 84 248 84c-83.8 0-152.3 68.5-152.3 152S164.2 412 248 412c97.4 0 135.8-62.1 142.9-92.7H248v-83.8h235.2c4.7 25.8 7.2 54.3 7.2 85.8z"></path></svg>
            Sign up with Google
        </Button>
    )
}

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard/overview');
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Signup Failed',
        description: error,
        variant: 'destructive',
      });
      setError(null);
      setIsPending(false);
    }
  }, [error, toast]);
  
  const handleSignup = () => {
    if (!name || !email || !password) {
        setError("Please fill in all fields.");
        return;
    }
    setIsPending(true);
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            if (userCredential.user) {
                return updateProfile(userCredential.user, { displayName: name });
            }
        })
        .catch((e) => {
            const err = e as AuthError;
            setError(err.message);
        });
  }

  // On the signup page, we just redirect to the login page to handle Google sign-in.
  // This centralizes the Google sign-in logic and avoids potential issues with
  // multiple redirect handlers. Firebase handles account creation automatically
  // if the user signs in with a new Google account.
  const handleGoogleSignIn = () => {
      router.push('/login');
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
                <AppLogo />
            </div>
          <CardTitle className="font-headline text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your information to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Jane Doe" required value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isPending} />
            </div>
            <SignupButton onClick={handleSignup} disabled={isPending || isUserLoading} />
          </div>
          <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
          </div>
          <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isPending || isUserLoading} />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
