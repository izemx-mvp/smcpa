import * as XLSX from "xlsx";

export type LineItem = {
  designation: string;
  unite_logistique: string;
  quantite: number;
  prix_unitaire_ht: number;
  remise_commerciale: number;
};

export type Invoice = {
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

export type Dossier = {
  id: string;
  period: string; // YYYY-MM
  label: string;
  createdAt: string;
  sourceFiles: string[]; // filenames imported
  invoices: Invoice[];
};

const KEY = "smcpa.dossiers.v1";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const blankItem = (): LineItem => ({
  designation: "",
  unite_logistique: "CARTON",
  quantite: 1,
  prix_unitaire_ht: 0,
  remise_commerciale: 0,
});

export const blankInvoice = (): Invoice => ({
  id: uid(),
  numero: "",
  numero_commande: "",
  code_commande: "",
  date: new Date().toISOString().slice(0, 10),
  num_cmde_client: "",
  num_livraison: "",
  tva: 0,
  montant_emballage: 0,
  items: [blankItem()],
});

export function loadDossiers(): Dossier[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDossier(d: Dossier) {
  const all = loadDossiers().filter((x) => x.id !== d.id);
  all.unshift(d);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteDossier(id: string) {
  localStorage.setItem(KEY, JSON.stringify(loadDossiers().filter((d) => d.id !== id)));
}

export function getDossier(id: string): Dossier | undefined {
  return loadDossiers().find((d) => d.id === id);
}

export function computeItem(it: LineItem) {
  const brut = it.quantite * it.prix_unitaire_ht;
  const net = brut - it.remise_commerciale;
  return { brut, net };
}

export function computeInvoice(inv: Invoice) {
  const ht = inv.items.reduce((s, it) => s + computeItem(it).net, 0);
  const ttc = ht + inv.tva + inv.montant_emballage;
  return { ht, ttc };
}

export function totalsFor(dossier: Dossier) {
  return dossier.invoices.reduce(
    (a, inv) => {
      const { ht, ttc } = computeInvoice(inv);
      return {
        ht: a.ht + ht,
        ttc: a.ttc + ttc,
        tva: a.tva + inv.tva,
        emb: a.emb + inv.montant_emballage,
        items: a.items + inv.items.length,
      };
    },
    { ht: 0, ttc: 0, tva: 0, emb: 0, items: 0 },
  );
}

export function money(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function buildRows(dossier: Dossier) {
  const detailed: Record<string, string | number>[] = [];
  const summary: Record<string, string | number>[] = [];
  dossier.invoices.forEach((inv) => {
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
  return { detailed, summary };
}

export function exportDetailed(dossier: Dossier) {
  const { detailed } = buildRows(dossier);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(detailed), "Détaillé");
  XLSX.writeFile(wb, `SMCPA_Detaille_${dossier.period}.xlsx`);
}
export function exportSummary(dossier: Dossier) {
  const { summary } = buildRows(dossier);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), "Récapitulatif");
  XLSX.writeFile(wb, `SMCPA_Recapitulatif_${dossier.period}.xlsx`);
}
