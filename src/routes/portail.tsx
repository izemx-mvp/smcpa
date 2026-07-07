import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Plus, Trash2, FileSpreadsheet, Download } from "lucide-react";

export const Route = createFileRoute("/portail")({
  component: Portail,
  head: () => ({
    meta: [
      { title: "Portail — Traitement mensuel des factures | SMCPA" },
      { name: "description", content: "Saisissez les factures du mois et générez les exports Excel Détaillé et Récapitulatif." },
    ],
  }),
});

type LineItem = {
  designation: string;
  unite_logistique: string;
  quantite: number;
  prix_unitaire_ht: number;
  remise_commerciale: number;
};

type Invoice = {
  id: string;
  numero: string;
  numero_commande: string;
  code_commande: string;
  date: string;
  num_cmde_client: string;
  num_livraison: string;
  tva: number;
  montant_emballage: number;
  items: LineItem[];
};

const uid = () => Math.random().toString(36).slice(2, 10);

const blankItem = (): LineItem => ({
  designation: "",
  unite_logistique: "CARTON",
  quantite: 1,
  prix_unitaire_ht: 0,
  remise_commerciale: 0,
});

const blankInvoice = (): Invoice => ({
  id: uid(),
  numero: "",
  numero_commande: "",
  code_commande: "",
  date: new Date().toISOString().slice(0, 10),
  num_cmde_client: "",
  num_livraison: "",
  tva: 0,
  montant_emballage: 0,
  items: [blankItem(), { ...blankItem(), designation: "PALETTE LOCAL BOIS1X1.2", unite_logistique: "PALETTE" }],
});

const money = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function computeItem(it: LineItem) {
  const brut = it.quantite * it.prix_unitaire_ht;
  const net = brut - it.remise_commerciale;
  return { brut, net };
}
function computeInvoice(inv: Invoice) {
  const ht = inv.items.reduce((s, it) => s + computeItem(it).net, 0);
  const ttc = ht + inv.tva + inv.montant_emballage;
  return { ht, ttc };
}

function Portail() {
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [invoices, setInvoices] = useState<Invoice[]>([blankInvoice()]);

  const totals = useMemo(() => {
    return invoices.reduce(
      (a, inv) => {
        const { ht, ttc } = computeInvoice(inv);
        return { ht: a.ht + ht, ttc: a.ttc + ttc, tva: a.tva + inv.tva, emb: a.emb + inv.montant_emballage };
      },
      { ht: 0, ttc: 0, tva: 0, emb: 0 },
    );
  }, [invoices]);

  const updateInv = (id: string, patch: Partial<Invoice>) =>
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const updateItem = (invId: string, idx: number, patch: Partial<LineItem>) =>
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invId
          ? { ...i, items: i.items.map((it, k) => (k === idx ? { ...it, ...patch } : it)) }
          : i,
      ),
    );

  const addItem = (invId: string) =>
    setInvoices((prev) => prev.map((i) => (i.id === invId ? { ...i, items: [...i.items, blankItem()] } : i)));

  const removeItem = (invId: string, idx: number) =>
    setInvoices((prev) =>
      prev.map((i) => (i.id === invId ? { ...i, items: i.items.filter((_, k) => k !== idx) } : i)),
    );

  const addInvoice = () => setInvoices((p) => [...p, blankInvoice()]);
  const removeInvoice = (id: string) => setInvoices((p) => p.filter((i) => i.id !== id));

  const exportExcel = () => {
    const detailed: Record<string, string | number>[] = [];
    const summary: Record<string, string | number>[] = [];

    invoices.forEach((inv) => {
      const { ht, ttc } = computeInvoice(inv);
      inv.items.forEach((it) => {
        const { brut, net } = computeItem(it);
        detailed.push({
          numero_commande: inv.numero_commande,
          code_commande: inv.code_commande,
          date: inv.date,
          numero: inv.numero,
          designation: it.designation,
          unite_logistique: it.unite_logistique,
          quantite: it.quantite,
          prix_unitaire_ht: it.prix_unitaire_ht,
          montant_ht_brut: +brut.toFixed(2),
          remise_commerciale: it.remise_commerciale,
          montant_ht_net: +net.toFixed(2),
          montant_ht: +ht.toFixed(2),
          tva: inv.tva,
          montant_emballage: inv.montant_emballage,
          montant_ttc: +ttc.toFixed(2),
          num_cmde_client: inv.num_cmde_client,
          num_livraison: inv.num_livraison,
        });
      });
      summary.push({
        numero_commande: inv.numero_commande,
        code_commande: inv.code_commande,
        date: inv.date,
        numero: inv.numero,
        montant_ht: +ht.toFixed(2),
        tva: inv.tva,
        montant_emballage: inv.montant_emballage,
        montant_ttc: +ttc.toFixed(2),
        num_cmde_client: inv.num_cmde_client,
        num_livraison: inv.num_livraison,
      });
    });

    const wbD = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbD, XLSX.utils.json_to_sheet(detailed), "Détaillé");
    XLSX.writeFile(wbD, `SMCPA_Detaille_${period}.xlsx`);

    const wbS = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbS, XLSX.utils.json_to_sheet(summary), "Récapitulatif");
    XLSX.writeFile(wbS, `SMCPA_Recapitulatif_${period}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">Portail comptable</span>
            <h1 className="text-3xl font-bold text-primary-dark mt-1">Traitement mensuel des factures</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Saisissez les factures du dossier du mois puis générez les deux exports Excel.
            </p>
          </div>
          <div className="flex items-end gap-3">
            <label className="text-sm">
              <span className="block text-xs text-muted-foreground mb-1">Période</span>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <button onClick={exportExcel} className="btn-primary hover:btn-primary-hover inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Générer les 2 fichiers Excel
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ["Factures", invoices.length.toString()],
            ["Total HT", `${money(totals.ht)} MAD`],
            ["Total TVA", `${money(totals.tva)} MAD`],
            ["Total TTC", `${money(totals.ttc)} MAD`],
          ].map(([label, val]) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-lg font-semibold text-primary-dark mt-1">{val}</div>
            </div>
          ))}
        </div>

        {/* Invoices */}
        <div className="space-y-6">
          {invoices.map((inv, idx) => {
            const { ht, ttc } = computeInvoice(inv);
            return (
              <div key={inv.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between bg-accent/50 px-5 py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary-dark">
                      Facture #{idx + 1} {inv.numero && `— ${inv.numero}`}
                    </span>
                  </div>
                  <button
                    onClick={() => removeInvoice(inv.id)}
                    className="text-destructive hover:bg-destructive/10 rounded p-1.5 transition"
                    aria-label="Supprimer la facture"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 grid gap-3 md:grid-cols-4">
                  <Field label="Numéro facture" value={inv.numero} onChange={(v) => updateInv(inv.id, { numero: v })} />
                  <Field label="N° commande" value={inv.numero_commande} onChange={(v) => updateInv(inv.id, { numero_commande: v })} />
                  <Field label="Code commande" value={inv.code_commande} onChange={(v) => updateInv(inv.id, { code_commande: v })} />
                  <Field label="Date" type="date" value={inv.date} onChange={(v) => updateInv(inv.id, { date: v })} />
                  <Field label="N° cmde client" value={inv.num_cmde_client} onChange={(v) => updateInv(inv.id, { num_cmde_client: v })} />
                  <Field label="N° livraison" value={inv.num_livraison} onChange={(v) => updateInv(inv.id, { num_livraison: v })} />
                  <Field label="TVA (MAD)" type="number" value={inv.tva} onChange={(v) => updateInv(inv.id, { tva: +v || 0 })} />
                  <Field label="Emballage (MAD)" type="number" value={inv.montant_emballage} onChange={(v) => updateInv(inv.id, { montant_emballage: +v || 0 })} />
                </div>

                <div className="px-5 pb-5">
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

                  <div className="mt-4 flex flex-wrap justify-end gap-6 text-sm border-t border-border pt-3">
                    <div><span className="text-muted-foreground">HT :</span> <span className="font-semibold">{money(ht)} MAD</span></div>
                    <div><span className="text-muted-foreground">TVA :</span> <span className="font-semibold">{money(inv.tva)}</span></div>
                    <div><span className="text-muted-foreground">Emb. :</span> <span className="font-semibold">{money(inv.montant_emballage)}</span></div>
                    <div className="text-primary-dark"><span className="opacity-70">TTC :</span> <span className="font-bold">{money(ttc)} MAD</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={addInvoice}
          className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 text-sm font-medium text-muted-foreground hover:text-primary transition inline-flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Ajouter une facture
        </button>
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
