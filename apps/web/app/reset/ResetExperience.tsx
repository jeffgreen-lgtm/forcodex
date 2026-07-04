"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { API_PATHS } from "@cosmoscope/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_COSMOSCOPE_API_BASE_URL?.trim() || "https://cosmoscope-api.jeff-green-5aa.workers.dev";

function readRecoveryToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash.replace(/^#/, "") || window.sessionStorage.getItem("cosmoscope-recovery-hash") || "";
  const params = new URLSearchParams(hash);
  const token = params.get("access_token");
  const type = params.get("type");

  if (!token || type !== "recovery") {
    return null;
  }

  return token;
}

async function request<T>(path: string, init: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {})
    }
  });

  const payload = (await response.json().catch(() => null)) as { message?: string } | T | null;
  if (!response.ok) {
    throw new Error((payload as { message?: string } | null)?.message || `Request failed with ${response.status}`);
  }

  return payload as T;
}

export function ResetExperience() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const syncToken = () => {
      setToken(readRecoveryToken());
    };

    syncToken();
    window.addEventListener("hashchange", syncToken);

    return () => {
      window.removeEventListener("hashchange", syncToken);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setError("This reset link is incomplete or expired. Request a fresh one from the login screen.");
      return;
    }

    setError(null);
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!token) {
      setError("This reset link is incomplete or expired. Request a fresh one from the login screen.");
      return;
    }

    if (password.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match yet.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await request<{ message: string }>(API_PATHS.updatePassword, {
        body: JSON.stringify({ password }),
        headers: {
          authorization: `Bearer ${token}`
        },
        method: "POST"
      });
      window.sessionStorage.removeItem("cosmoscope-recovery-hash");
      setStatus(response.message);
      window.setTimeout(() => {
        window.location.href = "/app";
      }, 1200);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update the password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="live-shell">
      <header className="demo-header">
        <a href="/" className="demo-wordmark">
          CosmoScope
        </a>
      </header>

      <section className="live-auth fade-up">
        <div className="live-auth-copy">
          <p className="timestamp">Reset your password.</p>
          <h1 className="demo-hero">Open the account again with a clean password.</h1>
          <p className="live-note">
            Choose a new password, save it once, and then we&apos;ll send you straight back into the app.
          </p>
        </div>

        <form className="live-form" onSubmit={(event) => void handleSubmit(event)}>
          <label className="demo-field live-field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              minLength={6}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
            />
          </label>

          <label className="demo-field live-field">
            <span>Confirm password</span>
            <input
              autoComplete="new-password"
              minLength={6}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the new password"
            />
          </label>

          {error ? <p className="live-error">{error}</p> : null}
          {status ? <p className="live-subtle">{status}</p> : null}

          <button className="button-primary" disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save new password"}
          </button>

          <a className="button-secondary" href="/app">
            Back to app
          </a>
        </form>
      </section>
    </main>
  );
}
