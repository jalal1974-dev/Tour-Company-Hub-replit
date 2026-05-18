import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox, Phone, Mail, MapPin, Calendar, Users, Trash2, CheckCircle,
  Clock, XCircle, Search, MessageCircle, StickyNote, ChevronDown, ChevronUp,
  Star, Moon, Utensils, BedDouble, RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PackageSnapshot {
  hotelNameEn?: string;
  hotelNameAr?: string;
  stars?: number;
  nights?: number;
  mealPlan?: string;
  roomType?: string;
  finalPriceJod?: number;
  area?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  destinationNameEn?: string;
  destinationNameAr?: string;
}

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  destination: string | null;
  adults: number;
  children: number;
  travelDate: string | null;
  notes: string | null;
  status: string;
  packageId: number | null;
  packageSnapshot: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; labelEn: string; icon: React.ElementType; chip: string; dot: string }> = {
  new:       { label: "جديد",        labelEn: "New",       icon: Clock,        chip: "text-amber-400 border-amber-400/30 bg-amber-400/10",   dot: "bg-amber-400" },
  contacted: { label: "تم التواصل",  labelEn: "Contacted", icon: Phone,        chip: "text-blue-400 border-blue-400/30 bg-blue-400/10",     dot: "bg-blue-400"  },
  confirmed: { label: "مؤكد",        labelEn: "Confirmed", icon: CheckCircle,  chip: "text-green-400 border-green-400/30 bg-green-400/10",  dot: "bg-green-400" },
  closed:    { label: "مغلق",        labelEn: "Closed",    icon: XCircle,      chip: "text-foreground/40 border-white/10 bg-muted",         dot: "bg-foreground/20" },
};

const WHATSAPP_TEMPLATES = (name: string, pkg?: PackageSnapshot) => [
  {
    id: "greeting",
    label: "ترحيب / Greeting",
    text: `مرحباً ${name}،\nشكراً لتواصلك مع الجود للسياحة والسفر 🌟\nسيتواصل معكم أحد مستشارينا قريباً.`,
  },
  {
    id: "package",
    label: "تفاصيل الباقة / Package Details",
    text: pkg
      ? `مرحباً ${name}،\nبخصوص استفساركم عن باقة ${pkg.destinationNameAr ?? ""}:\n🏨 ${pkg.hotelNameAr ?? pkg.hotelNameEn}\n🌙 ${pkg.nights} ليالي\n🍽 ${pkg.mealPlan}\n🛏 ${pkg.roomType}\n💰 ${pkg.finalPriceJod} دينار للشخص\n\nهل تودون تأكيد الحجز؟`
      : `مرحباً ${name}،\nشكراً لاهتمامكم. يسعدنا مشاركتكم تفاصيل الباقة المطلوبة.`,
  },
  {
    id: "followup",
    label: "متابعة / Follow-up",
    text: `مرحباً ${name}،\nنتابع معكم بخصوص طلب السفر.\nهل لديكم أي استفسارات إضافية؟ نحن هنا للمساعدة 🌍`,
  },
];

async function fetchInquiries(status: string, search: string): Promise<Inquiry[]> {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (search.trim()) params.set("search", search.trim());
  const res = await fetch(`/api/admin/inquiries?${params}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function patchStatus(id: number, status: string): Promise<Inquiry> {
  const res = await fetch(`/api/admin/inquiries/${id}/status`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    credentials: "include", body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function patchNotes(id: number, adminNotes: string): Promise<Inquiry> {
  const res = await fetch(`/api/admin/inquiries/${id}/notes`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    credentials: "include", body: JSON.stringify({ adminNotes }),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function deleteInquiry(id: number): Promise<void> {
  const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error("Failed");
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  const d = Math.floor(h / 24);
  return `منذ ${d} يوم`;
}

interface NotesEditorProps {
  inquiry: Inquiry;
  onSave: (notes: string) => void;
  saving: boolean;
}

function NotesEditor({ inquiry, onSave, saving }: NotesEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(inquiry.adminNotes ?? "");
  const ref = useRef<HTMLTextAreaElement>(null);

  const start = () => {
    setDraft(inquiry.adminNotes ?? "");
    setEditing(true);
    setTimeout(() => ref.current?.focus(), 50);
  };
  const save = () => { onSave(draft); setEditing(false); };
  const cancel = () => setEditing(false);

  if (!editing) {
    return (
      <button onClick={start} className="flex items-center gap-1.5 text-xs text-foreground/35 hover:text-primary transition-colors mt-2 max-w-full">
        <StickyNote className="w-3 h-3 flex-shrink-0" />
        {inquiry.adminNotes
          ? <span className="text-foreground/55 truncate">{inquiry.adminNotes}</span>
          : <span className="italic">+ ملاحظة داخلية...</span>}
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-1.5">
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-xs px-2 py-1.5 outline-none resize-none"
        placeholder="ملاحظات داخلية (لا تظهر للعميل)..."
      />
      <div className="flex gap-2">
        <button onClick={save} disabled={saving}
          className="text-xs bg-primary text-primary-foreground px-3 py-1 hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {saving ? "..." : "حفظ"}
        </button>
        <button onClick={cancel} className="text-xs text-foreground/40 hover:text-foreground px-2 py-1 transition-colors">
          إلغاء
        </button>
      </div>
    </div>
  );
}

interface WhatsAppMenuProps {
  inquiry: Inquiry;
  pkg?: PackageSnapshot;
}

function WhatsAppMenu({ inquiry, pkg }: WhatsAppMenuProps) {
  const [open, setOpen] = useState(false);
  const templates = WHATSAPP_TEMPLATES(inquiry.name, pkg);
  const phoneClean = inquiry.phone.replace(/\D/g, "");

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 w-full justify-center bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        واتساب
        {open ? <ChevronUp className="w-3 h-3 mr-auto" /> : <ChevronDown className="w-3 h-3 mr-auto" />}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 right-0 top-full mt-1 bg-card border border-white/15 shadow-2xl z-20 overflow-hidden"
            >
              {templates.map((tpl) => (
                <a
                  key={tpl.id}
                  href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(tpl.text)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 text-xs text-foreground/65 hover:bg-muted hover:text-foreground transition-colors border-b border-white/5 last:border-0"
                >
                  {tpl.label}
                </a>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PackageChip({ snapshot }: { snapshot: PackageSnapshot }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-foreground/50 bg-primary/5 px-2 py-1.5 border border-primary/10 mt-1.5">
      <BedDouble className="w-3 h-3 text-primary/50" />
      <span className="text-foreground/70 font-medium">{snapshot.hotelNameEn ?? snapshot.hotelNameAr}</span>
      {snapshot.stars != null && (
        <span className="flex">{Array.from({ length: snapshot.stars }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-primary text-primary" />)}</span>
      )}
      {snapshot.nights != null && <span className="flex items-center gap-0.5"><Moon className="w-2.5 h-2.5" />{snapshot.nights}ن</span>}
      {snapshot.mealPlan && <span className="flex items-center gap-0.5"><Utensils className="w-2.5 h-2.5" />{snapshot.mealPlan}</span>}
      {snapshot.roomType && <span className="flex items-center gap-0.5"><BedDouble className="w-2.5 h-2.5" />{snapshot.roomType}</span>}
      {snapshot.finalPriceJod != null && (
        <span className="text-primary font-semibold mr-auto">{snapshot.finalPriceJod} د.أ</span>
      )}
    </div>
  );
}

export default function AdminInquiriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearchChange = (v: string) => {
    setSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(v), 350);
  };

  const { data: inquiries = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "inquiries", statusFilter, debouncedSearch],
    queryFn: () => fetchInquiries(statusFilter, debouncedSearch),
  });

  const { data: allInquiries = [] } = useQuery({
    queryKey: ["admin", "inquiries", "all", ""],
    queryFn: () => fetchInquiries("all", ""),
    refetchInterval: 60_000,
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => patchStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }); toast({ title: "تم تحديث الحالة" }); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const notesMut = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) => patchNotes(id, notes),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }); toast({ title: "تم حفظ الملاحظة" }); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }); toast({ title: "تم الحذف" }); },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const newCount = allInquiries.filter(i => i.status === "new").length;

  return (
    <AdminGuard>
      <AdminLayout title="متابعة الاستفسارات" titleEn="Inquiry Tracker">
        <div className="space-y-5">

          {/* ── Stats Bar ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = allInquiries.filter(i => i.status === key).length;
              const active = statusFilter === key;
              return (
                <motion.button key={key}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => setStatusFilter(active ? "all" : key)}
                  className={`border p-4 text-start transition-all ${active ? "border-primary/50 bg-primary/5" : "border-white/10 bg-card hover:border-white/20"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <span className="text-2xl font-bold text-foreground">{count}</span>
                    {key === "new" && count > 0 && (
                      <span className="text-[10px] bg-amber-400 text-black px-1 rounded font-bold animate-pulse ml-1">جديد!</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/50">{cfg.label} <span className="text-foreground/25">/ {cfg.labelEn}</span></p>
                </motion.button>
              );
            })}
          </div>

          {/* ── Search + Tabs ── */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="بحث بالاسم، الهاتف، الوجهة..."
                className="w-full bg-card border border-white/10 focus:border-primary text-foreground text-sm pr-9 pl-3 py-2 outline-none transition-colors"
              />
              {search && (
                <button onClick={() => onSearchChange("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground text-base leading-none">×</button>
              )}
            </div>

            <div className="flex items-center gap-0.5 bg-card border border-white/10 p-1">
              {([["all", "الكل"]] as [string, string][]).concat(Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label] as [string, string])).map(([key, label]) => (
                <button key={key} onClick={() => setStatusFilter(key)}
                  className={`text-xs px-2.5 py-1 transition-colors ${statusFilter === key ? "bg-primary text-primary-foreground" : "text-foreground/50 hover:text-foreground"}`}>
                  {label}
                </button>
              ))}
            </div>

            <button onClick={() => refetch()} disabled={isFetching}
              className="text-foreground/40 hover:text-foreground p-2 transition-colors disabled:opacity-40" title="تحديث">
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>

            <span className="text-xs text-foreground/30">{inquiries.length} طلب</span>
          </div>

          {/* ── List ── */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted/50 animate-pulse" />)}
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-24 border border-white/10 bg-card">
              <Inbox className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
              <p className="text-foreground/40 text-sm">
                {debouncedSearch ? "لا توجد نتائج للبحث" : statusFilter === "all" ? "لا توجد استفسارات حتى الآن" : `لا استفسارات بحالة "${STATUS_CONFIG[statusFilter]?.label}"`}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {inquiries.map((inquiry, i) => {
                  const cfg = STATUS_CONFIG[inquiry.status] ?? STATUS_CONFIG.new;
                  const StatusIcon = cfg.icon;
                  const pkg = inquiry.packageSnapshot
                    ? (() => { try { return JSON.parse(inquiry.packageSnapshot) as PackageSnapshot; } catch { return undefined; } })()
                    : undefined;

                  return (
                    <motion.div key={inquiry.id} layout
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: i * 0.03 }}
                      className={`bg-card border transition-colors ${inquiry.status === "new" ? "border-amber-400/20 shadow-[0_0_0_1px_rgba(251,191,36,0.1)]" : "border-white/10"}`}
                    >
                      <div className="p-4 md:p-5 flex flex-wrap gap-4 items-start">

                        {/* Left: info */}
                        <div className="flex-1 min-w-0 space-y-1.5">

                          {/* Header row */}
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-serif text-foreground text-base">{inquiry.name}</h3>
                            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 border ${cfg.chip}`}>
                              <StatusIcon className="w-2.5 h-2.5" />{cfg.label}
                            </span>
                            {inquiry.destination && (
                              <span className="flex items-center gap-1 text-[10px] text-primary/70 border border-primary/20 px-2 py-0.5">
                                <MapPin className="w-2.5 h-2.5" />{inquiry.destination}
                              </span>
                            )}
                            <span className="text-[10px] text-foreground/25 mr-auto">{timeAgo(inquiry.createdAt)}</span>
                          </div>

                          {/* Contact row */}
                          <div className="flex flex-wrap gap-4 text-xs text-foreground/50">
                            <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                              <Phone className="w-3 h-3" /><span dir="ltr">{inquiry.phone}</span>
                            </a>
                            {inquiry.email && (
                              <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <Mail className="w-3 h-3" />{inquiry.email}
                              </a>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              {inquiry.adults} بالغ{inquiry.children > 0 ? ` + ${inquiry.children} طفل` : ""}
                            </span>
                            {inquiry.travelDate && (
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" />{inquiry.travelDate}
                              </span>
                            )}
                          </div>

                          {/* Package snapshot */}
                          {pkg && <PackageChip snapshot={pkg} />}

                          {/* Customer notes */}
                          {inquiry.notes && (
                            <p className="text-xs text-foreground/45 bg-muted/30 px-3 py-1.5 border-r-2 border-primary/25 italic mt-1">
                              "{inquiry.notes}"
                            </p>
                          )}

                          {/* Admin notes */}
                          <NotesEditor
                            inquiry={inquiry}
                            onSave={(notes) => notesMut.mutate({ id: inquiry.id, notes })}
                            saving={notesMut.isPending}
                          />
                        </div>

                        {/* Right: actions */}
                        <div className="flex flex-col gap-2 w-36 flex-shrink-0">
                          <WhatsAppMenu inquiry={inquiry} pkg={pkg} />

                          <select
                            value={inquiry.status}
                            onChange={(e) => statusMut.mutate({ id: inquiry.id, status: e.target.value })}
                            disabled={statusMut.isPending}
                            className="bg-muted border border-white/10 text-foreground text-xs px-2 py-1.5 focus:outline-none focus:border-primary w-full"
                          >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>

                          {inquiry.status !== "confirmed" && (
                            <button
                              onClick={() => statusMut.mutate({ id: inquiry.id, status: "confirmed" })}
                              disabled={statusMut.isPending}
                              className="flex items-center justify-center gap-1 text-[10px] border border-green-400/25 text-green-400/60 hover:bg-green-400/10 hover:text-green-400 px-2 py-1.5 transition-colors disabled:opacity-40"
                            >
                              <CheckCircle className="w-3 h-3" /> تم التأكيد
                            </button>
                          )}

                          <button
                            onClick={() => { if (confirm("حذف هذا الاستفسار نهائياً؟")) deleteMut.mutate(inquiry.id); }}
                            disabled={deleteMut.isPending}
                            className="flex items-center justify-center gap-1 text-[10px] border border-white/10 hover:border-red-400/30 text-foreground/30 hover:text-red-400 px-2 py-1.5 transition-colors disabled:opacity-40"
                          >
                            <Trash2 className="w-3 h-3" /> حذف
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>

        {/* Floating "new inquiries" badge */}
        {newCount > 0 && statusFilter !== "new" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => setStatusFilter("new")}
            className="fixed bottom-6 left-6 bg-amber-400 text-black text-xs font-bold px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-amber-300 transition-colors z-50"
          >
            <span className="w-2 h-2 bg-black rounded-full animate-pulse" />
            {newCount} طلب جديد
          </motion.button>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
