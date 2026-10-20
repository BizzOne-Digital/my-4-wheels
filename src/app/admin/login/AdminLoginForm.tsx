"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api("/api/auth/admin/login", { body: { email, password } });
          router.replace("/admin");
          router.refresh();
        } catch (err) {
          const s = (err as { status?: number }).status;
          setError(s === 429 ? "Too many attempts. Try again in 15 minutes." : s === 400 ? "Enter your email and password." : "Incorrect email or password.");
          setBusy(false);
        }
      }}
    >
      {error && <p role="alert" className="rounded-[3px] bg-brand/10 p-3 text-sm font-medium text-brand-dark">{error}</p>}
      <div>
        <label htmlFor="a-email" className="label">Email</label>
        <input id="a-email" type="email" autoComplete="username" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="a-pass" className="label">Password</label>
        <input id="a-pass" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
