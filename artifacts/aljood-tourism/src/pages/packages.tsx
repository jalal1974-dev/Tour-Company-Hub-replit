import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown, MapPin, RotateCcw } from "lucide-react";
import { useListPackages, useListDestinations } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PackageCard } from "@/components/PackageCard";
import { useLanguage } from "@/contexts/LanguageContext";

const PAGE_SIZE = 24;

const NIGHTS_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10, 14];
const STARS_OPTIONS = [3, 4, 5];
const MEAL_OPTIONS = ["BB", "HB", "FB", "All", "S.All", "H.All", "UALL", "UAI", "RO"];
const SORT_OPTIONS = ["priceAsc", "priceDesc", "nightsAsc", "nightsDesc"] as const;
type SortKey = typeof SORT_OPTIONS[number];

interface Filters {
  destinationSlug: string;
  nights: string;
  stars: string;
  mealPlan: string;
  minPrice: string;
  maxPrice: string;
  search: string;
  sort: SortKey;
}

const defaultFilters: Filters = {
  destinationSlug: "",
  nights: "",
  stars: "",
  mealPlan: "",
  minPrice: "",
  maxPrice: "",
  search: "",
  sort: "priceAsc",
};

function hasActiveFilters(f: Filters) {
  return (
    f.destinationSlug !== "" ||
    f.nights !== "" ||
    f.stars !== "" ||
    f.mealPlan !== "" ||
    f.minPrice !== "" ||
    f.maxPrice !== "" ||
    f.search !== ""
  );
}

export default function PackagesPage() {
  const { t, isEn } = useLanguage();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const set = (key: keyof Filters, val: string) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const reset = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const apiParams = {
    ...(filters.destinationSlug ? { destinationSlug: filters.destinationSlug } : {}),
    ...(filters.nights ? { nights: Number(filters.nights) } : {}),
    ...(filters.stars ? { stars: Number(filters.stars) } : {}),
    ...(filters.mealPlan ? { mealPlan: filters.mealPlan } : {}),
    ...(filters.minPrice ? { minPrice: Number(filters.minPrice) } : {}),
    ...(filters.maxPrice ? { maxPrice: Number(filters.maxPrice) } : {}),
  };

  const { data: rawPackages, isLoading } = useListPackages(apiParams);
  const { data: destinations } = useListDestinations();

  const packages = useMemo(() => {
    let list = Array.isArray(rawPackages) ? rawPackages : [];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.hotelNameEn.toLowerCase().includes(q) ||
          p.hotelNameAr.includes(filters.search) ||
          (p.destinationNameEn ?? "").toLowerCase().includes(q) ||
          (p.destinationNameAr ?? "").includes(filters.search) ||
          (p.area ?? "").toLowerCase().includes(q),
      );
    }

    switch (filters.sort) {
      case "priceAsc":
        list = [...list].sort((a, b) => a.finalPriceJod - b.finalPriceJod);
        break;
      case "priceDesc":
        list = [...list].sort((a, b) => b.finalPriceJod - a.finalPriceJod);
        break;
      case "nightsAsc":
        list = [...list].sort((a, b) => a.nights - b.nights || a.finalPriceJod - b.finalPriceJod);
        break;
      case "nightsDesc":
        list = [...list].sort((a, b) => b.nights - a.nights || a.finalPriceJod - b.finalPriceJod);
        break;
    }

    return list;
  }, [rawPackages, filters.search, filters.sort]);

  const totalCount = packages.length;
  const visible = packages.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < totalCount;

  const destMap = useMemo(() => {
    const m: Record<string, { nameAr: string; nameEn: string; flag: string }> = {};
    if (Array.isArray(destinations)) {
      for (const d of destinations) {
        m[d.slug] = { nameAr: d.nameAr, nameEn: d.nameEn, flag: d.flag ?? "" };
      }
    }
    return m;
  }, [destinations]);

  const activeCount = [
    filters.destinationSlug,
    filters.nights,
    filters.stars,
    filters.mealPlan,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=60"
            alt="Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">{t.pkgSearchTag}</p>
            <h1 className="font-serif text-5xl text-foreground mb-2">{t.pkgSearchTitle}</h1>
            <p className="text-foreground/40 text-sm">{t.pkgSearchSubtitle}</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                <input
                  type="search"
                  placeholder={t.pkgSearchPlaceholder}
                  value={filters.search}
                  onChange={(e) => set("search", e.target.value)}
                  className="w-full bg-card border border-white/10 focus:border-primary text-foreground text-sm pr-10 pl-4 py-3 outline-none transition-colors"
                  data-testid="input-pkg-search"
                />
              </div>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-4 py-3 border transition-colors text-sm font-medium ${
                  showFilters || activeCount > 0
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-white/10 text-foreground/60 hover:text-foreground hover:border-white/30"
                }`}
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeCount > 0 && (
                  <span className="bg-primary-foreground text-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 bg-card border border-white/10 p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {/* Destination */}
                    <div className="col-span-2 sm:col-span-3">
                      <label className="text-xs text-foreground/50 block mb-1">{t.pkgFilterDest}</label>
                      <div className="relative">
                        <select
                          value={filters.destinationSlug}
                          onChange={(e) => set("destinationSlug", e.target.value)}
                          className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none appearance-none cursor-pointer"
                          data-testid="select-destination"
                        >
                          <option value="">{t.pkgFilterAllDests}</option>
                          {Array.isArray(destinations) &&
                            destinations.map((d) => (
                              <option key={d.slug} value={d.slug}>
                                {d.flag} {isEn ? d.nameEn : d.nameAr}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Nights */}
                    <div>
                      <label className="text-xs text-foreground/50 block mb-1">{t.pkgFilterNights}</label>
                      <div className="relative">
                        <select
                          value={filters.nights}
                          onChange={(e) => set("nights", e.target.value)}
                          className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none appearance-none cursor-pointer"
                          data-testid="select-nights"
                        >
                          <option value="">{t.pkgFilterAllNights}</option>
                          {NIGHTS_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n} {t.nightLabel}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Stars */}
                    <div>
                      <label className="text-xs text-foreground/50 block mb-1">{t.pkgFilterStars}</label>
                      <div className="relative">
                        <select
                          value={filters.stars}
                          onChange={(e) => set("stars", e.target.value)}
                          className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none appearance-none cursor-pointer"
                          data-testid="select-stars"
                        >
                          <option value="">{t.pkgFilterAllStars}</option>
                          {STARS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {"★".repeat(s)} {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Meal Plan */}
                    <div>
                      <label className="text-xs text-foreground/50 block mb-1">{t.pkgFilterMeal}</label>
                      <div className="relative">
                        <select
                          value={filters.mealPlan}
                          onChange={(e) => set("mealPlan", e.target.value)}
                          className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none appearance-none cursor-pointer"
                          data-testid="select-meal"
                        >
                          <option value="">{t.pkgFilterAllMeals}</option>
                          {MEAL_OPTIONS.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40 pointer-events-none" />
                      </div>
                    </div>

                    {/* Min Price */}
                    <div>
                      <label className="text-xs text-foreground/50 block mb-1">{t.pkgFilterMinPrice}</label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        placeholder="0"
                        value={filters.minPrice}
                        onChange={(e) => set("minPrice", e.target.value)}
                        className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                        data-testid="input-min-price"
                      />
                    </div>

                    {/* Max Price */}
                    <div>
                      <label className="text-xs text-foreground/50 block mb-1">{t.pkgFilterMaxPrice}</label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        placeholder="5000"
                        value={filters.maxPrice}
                        onChange={(e) => set("maxPrice", e.target.value)}
                        className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                        data-testid="input-max-price"
                      />
                    </div>

                    {/* Reset */}
                    {hasActiveFilters(filters) && (
                      <div className="col-span-2 sm:col-span-3 flex justify-end">
                        <button
                          onClick={reset}
                          className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-primary transition-colors"
                          data-testid="button-reset-filters"
                        >
                          <RotateCcw className="w-3 h-3" />
                          {t.pkgResetAll}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-4 w-24 bg-muted animate-pulse" />
            ) : (
              <p className="text-foreground/50 text-sm">
                <span className="text-foreground font-semibold">{totalCount}</span>{" "}
                {t.pkgResultCount}
              </p>
            )}
            {hasActiveFilters(filters) && (
              <button
                onClick={reset}
                className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
              >
                <X className="w-3 h-3" /> {t.pkgResetAll}
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => set("sort", e.target.value as SortKey)}
              className="bg-card border border-white/10 focus:border-primary text-foreground text-xs px-3 py-2 pr-7 outline-none appearance-none cursor-pointer"
              data-testid="select-sort"
            >
              <option value="priceAsc">{t.pkgSortPriceAsc}</option>
              <option value="priceDesc">{t.pkgSortPriceDesc}</option>
              <option value="nightsAsc">{t.pkgSortNightsAsc}</option>
              <option value="nightsDesc">{t.pkgSortNightsDesc}</option>
            </select>
            <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/40 pointer-events-none" />
          </div>
        </div>

        {/* Active Filter Pills */}
        {hasActiveFilters(filters) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {filters.destinationSlug && (
              <FilterPill
                label={`${destMap[filters.destinationSlug]?.flag ?? ""} ${isEn ? destMap[filters.destinationSlug]?.nameEn : destMap[filters.destinationSlug]?.nameAr}`}
                onRemove={() => set("destinationSlug", "")}
              />
            )}
            {filters.nights && <FilterPill label={`${filters.nights} ${t.nightLabel}`} onRemove={() => set("nights", "")} />}
            {filters.stars && <FilterPill label={`${"★".repeat(Number(filters.stars))}`} onRemove={() => set("stars", "")} />}
            {filters.mealPlan && <FilterPill label={filters.mealPlan} onRemove={() => set("mealPlan", "")} />}
            {filters.minPrice && <FilterPill label={`≥ ${filters.minPrice} ${t.jod}`} onRemove={() => set("minPrice", "")} />}
            {filters.maxPrice && <FilterPill label={`≤ ${filters.maxPrice} ${t.jod}`} onRemove={() => set("maxPrice", "")} />}
            {filters.search && <FilterPill label={`"${filters.search}"`} onRemove={() => set("search", "")} />}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-card border border-white/10 overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted animate-pulse w-3/4" />
                  <div className="h-3 bg-muted animate-pulse w-1/2" />
                  <div className="h-8 bg-muted animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && totalCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-foreground font-serif text-xl mb-2">{t.pkgNoResults}</p>
            <p className="text-foreground/40 text-sm mb-6">{t.pkgNoResultsSubtitle}</p>
            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t.pkgResetAll}
            </button>
          </motion.div>
        )}

        {/* Package Grid */}
        {!isLoading && totalCount > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map((pkg, i) => {
                const destInfo = pkg.destinationSlug ? destMap[pkg.destinationSlug] : null;
                return (
                  <div key={pkg.id} className="relative">
                    {/* Destination Badge */}
                    {destInfo && (
                      <Link
                        href={`/destinations/${pkg.destinationSlug}`}
                        className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-white/10 px-2 py-0.5 text-[10px] text-foreground/70 hover:text-primary hover:border-primary/40 transition-colors"
                        data-testid={`badge-dest-${pkg.id}`}
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        {destInfo.flag} {isEn ? destInfo.nameEn : destInfo.nameAr}
                      </Link>
                    )}
                    <PackageCard
                      pkg={pkg}
                      destinationNameAr={pkg.destinationNameAr ?? undefined}
                      destinationNameEn={pkg.destinationNameEn ?? undefined}
                      destinationSlug={pkg.destinationSlug ?? undefined}
                      index={i % PAGE_SIZE}
                    />
                  </div>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-10">
                <p className="text-foreground/30 text-xs mb-3">
                  {visible.length} / {totalCount}
                </p>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground px-8 py-2.5 text-sm font-semibold transition-all"
                  data-testid="button-load-more"
                >
                  {t.pkgLoadMore} ({Math.min(PAGE_SIZE, totalCount - visible.length)} {t.pkgResultCount})
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-xs px-2.5 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-primary/70 transition-colors ml-0.5">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
