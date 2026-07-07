import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteHeader, SiteFooter, PageBackdrop } from "@/components/site-chrome";
import {
  computeInvoice,
  money,
  saveDossier,
  totalsFor,
  uid,
  type Dossier,
  type Invoice,
} from "@/lib/dossiers";
import { generateInvoicesForFiles } from "@/lib/mock-invoices";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileSpreadsheet,
  FileText,
  FolderUp,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

export const Route = createFileRoute("/nouveau")({
  component: NouveauDossier,
  head: () => ({
    meta: [
      { title: "Nouveau dossier — SMCPA" },
      { name: "description", content: "Importez les factures du mois, l'IA les analyse et génère les deux fichiers Excel." },
    ],
  }),
});

const STEPS = [
  { key: "import", label: "Importer", icon: FolderUp },
  { key: "analyse", label: "Analyse IA", icon: Sparkles },
  { key: "revue", label: "Vérification", icon: Check },
] as const;

type UploadedFile = { id: string; name: string; size: number };

function NouveauDossier() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const today = new Date();
  const [period, setPeriod] = useState(today.toISOString().slice(0, 7));
  const defaultLabel = `Dossier ${today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
  const [label, setLabel] = useState(defaultLabel.charAt(0).toUpperCase() + defaultLabel.slice(1));
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // AI analysis state
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [analysisDone, setAnalysisDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };
  const addFiles = (list: File[]) => {
    const next = list.map((f) => ({ id: uid(), name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...next]);
  };
  const removeFile = (id: string) => setFiles((p) => p.filter((f) => f.id !== id));

  // Simulate "AI" processing of the imported factures
  useEffect(() => {
    if (step !== 1 || analysisDone) return;
    setProgress(0);
    setLogs([]);
    const generated = generateInvoicesForFiles(period, files.length);

    let i = 0;
    const total = files.length;
    const tick = () => {
      if (i >= total) {
        setLogs((l) => [...l, "✓ Analyse terminée — génération des lignes prête."]);
        setInvoices(generated);
        setAnalysisDone(true);
        return;
      }
      const f = files[i];
      const inv = generated[i];
      setLogs((l) => [
        ...l,
        `→ ${f.name} · extraction en-tête (${inv.numero}) · ${inv.items.length - 1} produit(s) détecté(s)`,
      ]);
      i += 1;
      setProgress(Math.round((i / total) * 100));
      setTimeout(tick, 350 + Math.random() * 300);
    };
    const t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [step, files, period, analysisDone]);

  const canNext = () => {
    if (step === 0) return files.length > 0 && label.trim().length > 0 && period;
    if (step === 1) return analysisDone;
    return true;
  };

  const finalize = () => {
    const dossier: Dossier = {
      id: uid(),
      period,
      label: label.trim(),
      createdAt: new Date().toISOString(),
      sourceFiles: files.map((f) => f.name),
      invoices,
    };
    saveDossier(dossier);
    navigate({ to: "/dossier/$id", params: { id: dossier.id } });
  };

  const totals = totalsFor({
    id: "p",
    period,
    label,
    createdAt: "",
    sourceFiles: [],
    invoices,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <PageBackdrop />
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : done
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-card text-muted-foreground border-border"
                  }`}
                >
                  <div className="h-5 w-5 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                    {done ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-px w-8 ${done ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-primary-dark">Étape 1 — Importer les factures</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Déposez toutes les factures reçues durant le mois. L'IA extraira automatiquement les en-têtes et les lignes produits.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-6 max-w-2xl">
                <Field label="Intitulé du dossier" value={label} onChange={setLabel} />
                <Field label="Période" type="month" value={period} onChange={setPeriod} />
              </div>

              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className="mt-6 border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 rounded-xl p-10 text-center cursor-pointer transition"
              >
                <Upload className="h-8 w-8 mx-auto text-primary mb-3" />
                <div className="font-semibold text-primary-dark">Glissez vos factures ici</div>
                <div className="text-xs text-muted-foreground mt-1">
                  PDF, images ou scans — plusieurs fichiers acceptés
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                />
              </div>

              {files.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    {files.length} fichier(s) prêt(s) à être analysés
                  </div>
                  <div className="grid gap-1.5 max-h-64 overflow-y-auto">
                    {files.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="flex-1 truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {f.size ? `${(f.size / 1024).toFixed(0)} KB` : ""}
                        </span>
                        <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-primary-dark flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> Analyse IA en cours
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                L'IA lit chaque facture, extrait les en-têtes (numéro, date, TVA, emballage) et les lignes produits.
              </p>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    {analysisDone ? "Terminé" : "Traitement..."}
                  </span>
                  <span className="font-semibold text-primary-dark">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-muted/50 border border-border p-4 h-64 overflow-y-auto font-mono text-xs space-y-1">
                {logs.length === 0 && (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Initialisation du moteur d'extraction...
                  </div>
                )}
                {logs.map((l, i) => (
                  <div key={i} className="text-foreground">{l}</div>
                ))}
              </div>

              {analysisDone && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    ["Factures", invoices.length.toString()],
                    ["Lignes", totals.items.toString()],
                    ["Total HT", `${money(totals.ht)}`],
                    ["Total TTC", `${money(totals.ttc)}`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border p-3">
                      <div className="text-xs text-muted-foreground">{k}</div>
                      <div className="text-base font-semibold text-primary-dark mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-primary-dark">Étape 3 — Vérification</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Passez en revue les factures extraites. En validant, le dossier rejoint l'historique et les 2 fichiers Excel sont générés.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {[
                  ["Factures", invoices.length.toString()],
                  ["Lignes", totals.items.toString()],
                  ["Total HT", `${money(totals.ht)} MAD`],
                  ["Total TTC", `${money(totals.ttc)} MAD`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border p-4">
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="text-lg font-semibold text-primary-dark mt-1">{v}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-border overflow-hidden max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 sticky top-0">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Numéro</th>
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Lignes</th>
                      <th className="px-3 py-2 font-medium text-right">HT</th>
                      <th className="px-3 py-2 font-medium text-right">TVA</th>
                      <th className="px-3 py-2 font-medium text-right">TTC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => {
                      const { ht, ttc } = computeInvoice(inv);
                      return (
                        <tr key={inv.id} className="border-t border-border">
                          <td className="px-3 py-2 font-mono text-primary-dark">{inv.numero}</td>
                          <td className="px-3 py-2">{inv.date}</td>
                          <td className="px-3 py-2">{inv.items.length}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{money(ht)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{money(inv.tva)}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-semibold">{money(ttc)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mt-6">
                <div className="rounded-lg bg-accent/40 p-4">
                  <div className="font-semibold text-primary-dark flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> SMCPA_Detaille_{period}.xlsx
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {totals.items} lignes (une par produit)
                  </div>
                </div>
                <div className="rounded-lg bg-accent/40 p-4">
                  <div className="font-semibold text-primary-dark flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> SMCPA_Recapitulatif_{period}.xlsx
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {invoices.length} lignes (une par facture)
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button
              onClick={() => (step === 0 ? navigate({ to: "/" }) : setStep(step - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted text-sm font-medium transition"
            >
              <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Annuler" : "Précédent"}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext() && setStep(step + 1)}
                disabled={!canNext()}
                className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 0 ? "Lancer l'analyse IA" : "Suivant"} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finalize} className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2">
                <Check className="h-4 w-4" /> Enregistrer & générer les Excel
              </button>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm">
      <span className="block text-xs text-muted-foreground mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

// Unused (kept intentionally minimal): removeItem/updateItem could edit lines,
// but the AI-extracted preview is read-only for now to keep the flow simple.
export const _unused = { Trash2 };
