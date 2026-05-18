import { useState } from "react";
import { motion } from "framer-motion";
import { Inbox, Phone, Mail, MapPin, Calendar, Users, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  new: { label: "جديد / New", icon: Clock, color: "text-primary border-primary/30 bg-primary/10" },
  contacted: { label: "تم التواصل / Contacted", icon: CheckCircle, color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  confirmed: { label: "مؤكد / Confirmed", icon: CheckCircle, color: "text-green-400 border-green-400/30 bg-green-400/10" },
  closed: { label: "مغلق / Closed", icon: XCircle, color: "text-foreground/40 border-white/10 bg-muted" },
};

async function fetchInquiries(): Promise<Inquiry[]> {
  const res = await fetch("/api/admin/inquiries", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function updateStatus(id: number, status: string): Promise<Inquiry> {
  const res = await fetch(`/api/admin/inquiries/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

async function deleteInquiry(id: number): Promise<void> {
  const res = await fetch(`/api/admin/inquiries/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete");
}

export default function AdminInquiriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: fetchInquiries,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      toast({ title: "تم تحديث الحالة / Status updated" });
    },
    onError: () => toast({ title: "حدث خطأ / Error", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      toast({ title: "تم الحذف / Deleted" });
    },
    onError: () => toast({ title: "حدث خطأ / Error", variant: "destructive" }),
  });

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
  const newCount = inquiries.filter((i) => i.status === "new").length;

  return (
    <AdminGuard>
      <AdminLayout title="طلبات التواصل" titleEn="Inquiries">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(STATUS_LABELS).map(([key, meta]) => {
            const Icon = meta.icon;
            const count = inquiries.filter((i) => i.status === key).length;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setFilter(filter === key ? "all" : key)}
                className={`border p-4 text-start transition-colors ${
                  filter === key ? "border-primary/40 bg-primary/5" : "border-white/10 bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${meta.color.split(" ")[0]}`} />
                  <span className="text-2xl font-bold text-foreground">{count}</span>
                </div>
                <p className="text-xs text-foreground/50">{meta.label}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse" />)}
          </div>
        ) : !filtered.length ? (
          <div className="text-center py-20 border border-white/10">
            <Inbox className="w-8 h-8 text-foreground/20 mx-auto mb-3" />
            <p className="text-foreground/40 text-sm">
              {filter === "all" ? "لا توجد طلبات / No inquiries yet" : "لا توجد طلبات بهذه الحالة / No inquiries with this status"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((inquiry, i) => {
              const statusMeta = STATUS_LABELS[inquiry.status] ?? STATUS_LABELS.new;
              const StatusIcon = statusMeta.icon;
              return (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-white/10 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-serif text-foreground text-base">{inquiry.name}</h3>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 border ${statusMeta.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusMeta.label}
                        </span>
                        {inquiry.destination && (
                          <span className="text-xs text-primary/70 border border-primary/20 px-2 py-0.5">
                            📍 {inquiry.destination}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs text-foreground/50">
                        <a
                          href={`tel:${inquiry.phone}`}
                          className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <Phone className="w-3 h-3" /> {inquiry.phone}
                        </a>
                        {inquiry.email && (
                          <a
                            href={`mailto:${inquiry.email}`}
                            className="flex items-center gap-1.5 hover:text-primary transition-colors"
                          >
                            <Mail className="w-3 h-3" /> {inquiry.email}
                          </a>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> {inquiry.adults} بالغ + {inquiry.children} طفل
                        </span>
                        {inquiry.travelDate && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {inquiry.travelDate}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-foreground/30">
                          <Clock className="w-3 h-3" />
                          {new Date(inquiry.createdAt).toLocaleDateString("ar-JO", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </span>
                      </div>

                      {inquiry.notes && (
                        <p className="mt-2 text-xs text-foreground/50 bg-muted/50 px-3 py-2 border-r-2 border-primary/40">
                          {inquiry.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <a
                        href={`https://wa.me/${inquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `مرحباً ${inquiry.name}، نشكرك على تواصلك مع الجود للسياحة والسفر.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> واتساب
                      </a>

                      <select
                        value={inquiry.status}
                        onChange={(e) => statusMutation.mutate({ id: inquiry.id, status: e.target.value })}
                        disabled={statusMutation.isPending}
                        className="bg-muted border border-white/10 text-foreground text-xs px-2 py-1.5 focus:outline-none focus:border-primary"
                      >
                        <option value="new">جديد</option>
                        <option value="contacted">تم التواصل</option>
                        <option value="confirmed">مؤكد</option>
                        <option value="closed">مغلق</option>
                      </select>

                      <button
                        onClick={() => {
                          if (confirm("حذف هذا الطلب؟ / Delete this inquiry?")) {
                            deleteMutation.mutate(inquiry.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="flex items-center justify-center gap-1.5 border border-white/10 hover:border-red-400/40 text-foreground/40 hover:text-red-400 text-xs px-3 py-1.5 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" /> حذف
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
