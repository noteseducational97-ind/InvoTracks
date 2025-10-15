
'use client';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, AuthError } from 'firebase/auth';

function LoginButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Signing In...' : 'Sign In'}</Button>;
}

function GoogleSignInButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="button" variant="outline" className="w-full" disabled={pending}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 173.3 54.7l-73.2 67.7C313.6 99.8 283.7 84 248 84c-83.8 0-152.3 68.5-152.3 152S164.2 412 248 412c97.4 0 135.8-62.1 142.9-92.7H248v-83.8h235.2c4.7 25.8 7.2 54.3 7.2 85.8z"></path></svg>
            Sign in with Google
        </Button>
    )
}

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard/overview');
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Login Failed',
        description: error,
        variant: 'destructive',
      });
      setError(null); // Clear error after showing toast
    }
  }, [error, toast]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
        .catch((e) => {
            const err = e as AuthError;
            setError(err.message);
        });
  };
  
  const handleGoogleSignIn = () => {
      const provider = new GoogleAuthProvider();
      signInWithPopup(auth, provider)
          .catch((e) => {
              const err = e as AuthError;
              setError(err.message);
          });
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
                <AppLogo />
            </div>
            <CardTitle className="font-headline text-2xl">Welcome Back!</CardTitle>
            <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </Link>
              </div>
              <Input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <LoginButton />
          </form>
           <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
          </div>
          <div onClick={handleGoogleSignIn}>
            <GoogleSignInButton />
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
