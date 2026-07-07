import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { FileSpreadsheet, FolderOpen, Calculator, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "SMCPA — Portail Comptable" },
      { name: "description", content: "Portail interne SMCPA : centralisez vos factures mensuelles et générez les exports Excel détaillé et récapitulatif." },
    ],
  }),
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/40 to-background">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              Portail comptable interne
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary-dark leading-tight">
              Traitement mensuel des factures, simple et structuré.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Chaque 15 du mois, centralisez le dossier de factures reçues, saisissez les lignes
              produits, et générez en un clic les deux fichiers Excel : <strong>Détaillé</strong> et
              <strong> Récapitulatif</strong>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/portail" className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2">
                Ouvrir le portail <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#process" className="px-5 py-2.5 rounded-md border border-border hover:bg-muted transition-colors text-sm font-medium">
                Voir le processus
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl border border-border bg-card shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-primary-dark">Dossier — Mai 2026</div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">12 factures</span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  ["FA-2026-0142", "3 200,50", "Fournisseur A"],
                  ["FA-2026-0143", "1 845,00", "Fournisseur B"],
                  ["FA-2026-0144", "5 120,75", "Fournisseur C"],
                  ["FA-2026-0145", "   980,20", "Fournisseur A"],
                ].map(([n, m, f]) => (
                  <div key={n} className="grid grid-cols-3 gap-2 py-2 border-b border-border last:border-0">
                    <span className="font-mono text-foreground">{n}</span>
                    <span className="text-muted-foreground">{f}</span>
                    <span className="text-right font-medium text-primary-dark">{m} MAD</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <div className="flex-1 text-center text-xs py-2 rounded-md bg-primary text-primary-foreground font-medium">
                  Détaillé.xlsx
                </div>
                <div className="flex-1 text-center text-xs py-2 rounded-md bg-primary-dark text-primary-foreground font-medium">
                  Récapitulatif.xlsx
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-widest text-primary font-semibold">Le processus</span>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mt-2">Un flux mensuel maîtrisé</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Le 15 de chaque mois, toutes les factures reçues sont réunies en un seul dossier,
            analysées, puis converties en deux exports Excel structurés.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: FolderOpen,
              t: "1. Constitution du dossier",
              d: "Collecte de toutes les factures reçues durant le mois dans un dossier unique.",
            },
            {
              icon: Calculator,
              t: "2. Saisie & analyse",
              d: "Saisie des en-têtes de facture et des lignes produits (désignation, quantité, prix, remise).",
            },
            {
              icon: FileSpreadsheet,
              t: "3. Génération des exports",
              d: "Deux fichiers Excel générés automatiquement : Détaillé (ligne par produit) et Récapitulatif (ligne par facture).",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="p-6 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition">
              <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg text-primary-dark">{t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Files explanation */}
      <section className="bg-accent/40">
        <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-3">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary-dark">Fichier 1 — Détaillé</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Une ligne par <strong>produit</strong> à l'intérieur d'une facture. Le numéro de facture
              se répète sur plusieurs lignes consécutives.
            </p>
            <div className="text-xs font-mono bg-muted p-3 rounded-md space-y-1">
              <div>numero · date · designation · quantite · prix_unitaire_ht ·</div>
              <div>montant_ht_brut · remise · montant_ht_net · tva · emballage · <strong>ttc*</strong></div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">* TTC calculé = HT + TVA + Emballage</p>
          </div>
          <div className="p-8 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-primary-dark">Fichier 2 — Récapitulatif</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Une ligne par <strong>facture</strong>. Chaque numéro apparaît une seule fois, les
              détails produits sont supprimés.
            </p>
            <div className="text-xs font-mono bg-muted p-3 rounded-md space-y-1">
              <div>numero · code_commande · date · num_cmde_client ·</div>
              <div>num_livraison · montant_ht · tva · emballage · <strong>ttc*</strong></div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">Rollup du Fichier 1 par numéro de facture.</p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
