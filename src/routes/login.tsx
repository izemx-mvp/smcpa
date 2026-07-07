import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageBackdrop } from "@/components/site-chrome";
import { DEMO_EMAIL, DEMO_PASSWORD, isAuthed, signIn } from "@/lib/auth";
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Connexion — SMCPA" },
      { name: "description", content: "Connexion au portail comptable SMCPA." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/" });
  }, [navigate]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (signIn(email, password)) {
        navigate({ to: "/" });
      } else {
        setError("Identifiants incorrects.");
        setLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackdrop />

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="SMCPA" className="h-24 w-auto object-contain" />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl shadow-primary/5 p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-primary-dark">Bienvenue</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Connectez-vous pour accéder au portail comptable.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Mot de passe
                </label>
                <div className="relative mt-1.5">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary hover:btn-primary-hover inline-flex items-center justify-center gap-2 py-2.5 disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-xs">
              <div className="flex items-center gap-1.5 text-primary font-medium mb-1">
                <Sparkles className="h-3.5 w-3.5" /> Accès démo pré-rempli
              </div>
              <div className="text-muted-foreground font-mono">
                {DEMO_EMAIL} · {DEMO_PASSWORD}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} SMCPA — Portail comptable interne
          </p>
        </div>
      </main>
    </div>
  );
}
