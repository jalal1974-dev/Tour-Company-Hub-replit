import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import {
  useListAdminDestinations,
  useCreateAdminDestination,
  useUpdateAdminDestination,
  useDeleteAdminDestination,
  getListAdminDestinationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";

interface DestForm {
  slug: string;
  nameAr: string;
  nameEn: string;
  country: string;
  flag: string;
  heroImage: string;
  descriptionAr: string;
  descriptionEn: string;
  isFeatured: boolean;
  ticketPriceJod: string;
}

const empty: DestForm = {
  slug: "", nameAr: "", nameEn: "", country: "", flag: "",
  heroImage: "", descriptionAr: "", descriptionEn: "", isFeatured: false,
  ticketPriceJod: "",
};

export default function AdminDestinationsPage() {
  const { data: destinations, isLoading } = useListAdminDestinations({
    query: { queryKey: getListAdminDestinationsQueryKey() },
  });
  const createDest = useCreateAdminDestination();
  const updateDest = useUpdateAdminDestination();
  const deleteDest = useDeleteAdminDestination();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState<(DestForm & { id?: number }) | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListAdminDestinationsQueryKey() });

  const openNew = () => setEditing({ ...empty });
  const openEdit = (d: NonNullable<typeof destinations>[0]) => {
    setEditing({
      id: d.id,
      slug: d.slug,
      nameAr: d.nameAr,
      nameEn: d.nameEn,
      country: d.country,
      flag: d.flag ?? "",
      heroImage: d.heroImage ?? "",
      descriptionAr: d.descriptionAr ?? "",
      descriptionEn: d.descriptionEn ?? "",
      isFeatured: d.isFeatured ?? false,
      ticketPriceJod: d.ticketPriceJod != null ? String(d.ticketPriceJod) : "",
    });
  };

  const buildPayload = (form: DestForm) => {
    const ticketVal = form.ticketPriceJod.trim();
    return {
      slug: form.slug,
      nameAr: form.nameAr,
      nameEn: form.nameEn,
      country: form.country,
      flag: form.flag || null,
      heroImage: form.heroImage,
      descriptionAr: form.descriptionAr || null,
      descriptionEn: form.descriptionEn || null,
      isFeatured: form.isFeatured,
      ticketPriceJod: ticketVal !== "" ? parseFloat(ticketVal) : null,
    };
  };

  const handleSave = () => {
    if (!editing) return;
    const data = buildPayload(editing);
    if (editing.id) {
      updateDest.mutate(
        { id: editing.id!, data },
        {
          onSuccess: () => { invalidate(); setEditing(null); toast({ title: "تم التحديث" }); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        },
      );
    } else {
      createDest.mutate(
        { data },
        {
          onSuccess: () => { invalidate(); setEditing(null); toast({ title: "تمت الإضافة" }); },
          onError: () => toast({ title: "خطأ", variant: "destructive" }),
        },
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteDest.mutate(
      { id },
      {
        onSuccess: () => { invalidate(); setConfirmDelete(null); toast({ title: "تم الحذف" }); },
        onError: () => toast({ title: "خطأ", variant: "destructive" }),
      },
    );
  };

  return (
    <AdminGuard>
      <AdminLayout title="الوجهات" titleEn="Destinations">
        <div className="flex justify-between items-center mb-6">
          <p className="text-foreground/40 text-sm">{destinations?.length ?? 0} وجهة مسجلة</p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold transition-colors"
            data-testid="button-add-destination"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة وجهة
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse" />)}</div>
        ) : (
          <div className="bg-card border border-white/10 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-foreground/40">
                  <th className="text-right p-3 font-medium">الوجهة</th>
                  <th className="text-right p-3 font-medium">السلج</th>
                  <th className="text-right p-3 font-medium">الدولة</th>
                  <th className="text-right p-3 font-medium">تذكرة (JOD)</th>
                  <th className="text-right p-3 font-medium">مميز</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {destinations?.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                    data-testid={`row-dest-${d.slug}`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span>{d.flag}</span>
                        <div>
                          <div className="text-foreground font-medium">{d.nameAr}</div>
                          <div className="text-foreground/40 text-xs">{d.nameEn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-foreground/40 font-mono text-xs">{d.slug}</td>
                    <td className="p-3 text-foreground/60">{d.country}</td>
                    <td className="p-3 text-foreground/60 font-mono text-xs">
                      {d.ticketPriceJod != null ? (
                        <span className="text-primary">{d.ticketPriceJod} JOD</span>
                      ) : (
                        <span className="text-foreground/20">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      {d.isFeatured ? <span className="text-primary text-xs">✓</span> : <span className="text-foreground/20 text-xs">—</span>}
                    </td>
                    <td className="p-3 flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(d)} className="text-foreground/40 hover:text-primary transition-colors" data-testid={`button-edit-dest-${d.id}`}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(d.id)} className="text-foreground/40 hover:text-destructive transition-colors" data-testid={`button-delete-dest-${d.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit/Create Modal */}
        {editing && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-testid="modal-destination">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="font-serif text-foreground">{editing.id ? "تعديل الوجهة" : "إضافة وجهة جديدة"}</h3>
                <button onClick={() => setEditing(null)} className="text-foreground/40 hover:text-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-3">
                {([
                  ["slug", "السلج (Slug)", "text"],
                  ["nameAr", "الاسم بالعربية", "text"],
                  ["nameEn", "الاسم بالإنجليزية", "text"],
                  ["country", "الدولة", "text"],
                  ["flag", "رمز العلم 🏳️", "text"],
                  ["heroImage", "رابط صورة الغلاف", "url"],
                  ["descriptionAr", "الوصف بالعربية", "text"],
                  ["descriptionEn", "الوصف بالإنجليزية", "text"],
                ] as [keyof DestForm, string, string][]).map(([key, label, type]) => (
                  <div key={key}>
                    <label className="text-xs text-foreground/60 block mb-1">{label}</label>
                    <input
                      type={type}
                      value={String(editing[key])}
                      onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid={`input-dest-${key}`}
                    />
                  </div>
                ))}

                {/* Per-destination ticket price */}
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">
                    سعر التذكرة بالدينار (JOD) — اتركه فارغاً لاستخدام الإعداد العام
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="مثال: 0 للوجهات المحلية أو غير المعروضة"
                    value={editing.ticketPriceJod}
                    onChange={(e) => setEditing({ ...editing, ticketPriceJod: e.target.value })}
                    className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                    data-testid="input-dest-ticketPriceJod"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.isFeatured}
                    onChange={(e) => setEditing({ ...editing, isFeatured: e.target.checked })}
                    className="accent-primary"
                    data-testid="checkbox-is-featured"
                  />
                  <span className="text-sm text-foreground/70">وجهة مميزة (Featured)</span>
                </label>
              </div>
              <div className="p-4 border-t border-white/10 flex justify-end gap-2">
                <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-foreground/50 hover:text-foreground border border-white/10 transition-colors">إلغاء</button>
                <button
                  onClick={handleSave}
                  disabled={createDest.isPending || updateDest.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  data-testid="button-save-destination"
                >
                  <Save className="w-3 h-3" /> حفظ
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirm */}
        {confirmDelete !== null && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-white/10 p-6 max-w-sm w-full text-center">
              <p className="text-foreground mb-4 text-sm">هل أنت متأكد من حذف هذه الوجهة؟</p>
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
