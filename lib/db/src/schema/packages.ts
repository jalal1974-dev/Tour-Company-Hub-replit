import { pgTable, text, serial, boolean, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { destinationsTable } from "./destinations";
import { hotelsTable } from "./hotels";

export const packagesTable = pgTable("packages", {
  id: serial("id").primaryKey(),
  hotelId: integer("hotel_id").notNull().references(() => hotelsTable.id, { onDelete: "cascade" }),
  destinationId: integer("destination_id").notNull().references(() => destinationsTable.id, { onDelete: "cascade" }),
  nights: integer("nights").notNull(),
  mealPlan: text("meal_plan").notNull(),
  roomType: text("room_type").notNull(),
  basePriceUsd: numeric("base_price_usd", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  dateFrom: text("date_from"),
  dateTo: text("date_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPackageSchema = createInsertSchema(packagesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packagesTable.$inferSelect;
