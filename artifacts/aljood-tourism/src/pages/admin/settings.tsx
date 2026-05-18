import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import {
  useGetAdminSettings,
  useUpdateAdminSettings,
  getGetAdminSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";

interface SettingsForm {
  ticketPriceJod: number;
  transportJod: number;
  fixedProfitJod: number;
  profitPct: number;
  rateUsdToJod: number;
  rateEurToJod: number;
  rateSarToJod: number;
  whatsappNumber: string;
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useGetAdminSettings({
    query: { queryKey: getGetAdminSettingsQueryKey() },
  });
  const updateSettings = useUpdateAdminSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { isDirty } } = useForm<SettingsForm>();

  useEffect(() => {
    if (settings) {
      reset({
        ticketPriceJod: settings.ticketPriceJod,
        transportJod: settings.transportJod,
        fixedProfitJod: settings.fixedProfitJod,
        profitPct: settings.profitPct,
        rateUsdToJod: settings.rateUsdToJod,
        rateEurToJod: settings.rateEurToJod,
        rateSarToJod: settings.rateSarToJod,
        whatsappNumber: settings.whatsappNumber,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: SettingsForm) => {
    updateSettings.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminSettingsQueryKey() });
          toast({ title: "تم حفظ الإعدادات بنجاح" });
          reset(data);
        },
        onError: () => toast({ title: "حدث خطأ", variant: "destructive" }),
      },
    );
  };

  const field = (name: keyof SettingsForm, label: string, labelEn: string, type = "number", step = "0.01") => (
    <div>
      <label className="text-xs text-foreground/60 block mb-1.5">
        {label} <span className="text-foreground/30">/ {labelEn}</span>
      </label>
      <input
        {...register(name, { valueAsNumber: type === "number" })}
        type={type}
        step={type === "number" ? step : undefined}
        className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 outline-none transition-colors"
        data-testid={`input-setting-${name}`}
      />
    </div>
  );

  return (
    <AdminGuard>
      <AdminLayout title="إعدادات التسعير" titleEn="Pricing Settings">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-muted animate-pulse" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-white/10 p-5"
              >
                <h2 className="font-serif text-foreground text-base mb-5 pb-3 border-b border-white/10">
                  تكاليف الباقة الثابتة
                  <span className="text-xs text-foreground/30 mr-2">Fixed Package Costs</span>
                </h2>
                <div className="space-y-4">
                  {field("ticketPriceJod", "سعر التذكرة (د.أ)", "Ticket Price (JOD)")}
                  {field("transportJod", "سعر النقل (د.أ)", "Transport (JOD)")}
                  {field("fixedProfitJod", "الربح الثابت (د.أ)", "Fixed Profit (JOD)")}
                  {field("profitPct", "نسبة الربح (%)", "Profit Percentage (%)")}
                </div>
              </motion.div>

              {/* Exchange Rates */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-white/10 p-5"
              >
                <h2 className="font-serif text-foreground text-base mb-5 pb-3 border-b border-white/10">
                  أسعار الصرف
                  <span className="text-xs text-foreground/30 mr-2">Exchange Rates</span>
                </h2>
                <div className="space-y-4">
                  {field("rateUsdToJod", "USD → JOD", "US Dollar to Jordanian Dinar", "number", "0.0001")}
                  {field("rateEurToJod", "EUR → JOD", "Euro to Jordanian Dinar", "number", "0.0001")}
                  {field("rateSarToJod", "SAR → JOD", "Saudi Riyal to Jordanian Dinar", "number", "0.0001")}
                </div>
              </motion.div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-white/10 p-5"
              >
                <h2 className="font-serif text-foreground text-base mb-5 pb-3 border-b border-white/10">
                  معلومات التواصل
                  <span className="text-xs text-foreground/30 mr-2">Contact Information</span>
                </h2>
                {field("whatsappNumber", "رقم واتساب (بدون +)", "WhatsApp Number (without +)", "text", undefined)}
                <p className="text-foreground/30 text-xs mt-2">مثال: 962777066001</p>
              </motion.div>
            </div>

            {/* Formula Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-muted/30 border border-white/5 p-4"
            >
              <p className="text-xs text-foreground/40 font-mono">
                السعر النهائي = (سعر الفندق × الليالي × سعر الصرف) + تذكرة + نقل + ربح ثابت) × (1 + ربح%)
              </p>
            </motion.div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={!isDirty || updateSettings.isPending}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40"
                data-testid="button-save-settings"
              >
                <Save className="w-4 h-4" />
                {updateSettings.isPending ? "جاري الحفظ..." : "حفظ الإعدادات / Save"}
              </button>
            </div>
          </form>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
