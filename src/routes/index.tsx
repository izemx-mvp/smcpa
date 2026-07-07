import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter, PageBackdrop } from "@/components/site-chrome";
import {
  loadDossiers,
  deleteDossier,
  saveDossier,
  totalsFor,
  money,
  type Dossier,
} from "@/lib/dossiers";
import { seedDossiers } from "@/lib/mock-invoices";
import { useAuthGuard } from "@/lib/auth";
import { Plus, FolderOpen, Trash2, FileSpreadsheet, Calendar, FileText } from "lucide-react";

const SEED_KEY = "smcpa.seeded.v1";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "SMCPA — Dossiers mensuels" },
      { name: "description", content: "Historique des dossiers de factures analysés et leurs exports Excel." },
    ],
  }),
});

function Dashboard() {
  useAuthGuard();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    let all = loadDossiers();
    if (all.length === 0 && !localStorage.getItem(SEED_KEY)) {
      seedDossiers().forEach(saveDossier);
      localStorage.setItem(SEED_KEY, "1");
      all = loadDossiers();
    }
    setDossiers(all);
  }, []);

  const remove = (id: string) => {
    if (!confirm("Supprimer ce dossier ?")) return;
    deleteDossier(id);
    setDossiers(loadDossiers());
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackdrop />
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Portail comptable</span>
            <h1 className="text-3xl font-bold text-primary-dark mt-1">Dossiers mensuels</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Historique de tous les dossiers analysés et leurs deux exports Excel.
            </p>
          </div>
          <Link to="/nouveau" className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Nouveau dossier
          </Link>
        </div>

        {dossiers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-16 text-center">
            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-primary-dark">Aucun dossier pour le moment</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Lancez l'assistant pour analyser les factures du mois.
            </p>
            <Link to="/nouveau" className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2">
              <Plus className="h-4 w-4" /> Démarrer un dossier
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {dossiers.map((d) => {
              const t = totalsFor(d);
              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link to="/dossier/$id" params={{ id: d.id }} className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <FolderOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-primary-dark truncate">{d.label}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {d.period}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" /> {d.sourceFiles.length} factures importées
                            </span>
                            <span>{t.items} lignes</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total TTC</div>
                        <div className="font-semibold text-primary-dark">{money(t.ttc)} MAD</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <FileSpreadsheet className="h-4 w-4" /> 2 fichiers
                      </div>
                      <button
                        onClick={() => remove(d.id)}
                        className="text-muted-foreground hover:text-destructive p-2 rounded transition"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
