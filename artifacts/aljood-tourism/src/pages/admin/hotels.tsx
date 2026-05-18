import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save, Star } from "lucide-react";
import {
  useListAdminDestinations,
  useListAdminHotels,
  useCreateAdminHotel,
  useUpdateAdminHotel,
  useDeleteAdminHotel,
  getListAdminDestinationsQueryKey,
  getListAdminHotelsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";

interface HotelForm {
  destinationId: number;
  nameAr: string;
  nameEn: string;
  stars: number;
  area: string;
  imageUrl: string;
  description: string;
}

const empty: HotelForm = {
  destinationId: 0, nameAr: "", nameEn: "", stars: 4, area: "", imageUrl: "", description: "",
};

export default function AdminHotelsPage() {
  const { data: destinations } = useListAdminDestinations({ query: { queryKey: getListAdminDestinationsQueryKey() } });
  const [destFilter, setDestFilter] = useState("");
  const { data: hotels, isLoading } = useListAdminHotels(
    { destinationId: destFilter ? Number(destFilter) : undefined },
    { query: { queryKey: getListAdminHotelsQueryKey({ destinationId: destFilter ? Number(destFilter) : undefined }) } },
  );
  const createHotel = useCreateAdminHotel();
  const updateHotel = useUpdateAdminHotel();
  const deleteHotel = useDeleteAdminHotel();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState<(HotelForm & { id?: number }) | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["listAdminHotels"] });

  const openNew = () => setEditing({ ...empty, destinationId: destFilter ? Number(destFilter) : 0 });
  const openEdit = (h: NonNullable<typeof hotels>[0]) => {
    setEditing({
      id: h.id,
      destinationId: h.destinationId,
      nameAr: h.nameAr,
      nameEn: h.nameEn,
      stars: h.stars,
      area: h.area ?? "",
      imageUrl: h.imageUrl ?? "",
      description: h.description ?? "",
    });
  };

  const handleSave = () => {
    if (!editing || !editing.destinationId) {
      toast({ title: "اختر الوجهة أولاً", variant: "destructive" }); return;
    }
    const data = {
      destinationId: editing.destinationId,
      nameAr: editing.nameAr,
      nameEn: editing.nameEn,
      stars: editing.stars,
      area: editing.area || null,
      imageUrl: editing.imageUrl || null,
      description: editing.description || null,
    };
    if (editing.id) {
      updateHotel.mutate(
        { id: editing.id!, data },
        {
          onSuccess: () => { invalidate(); setEditing(null); toast({ title: "تم التحديث" }); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        },
      );
    } else {
      createHotel.mutate(
        { data },
        {
          onSuccess: () => { invalidate(); setEditing(null); toast({ title: "تمت الإضافة" }); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteHotel.mutate(
      { id },
      {
        onSuccess: () => { invalidate(); setConfirmDelete(null); toast({ title: "تم الحذف" }); },
        onError: () => toast({ title: "خطأ", variant: "destructive" }),
      },
    );
  };

  return (
    <AdminGuard>
      <AdminLayout title="الفنادق" titleEn="Hotels">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <select
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            className="bg-card border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
            data-testid="select-dest-filter"
          >
            <option value="">كل الوجهات</option>
            {destinations?.map((d) => <option key={d.id} value={d.id}>{d.nameAr} – {d.nameEn}</option>)}
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold transition-colors"
            data-testid="button-add-hotel"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة فندق
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
                  <th className="text-right p-3 font-medium">النجوم</th>
                  <th className="text-right p-3 font-medium">المنطقة</th>
                  <th className="text-right p-3 font-medium">الوجهة</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {hotels?.map((h, i) => (
                  <motion.tr
                    key={h.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                    data-testid={`row-hotel-${h.id}`}
                  >
                    <td className="p-3">
                      <div className="text-foreground font-medium">{h.nameAr}</div>
                      <div className="text-foreground/40 text-xs">{h.nameEn}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: h.stars }).map((_, j) => (
                          <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-foreground/60 text-xs">{h.area ?? "—"}</td>
                    <td className="p-3 text-foreground/60 text-xs">{h.destinationId}</td>
                    <td className="p-3 flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(h)} className="text-foreground/40 hover:text-primary transition-colors" data-testid={`button-edit-hotel-${h.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(h.id)} className="text-foreground/40 hover:text-destructive transition-colors" data-testid={`button-delete-hotel-${h.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {!hotels?.length && (
                  <tr><td colSpan={5} className="text-center py-10 text-foreground/30 text-sm">لا توجد فنادق</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit/Create Modal */}
        {editing && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="modal-hotel">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-serif text-foreground">{editing.id ? "تعديل الفندق" : "إضافة فندق جديد"}</h3>
                <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-foreground/40" /></button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">الوجهة *</label>
                  <select
                    value={editing.destinationId}
                    onChange={(e) => setEditing({ ...editing, destinationId: Number(e.target.value) })}
                    className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                    data-testid="select-hotel-destination"
                  >
                    <option value={0}>اختر وجهة</option>
                    {destinations?.map((d) => <option key={d.id} value={d.id}>{d.nameAr} – {d.nameEn}</option>)}
                  </select>
                </div>
                {([
                  ["nameAr", "الاسم بالعربية"],
                  ["nameEn", "الاسم بالإنجليزية"],
                  ["area", "المنطقة"],
                  ["imageUrl", "رابط الصورة"],
                  ["description", "الوصف"],
                ] as [keyof HotelForm, string][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs text-foreground/60 block mb-1">{label}</label>
                    <input
                      value={String(editing[key])}
                      onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid={`input-hotel-${key}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">النجوم</label>
                  <select
                    value={editing.stars}
                    onChange={(e) => setEditing({ ...editing, stars: Number(e.target.value) })}
                    className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                    data-testid="select-hotel-stars"
                  >
                    {[3, 4, 5].map(s => <option key={s} value={s}>{s} نجوم</option>)}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-foreground/50 border border-white/10">إلغاء</button>
                <button
                  onClick={handleSave}
                  disabled={createHotel.isPending || updateHotel.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                  data-testid="button-save-hotel"
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
              <p className="text-foreground mb-4 text-sm">هل أنت متأكد من حذف هذا الفندق؟</p>
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
