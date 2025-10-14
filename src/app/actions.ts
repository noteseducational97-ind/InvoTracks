'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';

export type User = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
};

// This is a simplified, mock implementation.
// In a real app, you would have a proper database and password hashing.
const MOCK_USERS_DB = [
  { id: '1', name: 'Prasanna Warade', email: ADMIN_EMAIL, password: 'admin', role: 'admin' as const },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', password: 'password', role: 'user' as const },
];

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = MOCK_USERS_DB.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  cookies().set('session', user.id, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  redirect('/dashboard/overview');
}

export async function signup(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (MOCK_USERS_DB.find((u) => u.email === email)) {
        return { error: 'User with this email already exists.' };
    }
    
    const newUser = {
        id: String(MOCK_USERS_DB.length + 1),
        name,
        email,
        password,
        role: 'user' as const,
    };
    
    MOCK_USERS_DB.push(newUser);
    
    cookies().set('session', newUser.id, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
    
    redirect('/dashboard/overview');
}

export async function logout() {
  cookies().delete('session');
  redirect('/login');
}

export async function getUser(): Promise<User | null> {
  const userId = cookies().get('session')?.value;
  if (!userId) return null;

  const user = MOCK_USERS_DB.find((u) => u.id === userId);
  return user || null;
}
