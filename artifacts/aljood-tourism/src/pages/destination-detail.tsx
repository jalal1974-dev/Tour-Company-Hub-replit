import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Moon, Utensils, BedDouble, Filter } from "lucide-react";
import {
  useGetDestination,
  useGetDestinationSummary,
  useListPackages,
  getGetDestinationQueryKey,
  getGetDestinationSummaryQueryKey,
  getListPackagesQueryKey,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PackageCard } from "@/components/PackageCard";

export default function DestinationDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<{
    nights?: number;
    stars?: number;
    area?: string;
    mealPlan?: string;
    roomType?: string;
  }>({});

  const { data: destination, isLoading: destLoading } = useGetDestination(slug, {
    query: { queryKey: getGetDestinationQueryKey(slug) },
  });
  const { data: summary } = useGetDestinationSummary(slug, {
    query: { queryKey: getGetDestinationSummaryQueryKey(slug) },
  });
  const { data: packages, isLoading: pkgsLoading } = useListPackages(
    { destinationSlug: slug, ...filters },
    {
      query: { queryKey: getListPackagesQueryKey({ destinationSlug: slug, ...filters }) },
    },
  );

  if (destLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-foreground/60">الوجهة غير موجودة / Destination not found</p>
        <Link href="/destinations" className="text-primary text-sm hover:underline">
          العودة إلى الوجهات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.nameEn}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background" />
        <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              href="/destinations"
              className="flex items-center gap-2 text-foreground/50 hover:text-primary text-xs mb-4 transition-colors w-fit"
              data-testid="link-back-destinations"
            >
              <ArrowLeft className="w-3 h-3" /> جميع الوجهات / All Destinations
            </Link>
            <div className="flex items-end gap-4">
              <div>
                <h1 className="font-serif text-5xl text-foreground mb-1">
                  {destination.nameAr}
                  <span className="text-2xl text-foreground/40 mr-2 ml-2">{destination.flag}</span>
                </h1>
                <p className="text-foreground/50 text-lg">{destination.nameEn}, {destination.country}</p>
              </div>
              {summary && (
                <div className="mr-auto flex gap-6 text-right">
                  <div>
                    <div className="text-primary font-bold text-xl">{summary.totalPackages}</div>
                    <div className="text-foreground/40 text-xs">باقة متاحة</div>
                  </div>
                  <div>
                    <div className="text-primary font-bold text-xl">{summary.totalHotels}</div>
                    <div className="text-foreground/40 text-xs">فندق</div>
                  </div>
                  {summary.minPrice && (
                    <div>
                      <div className="text-primary font-bold text-xl">من {summary.minPrice}</div>
                      <div className="text-foreground/40 text-xs">د.أ للشخص</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Description */}
        {(destination.descriptionAr || destination.descriptionEn) && (
          <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {destination.descriptionAr && (
              <p className="text-foreground/60 leading-relaxed text-sm" dir="rtl">
                {destination.descriptionAr}
              </p>
            )}
            {destination.descriptionEn && (
              <p className="text-foreground/60 leading-relaxed text-sm" dir="ltr">
                {destination.descriptionEn}
              </p>
            )}
          </div>
        )}

        {/* Filters */}
        {summary && (
          <div className="mb-8 border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/70 font-medium">تصفية الباقات / Filter Packages</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Nights */}
              <select
                value={filters.nights ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, nights: e.target.value ? Number(e.target.value) : undefined }))}
                className="bg-muted border border-white/10 text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                data-testid="select-filter-nights"
              >
                <option value="">كل الليالي</option>
                {summary.availableNights.map((n) => (
                  <option key={n} value={n}>{n} ليالي</option>
                ))}
              </select>

              {/* Stars */}
              <select
                value={filters.stars ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, stars: e.target.value ? Number(e.target.value) : undefined }))}
                className="bg-muted border border-white/10 text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                data-testid="select-filter-stars"
              >
                <option value="">كل النجوم</option>
                {summary.availableStars.map((s) => (
                  <option key={s} value={s}>{s} نجوم</option>
                ))}
              </select>

              {/* Area */}
              {summary.availableAreas.length > 0 && (
                <select
                  value={filters.area ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value || undefined }))}
                  className="bg-muted border border-white/10 text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                  data-testid="select-filter-area"
                >
                  <option value="">كل المناطق</option>
                  {summary.availableAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              )}

              {/* Meal Plan */}
              <select
                value={filters.mealPlan ?? ""}
                onChange={(e) => setFilters((f) => ({ ...f, mealPlan: e.target.value || undefined }))}
                className="bg-muted border border-white/10 text-foreground text-xs px-3 py-2 focus:outline-none focus:border-primary"
                data-testid="select-filter-meal"
              >
                <option value="">كل الأنظمة</option>
                {summary.availableMealPlans.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Reset */}
              <button
                onClick={() => setFilters({})}
                className="border border-white/10 hover:border-primary/40 text-foreground/50 hover:text-primary text-xs px-3 py-2 transition-colors"
                data-testid="button-reset-filters"
              >
                إزالة الفلاتر / Reset
              </button>
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-6">
            الباقات المتاحة
            {packages && <span className="text-foreground/30 text-base mr-2">({packages.length} باقة)</span>}
          </h2>

          {pkgsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-muted animate-pulse" />
              ))}
            </div>
          ) : !packages?.length ? (
            <div className="text-center py-20 border border-white/10">
              <BedDouble className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/40 text-sm">لا توجد باقات بهذه المعايير</p>
              <p className="text-foreground/30 text-xs mt-1">No packages match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg, i) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  destinationNameAr={destination.nameAr}
                  destinationNameEn={destination.nameEn}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
