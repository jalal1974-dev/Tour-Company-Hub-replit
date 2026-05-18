import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const inquiriesTable = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  destination: text("destination"),
  adults: integer("adults").notNull().default(2),
  children: integer("children").notNull().default(0),
  travelDate: text("travel_date"),
  notes: text("notes"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiriesTable).omit({ id: true, createdAt: true, status: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiriesTable.$inferSelect;
