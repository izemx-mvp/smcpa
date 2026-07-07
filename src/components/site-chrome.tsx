import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="w-full">
      {/* Top green bar */}
      <div className="bg-primary text-primary-foreground text-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 156 Bd d'Anfa, 2ème étage, Casablanca
            </span>
            <span className="hidden md:inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@smcpa.ma
            </span>
          </div>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4" /> 05 22 36 01 68
          </span>
        </div>
      </div>

      {/* Main nav */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" aria-label="SMCPA — accueil">
            <img
              src={logo}
              alt="SMCPA"
              width={48}
              height={48}
              className="h-12 w-12 object-contain transition-transform group-hover:scale-105"
            />
            <div className="leading-tight">
              <div className="text-2xl font-bold tracking-tight text-primary-dark">SMCPA</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">
                Commercialisation de produits alimentaires
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">Accueil</Link>
            <Link to="/portail" className="text-foreground hover:text-primary transition-colors">Portail</Link>
            <a href="#process" className="text-foreground hover:text-primary transition-colors">Processus</a>
            <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contact</a>
          </nav>

          <Link
            to="/portail"
            className="btn-primary hover:btn-primary-hover text-sm"
          >
            Ouvrir le portail
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-primary-dark text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={40} height={40} className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold">SMCPA</span>
          </div>
          <p className="text-sm mt-3 opacity-90">
            Société Marocaine de Commercialisation de Produits Alimentaires.
          </p>
        </div>
        <div className="text-sm space-y-2">
          <div className="font-semibold mb-2">Contact</div>
          <p className="opacity-90">156 Bd d'Anfa, 2ème étage, Casablanca</p>
          <p className="opacity-90">info@smcpa.ma</p>
          <p className="opacity-90">05 22 36 01 68</p>
        </div>
        <div className="text-sm space-y-2">
          <div className="font-semibold mb-2">Portail</div>
          <Link to="/portail" className="block opacity-90 hover:opacity-100">Traitement mensuel</Link>
          <a href="#process" className="block opacity-90 hover:opacity-100">Le processus</a>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-6 py-4 text-xs opacity-80">
          © {new Date().getFullYear()} SMCPA — Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
