import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, packagesTable, hotelsTable, destinationsTable, pricingSettingsTable } from "@workspace/db";
import { GenerateQuoteBody } from "@workspace/api-zod";
import { computeFinalPrice } from "../lib/pricing";

const router: IRouter = Router();

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = GenerateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { packageId, nights, roomType, guestName, guestPhone, adults, children, specialRequests } = parsed.data;

  const [row] = await db
    .select({ pkg: packagesTable, hotel: hotelsTable, destination: destinationsTable })
    .from(packagesTable)
    .innerJoin(hotelsTable, eq(packagesTable.hotelId, hotelsTable.id))
    .innerJoin(destinationsTable, eq(packagesTable.destinationId, destinationsTable.id))
    .where(eq(packagesTable.id, packageId));

  if (!row) {
    res.status(404).json({ error: "Package not found" });
    return;
  }

  const settings = await db.select().from(pricingSettingsTable).limit(1);
  const cfg = settings[0];
  if (!cfg) {
    res.status(500).json({ error: "Pricing settings not configured" });
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

  const price = computeFinalPrice(
    parseFloat(row.pkg.basePriceUsd as unknown as string),
    nights,
    row.pkg.currency,
    config,
  );

  const hotelNameAr = row.hotel.nameAr;
  const hotelNameEn = row.hotel.nameEn;
  const destAr = row.destination.nameAr;
  const destEn = row.destination.nameEn;

  const whatsappMessage =
    `مرحباً، أود الاستفسار عن باقة سياحية:\n` +
    `الوجهة: ${destAr} / ${destEn}\n` +
    `الفندق: ${hotelNameAr} / ${hotelNameEn}\n` +
    `عدد الليالي: ${nights} ليلة\n` +
    `نوع الغرفة: ${roomType}\n` +
    `نظام الإقامة: ${row.pkg.mealPlan}\n` +
    `السعر: ${price.jod} د.أ\n` +
    `الاسم: ${guestName}\n` +
    (guestPhone ? `الهاتف: ${guestPhone}\n` : "") +
    (adults ? `البالغين: ${adults}\n` : "") +
    (children ? `الأطفال: ${children}\n` : "") +
    (specialRequests ? `ملاحظات: ${specialRequests}\n` : "");

  res.json({
    quoteId: randomUUID(),
    hotelNameAr,
    hotelNameEn,
    destinationNameAr: destAr,
    destinationNameEn: destEn,
    nights,
    roomType,
    mealPlan: row.pkg.mealPlan,
    finalPriceJod: price.jod,
    finalPriceUsd: price.usd,
    whatsappNumber: cfg.whatsappNumber,
    whatsappMessage,
    guestName,
    adults: adults ?? null,
    children: children ?? null,
    hotelStars: row.hotel.stars,
    hotelArea: row.hotel.area ?? null,
    dateFrom: row.pkg.dateFrom ?? null,
    dateTo: row.pkg.dateTo ?? null,
  });
});

export default router;
