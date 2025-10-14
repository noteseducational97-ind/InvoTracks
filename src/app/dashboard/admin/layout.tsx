'use client';
import { useUser } from "@/firebase";
import { ADMIN_EMAIL } from "@/lib/constants";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        redirect('/dashboard/overview');
      }
    }
  }, [user, isUserLoading]);

  if (isUserLoading || !user || user.email !== ADMIN_EMAIL) {
    return null; // Or a loading spinner
  }
  
  return <>{children}</>;
}
