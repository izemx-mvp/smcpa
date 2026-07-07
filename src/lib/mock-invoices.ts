import type { Invoice, LineItem } from "./dossiers";

const uid = () => Math.random().toString(36).slice(2, 10);

const SUPPLIERS = [
  { prefix: "SODEXAM", codeCmd: "SDX", clientBase: "CL-SDX" },
  { prefix: "COFRUIT", codeCmd: "CFR", clientBase: "CL-CFR" },
  { prefix: "AGRIMED", codeCmd: "AGM", clientBase: "CL-AGM" },
  { prefix: "MAROLAIT", codeCmd: "MRL", clientBase: "CL-MRL" },
  { prefix: "ATLASFOOD", codeCmd: "ATF", clientBase: "CL-ATF" },
  { prefix: "CENTRALE LAIT", codeCmd: "CTL", clientBase: "CL-CTL" },
];

const PRODUCTS: Array<{ name: string; unit: string; price: [number, number] }> = [
  { name: "HUILE OLIVE VIERGE 1L", unit: "CARTON 12", price: [420, 480] },
  { name: "FARINE DE BLE T55 25KG", unit: "SAC", price: [180, 220] },
  { name: "SUCRE BLANC RAFFINE 50KG", unit: "SAC", price: [510, 560] },
  { name: "RIZ LONG BASMATI 5KG", unit: "CARTON 6", price: [340, 380] },
  { name: "PATES COUDES 500G", unit: "CARTON 24", price: [180, 210] },
  { name: "TOMATE CONCENTREE 400G", unit: "CARTON 24", price: [220, 260] },
  { name: "LAIT UHT DEMI-ECREME 1L", unit: "CARTON 12", price: [140, 170] },
  { name: "CAFE MOULU ARABICA 250G", unit: "CARTON 20", price: [520, 600] },
  { name: "THE VERT MENTHE 200G", unit: "CARTON 30", price: [380, 440] },
  { name: "BISCUITS PETIT DEJEUNER 500G", unit: "CARTON 12", price: [190, 230] },
  { name: "EAU MINERALE 1.5L", unit: "PACK 6", price: [24, 32] },
  { name: "CONSERVE THON 160G", unit: "CARTON 48", price: [420, 480] },
  { name: "OLIVES VERTES 500G", unit: "SEAU", price: [95, 130] },
  { name: "COUSCOUS MOYEN 1KG", unit: "CARTON 10", price: [110, 140] },
  { name: "LEGUMES SURGELES MELANGE 2.5KG", unit: "CARTON", price: [180, 220] },
];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function makeItems(): LineItem[] {
  const count = randInt(2, 5);
  const chosen = new Set<number>();
  const items: LineItem[] = [];
  while (chosen.size < count) chosen.add(randInt(0, PRODUCTS.length - 1));
  chosen.forEach((idx) => {
    const p = PRODUCTS[idx];
    const qty = randInt(5, 40);
    const pu = +rand(p.price[0], p.price[1]).toFixed(2);
    const brut = qty * pu;
    const remise = Math.random() < 0.4 ? +(brut * rand(0.02, 0.08)).toFixed(2) : 0;
    items.push({
      designation: p.name,
      unite_logistique: p.unit,
      quantite: qty,
      prix_unitaire_ht: pu,
      remise_commerciale: remise,
    });
  });
  // Always append the pallet packaging line (matches source-file convention)
  items.push({
    designation: "PALETTE LOCAL BOIS 1X1.2",
    unite_logistique: "PALETTE",
    quantite: 1,
    prix_unitaire_ht: 0,
    remise_commerciale: 0,
  });
  return items;
}

export function generateInvoice(period: string, seq: number): Invoice {
  const supplier = pick(SUPPLIERS);
  const [year, month] = period.split("-");
  const day = String(randInt(1, 28)).padStart(2, "0");
  const items = makeItems();
  const ht = items.reduce((s, it) => s + it.quantite * it.prix_unitaire_ht - it.remise_commerciale, 0);
  const tva = +(ht * 0.2).toFixed(2);
  const emballage = +rand(15, 60).toFixed(2);
  return {
    id: uid(),
    numero: `${supplier.prefix}-${year}-${String(seq).padStart(4, "0")}`,
    numero_commande: `CMD-${supplier.codeCmd}-${randInt(10000, 99999)}`,
    code_commande: `${supplier.codeCmd}${randInt(100, 999)}`,
    date: `${year}-${month}-${day}`,
    num_cmde_client: `${supplier.clientBase}-${randInt(1000, 9999)}`,
    num_livraison: `BL-${randInt(100000, 999999)}`,
    tva,
    montant_emballage: emballage,
    items,
  };
}

export function generateInvoicesForFiles(period: string, count: number): Invoice[] {
  return Array.from({ length: count }, (_, i) => generateInvoice(period, i + 1));
}

export function seedDossiers() {
  const seed: Array<{ period: string; label: string; files: number; days: number }> = [
    { period: "2026-05", label: "Dossier Mai 2026", files: 14, days: 15 },
    { period: "2026-04", label: "Dossier Avril 2026", files: 11, days: 46 },
    { period: "2026-03", label: "Dossier Mars 2026", files: 17, days: 77 },
  ];
  return seed.map((s) => {
    const invoices = generateInvoicesForFiles(s.period, s.files);
    const createdAt = new Date(Date.now() - s.days * 86400000).toISOString();
    return {
      id: uid(),
      period: s.period,
      label: s.label,
      createdAt,
      sourceFiles: invoices.map((inv) => `${inv.numero}.pdf`),
      invoices,
    };
  });
}
