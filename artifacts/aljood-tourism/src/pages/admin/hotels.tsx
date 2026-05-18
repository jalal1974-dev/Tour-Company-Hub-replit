import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, X, Save, Star, Upload, Link, ImageOff, Loader2 } from "lucide-react";
import {
  useListAdminDestinations,
  useListAdminHotels,
  useCreateAdminHotel,
  useUpdateAdminHotel,
  useDeleteAdminHotel,
  getListAdminDestinationsQueryKey,
  getListAdminHotelsQueryKey,
} from "@workspace/api-client-react";
import { useUpload } from "@workspace/object-storage-web";
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

type ImageTab = "upload" | "url";

function ImagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [tab, setTab] = useState<ImageTab>(value && !value.startsWith("/api/storage") ? "url" : "upload");
  const [urlInput, setUrlInput] = useState(tab === "url" ? value : "");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { uploadFile, isUploading, progress } = useUpload({
    basePath: "/api/storage",
    onSuccess: (response) => {
      const serveUrl = `/api/storage${response.objectPath}`;
      onChange(serveUrl);
      toast({ title: "تم رفع الصورة بنجاح" });
    },
    onError: (err) => {
      toast({ title: "فشل رفع الصورة: " + err.message, variant: "destructive" });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "يرجى اختيار ملف صورة", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "حجم الصورة يجب أن لا يتجاوز 10MB", variant: "destructive" });
      return;
    }
    await uploadFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyUrl = () => {
    onChange(urlInput.trim());
  };

  const currentImage = value;

  return (
    <div className="space-y-3">
      {/* Preview */}
      {currentImage ? (
        <div className="relative h-32 bg-muted overflow-hidden border border-white/10">
          <img
            src={currentImage}
            alt="Hotel preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <button
            type="button"
            onClick={() => { onChange(""); setUrlInput(""); }}
            className="absolute top-2 right-2 bg-background/80 hover:bg-destructive text-foreground hover:text-white p-1 transition-colors"
            title="إزالة الصورة"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="h-32 bg-muted border border-white/10 flex items-center justify-center">
          <ImageOff className="w-6 h-6 text-foreground/20" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex border border-white/10">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${tab === "upload" ? "bg-primary/20 text-primary" : "text-foreground/40 hover:text-foreground"}`}
        >
          <Upload className="w-3.5 h-3.5" /> رفع صورة
        </button>
        <button
          type="button"
          onClick={() => setTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${tab === "url" ? "bg-primary/20 text-primary" : "text-foreground/40 hover:text-foreground"}`}
        >
          <Link className="w-3.5 h-3.5" /> رابط خارجي
        </button>
      </div>

      {tab === "upload" && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            id="hotel-image-upload"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="hotel-image-upload"
            className={`flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-white/20 hover:border-primary/50 text-foreground/50 hover:text-foreground text-xs transition-colors cursor-pointer ${isUploading ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الرفع {progress > 0 ? `${progress}%` : ""}…
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                انقر لاختيار صورة (JPG، PNG، WebP — حتى 10MB)
              </>
            )}
          </label>
          {isUploading && (
            <div className="mt-2 h-1 bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      )}

      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
            placeholder="https://example.com/image.jpg"
            dir="ltr"
            className="flex-1 bg-muted border border-white/10 focus:border-primary text-foreground text-xs px-3 py-2 outline-none"
            data-testid="input-hotel-imageUrl"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="px-3 py-2 bg-muted border border-white/10 hover:border-primary text-foreground/60 hover:text-foreground text-xs transition-colors"
          >
            تطبيق
          </button>
        </div>
      )}
    </div>
  );
}

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

  const destName = (id: number) => destinations?.find(d => d.id === id)?.nameAr ?? String(id);

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
                  <th className="text-right p-3 font-medium w-16">صورة</th>
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
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                    data-testid={`row-hotel-${h.id}`}
                  >
                    <td className="p-3">
                      <div className="w-12 h-10 bg-muted overflow-hidden shrink-0">
                        {h.imageUrl ? (
                          <img
                            src={h.imageUrl}
                            alt={h.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff className="w-3.5 h-3.5 text-foreground/20" />
                          </div>
                        )}
                      </div>
                    </td>
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
                    <td className="p-3 text-foreground/60 text-xs">{destName(h.destinationId)}</td>
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
                  <tr><td colSpan={6} className="text-center py-10 text-foreground/30 text-sm">لا توجد فنادق</td></tr>
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
              <div className="p-5 space-y-4">
                {/* Destination */}
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

                {/* Names */}
                {(["nameAr", "nameEn", "area"] as const).map((key) => (
                  <div key={key}>
                    <label className="text-xs text-foreground/60 block mb-1">
                      {key === "nameAr" ? "الاسم بالعربية" : key === "nameEn" ? "الاسم بالإنجليزية" : "المنطقة"}
                    </label>
                    <input
                      value={editing[key]}
                      onChange={(e) => setEditing({ ...editing, [key]: e.target.value })}
                      className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none"
                      data-testid={`input-hotel-${key}`}
                    />
                  </div>
                ))}

                {/* Stars */}
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

                {/* Description */}
                <div>
                  <label className="text-xs text-foreground/60 block mb-1">الوصف</label>
                  <textarea
                    value={editing.description}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={2}
                    className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none resize-none"
                    data-testid="input-hotel-description"
                  />
                </div>

                {/* Image Picker */}
                <div>
                  <label className="text-xs text-foreground/60 block mb-2">صورة الفندق</label>
                  <ImagePicker
                    value={editing.imageUrl}
                    onChange={(url) => setEditing({ ...editing, imageUrl: url })}
                  />
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
