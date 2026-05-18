import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, MapPin, Building2, Package, Settings, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", labelEn: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/destinations", label: "الوجهات", labelEn: "Destinations", icon: MapPin },
  { href: "/admin/hotels", label: "الفنادق", labelEn: "Hotels", icon: Building2 },
  { href: "/admin/packages", label: "الباقات", labelEn: "Packages", icon: Package },
  { href: "/admin/settings", label: "الإعدادات", labelEn: "Settings", icon: Settings },
];

function NavLink({ href, label, labelEn, icon: Icon, exact }: typeof navItems[0]) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-primary/10 text-primary border-r-2 border-primary"
          : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
      }`}
      data-testid={`nav-admin-${labelEn.toLowerCase().replace(/ /g, '-')}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">{label}</span>
      <span className="text-xs text-foreground/30 mr-auto">{labelEn}</span>
    </Link>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  titleEn?: string;
}

export function AdminLayout({ children, title, titleEn }: AdminLayoutProps) {
  const { data: me } = useGetAdminMe({ query: { queryKey: getGetAdminMeQueryKey() } });
  const logout = useAdminLogout();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        window.location.href = "/admin/login";
      },
    });
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">ج</span>
          </div>
          <div>
            <div className="text-primary font-serif text-xs font-semibold">الجود</div>
            <div className="text-foreground/30 text-[9px] tracking-wider">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        {me && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs text-foreground/60">{me.username[0].toUpperCase()}</span>
            </div>
            <div>
              <div className="text-xs text-foreground font-medium">{me.username}</div>
              <div className="text-[10px] text-foreground/40">{me.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-foreground/50 hover:text-destructive text-xs transition-colors w-full"
          data-testid="button-logout"
        >
          <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج / Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-card border-r border-white/10 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-card border-r border-white/10 z-50 lg:hidden"
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-white/10 bg-card flex items-center px-4 gap-3">
          <button
            className="lg:hidden text-foreground/50 hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <h1 className="font-serif text-foreground text-sm font-medium flex-1">
            {title}
            {titleEn && <span className="text-foreground/30 text-xs mr-2">/ {titleEn}</span>}
          </h1>
          <Link href="/" className="text-foreground/30 hover:text-primary text-xs transition-colors">
            الموقع ← Site
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
