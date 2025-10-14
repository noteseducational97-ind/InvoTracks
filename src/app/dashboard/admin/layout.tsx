import { getUser } from "@/app/actions";
import { ADMIN_EMAIL } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/dashboard/overview');
  }

  return <>{children}</>;
}
