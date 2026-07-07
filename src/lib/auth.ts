import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const DEMO_EMAIL = "demo@smcpa.ma";
export const DEMO_PASSWORD = "smcpa2026";
const KEY = "smcpa.auth.v1";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

export function signIn(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
    localStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function signOut() {
  localStorage.removeItem(KEY);
}

export function useAuthGuard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthed()) navigate({ to: "/login" });
  }, [navigate]);
}
