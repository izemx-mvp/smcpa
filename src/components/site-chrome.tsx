import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group" aria-label="SMCPA — accueil">
          <img
            src={logo}
            alt="SMCPA"
            width={44}
            height={44}
            className="h-11 w-11 object-contain transition-transform group-hover:scale-105"
          />
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight text-primary-dark">SMCPA</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">Portail comptable</div>
          </div>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-primary" }}
            className="text-foreground hover:text-primary transition-colors"
          >
            Dossiers
          </Link>
          <Link
            to="/nouveau"
            activeProps={{ className: "text-primary" }}
            className="text-foreground hover:text-primary transition-colors"
          >
            Nouveau
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} SMCPA — Portail comptable interne</span>
        <span>info@smcpa.ma</span>
      </div>
    </footer>
  );
}
