import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pricingSettingsTable = pgTable("pricing_settings", {
  id: serial("id").primaryKey(),
  ticketPriceJod: numeric("ticket_price_jod", { precision: 10, scale: 2 }).notNull().default("150"),
  transportJod: numeric("transport_jod", { precision: 10, scale: 2 }).notNull().default("30"),
  fixedProfitJod: numeric("fixed_profit_jod", { precision: 10, scale: 2 }).notNull().default("50"),
  profitPct: numeric("profit_pct", { precision: 5, scale: 2 }).notNull().default("15"),
  rateUsdToJod: numeric("rate_usd_to_jod", { precision: 8, scale: 4 }).notNull().default("0.7085"),
  rateEurToJod: numeric("rate_eur_to_jod", { precision: 8, scale: 4 }).notNull().default("0.7750"),
  rateSarToJod: numeric("rate_sar_to_jod", { precision: 8, scale: 4 }).notNull().default("0.1889"),
  whatsappNumber: text("whatsapp_number").notNull().default("962777066005"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPricingSettingsSchema = createInsertSchema(pricingSettingsTable).omit({ id: true, updatedAt: true });
export type InsertPricingSettings = z.infer<typeof insertPricingSettingsSchema>;
export type PricingSettings = typeof pricingSettingsTable.$inferSelect;
