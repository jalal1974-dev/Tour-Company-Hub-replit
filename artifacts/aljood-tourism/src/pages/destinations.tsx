import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { useListDestinations } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function DestinationsPage() {
  const { data: destinations, isLoading } = useListDestinations();
  const [search, setSearch] = useState("");

  const destList = Array.isArray(destinations) ? destinations : [];
  const filtered = destList.filter(
    (d) =>
      d.nameAr.includes(search) ||
      d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600"
            alt="World"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">استكشف معنا</p>
            <h1 className="font-serif text-5xl text-foreground mb-3">جميع الوجهات</h1>
            <p className="text-foreground/40 text-sm mb-8">All Destinations</p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
              <input
                type="search"
                placeholder="ابحث عن وجهة... Search destinations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-card border border-white/10 focus:border-primary text-foreground text-sm pr-10 pl-4 py-3 outline-none transition-colors"
                data-testid="input-search-destinations"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse" />
              ))}
            </div>
          ) : !filtered?.length ? (
            <div className="text-center py-20 text-foreground/40">
              لا توجد نتائج لبحثك / No results found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((dest, i) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link href={`/destinations/${dest.slug}`} data-testid={`card-destination-${dest.slug}`}>
                    <div className="group cursor-pointer border border-white/10 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                      <div className="relative h-52">
                        <img
                          src={dest.heroImage}
                          alt={dest.nameEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                        {/* Flag */}
                        <div className="absolute top-3 right-3 text-xl">{dest.flag}</div>
                        {dest.minPrice && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-0.5 font-semibold">
                            من {dest.minPrice} د.أ
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-card">
                        <h3 className="font-serif text-foreground text-lg mb-0.5">{dest.nameAr}</h3>
                        <p className="text-foreground/40 text-xs mb-2">{dest.nameEn}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-foreground/40 text-xs">
                            <MapPin className="w-3 h-3" />
                            {dest.country}
                          </div>
                          {(dest.hotelCount ?? 0) > 0 && (
                            <span className="text-primary/70 text-xs">
                              {dest.hotelCount} فندق
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
