import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, destinationsTable, hotelsTable, packagesTable, pricingSettingsTable } from "@workspace/db";
import {
  GetDestinationParams,
  GetDestinationSummaryParams,
  ListPackagesQueryParams,
} from "@workspace/api-zod";
import { computeFinalPrice } from "../lib/pricing";

const router: IRouter = Router();

router.get("/destinations", async (req, res): Promise<void> => {
  const destinations = await db
    .select()
    .from(destinationsTable)
    .where(eq(destinationsTable.isActive, true))
    .orderBy(asc(destinationsTable.sortOrder));

  const hotelCounts = await db
    .select({ destinationId: hotelsTable.destinationId })
    .from(hotelsTable)
    .where(eq(hotelsTable.isActive, true));

  const countMap: Record<number, number> = {};
  for (const h of hotelCounts) countMap[h.destinationId] = (countMap[h.destinationId] ?? 0) + 1;

  const settings = await db.select().from(pricingSettingsTable).limit(1);
  const cfg = settings[0];

  const pkgs = cfg
    ? await db
        .select()
        .from(packagesTable)
        .where(eq(packagesTable.isActive, true))
    : [];

  const minPriceMap: Record<number, number> = {};
  if (cfg) {
    const config = {
      ticketPriceJod: parseFloat(cfg.ticketPriceJod as unknown as string),
      transportJod: parseFloat(cfg.transportJod as unknown as string),
      fixedProfitJod: parseFloat(cfg.fixedProfitJod as unknown as string),
      profitPct: parseFloat(cfg.profitPct as unknown as string),
      rateUsdToJod: parseFloat(cfg.rateUsdToJod as unknown as string),
      rateEurToJod: parseFloat(cfg.rateEurToJod as unknown as string),
      rateSarToJod: parseFloat(cfg.rateSarToJod as unknown as string),
    };
    const destTicketMap: Record<number, number | null> = {};
    for (const d of destinations) {
      destTicketMap[d.id] = d.ticketPriceJod != null ? parseFloat(d.ticketPriceJod as unknown as string) : null;
    }
    for (const pkg of pkgs) {
      const price = computeFinalPrice(
        parseFloat(pkg.basePriceUsd as unknown as string),
        pkg.nights,
        pkg.currency,
        config,
        destTicketMap[pkg.destinationId],
      );
      const existing = minPriceMap[pkg.destinationId];
      if (existing == null || price.jod < existing) {
        minPriceMap[pkg.destinationId] = price.jod;
      }
    }
  }

  res.json(
    destinations.map((d) => ({
      ...d,
      hotelCount: countMap[d.id] ?? 0,
      minPrice: minPriceMap[d.id] ?? null,
    })),
  );
});

router.get("/destinations/featured", async (_req, res): Promise<void> => {
  const destinations = await db
    .select()
    .from(destinationsTable)
    .where(and(eq(destinationsTable.isActive, true), eq(destinationsTable.isFeatured, true)))
    .orderBy(asc(destinationsTable.sortOrder))
    .limit(6);

  const settings = await db.select().from(pricingSettingsTable).limit(1);
  const cfg = settings[0];

  const minPriceMap: Record<number, number> = {};
  if (cfg && destinations.length > 0) {
    const config = {
      ticketPriceJod: parseFloat(cfg.ticketPriceJod as unknown as string),
      transportJod: parseFloat(cfg.transportJod as unknown as string),
      fixedProfitJod: parseFloat(cfg.fixedProfitJod as unknown as string),
      profitPct: parseFloat(cfg.profitPct as unknown as string),
      rateUsdToJod: parseFloat(cfg.rateUsdToJod as unknown as string),
      rateEurToJod: parseFloat(cfg.rateEurToJod as unknown as string),
      rateSarToJod: parseFloat(cfg.rateSarToJod as unknown as string),
    };
    const destTicketMap: Record<number, number | null> = {};
    for (const d of destinations) {
      destTicketMap[d.id] = d.ticketPriceJod != null ? parseFloat(d.ticketPriceJod as unknown as string) : null;
    }
    const pkgs = await db.select().from(packagesTable).where(eq(packagesTable.isActive, true));
    for (const pkg of pkgs) {
      if (!destTicketMap.hasOwnProperty(pkg.destinationId)) continue;
      const price = computeFinalPrice(
        parseFloat(pkg.basePriceUsd as unknown as string),
        pkg.nights,
        pkg.currency,
        config,
        destTicketMap[pkg.destinationId],
      );
      const existing = minPriceMap[pkg.destinationId];
      if (existing == null || price.jod < existing) {
        minPriceMap[pkg.destinationId] = price.jod;
      }
    }
  }

  res.json(destinations.map((d) => ({ ...d, hotelCount: null, minPrice: minPriceMap[d.id] ?? null })));
});

router.get("/destinations/:slug", async (req, res): Promise<void> => {
  const params = GetDestinationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [destination] = await db
    .select()
    .from(destinationsTable)
    .where(eq(destinationsTable.slug, params.data.slug));

  if (!destination) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }
  res.json({ ...destination, hotelCount: null, minPrice: null });
});

router.get("/destinations/:slug/summary", async (req, res): Promise<void> => {
  const params = GetDestinationSummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [destination] = await db
    .select()
    .from(destinationsTable)
    .where(eq(destinationsTable.slug, params.data.slug));

  if (!destination) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }

  const hotels = await db
    .select()
    .from(hotelsTable)
    .where(and(eq(hotelsTable.destinationId, destination.id), eq(hotelsTable.isActive, true)));

  const pkgs = await db
    .select()
    .from(packagesTable)
    .where(and(eq(packagesTable.destinationId, destination.id), eq(packagesTable.isActive, true)));

  const settings = await db.select().from(pricingSettingsTable).limit(1);
  const cfg = settings[0];

  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  if (cfg) {
    const config = {
      ticketPriceJod: parseFloat(cfg.ticketPriceJod as unknown as string),
      transportJod: parseFloat(cfg.transportJod as unknown as string),
      fixedProfitJod: parseFloat(cfg.fixedProfitJod as unknown as string),
      profitPct: parseFloat(cfg.profitPct as unknown as string),
      rateUsdToJod: parseFloat(cfg.rateUsdToJod as unknown as string),
      rateEurToJod: parseFloat(cfg.rateEurToJod as unknown as string),
      rateSarToJod: parseFloat(cfg.rateSarToJod as unknown as string),
    };
    const destTicket = destination.ticketPriceJod != null ? parseFloat(destination.ticketPriceJod as unknown as string) : null;
    for (const pkg of pkgs) {
      const price = computeFinalPrice(
        parseFloat(pkg.basePriceUsd as unknown as string),
        pkg.nights,
        pkg.currency,
        config,
        destTicket,
      );
      if (minPrice == null || price.jod < minPrice) minPrice = price.jod;
      if (maxPrice == null || price.jod > maxPrice) maxPrice = price.jod;
    }
  }

  const nightsSet = new Set(pkgs.map((p) => p.nights));
  const areasSet = new Set(hotels.map((h) => h.area).filter(Boolean) as string[]);
  const mealPlansSet = new Set(pkgs.map((p) => p.mealPlan));
  const starsSet = new Set(hotels.map((h) => h.stars));

  res.json({
    slug: params.data.slug,
    totalHotels: hotels.length,
    totalPackages: pkgs.length,
    minPrice,
    maxPrice,
    availableNights: Array.from(nightsSet).sort((a, b) => a - b),
    availableAreas: Array.from(areasSet).sort(),
    availableMealPlans: Array.from(mealPlansSet).sort(),
    availableStars: Array.from(starsSet).sort((a, b) => a - b),
  });
});

router.get("/packages", async (req, res): Promise<void> => {
  const query = ListPackagesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const settings = await db.select().from(pricingSettingsTable).limit(1);
  const cfg = settings[0];
  if (!cfg) {
    res.json([]);
    return;
  }

  const config = {
    ticketPriceJod: parseFloat(cfg.ticketPriceJod as unknown as string),
    transportJod: parseFloat(cfg.transportJod as unknown as string),
    fixedProfitJod: parseFloat(cfg.fixedProfitJod as unknown as string),
    profitPct: parseFloat(cfg.profitPct as unknown as string),
    rateUsdToJod: parseFloat(cfg.rateUsdToJod as unknown as string),
    rateEurToJod: parseFloat(cfg.rateEurToJod as unknown as string),
    rateSarToJod: parseFloat(cfg.rateSarToJod as unknown as string),
  };

  const { destinationSlug, nights, stars, area, mealPlan, roomType, maxPrice, minPrice } = query.data;

  const rows = await db
    .select({
      pkg: packagesTable,
      hotel: hotelsTable,
      destination: destinationsTable,
    })
    .from(packagesTable)
    .innerJoin(hotelsTable, eq(packagesTable.hotelId, hotelsTable.id))
    .innerJoin(destinationsTable, eq(packagesTable.destinationId, destinationsTable.id))
    .where(eq(packagesTable.isActive, true));

  const results = rows
    .filter((row) => {
      if (destinationSlug && row.destination.slug !== destinationSlug) return false;
      if (nights != null && row.pkg.nights !== nights) return false;
      if (stars != null && row.hotel.stars !== stars) return false;
      if (area && row.hotel.area !== area) return false;
      if (mealPlan && row.pkg.mealPlan !== mealPlan) return false;
      if (roomType && row.pkg.roomType !== roomType) return false;
      return true;
    })
    .map((row) => {
      const destTicket = row.destination.ticketPriceJod != null ? parseFloat(row.destination.ticketPriceJod as unknown as string) : null;
      const price = computeFinalPrice(
        parseFloat(row.pkg.basePriceUsd as unknown as string),
        row.pkg.nights,
        row.pkg.currency,
        config,
        destTicket,
      );
      return {
        id: row.pkg.id,
        hotelId: row.pkg.hotelId,
        hotelNameAr: row.hotel.nameAr,
        hotelNameEn: row.hotel.nameEn,
        stars: row.hotel.stars,
        area: row.hotel.area ?? null,
        mealPlan: row.pkg.mealPlan,
        roomType: row.pkg.roomType,
        nights: row.pkg.nights,
        finalPriceJod: price.jod,
        finalPriceUsd: price.usd,
        dateFrom: row.pkg.dateFrom ?? null,
        dateTo: row.pkg.dateTo ?? null,
        isActive: row.pkg.isActive,
        hotelImageUrl: row.hotel.imageUrl ?? null,
        hotelDescription: row.hotel.description ?? null,
      };
    })
    .filter((p) => {
      if (minPrice != null && p.finalPriceJod < minPrice) return false;
      if (maxPrice != null && p.finalPriceJod > maxPrice) return false;
      return true;
    });

  res.json(results);
});

export default router;
