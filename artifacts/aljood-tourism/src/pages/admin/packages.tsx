import { useState } from "react";
import { useSearch } from "wouter";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save, Moon, Utensils, BedDouble } from "lucide-react";
import {
  useListAdminDestinations,
  useListAdminHotels,
  useListAdminPackages,
  useCreateAdminPackage,
  useUpdateAdminPackage,
  useDeleteAdminPackage,
  getListAdminPackagesQueryKey,
  getListAdminHotelsQueryKey,
  getListAdminDestinationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";

interface PkgForm {
  hotelId: number;
  destinationId: number;
  mealPlan: string;
  roomType: string;
  currency: string;
  nights: number;
  basePriceUsd: number;
  dateFrom: string;
  dateTo: string;
  isActive: boolean;
}

const MEAL_PLANS = ["BB", "HB", "FB", "AI", "RO"];
const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family", "Single", "Twin"];

const empty: PkgForm = {
  hotelId: 0, destinationId: 0, mealPlan: "BB", roomType: "Standard", currency: "USD",
  nights: 7, basePriceUsd: 100, dateFrom: "", dateTo: "", isActive: true,
};

export default function AdminPackagesPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initDestSlug = params.get("destinationSlug") ?? "";

  const { data: destinations } = useListAdminDestinations({ query: { queryKey: getListAdminDestinationsQueryKey() } });
  const [destFilter, setDestFilter] = useState(initDestSlug);

  const selectedDest = destinations?.find((d) => d.slug === destFilter);
  const filterDestId = selectedDest?.id ?? undefined;

  const { data: hotels } = useListAdminHotels(
    { destinationId: filterDestId },
    { query: { queryKey: getListAdminHotelsQueryKey({ destinationId: filterDestId }) } },
  );
  const { data: packages, isLoading } = useListAdminPackages(
    { destinationId: filterDestId ?? null },
    { query: { queryKey: getListAdminPackagesQueryKey({ destinationId: filterDestId ?? null }) } },
  );

  const createPkg = useCreateAdminPackage();
  const updatePkg = useUpdateAdminPackage();
  const deletePkg = useDeleteAdminPackage();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState<(PkgForm & { id?: number }) | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["listAdminPackages"] });

  const openEdit = (p: NonNullable<typeof packages>[0]) => {
    setEditing({
      id: p.id,
      hotelId: p.hotelId,
      destinationId: p.destinationId,
      mealPlan: p.mealPlan,
      roomType: p.roomType,
      currency: p.currency,
      nights: p.nights,
      basePriceUsd: p.basePriceUsd,
      dateFrom: p.dateFrom ?? "",
      dateTo: p.dateTo ?? "",
      isActive: p.isActive,
    });
    const dest = destinations?.find((d) => d.id === p.destinationId);
    if (dest) setDestFilter(dest.slug);
  };

  const handleSave = () => {
    if (!editing || !editing.hotelId || !editing.destinationId) {
      toast({ title: "اختر الوجهة والفندق أولاً", variant: "destructive" }); return;
    }
    const data = {
      hotelId: editing.hotelId,
      destinationId: editing.destinationId,
      mealPlan: editing.mealPlan,
      roomType: editing.roomType,
      currency: editing.currency,
      nights: editing.nights,
      basePriceUsd: editing.basePriceUsd,
      dateFrom: editing.dateFrom || null,
      dateTo: editing.dateTo || null,
      isActive: editing.isActive,
    };
    if (editing.id) {
      updatePkg.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => { invalidate(); setEditing(null); toast({ title: "تم التحديث" }); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        },
      );
    } else {
      createPkg.mutate(
        { data },
        {
          onSuccess: () => { invalidate(); setEditing(null); toast({ title: "تمت الإضافة" }); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = (id: number) => {
    deletePkg.mutate(
      { id },
      {
        onSuccess: () => { invalidate(); setConfirmDelete(null); toast({ title: "تم الحذف" }); },
        onError: () => toast({ title: "خطأ", variant: "destructive" }),
      },
    );
  };

  const getDestName = (destId: number) => {
    return destinations?.find((d) => d.id === destId)?.nameAr ?? String(destId);
  };

  return (
    <AdminGuard>
      <AdminLayout title="الباقات" titleEn="Packages">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <select
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="bg-card border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
            data-testid="select-dest-filter"
          >
            <option value="">كل الوجهات</option>
            {destinations?.map((d) => <option key={d.id} value={d.slug}>{d.nameAr} – {d.nameEn}</option>)}
          </select>
          <span className="text-foreground/30 text-xs">{packages?.length ?? 0} باقة</span>
          <button
            onClick={() => setEditing({ ...empty, destinationId: filterDestId ?? 0 })}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold transition-colors"
            data-testid="button-add-package"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة باقة
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="bg-card border border-white/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-foreground/40">
                  <th className="text-right p-3 font-medium">الفندق</th>
                  <th className="text-right p-3 font-medium">الباقة</th>
                  <th className="text-right p-3 font-medium">الليالي</th>
                  <th className="text-right p-3 font-medium">السعر $</th>
                  <th className="text-right p-3 font-medium">الوجهة</th>
                  <th className="text-right p-3 font-medium">الحالة</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {packages?.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                    data-testid={`row-package-${p.id}`}
                  >
                    <td className="p-3">
                      <div className="text-foreground text-sm">{p.hotelNameAr ?? "—"}</div>
                      <div className="text-foreground/40 text-xs">{p.hotelNameEn ?? ""}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-xs bg-muted px-1.5 py-0.5 text-foreground/60 flex items-center gap-0.5">
                          <Utensils className="w-2.5 h-2.5" />{p.mealPlan}
                        </span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 text-foreground/60 flex items-center gap-0.5">
                          <BedDouble className="w-2.5 h-2.5" />{p.roomType}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-foreground/60">
                      <span className="flex items-center gap-1"><Moon className="w-3 h-3" />{p.nights}</span>
                    </td>
                    <td className="p-3 text-foreground/40 font-mono text-xs">
                      ${p.basePriceUsd}/ليلة
                    </td>
                    <td className="p-3 text-foreground/50 text-xs">{getDestName(p.destinationId)}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 ${p.isActive ? "bg-primary/10 text-primary" : "bg-muted text-foreground/30"}`}>
                        {p.isActive ? "نشط" : "مخفي"}
                      </span>
                    </td>
                    <td className="p-3 flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="text-foreground/40 hover:text-primary transition-colors" data-testid={`button-edit-pkg-${p.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(p.id)} className="text-foreground/40 hover:text-destructive transition-colors" data-testid={`button-delete-pkg-${p.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {!packages?.length && (
                  <tr><td colSpan={7} className="text-center py-10 text-foreground/30 text-sm">لا توجد باقات</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit/Create Modal */}
        {editing && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="modal-package">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-serif text-foreground">{editing.id ? "تعديل الباقة" : "إضافة باقة جديدة"}</h3>
                <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-foreground/40" /></button>
              </div>
              <div className="p-5 space-y-3">
                {/* Destination */}
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">الوجهة *</label>
                  <select
                    value={destFilter}
                    onChange={(e) => {
                      setDestFilter(e.target.value);
                      const d = destinations?.find((d) => d.slug === e.target.value);
                      if (d) setEditing({ ...editing, destinationId: d.id });
                    }}
                    className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 outline-none"
                    data-testid="select-pkg-dest"
                  >
                    <option value="">اختر وجهة</option>
                    {destinations?.map((d) => <option key={d.id} value={d.slug}>{d.nameAr} – {d.nameEn}</option>)}
                  </select>
                </div>
                {/* Hotel */}
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">الفندق *</label>
                  <select
                    value={editing.hotelId}
                    onChange={(e) => setEditing({ ...editing, hotelId: Number(e.target.value) })}
                    className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                    data-testid="select-pkg-hotel"
                  >
                    <option value={0}>اختر فندقاً</option>
                    {hotels?.map((h) => <option key={h.id} value={h.id}>{h.nameAr} ({h.stars}★)</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">نظام الوجبات</label>
                    <select
                      value={editing.mealPlan}
                      onChange={(e) => setEditing({ ...editing, mealPlan: e.target.value })}
                      className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="select-pkg-meal"
                    >
                      {MEAL_PLANS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">نوع الغرفة</label>
                    <select
                      value={editing.roomType}
                      onChange={(e) => setEditing({ ...editing, roomType: e.target.value })}
                      className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="select-pkg-room"
                    >
                      {ROOM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">الليالي</label>
                    <input
                      type="number" min={1}
                      value={editing.nights}
                      onChange={(e) => setEditing({ ...editing, nights: Number(e.target.value) })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="input-pkg-nights"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">السعر (USD/ليلة)</label>
                    <input
                      type="number" min={1} step="0.01"
                      value={editing.basePriceUsd}
                      onChange={(e) => setEditing({ ...editing, basePriceUsd: Number(e.target.value) })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="input-pkg-price"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">العملة</label>
                    <select
                      value={editing.currency}
                      onChange={(e) => setEditing({ ...editing, currency: e.target.value })}
                      className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="select-pkg-currency"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="SAR">SAR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">من تاريخ</label>
                    <input
                      type="date" value={editing.dateFrom}
                      onChange={(e) => setEditing({ ...editing, dateFrom: e.target.value })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="input-pkg-date-from"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/60 block mb-1">إلى تاريخ</label>
                    <input
                      type="date" value={editing.dateTo}
                      onChange={(e) => setEditing({ ...editing, dateTo: e.target.value })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid="input-pkg-date-to"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" checked={editing.isActive}
                    onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
                    className="accent-primary"
                    data-testid="checkbox-pkg-active"
                  />
                  <span className="text-sm text-foreground/70">نشط (Active)</span>
                </label>
              </div>
              <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-foreground/50 border border-white/10">إلغاء</button>
                <button
                  onClick={handleSave}
                  disabled={createPkg.isPending || updatePkg.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                  data-testid="button-save-package"
                >
                  <Save className="w-3 h-3" /> حفظ
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {confirmDelete !== null && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-white/10 p-6 max-w-sm w-full text-center">
              <p className="text-foreground mb-4 text-sm">هل أنت متأكد من حذف هذه الباقة؟</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-xs border border-white/10 text-foreground/60">إلغاء</button>
                <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 bg-destructive text-white text-xs" data-testid="button-confirm-delete">حذف</button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
