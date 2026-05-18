import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { createHash } from "crypto";
import { db, destinationsTable, hotelsTable, packagesTable, pricingSettingsTable, adminsTable } from "@workspace/db";
import {
  AdminLoginBody,
  GetAdminDestinationParams,
  UpdateAdminDestinationParams,
  DeleteAdminDestinationParams,
  CreateAdminDestinationBody,
  UpdateAdminDestinationBody,
  UpdateAdminHotelParams,
  DeleteAdminHotelParams,
  CreateAdminHotelBody,
  UpdateAdminHotelBody,
  ListAdminHotelsQueryParams,
  UpdateAdminPackageParams,
  DeleteAdminPackageParams,
  ToggleAdminPackageParams,
  CreateAdminPackageBody,
  UpdateAdminPackageBody,
  ToggleAdminPackageBody,
  ListAdminPackagesQueryParams,
  UpdateAdminSettingsBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "aljood_salt_2024").digest("hex");
}

type SessionRequest = import("express").Request & {
  session: {
    adminId?: number;
    username?: string;
    role?: string;
    destroy: (cb: (err: unknown) => void) => void;
    save: (cb: (err: unknown) => void) => void;
  };
};

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { username, password } = parsed.data;
  const hash = hashPassword(password);
  const [admin] = await db
    .select()
    .from(adminsTable)
    .where(and(eq(adminsTable.username, username), eq(adminsTable.passwordHash, hash)));

  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const sessionReq = req as SessionRequest;
  sessionReq.session.adminId = admin.id;
  sessionReq.session.username = admin.username;
  sessionReq.session.role = admin.role;

  sessionReq.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Session save error");
      res.status(500).json({ error: "Session error" });
      return;
    }
    res.json({ id: admin.id, username: admin.username, role: admin.role });
  });
});

router.post("/admin/logout", (req, res): void => {
  const sessionReq = req as SessionRequest;
  sessionReq.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/admin/me", (req, res): void => {
  const sessionReq = req as SessionRequest;
  if (!sessionReq.session?.adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: sessionReq.session.adminId,
    username: sessionReq.session.username,
    role: sessionReq.session.role,
  });
});

router.get("/admin/settings", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await db.select().from(pricingSettingsTable).limit(1);
  if (!settings[0]) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }
  const s = settings[0];
  res.json({
    ...s,
    ticketPriceJod: parseFloat(s.ticketPriceJod as unknown as string),
    transportJod: parseFloat(s.transportJod as unknown as string),
    fixedProfitJod: parseFloat(s.fixedProfitJod as unknown as string),
    profitPct: parseFloat(s.profitPct as unknown as string),
    rateUsdToJod: parseFloat(s.rateUsdToJod as unknown as string),
    rateEurToJod: parseFloat(s.rateEurToJod as unknown as string),
    rateSarToJod: parseFloat(s.rateSarToJod as unknown as string),
    updatedAt: s.updatedAt.toISOString(),
  });
});

router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(pricingSettingsTable).limit(1);
  if (!existing[0]) {
    res.status(404).json({ error: "Settings not found" });
    return;
  }
  const settingsUpdate: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v != null) settingsUpdate[k] = String(v);
  }
  const [updated] = await db
    .update(pricingSettingsTable)
    .set(settingsUpdate)
    .where(eq(pricingSettingsTable.id, existing[0].id))
    .returning();
  res.json({
    ...updated,
    ticketPriceJod: parseFloat(updated.ticketPriceJod as unknown as string),
    transportJod: parseFloat(updated.transportJod as unknown as string),
    fixedProfitJod: parseFloat(updated.fixedProfitJod as unknown as string),
    profitPct: parseFloat(updated.profitPct as unknown as string),
    rateUsdToJod: parseFloat(updated.rateUsdToJod as unknown as string),
    rateEurToJod: parseFloat(updated.rateEurToJod as unknown as string),
    rateSarToJod: parseFloat(updated.rateSarToJod as unknown as string),
    updatedAt: updated.updatedAt.toISOString(),
  });
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalDest] = await db.select({ count: count() }).from(destinationsTable);
  const [totalHotels] = await db.select({ count: count() }).from(hotelsTable);
  const [totalPkgs] = await db.select({ count: count() }).from(packagesTable);
  const [activePkgs] = await db.select({ count: count() }).from(packagesTable).where(eq(packagesTable.isActive, true));

  const destinations = await db.select().from(destinationsTable).orderBy(destinationsTable.sortOrder);
  const hotelCounts = await db.select({ destinationId: hotelsTable.destinationId }).from(hotelsTable);
  const pkgCounts = await db.select({ destinationId: packagesTable.destinationId }).from(packagesTable);

  const hotelCountMap: Record<number, number> = {};
  for (const h of hotelCounts) hotelCountMap[h.destinationId] = (hotelCountMap[h.destinationId] ?? 0) + 1;

  const pkgCountMap: Record<number, number> = {};
  for (const p of pkgCounts) pkgCountMap[p.destinationId] = (pkgCountMap[p.destinationId] ?? 0) + 1;

  res.json({
    totalDestinations: totalDest?.count ?? 0,
    totalHotels: totalHotels?.count ?? 0,
    totalPackages: totalPkgs?.count ?? 0,
    activePackages: activePkgs?.count ?? 0,
    destinations: destinations.map((d) => ({
      slug: d.slug,
      nameEn: d.nameEn,
      hotelCount: hotelCountMap[d.id] ?? 0,
      packageCount: pkgCountMap[d.id] ?? 0,
    })),
  });
});

router.get("/admin/destinations", requireAdmin, async (_req, res): Promise<void> => {
  const destinations = await db
    .select()
    .from(destinationsTable)
    .orderBy(destinationsTable.sortOrder);
  res.json(destinations.map((d) => ({ ...d, hotelCount: null, minPrice: null })));
});

router.post("/admin/destinations", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminDestinationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(destinationsTable).values(parsed.data).returning();
  res.status(201).json({ ...created, hotelCount: null, minPrice: null });
});

router.get("/admin/destinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = GetAdminDestinationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [dest] = await db.select().from(destinationsTable).where(eq(destinationsTable.id, params.data.id));
  if (!dest) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }
  res.json({ ...dest, hotelCount: null, minPrice: null });
});

router.put("/admin/destinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminDestinationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAdminDestinationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(destinationsTable)
    .set(parsed.data)
    .where(eq(destinationsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Destination not found" });
    return;
  }
  res.json({ ...updated, hotelCount: null, minPrice: null });
});

router.delete("/admin/destinations/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminDestinationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(destinationsTable).where(eq(destinationsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/admin/hotels", requireAdmin, async (req, res): Promise<void> => {
  const query = ListAdminHotelsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { destinationId } = query.data;
  const hotels = await db
    .select()
    .from(hotelsTable)
    .where(destinationId != null ? eq(hotelsTable.destinationId, destinationId) : undefined);
  res.json(hotels);
});

router.post("/admin/hotels", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminHotelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(hotelsTable).values(parsed.data).returning();
  res.status(201).json(created);
});

router.put("/admin/hotels/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminHotelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAdminHotelBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(hotelsTable)
    .set(parsed.data)
    .where(eq(hotelsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Hotel not found" });
    return;
  }
  res.json(updated);
});

router.delete("/admin/hotels/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminHotelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(hotelsTable).where(eq(hotelsTable.id, params.data.id));
  res.sendStatus(204);
});

router.get("/admin/packages", requireAdmin, async (req, res): Promise<void> => {
  const query = ListAdminPackagesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const { destinationId, hotelId } = query.data;
  const rows = await db
    .select({
      pkg: packagesTable,
      hotel: hotelsTable,
    })
    .from(packagesTable)
    .innerJoin(hotelsTable, eq(packagesTable.hotelId, hotelsTable.id))
    .where(
      destinationId != null
        ? eq(packagesTable.destinationId, destinationId)
        : hotelId != null
          ? eq(packagesTable.hotelId, hotelId)
          : undefined,
    );

  res.json(
    rows.map((r) => ({
      ...r.pkg,
      basePriceUsd: parseFloat(r.pkg.basePriceUsd as unknown as string),
      hotelNameAr: r.hotel.nameAr,
      hotelNameEn: r.hotel.nameEn,
      hotelStars: r.hotel.stars,
      hotelArea: r.hotel.area ?? null,
    })),
  );
});

router.post("/admin/packages", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAdminPackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(packagesTable).values({
    ...parsed.data,
    basePriceUsd: String(parsed.data.basePriceUsd),
  }).returning();
  res.status(201).json({
    ...created,
    basePriceUsd: parseFloat(created.basePriceUsd as unknown as string),
    hotelNameAr: null,
    hotelNameEn: null,
    hotelStars: null,
    hotelArea: null,
  });
});

router.put("/admin/packages/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAdminPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateAdminPackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(packagesTable)
    .set({
      ...parsed.data,
      basePriceUsd: String(parsed.data.basePriceUsd),
    })
    .where(eq(packagesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json({
    ...updated,
    basePriceUsd: parseFloat(updated.basePriceUsd as unknown as string),
    hotelNameAr: null,
    hotelNameEn: null,
    hotelStars: null,
    hotelArea: null,
  });
});

router.delete("/admin/packages/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAdminPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(packagesTable).where(eq(packagesTable.id, params.data.id));
  res.sendStatus(204);
});

router.patch("/admin/packages/:id/toggle", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleAdminPackageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = ToggleAdminPackageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [updated] = await db
    .update(packagesTable)
    .set({ isActive: parsed.data.isActive })
    .where(eq(packagesTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Package not found" });
    return;
  }
  res.json({
    ...updated,
    basePriceUsd: parseFloat(updated.basePriceUsd as unknown as string),
    hotelNameAr: null,
    hotelNameEn: null,
    hotelStars: null,
    hotelArea: null,
  });
});

export default router;
