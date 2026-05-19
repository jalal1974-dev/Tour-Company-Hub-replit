export interface PricingConfig {
  ticketPriceJod: number;
  transportJod: number;
  fixedProfitJod: number;
  profitPct: number;
  rateUsdToJod: number;
  rateEurToJod: number;
  rateSarToJod: number;
}

export function computeFinalPrice(
  basePriceUsd: number,
  nights: number,
  currency: string,
  config: PricingConfig,
  destTicketPriceJod?: number | null,
): { jod: number; usd: number } {
  let rate: number;
  switch (currency.toUpperCase()) {
    case "EUR":
      rate = config.rateEurToJod;
      break;
    case "SAR":
      rate = config.rateSarToJod;
      break;
    case "USD":
    default:
      rate = config.rateUsdToJod;
      break;
  }

  const ticket = destTicketPriceJod != null ? destTicketPriceJod : config.ticketPriceJod;
  const hotelCostJod = basePriceUsd * nights * rate;
  const subtotal = hotelCostJod + ticket + config.transportJod + config.fixedProfitJod;
  const finalJod = subtotal * (1 + config.profitPct / 100);
  const finalUsd = finalJod / config.rateUsdToJod;

  return {
    jod: Math.ceil(finalJod),
    usd: Math.ceil(finalUsd),
  };
}
