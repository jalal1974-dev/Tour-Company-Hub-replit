import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star, MapPin, Users, Award } from "lucide-react";
import { useListFeaturedDestinations, useListPackages } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PackageCard } from "@/components/PackageCard";
import { useLanguage } from "@/contexts/LanguageContext";

function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920"
          alt="Istanbul"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-primary text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            {t.heroTagline}
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground leading-tight mb-4">
            {t.heroTitle1}
            <span className="block text-primary italic">{t.heroTitle2}</span>
          </h1>
          <p className="text-foreground/60 text-lg mb-2 font-light">
            {t.heroSubEn}
          </p>
          <p className="text-foreground/50 text-sm max-w-lg mx-auto mb-10 leading-relaxed">
            {t.heroDesc}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/destinations"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-sm font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
            data-testid="button-explore-destinations"
          >
            {t.heroCta}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/962777066005"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-primary/40 hover:border-primary text-primary px-8 py-3 text-sm font-semibold tracking-wide transition-colors text-center"
            data-testid="button-hero-whatsapp"
          >
            {t.heroContact}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent mx-auto"
        />
      </div>
    </section>
  );
}

function StatsBar() {
  const { t } = useLanguage();
  const stats = [
    { icon: MapPin, value: "13+", label: t.statDestinations },
    { icon: Users, value: "5000+", label: t.statClients },
    { icon: Star, value: "4.9", label: t.statRating },
    { icon: Award, value: "10+", label: t.statYears },
  ];

  return (
    <section className="py-12 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="font-serif text-3xl text-primary font-semibold">{value}</div>
              <div className="text-foreground/50 text-xs mt-1">{label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedDestinations() {
  const { t, isEn } = useLanguage();
  const { data: destinations, isLoading } = useListFeaturedDestinations();

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">{t.featuredTag}</p>
          <h2 className="font-serif text-4xl text-foreground mb-3">{t.featuredTitle}</h2>
          <p className="text-foreground/40 text-sm">{t.featuredSubtitle}</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(destinations) ? destinations : []).slice(0, 6).map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/destinations/${dest.slug}`} data-testid={`card-dest-${dest.slug}`}>
                  <div className="group relative overflow-hidden cursor-pointer">
                    <div className="relative h-64">
                      <img
                        src={dest.heroImage}
                        alt={dest.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="font-serif text-foreground text-xl mb-0.5">
                            {isEn ? dest.nameEn : dest.nameAr}
                          </h3>
                          <p className="text-foreground/50 text-xs">{dest.nameEn}, {dest.country}</p>
                        </div>
                        <div className="text-right">
                          {dest.minPrice && (
                            <div className="text-primary text-sm font-semibold">
                              {t.destFromPrice} {dest.minPrice} {t.destPriceSuffix}
                            </div>
                          )}
                          <div className="text-foreground/40 text-xs">{dest.hotelCount} {t.destHotelUnit}</div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/30 transition-all duration-300" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/destinations"
            className="border border-primary/40 hover:border-primary text-primary px-8 py-3 text-sm font-medium tracking-wide transition-colors inline-block"
            data-testid="button-all-destinations"
          >
            {t.allDestinationsBtn}
          </Link>
        </div>
      </div>
    </section>
  );
}

function PopularPackages() {
  const { t } = useLanguage();
  const { data: packages, isLoading } = useListPackages({ destinationSlug: "istanbul" });

  return (
    <section className="py-20 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">{t.popularTag}</p>
          <h2 className="font-serif text-4xl text-foreground mb-3">{t.popularTitle}</h2>
          <p className="text-foreground/40 text-sm">{t.popularSubtitle}</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(packages) ? packages : []).slice(0, 3).map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                destinationNameAr="إسطنبول"
                destinationNameEn="Istanbul"
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const { t } = useLanguage();
  const reasons = [
    { title: t.reason1Title, titleEn: t.reason1TitleEn, desc: t.reason1Desc },
    { title: t.reason2Title, titleEn: t.reason2TitleEn, desc: t.reason2Desc },
    { title: t.reason3Title, titleEn: t.reason3TitleEn, desc: t.reason3Desc },
    { title: t.reason4Title, titleEn: t.reason4TitleEn, desc: t.reason4Desc },
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">{t.whyTag}</p>
          <h2 className="font-serif text-4xl text-foreground mb-3">{t.whyTitle}</h2>
          <p className="text-foreground/40 text-sm">{t.whySubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map(({ title, titleEn, desc }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border border-white/10 p-6 hover:border-primary/30 transition-colors"
              data-testid={`card-reason-${i}`}
            >
              <div className="w-8 h-0.5 bg-primary mb-4" />
              <h3 className="font-serif text-foreground text-lg mb-1">{title}</h3>
              <p className="text-primary/60 text-xs mb-3">{titleEn}</p>
              <p className="text-foreground/50 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturedDestinations />
      <PopularPackages />
      <WhyChooseUs />
      <Footer />
    </div>
  );
}
