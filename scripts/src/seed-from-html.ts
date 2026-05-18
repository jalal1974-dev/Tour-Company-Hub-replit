/**
 * Seed hotels & packages from the uploaded HTML pricing dashboards.
 * Run: pnpm --filter @workspace/scripts run seed-from-html
 */
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import { hotelsTable, packagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const HTML_DIR = path.join(process.cwd(), "..", "attached_assets");
const RATE_USD_JOD = 0.71;
const RATE_EUR_JOD = 0.79;

// Destination slugs → IDs (from current DB)
const DEST: Record<string, number> = {
  istanbul: 1,
  antalya: 2,
  trabzon: 3,
  sharm: 4,
  bali: 5,
  malaysia: 6,
  singapore: 7,
  thailand: 8,
  vietnam: 9,
  aqaba: 10,
  georgia: 11,
};

function readHtml(filename: string): string {
  return fs.readFileSync(path.join(HTML_DIR, filename), "utf-8");
}

/** Extract a JS variable assignment from HTML and evaluate it */
function extractVar(html: string, varName: string): unknown {
  const re = new RegExp(`(?:const|var|let)\\s+${varName}\\s*=\\s*`, "s");
  const match = re.exec(html);
  if (!match) throw new Error(`Variable ${varName} not found`);
  const valueStart = match.index + match[0].length;
  // Skip whitespace to find first bracket/brace
  let i = valueStart;
  while (i < html.length && /\s/.test(html[i])) i++;
  const opener = html[i];
  const closer = opener === "[" ? "]" : opener === "{" ? "}" : null;
  if (!closer) throw new Error(`${varName} does not start with [ or {`);

  let depth = 0;
  let inStr = false;
  let strChar = "";
  const start = i;
  while (i < html.length) {
    const c = html[i];
    if (inStr) {
      if (c === strChar && html[i - 1] !== "\\") inStr = false;
    } else {
      if (c === '"' || c === "'" || c === "`") { inStr = true; strChar = c; }
      else if (c === opener) depth++;
      else if (c === closer) {
        depth--;
        if (depth === 0) { i++; break; }
      }
    }
    i++;
  }
  const raw = html.slice(start, i).trim();
  try {
    return new Function(`"use strict"; return (${raw})`)();
  } catch (e) {
    throw new Error(`Failed to eval ${varName}: ${e}`);
  }
}

// ─── SHARM ─────────────────────────────────────────────────────────────────
interface SharmPeriod {
  date_from: string; date_to: string;
  room_type: string; meal_plan: string;
  single: number; double: number; triple: number;
}
interface SharmHotel {
  id: number; name: string; stars: number;
  periods: SharmPeriod[];
}

function parseSharm() {
  const html = readHtml("sharm_pricing_dashboard1_1779061660607.html");
  const hotels = extractVar(html, "HOTELS") as SharmHotel[];
  const rows: { hotel: { nameEn: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const h of hotels) {
    const nameParts = h.name.replace(/\s*-\s*\d+\s*STARS?\s*$/i, "").trim();
    const pkgs: typeof rows[0]["pkgs"] = [];
    for (const p of h.periods) {
      // Create packages for SGL, DBL, TPL (per-person per-night in USD)
      pkgs.push({ nights: 7, mealPlan: p.meal_plan, roomType: `${p.room_type} - DBL`, basePriceUsd: p.double, currency: "USD", dateFrom: p.date_from, dateTo: p.date_to });
      pkgs.push({ nights: 7, mealPlan: p.meal_plan, roomType: `${p.room_type} - SGL`, basePriceUsd: p.single, currency: "USD", dateFrom: p.date_from, dateTo: p.date_to });
      pkgs.push({ nights: 7, mealPlan: p.meal_plan, roomType: `${p.room_type} - TPL`, basePriceUsd: p.triple, currency: "USD", dateFrom: p.date_from, dateTo: p.date_to });
    }
    rows.push({ hotel: { nameEn: nameParts, stars: h.stars, destId: DEST.sharm }, pkgs });
  }
  return rows;
}

// ─── ANTALYA ────────────────────────────────────────────────────────────────
interface AntalyaPeriod {
  dates?: string;
  ppd?: number;
  dbl?: number; sng?: number; trp?: number;
}
interface AntalyaHotel {
  area: string; name: string; stars: number; basis: string; cur: string;
  periods: AntalyaPeriod[];
}

function parseAntalya() {
  const html = readHtml("antalya_pricing_dashboard_(1)11111_1779061617858.html");
  const hotels = extractVar(html, "HOTELS") as AntalyaHotel[];
  const rows: { hotel: { nameEn: string; stars: number; destId: number; area: string }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const h of hotels) {
    const pkgs: typeof rows[0]["pkgs"] = [];
    const currency = (h.cur || "EUR").toUpperCase();
    const basis = h.basis || "UALL";
    for (const p of h.periods) {
      const [df, dt] = (p.dates || "").split("–").map(s => s.trim());
      const dateFrom = df ? df.replace(/(\d+)\.(\d+)/, (_, d, m) => `${d}.${m}.2026`) : "";
      const dateTo = dt ? dt.replace(/(\d+)\.(\d+)/, (_, d, m) => `${d}.${m}.2026`) : "";
      if (p.ppd !== undefined) {
        pkgs.push({ nights: 7, mealPlan: basis, roomType: "DBL", basePriceUsd: p.ppd, currency, dateFrom, dateTo });
      } else {
        if (p.dbl !== undefined) pkgs.push({ nights: 7, mealPlan: basis, roomType: "DBL", basePriceUsd: p.dbl, currency, dateFrom, dateTo });
        if (p.sng !== undefined) pkgs.push({ nights: 7, mealPlan: basis, roomType: "SGL", basePriceUsd: p.sng, currency, dateFrom, dateTo });
        if (p.trp !== undefined) pkgs.push({ nights: 7, mealPlan: basis, roomType: "TPL", basePriceUsd: p.trp, currency, dateFrom, dateTo });
      }
    }
    if (pkgs.length === 0) continue;
    rows.push({ hotel: { nameEn: h.name, stars: h.stars, destId: DEST.antalya, area: h.area }, pkgs });
  }
  return rows;
}

// ─── ISTANBUL ───────────────────────────────────────────────────────────────
interface IstanbulEntry { n: string; s: number; l: string; dbl: number; sgl: number; xtr: number | null; nw?: boolean }
type IstanbulPeriodData = { [nights: number]: IstanbulEntry[] };
interface IstanbulData { may: IstanbulPeriodData; jun: IstanbulPeriodData }

function parseIstanbul() {
  const html = readHtml("istanbul_pricing_dashboard_(1)111111111_1779061638166.html");
  const data = extractVar(html, "DATA") as IstanbulData;
  const rows: { hotel: { nameEn: string; stars: number; destId: number; area: string }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  const hotelMap = new Map<string, typeof rows[0]>();

  for (const [period, nightsData] of Object.entries(data)) {
    const dateFrom = period === "may" ? "01.05.2026" : "01.06.2026";
    const dateTo = period === "may" ? "31.05.2026" : "30.06.2026";
    for (const [nightsStr, entries] of Object.entries(nightsData)) {
      const nights = parseInt(nightsStr);
      for (const e of entries) {
        const key = e.n;
        if (!hotelMap.has(key)) {
          hotelMap.set(key, { hotel: { nameEn: e.n, stars: e.s, destId: DEST.istanbul, area: e.l }, pkgs: [] });
          rows.push(hotelMap.get(key)!);
        }
        const row = hotelMap.get(key)!;
        // Istanbul prices are total per-person in USD for N nights → divide by nights for per-night rate
        row.pkgs.push({ nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd: +(e.dbl / nights).toFixed(4), currency: "USD", dateFrom, dateTo });
        row.pkgs.push({ nights, mealPlan: "B&B", roomType: "SGL", basePriceUsd: +(e.sgl / nights).toFixed(4), currency: "USD", dateFrom, dateTo });
        if (e.xtr !== null) {
          row.pkgs.push({ nights, mealPlan: "B&B", roomType: "DBL+Extra", basePriceUsd: +(e.xtr / nights).toFixed(4), currency: "USD", dateFrom, dateTo });
        }
      }
    }
  }
  return rows;
}

// ─── TRABZON ─────────────────────────────────────────────────────────────────
interface TrabzonEntry { n: string; s: string; sp: string | null; n3: { dbl: number; sgl: number; extra: number | null }; n4: { dbl: number; sgl: number; extra: number | null }; n5: { dbl: number; sgl: number; extra: number | null }; n6: { dbl: number; sgl: number; extra: number | null }; n7: { dbl: number; sgl: number; extra: number | null } }

function parseTrabzon() {
  const html = readHtml("trabzon_pricing_dashboard111111111_1779061682805.html");
  const D = extractVar(html, "D") as { may: TrabzonEntry[]; jun: TrabzonEntry[] };
  const rows: { hotel: { nameEn: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  const hotelMap = new Map<string, typeof rows[0]>();

  for (const [period, entries] of Object.entries(D)) {
    const dateFrom = period === "may" ? "01.05.2026" : "03.06.2026";
    const dateTo = period === "may" ? "31.05.2026" : "30.06.2026";
    for (const e of entries) {
      const key = e.n;
      const stars = parseInt(e.s) || 3;
      if (!hotelMap.has(key)) {
        hotelMap.set(key, { hotel: { nameEn: e.n, stars, destId: DEST.trabzon }, pkgs: [] });
        rows.push(hotelMap.get(key)!);
      }
      const row = hotelMap.get(key)!;
      for (const nights of [3, 4, 5, 6, 7] as const) {
        const pd = e[`n${nights}` as keyof TrabzonEntry] as { dbl: number; sgl: number; extra: number | null };
        if (!pd) continue;
        // Prices are total per person in USD → divide by nights
        row.pkgs.push({ nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd: +(pd.dbl / nights).toFixed(4), currency: "USD", dateFrom, dateTo });
        row.pkgs.push({ nights, mealPlan: "B&B", roomType: "SGL", basePriceUsd: +(pd.sgl / nights).toFixed(4), currency: "USD", dateFrom, dateTo });
        if (pd.extra !== null) {
          row.pkgs.push({ nights, mealPlan: "B&B", roomType: "DBL+Extra", basePriceUsd: +(pd.extra / nights).toFixed(4), currency: "USD", dateFrom, dateTo });
        }
      }
    }
  }
  return rows;
}

// ─── BALI ────────────────────────────────────────────────────────────────────
interface BaliPkg { id: string; stars: number; nights: number; nameAr: string; nameEn: string; base: number }

function parseBali() {
  const html = readHtml("indonesia_bali_packages_dashboard_(2)_1779061643253.html");
  const pkgs = extractVar(html, "PKG") as BaliPkg[];
  const rows: { hotel: { nameEn: string; nameAr: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const p of pkgs) {
    // base is JOD per person total → convert to per-night USD equivalent
    const basePriceUsd = +(p.base / p.nights / RATE_USD_JOD).toFixed(4);
    rows.push({
      hotel: { nameEn: p.nameEn, nameAr: p.nameAr, stars: p.stars, destId: DEST.bali },
      pkgs: [{ nights: p.nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd, currency: "USD", dateFrom: "01.05.2026", dateTo: "31.10.2026" }],
    });
  }
  return rows;
}

// ─── MALAYSIA ────────────────────────────────────────────────────────────────
interface MalaysiaPkg { id: number; stars: number; nights: number; title_en: string; title_ar: string; baseJOD: number }

function parseMalaysia() {
  // Use the first Malaysia file
  const html = readHtml("malaysia_packages_dashboard_bilingual_1779061654493.html");
  const pkgs = extractVar(html, "packages") as MalaysiaPkg[];
  const rows: { hotel: { nameEn: string; nameAr: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const p of pkgs) {
    const basePriceUsd = +(p.baseJOD / p.nights / RATE_USD_JOD).toFixed(4);
    rows.push({
      hotel: { nameEn: p.title_en, nameAr: p.title_ar, stars: p.stars, destId: DEST.malaysia },
      pkgs: [{ nights: p.nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd, currency: "USD", dateFrom: "01.05.2026", dateTo: "31.10.2026" }],
    });
  }
  return rows;
}

// ─── SINGAPORE ───────────────────────────────────────────────────────────────
interface SingaporePkg { id: string; stars: number; nights: number; nameAr: string; nameEn: string; base: number }

function parseSingapore() {
  const html = readHtml("singapore_packages_dashboard_(1)_1779061672799.html");
  const pkgs = extractVar(html, "PKG") as SingaporePkg[];
  const rows: { hotel: { nameEn: string; nameAr: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const p of pkgs) {
    const basePriceUsd = +(p.base / p.nights / RATE_USD_JOD).toFixed(4);
    rows.push({
      hotel: { nameEn: p.nameEn, nameAr: p.nameAr, stars: p.stars, destId: DEST.singapore },
      pkgs: [{ nights: p.nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd, currency: "USD", dateFrom: "01.05.2026", dateTo: "31.12.2026" }],
    });
  }
  return rows;
}

// ─── THAILAND ─────────────────────────────────────────────────────────────────
interface ThailandPkg { id: string; stars: number; nights: number; title: string; basePriceJOD: number }

function parseThailand() {
  const html = readHtml("thailand_packages_dashboard_1779061678158.html");
  const pkgs = extractVar(html, "packages") as ThailandPkg[];
  const rows: { hotel: { nameEn: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const p of pkgs) {
    const basePriceUsd = +(p.basePriceJOD / p.nights / RATE_USD_JOD).toFixed(4);
    rows.push({
      hotel: { nameEn: p.title, stars: p.stars, destId: DEST.thailand },
      pkgs: [{ nights: p.nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd, currency: "USD", dateFrom: "01.05.2026", dateTo: "31.12.2026" }],
    });
  }
  return rows;
}

// ─── VIETNAM ──────────────────────────────────────────────────────────────────
interface VietnamPkg { id: string; stars: number; nights: number; title: { en: string; ar?: string }; basePriceJOD: number }

function parseVietnam() {
  const html = readHtml("vietnam_packages_bilingual_1779061692887.html");
  const pkgs = extractVar(html, "packages") as VietnamPkg[];
  const rows: { hotel: { nameEn: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const p of pkgs) {
    const name = typeof p.title === "object" ? (p.title.en || String(p.title)) : String(p.title);
    const basePriceUsd = +(p.basePriceJOD / p.nights / RATE_USD_JOD).toFixed(4);
    rows.push({
      hotel: { nameEn: name, stars: p.stars, destId: DEST.vietnam },
      pkgs: [{ nights: p.nights, mealPlan: "B&B", roomType: "DBL", basePriceUsd, currency: "USD", dateFrom: "01.05.2026", dateTo: "31.12.2026" }],
    });
  }
  return rows;
}

// ─── AQABA ────────────────────────────────────────────────────────────────────
interface AqabaRoom { label: string; weekday?: number; weekend?: number; isAddon?: boolean; isORB?: boolean; meals?: string }
interface AqabaHotel { name: string; note?: string; meals?: string; rooms: AqabaRoom[] }

function parseAqaba() {
  const html = readHtml("aqaba_pricing_dashboard_(1)_1779061623892.html");
  const hotels4 = extractVar(html, "HOTELS4") as AqabaHotel[];
  const hotels5 = extractVar(html, "HOTELS5") as AqabaHotel[];
  const allHotels = [
    ...hotels4.map(h => ({ ...h, stars: 4 })),
    ...hotels5.map(h => ({ ...h, stars: 5 })),
  ];
  const rows: { hotel: { nameEn: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];

  for (const h of allHotels) {
    const pkgs: typeof rows[0]["pkgs"] = [];
    for (const r of h.rooms) {
      if (r.isAddon || r.isORB || !r.weekday) continue;
      // Aqaba prices are per room per night in JOD
      // Assume double room → per person = weekday/2
      const pricePerPersonJod = r.weekday / 2;
      const basePriceUsd = +(pricePerPersonJod / RATE_USD_JOD).toFixed(4);
      const mealPlan = r.meals || h.meals || "Breakfast";
      pkgs.push({ nights: 2, mealPlan, roomType: r.label.replace(/\s*\(.*?\)/g, "").trim(), basePriceUsd, currency: "USD", dateFrom: "01.05.2026", dateTo: "31.12.2026" });
    }
    if (pkgs.length === 0) continue;
    rows.push({ hotel: { nameEn: h.name, stars: (h as any).stars || 4, destId: DEST.aqaba }, pkgs });
  }
  return rows;
}

// ─── GEORGIA ──────────────────────────────────────────────────────────────────
interface GeorgiaHotel { name: string; stars: number; meal: string; d: number; s: number }
interface GeorgiaPkg { id: number; title: string; arabic: string; hotels: GeorgiaHotel[] }

function parseGeorgia() {
  const html = readHtml("travel_packages_dashboard_(2)_1779061688383.html");
  const pkgs = extractVar(html, "packages") as GeorgiaPkg[];
  const rows: { hotel: { nameEn: string; stars: number; destId: number }; pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }> }[] = [];
  const NIGHTS = 7;

  for (const p of pkgs) {
    for (const h of p.hotels) {
      // d = JOD per person double, s = JOD per person single
      const dblUsd = +(h.d / NIGHTS / RATE_USD_JOD).toFixed(4);
      const sglUsd = +(h.s / NIGHTS / RATE_USD_JOD).toFixed(4);
      rows.push({
        hotel: { nameEn: `${h.name} — ${p.title}`, stars: h.stars, destId: DEST.georgia },
        pkgs: [
          { nights: NIGHTS, mealPlan: h.meal, roomType: "DBL", basePriceUsd: dblUsd, currency: "USD", dateFrom: "22.05.2026", dateTo: "31.10.2026" },
          { nights: NIGHTS, mealPlan: h.meal, roomType: "SGL", basePriceUsd: sglUsd, currency: "USD", dateFrom: "22.05.2026", dateTo: "31.10.2026" },
        ],
      });
    }
  }
  return rows;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log("Parsing HTML files...");

  const allRows: {
    destId: number;
    hotel: { nameEn: string; nameAr?: string; stars: number; destId: number; area?: string };
    pkgs: Array<{ nights: number; mealPlan: string; roomType: string; basePriceUsd: number; currency: string; dateFrom: string; dateTo: string }>;
  }[] = [];

  const parsers: Array<() => typeof allRows> = [
    () => parseSharm().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseAntalya().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseIstanbul().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseTrabzon().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseBali().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseMalaysia().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseSingapore().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseThailand().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseVietnam().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseAqaba().map(r => ({ destId: r.hotel.destId, ...r })),
    () => parseGeorgia().map(r => ({ destId: r.hotel.destId, ...r })),
  ];

  for (const parse of parsers) {
    try {
      allRows.push(...parse());
    } catch (e) {
      console.error("Parse error:", e);
    }
  }

  console.log(`Parsed ${allRows.length} hotel entries`);

  // Get the destination IDs to clear
  const destIds = [...new Set(allRows.map(r => r.destId))];

  console.log("Clearing existing hotels & packages for seeded destinations...");
  for (const destId of destIds) {
    await db.delete(hotelsTable).where(eq(hotelsTable.destinationId, destId));
  }
  console.log("Cleared.");

  // Insert hotels and packages
  let totalHotels = 0;
  let totalPkgs = 0;

  for (const row of allRows) {
    const { hotel, pkgs } = row;
    if (pkgs.length === 0) continue;

    const [inserted] = await db.insert(hotelsTable).values({
      destinationId: hotel.destId,
      nameEn: hotel.nameEn,
      nameAr: (hotel as any).nameAr || hotel.nameEn,
      stars: hotel.stars,
      area: (hotel as any).area || null,
      isActive: true,
    }).returning({ id: hotelsTable.id });

    totalHotels++;

    const validPkgs = pkgs.filter(p => p.basePriceUsd !== null && p.basePriceUsd !== undefined && !isNaN(p.basePriceUsd) && p.basePriceUsd > 0);
    const pkgRows = validPkgs.map(p => ({
      hotelId: inserted.id,
      destinationId: hotel.destId,
      nights: p.nights,
      mealPlan: p.mealPlan,
      roomType: p.roomType,
      basePriceUsd: String(p.basePriceUsd),
      currency: p.currency,
      dateFrom: p.dateFrom || null,
      dateTo: p.dateTo || null,
      isActive: true,
    }));

    // Insert in batches of 100
    for (let i = 0; i < pkgRows.length; i += 100) {
      await db.insert(packagesTable).values(pkgRows.slice(i, i + 100));
      totalPkgs += Math.min(100, pkgRows.length - i);
    }

    if (totalHotels % 20 === 0) {
      console.log(`  Progress: ${totalHotels} hotels, ${totalPkgs} packages...`);
    }
  }

  console.log(`\nDone! Inserted ${totalHotels} hotels and ${totalPkgs} packages.`);
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
