"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { BrandLockup } from "@/app/components/brand-lockup";

export type LoginRole =
  | "ADMIN"
  | "CUSTOMER"
  | "KARYAWAN_PRODUKSI"
  | "OWNER";

const roleLabels: Record<LoginRole, string> = {
  ADMIN: "Admin",
  CUSTOMER: "Pelanggan",
  KARYAWAN_PRODUKSI: "Karyawan Produksi",
  OWNER: "Owner",
};

const destinations: Record<LoginRole, string> = {
  ADMIN: "/admin",
  CUSTOMER: "/menu",
  KARYAWAN_PRODUKSI: "/produksi",
  OWNER: "/owner",
};

const roleLoginPaths: Array<{ label: string; path: string }> = [
  { label: "Admin", path: "/login/admin" },
  { label: "Owner", path: "/login/owner" },
  { label: "Karyawan Produksi", path: "/login/produksi" },
];

function isLoginRole(value: unknown): value is LoginRole {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(destinations, value)
  );
}

type LoginFormProps = {
  role: LoginRole;
};

export function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isCustomer = role === "CUSTOMER";

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
          role,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Gagal masuk.";
        throw new Error(message);
      }
      if (
        typeof result !== "object" ||
        result === null ||
        !("role" in result) ||
        !isLoginRole(result.role)
      ) {
        throw new Error("Respons masuk tidak valid.");
      }
      router.replace(destinations[result.role]);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Gagal masuk.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section aria-labelledby="login-title" className="login-card">
        <Link
          aria-label={isCustomer ? "Kembali ke beranda Dapur Abita" : "Kembali ke masuk pelanggan"}
          className="login-card__back"
          href={isCustomer ? "/beranda" : "/"}
        >
          <Image
            alt=""
            height={30}
            src="/login-back-arrow.png"
            width={30}
          />
        </Link>
        <BrandLockup className="brand-lockup--auth" />
        <div className="login-card__heading">
          <h1 id="login-title">Masuk</h1>
          {!isCustomer ? (
            <p className="login-card__role">Portal {roleLabels[role]}</p>
          ) : null}
        </div>
        <form className="login-fields" onSubmit={signIn}>
          <div className="form-field">
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              autoComplete="username"
              className="text-input"
              id="username"
              name="username"
              placeholder="Masukkan username"
              required
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="text-input"
              id="password"
              name="password"
              placeholder="Masukkan password"
              required
              type="password"
            />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button
            className="button button--primary login-submit"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
        {isCustomer ? (
          <>
            <div className="login-card__register">
              <span>Belum memiliki akun?</span>
              <Link href="/register">Daftar</Link>
            </div>
            <div aria-hidden="true" className="login-divider" />
            <p className="login-role-label">
              Masuk sebagai Admin / Owner / Karyawan Produksi
            </p>
            <nav aria-label="Masuk untuk staf" className="login-role-links">
              {roleLoginPaths.map((roleLogin) => (
                <Link
                  className="button button--outline"
                  href={roleLogin.path}
                  key={roleLogin.path}
                >
                  {roleLogin.label}
                </Link>
              ))}
            </nav>
          </>
        ) : null}
      </section>
    </main>
  );
}
