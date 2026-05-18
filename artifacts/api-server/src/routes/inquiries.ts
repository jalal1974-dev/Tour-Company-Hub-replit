import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, inquiriesTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.post("/inquiries", async (req, res): Promise<void> => {
  const { name, phone, email, destination, adults, children, travelDate, notes } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    destination?: string;
    adults?: number;
    children?: number;
    travelDate?: string;
    notes?: string;
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
    })
    .returning();

  res.status(201).json(created);
});

router.get("/admin/inquiries", requireAdmin, async (_req, res): Promise<void> => {
  const inquiries = await db
    .select()
    .from(inquiriesTable)
    .orderBy(desc(inquiriesTable.createdAt));
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

router.delete("/admin/inquiries/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
  res.sendStatus(204);
});

export default router;
