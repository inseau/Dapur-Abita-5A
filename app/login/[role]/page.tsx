import { notFound } from "next/navigation";
import { LoginForm } from "@/app/components/login-form";
import type { LoginRole } from "@/app/components/login-form";

const roleByPath: Record<string, Exclude<LoginRole, "CUSTOMER">> = {
  admin: "ADMIN",
  owner: "OWNER",
  produksi: "KARYAWAN_PRODUKSI",
};

export function generateStaticParams() {
  return Object.keys(roleByPath).map((role) => ({ role }));
}

export default async function StakeholderLoginPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const loginRole = roleByPath[role];
  if (!loginRole) notFound();

  return <LoginForm role={loginRole} />;
}
