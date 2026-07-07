import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import {
  blankInvoice,
  blankItem,
  computeInvoice,
  computeItem,
  money,
  saveDossier,
  totalsFor,
  uid,
  type Dossier,
  type Invoice,
  type LineItem,
} from "@/lib/dossiers";
import { ArrowLeft, ArrowRight, Check, FolderOpen, Plus, Trash2, FileSpreadsheet, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/nouveau")({
  component: NouveauDossier,
  head: () => ({
    meta: [
      { title: "Nouveau dossier — SMCPA" },
      { name: "description", content: "Assistant de création d'un dossier mensuel de factures." },
    ],
  }),
});

const STEPS = [
  { key: "dossier", label: "Dossier", icon: FolderOpen },
  { key: "factures", label: "Factures", icon: ClipboardList },
  { key: "exports", label: "Exports", icon: FileSpreadsheet },
] as const;

function NouveauDossier() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const today = new Date();
  const [period, setPeriod] = useState(today.toISOString().slice(0, 7));
  const defaultLabel = `Dossier ${today.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
  const [label, setLabel] = useState(defaultLabel.charAt(0).toUpperCase() + defaultLabel.slice(1));
  const [invoices, setInvoices] = useState<Invoice[]>([blankInvoice()]);

  const dossierPreview: Dossier = useMemo(
    () => ({ id: "preview", period, label, createdAt: "", invoices }),
    [period, label, invoices],
  );
  const totals = totalsFor(dossierPreview);

  const updateInv = (id: string, patch: Partial<Invoice>) =>
    setInvoices((p) => p.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const updateItem = (invId: string, idx: number, patch: Partial<LineItem>) =>
    setInvoices((p) =>
      p.map((i) =>
        i.id === invId ? { ...i, items: i.items.map((it, k) => (k === idx ? { ...it, ...patch } : it)) } : i,
      ),
    );
  const addItem = (invId: string) =>
    setInvoices((p) => p.map((i) => (i.id === invId ? { ...i, items: [...i.items, blankItem()] } : i)));
  const removeItem = (invId: string, idx: number) =>
    setInvoices((p) =>
      p.map((i) => (i.id === invId ? { ...i, items: i.items.filter((_, k) => k !== idx) } : i)),
    );
  const addInvoice = () => setInvoices((p) => [...p, blankInvoice()]);
  const removeInvoice = (id: string) => setInvoices((p) => (p.length > 1 ? p.filter((i) => i.id !== id) : p));

  const canNext = () => {
    if (step === 0) return period && label.trim().length > 0;
    if (step === 1) return invoices.length > 0 && invoices.every((i) => i.numero.trim().length > 0);
    return true;
  };

  const finalize = () => {
    const dossier: Dossier = {
      id: uid(),
      period,
      label: label.trim(),
      createdAt: new Date().toISOString(),
      invoices,
    };
    saveDossier(dossier);
    navigate({ to: "/dossier/$id", params: { id: dossier.id } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
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
              <h2 className="text-2xl font-bold text-primary-dark">Étape 1 — Créer le dossier</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Le 15 du mois, ouvrez un nouveau dossier pour rassembler toutes les factures reçues.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6 max-w-xl">
                <Field label="Intitulé du dossier" value={label} onChange={setLabel} />
                <Field label="Période" type="month" value={period} onChange={setPeriod} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-primary-dark">Étape 2 — Saisir les factures</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Une facture par bloc. Ajoutez chaque ligne produit (le total HT / TTC se calcule automatiquement).
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {invoices.length} facture(s) · {totals.items} ligne(s)
                </div>
              </div>

              <div className="space-y-5 mt-6">
                {invoices.map((inv, idx) => {
                  const { ht, ttc } = computeInvoice(inv);
                  return (
                    <div key={inv.id} className="rounded-xl border border-border overflow-hidden">
                      <div className="flex items-center justify-between bg-accent/50 px-4 py-2.5 border-b border-border">
                        <span className="font-semibold text-primary-dark text-sm">
                          Facture #{idx + 1} {inv.numero && `— ${inv.numero}`}
                        </span>
                        <button
                          onClick={() => removeInvoice(inv.id)}
                          className="text-destructive hover:bg-destructive/10 rounded p-1"
                          aria-label="Supprimer la facture"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="p-4 grid gap-3 md:grid-cols-4">
                        <Field label="Numéro facture *" value={inv.numero} onChange={(v) => updateInv(inv.id, { numero: v })} />
                        <Field label="N° commande" value={inv.numero_commande} onChange={(v) => updateInv(inv.id, { numero_commande: v })} />
                        <Field label="Code commande" value={inv.code_commande} onChange={(v) => updateInv(inv.id, { code_commande: v })} />
                        <Field label="Date" type="date" value={inv.date} onChange={(v) => updateInv(inv.id, { date: v })} />
                        <Field label="N° cmde client" value={inv.num_cmde_client} onChange={(v) => updateInv(inv.id, { num_cmde_client: v })} />
                        <Field label="N° livraison" value={inv.num_livraison} onChange={(v) => updateInv(inv.id, { num_livraison: v })} />
                        <Field label="TVA (MAD)" type="number" value={inv.tva} onChange={(v) => updateInv(inv.id, { tva: +v || 0 })} />
                        <Field label="Emballage (MAD)" type="number" value={inv.montant_emballage} onChange={(v) => updateInv(inv.id, { montant_emballage: +v || 0 })} />
                      </div>

                      <div className="px-4 pb-4">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Lignes produits
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                                <th className="py-2 pr-2 font-medium">Désignation</th>
                                <th className="py-2 pr-2 font-medium">Unité</th>
                                <th className="py-2 pr-2 font-medium text-right">Qté</th>
                                <th className="py-2 pr-2 font-medium text-right">P.U. HT</th>
                                <th className="py-2 pr-2 font-medium text-right">Remise</th>
                                <th className="py-2 pr-2 font-medium text-right">HT net</th>
                                <th className="py-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map((it, k) => {
                                const { net } = computeItem(it);
                                return (
                                  <tr key={k} className="border-b border-border last:border-0">
                                    <td className="py-1.5 pr-2">
                                      <CellInput value={it.designation} onChange={(v) => updateItem(inv.id, k, { designation: v })} />
                                    </td>
                                    <td className="py-1.5 pr-2 w-28">
                                      <CellInput value={it.unite_logistique} onChange={(v) => updateItem(inv.id, k, { unite_logistique: v })} />
                                    </td>
                                    <td className="py-1.5 pr-2 w-20">
                                      <CellInput type="number" value={it.quantite} onChange={(v) => updateItem(inv.id, k, { quantite: +v || 0 })} align="right" />
                                    </td>
                                    <td className="py-1.5 pr-2 w-28">
                                      <CellInput type="number" value={it.prix_unitaire_ht} onChange={(v) => updateItem(inv.id, k, { prix_unitaire_ht: +v || 0 })} align="right" />
                                    </td>
                                    <td className="py-1.5 pr-2 w-24">
                                      <CellInput type="number" value={it.remise_commerciale} onChange={(v) => updateItem(inv.id, k, { remise_commerciale: +v || 0 })} align="right" />
                                    </td>
                                    <td className="py-1.5 pr-2 text-right font-medium text-primary-dark tabular-nums">
                                      {money(net)}
                                    </td>
                                    <td className="w-8 text-right">
                                      <button onClick={() => removeItem(inv.id, k)} className="text-muted-foreground hover:text-destructive p-1">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <button
                          onClick={() => addItem(inv.id)}
                          className="mt-3 text-xs font-medium inline-flex items-center gap-1 text-primary hover:text-primary-dark"
                        >
                          <Plus className="h-3.5 w-3.5" /> Ajouter une ligne
                        </button>

                        <div className="mt-3 flex flex-wrap justify-end gap-5 text-sm border-t border-border pt-3">
                          <div><span className="text-muted-foreground">HT :</span> <span className="font-semibold">{money(ht)}</span></div>
                          <div><span className="text-muted-foreground">TVA :</span> <span className="font-semibold">{money(inv.tva)}</span></div>
                          <div><span className="text-muted-foreground">Emb. :</span> <span className="font-semibold">{money(inv.montant_emballage)}</span></div>
                          <div className="text-primary-dark"><span className="opacity-70">TTC :</span> <span className="font-bold">{money(ttc)}</span></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addInvoice}
                className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition inline-flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" /> Ajouter une facture
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-primary-dark">Étape 3 — Vérifier et générer</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Récapitulatif du dossier. En validant, le dossier est enregistré dans l'historique et les deux fichiers Excel seront disponibles.
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

              <div className="mt-6 rounded-xl border border-border p-5">
                <div className="text-sm">
                  <div><span className="text-muted-foreground">Dossier :</span> <strong className="text-primary-dark">{label}</strong></div>
                  <div className="mt-1"><span className="text-muted-foreground">Période :</span> <strong>{period}</strong></div>
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-lg bg-accent/40 p-3 text-sm">
                    <div className="font-semibold text-primary-dark flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" /> Fichier Détaillé
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {totals.items} lignes (une par produit)
                    </div>
                  </div>
                  <div className="rounded-lg bg-accent/40 p-3 text-sm">
                    <div className="font-semibold text-primary-dark flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" /> Fichier Récapitulatif
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {invoices.length} lignes (une par facture)
                    </div>
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
                Suivant <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={finalize} className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2">
                <Check className="h-4 w-4" /> Enregistrer le dossier
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

function CellInput({
  value,
  onChange,
  type = "text",
  align = "left",
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  align?: "left" | "right";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring tabular-nums ${align === "right" ? "text-right" : ""}`}
    />
  );
}
