'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/constants';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// --- START: Server-Side Firebase Initialization ---
// This pattern ensures we initialize Firebase Admin only once.
const apps = getApps();
const app: App = apps.length
  ? apps[0]!
  : initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      // The GOOGLE_APPLICATION_CREDENTIALS env var is used automatically
      // when running in a Google Cloud environment.
    });

const auth = getAuth(app);
const firestore = getFirestore(app);
// --- END: Server-Side Firebase Initialization ---


export type User = {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
};

async function getUserIdFromSession(): Promise<string | null> {
    try {
        const sessionCookie = cookies().get('__session')?.value;
        if (!sessionCookie) return null;
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        return decodedToken.uid;
    } catch (error) {
        // Session cookie is invalid or expired.
        return null;
    }
}

export async function getFinancialProfile() {
    const userId = await getUserIdFromSession();
    if (!userId) {
        return null;
    }

    try {
        const docRef = firestore.collection('users').doc(userId).collection('financial_profile').doc('default');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching financial profile:", error);
        return null;
    }
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
