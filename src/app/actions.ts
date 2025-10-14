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
const MOCK_USERS_DB: User[] = [
  { id: '1', name: 'Prasanna Warade', email: ADMIN_EMAIL, role: 'admin' as const },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', role: 'user' as const },
];

// This is now a simplified representation, actual user data will be in Firebase
const findUserById = (id: string) => {
    if (id === 'gHZ9n7s2b9X8fJ2kP3s5t8YxVOE2') { // Mocking a specific firebase user for now
        return {
             id: 'gHZ9n7s2b9X8fJ2kP3s5t8YxVOE2',
             name: 'Firebase User',
             email: 'user@firebase.com',
             role: 'user' as const
        }
    }
    return MOCK_USERS_DB.find(u => u.id === id);
}

export async function getUserFromCookie(): Promise<User | null> {
  const userId = cookies().get('session')?.value;
  if (!userId) return null;

  // In a real app, you'd fetch this from a database.
  // We'll simulate it for now.
  const user = findUserById(userId);
  return user || null;
}


export async function login(prevState: any, formData: FormData) {
  // This server action is now primarily for non-JS form submissions or specific server-side logic.
  // Client-side Firebase Auth will handle the main logic.
  // We will redirect as the client-side will handle auth state.
  redirect('/dashboard/overview');
}

export async function signup(prevState: any, formData: FormData) {
    // This server action is now primarily for non-JS form submissions.
    // Client-side Firebase Auth will handle the main logic.
    redirect('/dashboard/overview');
}

export async function logout() {
  // Client-side will call Firebase signOut. This is a fallback/server-side cleanup.
  cookies().delete('session');
  redirect('/login');
}

export async function getUser(): Promise<{
  displayName: string | null;
  email: string | null;
  uid: string;
  role: 'admin' | 'user';
} | null> {
  const userId = cookies().get('session')?.value;
  if (!userId) return null;

  // This is a placeholder. In a real app, you might verify the session
  // with Firebase Admin SDK and get user roles from a database.
  const isHardcodedAdmin = userId === '1' && MOCK_USERS_DB[0].email === ADMIN_EMAIL;
  
  // This is a simplified mock. The client-side `useUser` hook will provide the real user object.
  const mockUser = findUserById(userId);

  return {
      uid: userId,
      displayName: mockUser?.name || 'Anonymous',
      email: mockUser?.email || '',
      role: isHardcodedAdmin ? 'admin' : 'user',
  }
}
