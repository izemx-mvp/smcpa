import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

export function SiteHeader() {
  const navigate = useNavigate();
  const onLogout = () => {
    signOut();
    navigate({ to: "/login" });
  };
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center group" aria-label="SMCPA — accueil">
          <img
            src="/logo.png"
            alt="SMCPA — Commercialisation de produits alimentaires"
            className="h-14 w-auto object-contain transition-transform group-hover:scale-[1.03]"
          />
        </Link>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1 text-sm font-medium bg-muted/60 rounded-full p-1 border border-border/60">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-card text-primary-dark shadow-sm" }}
              className="px-4 py-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
            >
              Dossiers
            </Link>
            <Link
              to="/nouveau"
              activeProps={{ className: "bg-card text-primary-dark shadow-sm" }}
              className="px-4 py-1.5 rounded-full text-muted-foreground hover:text-primary transition-colors"
            >
              Nouveau
            </Link>
          </nav>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-full border border-border/60 hover:border-destructive/40"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-3.5 w-3.5" /> Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}


export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-16 bg-background/60 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-7 w-auto opacity-80" />
          <span>© {new Date().getFullYear()} SMCPA — Portail comptable interne</span>
        </div>
        <span>info@smcpa.ma</span>
      </div>
    </footer>
  );
}

export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-[oklch(0.85_0.12_140)]/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-primary-dark/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-primary-dark) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  );
}
