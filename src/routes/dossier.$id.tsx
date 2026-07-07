import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import {
  buildRows,
  computeInvoice,
  deleteDossier,
  exportDetailed,
  exportSummary,
  getDossier,
  money,
  totalsFor,
  type Dossier,
} from "@/lib/dossiers";
import { ArrowLeft, Calendar, Download, FileSpreadsheet, Sparkles, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dossier/$id")({
  component: DossierView,
  head: () => ({
    meta: [
      { title: "Dossier — SMCPA" },
      { name: "description", content: "Détail d'un dossier mensuel et téléchargement des exports Excel." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function DossierView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [tab, setTab] = useState<"detail" | "recap">("detail");

  useEffect(() => {
    setDossier(getDossier(id) || null);
  }, [id]);

  if (!dossier) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-6 py-20 text-center flex-1">
          <h1 className="text-2xl font-bold text-primary-dark">Dossier introuvable</h1>
          <p className="text-sm text-muted-foreground mt-2">Ce dossier n'existe pas ou a été supprimé.</p>
          <Link to="/" className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2 mt-6">
            <ArrowLeft className="h-4 w-4" /> Retour à l'historique
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const t = totalsFor(dossier);
  const { detailed, summary } = buildRows(dossier);
  const rows = tab === "detail" ? detailed : summary;

  const onDelete = () => {
    if (!confirm("Supprimer ce dossier ?")) return;
    deleteDossier(dossier.id);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Historique
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-dark">{dossier.label}</h1>
            <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Période {dossier.period}
              </span>
              <span>Créé le {new Date(dossier.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-destructive hover:bg-destructive/10 transition"
          >
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        </div>

        {/* Source files banner */}
        {dossier.sourceFiles.length > 0 && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Factures importées ({dossier.sourceFiles.length})
              </div>
              <div className="text-xs text-primary inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Analysées par l'IA
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {dossier.sourceFiles.slice(0, 12).map((n) => (
                <span key={n} className="text-[11px] font-mono bg-muted rounded px-2 py-1 border border-border">
                  {n}
                </span>
              ))}
              {dossier.sourceFiles.length > 12 && (
                <span className="text-[11px] text-muted-foreground px-2 py-1">
                  +{dossier.sourceFiles.length - 12} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            ["Factures", dossier.invoices.length.toString()],
            ["Lignes", t.items.toString()],
            ["Total HT", `${money(t.ht)} MAD`],
            ["TVA", `${money(t.tva)} MAD`],
            ["Total TTC", `${money(t.ttc)} MAD`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="text-lg font-semibold text-primary-dark mt-1">{v}</div>
            </div>
          ))}
        </div>

        {/* Exports */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <ExportCard
            title="Fichier Détaillé"
            desc={`${detailed.length} lignes — une ligne par produit`}
            fileName={`SMCPA_Detaille_${dossier.period}.xlsx`}
            onClick={() => exportDetailed(dossier)}
          />
          <ExportCard
            title="Fichier Récapitulatif"
            desc={`${summary.length} lignes — une ligne par facture`}
            fileName={`SMCPA_Recapitulatif_${dossier.period}.xlsx`}
            onClick={() => exportSummary(dossier)}
          />
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-1 border-b border-border p-1.5 bg-muted/40">
            {(["detail", "recap"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  tab === k
                    ? "bg-card text-primary-dark shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {k === "detail" ? "Aperçu — Détaillé" : "Aperçu — Récapitulatif"}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 sticky top-0">
                <tr>
                  {rows[0] &&
                    Object.keys(rows[0]).map((c) => (
                      <th key={c} className="text-left px-3 py-2 font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                    {Object.values(r).map((v, k) => (
                      <td key={k} className="px-3 py-1.5 whitespace-nowrap tabular-nums">
                        {typeof v === "number" ? money(v) : v}
                      </td>
                    ))}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td className="px-3 py-6 text-center text-muted-foreground">Aucune ligne</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice list */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-primary-dark mb-3">Factures du dossier</h2>
          <div className="grid gap-2">
            {dossier.invoices.map((inv, i) => {
              const { ht, ttc } = computeInvoice(inv);
              return (
                <div key={inv.id} className="rounded-lg border border-border bg-card px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <span className="font-mono text-primary-dark font-semibold">{inv.numero || `#${i + 1}`}</span>
                    <span className="text-muted-foreground ml-3">{inv.date} · {inv.items.length} lignes</span>
                  </div>
                  <div className="flex gap-5 text-xs">
                    <span><span className="text-muted-foreground">HT</span> <strong>{money(ht)}</strong></span>
                    <span><span className="text-muted-foreground">TTC</span> <strong className="text-primary-dark">{money(ttc)} MAD</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ExportCard({
  title,
  desc,
  fileName,
  onClick,
}: {
  title: string;
  desc: string;
  fileName: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-primary-dark">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{fileName}</div>
        </div>
      </div>
      <button onClick={onClick} className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2 flex-shrink-0">
        <Download className="h-4 w-4" /> Télécharger
      </button>
    </div>
  );
}
