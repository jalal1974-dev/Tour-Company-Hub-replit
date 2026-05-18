import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Save, KeyRound, Eye, EyeOff } from "lucide-react";
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

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function ChangePasswordSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>();

  const onSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({ title: "كلمتا المرور غير متطابقتين / Passwords do not match", variant: "destructive" });
      return;
    }
    if (data.newPassword.length < 8) {
      toast({ title: "كلمة المرور يجب أن تكون 8 أحرف على الأقل / Min 8 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });
      if (res.ok) {
        toast({ title: "تم تغيير كلمة المرور بنجاح / Password changed successfully" });
        reset();
      } else {
        const err = await res.json();
        if (res.status === 401) {
          toast({ title: "كلمة المرور الحالية غير صحيحة / Current password is incorrect", variant: "destructive" });
        } else {
          toast({ title: err.error || "حدث خطأ / An error occurred", variant: "destructive" });
        }
      }
    } catch {
      toast({ title: "حدث خطأ في الاتصال / Connection error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pwInput = (
    name: keyof PasswordForm,
    label: string,
    labelEn: string,
    show: boolean,
    setShow: (v: boolean) => void,
  ) => (
    <div>
      <label className="text-xs text-foreground/60 block mb-1.5">
        {label} <span className="text-foreground/30">/ {labelEn}</span>
      </label>
      <div className="relative">
        <input
          {...register(name, { required: true })}
          type={show ? "text" : "password"}
          className="w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2 pr-10 outline-none transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 px-3 text-foreground/40 hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1">هذا الحقل مطلوب / Required</p>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-card border border-white/10 p-5 col-span-1 lg:col-span-2"
    >
      <h2 className="font-serif text-foreground text-base mb-5 pb-3 border-b border-white/10 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-primary" />
        تغيير كلمة المرور
        <span className="text-xs text-foreground/30 mr-1">/ Change Password</span>
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pwInput("currentPassword", "كلمة المرور الحالية", "Current Password", showCurrent, setShowCurrent)}
          {pwInput("newPassword", "كلمة المرور الجديدة", "New Password", showNew, setShowNew)}
          {pwInput("confirmPassword", "تأكيد كلمة المرور", "Confirm Password", showConfirm, setShowConfirm)}
        </div>
        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
          >
            <KeyRound className="w-4 h-4" />
            {loading ? "جاري التغيير..." : "تغيير كلمة المرور / Change Password"}
          </button>
        </div>
      </form>
    </motion.div>
  );
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
          <>
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
                  <p className="text-foreground/30 text-xs mt-2">مثال: 962777066005</p>
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

            {/* Divider */}
            <div className="my-8 border-t border-white/10" />

            {/* Change Password */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChangePasswordSection />
            </div>
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
