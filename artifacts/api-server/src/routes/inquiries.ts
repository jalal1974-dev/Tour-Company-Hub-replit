import { Router, type IRouter } from "express";
import { desc, eq, ilike, or } from "drizzle-orm";
import { db, inquiriesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.post("/inquiries", async (req, res): Promise<void> => {
  const { name, phone, email, destination, adults, children, travelDate, notes, packageId, packageSnapshot } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    destination?: string;
    adults?: number;
    children?: number;
    travelDate?: string;
    notes?: string;
    packageId?: number;
    packageSnapshot?: Record<string, unknown>;
  };

  if (!name?.trim() || !phone?.trim()) {
    res.status(400).json({ error: "Name and phone are required" });
    return;
  }

  const [created] = await db
    .insert(inquiriesTable)
    .values({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim() || null,
      destination: destination?.trim() || null,
      adults: adults ?? 2,
      children: children ?? 0,
      travelDate: travelDate?.trim() || null,
      notes: notes?.trim() || null,
      packageId: packageId ?? null,
      packageSnapshot: packageSnapshot ? JSON.stringify(packageSnapshot) : null,
    })
    .returning();

  res.status(201).json(created);
});

router.get("/admin/inquiries", requireAdmin, async (req, res): Promise<void> => {
  const { status, search } = req.query as { status?: string; search?: string };

  let query = db.select().from(inquiriesTable).$dynamic();

  if (status && status !== "all") {
    query = query.where(eq(inquiriesTable.status, status));
  }

  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    query = query.where(
      or(
        ilike(inquiriesTable.name, term),
        ilike(inquiriesTable.phone, term),
        ilike(inquiriesTable.destination, term),
        ilike(inquiriesTable.email, term),
      ),
    );
  }

  const inquiries = await query.orderBy(desc(inquiriesTable.createdAt));
  res.json(inquiries);
});

router.patch("/admin/inquiries/:id/status", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };
  if (!status) {
    res.status(400).json({ error: "status is required" });
    return;
  }
  const [updated] = await db
    .update(inquiriesTable)
    .set({ status })
    .where(eq(inquiriesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }
  res.json(updated);
});

router.patch("/admin/inquiries/:id/notes", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { adminNotes } = req.body as { adminNotes?: string };
  const [updated] = await db
    .update(inquiriesTable)
    .set({ adminNotes: adminNotes?.trim() || null })
    .where(eq(inquiriesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Inquiry not found" });
    return;
  }
  res.json(updated);
});

router.delete("/admin/inquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
  res.sendStatus(204);
});

export default router;
