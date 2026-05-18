import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { t, lang, toggleLang } = useLanguage();

  const links = [
    { href: "/", label: t.navHome },
    { href: "/destinations", label: t.navDestinations },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">ج</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-serif text-primary text-sm font-semibold">الجود</span>
              <span className="text-foreground/60 text-[10px] tracking-widest uppercase">Al Jood Travel</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors hover:text-primary font-serif ${
                  location === link.href ? "text-primary" : "text-foreground/70"
                }`}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Lang Toggle + Mobile */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center justify-center w-9 h-9 border border-white/20 hover:border-primary/60 text-foreground/70 hover:text-primary text-xs font-bold tracking-widest transition-colors"
              data-testid="button-lang-toggle"
              title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            >
              {lang === "ar" ? "EN" : "ع"}
            </button>

            <a
              href="https://wa.me/962777066001"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold tracking-wide transition-colors"
              data-testid="button-whatsapp-nav"
            >
              <Phone className="w-3 h-3" />
              <span>{t.navWhatsapp}</span>
            </a>
            <button
              className="md:hidden text-foreground/70 hover:text-foreground"
              onClick={() => setOpen(!open)}
              data-testid="button-mobile-menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground/70 hover:text-primary transition-colors font-serif"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="https://wa.me/962777066001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold text-center justify-center"
              >
                <Phone className="w-3 h-3" /> {t.navWhatsapp}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
