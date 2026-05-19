import { pgTable, text, serial, boolean, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const destinationsTable = pgTable("destinations", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  country: text("country").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  heroImage: text("hero_image").notNull(),
  flag: text("flag"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ticketPriceJod: numeric("ticket_price_jod", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDestinationSchema = createInsertSchema(destinationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinationsTable.$inferSelect;
