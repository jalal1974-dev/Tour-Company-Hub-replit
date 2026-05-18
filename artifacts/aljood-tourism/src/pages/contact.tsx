import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Users, Baby } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useListDestinations } from "@workspace/api-client-react";

export default function ContactPage() {
  const { t, isEn } = useLanguage();
  const { data: destinations } = useListDestinations();
  const destList = Array.isArray(destinations) ? destinations : [];

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    destination: "",
    adults: 2,
    children: 0,
    travelDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError(isEn ? "Please enter your name and phone number" : "يرجى إدخال الاسم ورقم الهاتف");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", phone: "", email: "", destination: "", adults: 2, children: 0, travelDate: "", notes: "" });
      } else {
        const data = await res.json();
        setError(data.error || (isEn ? "An error occurred" : "حدث خطأ"));
      }
    } catch {
      setError(isEn ? "Connection error, please try again" : "خطأ في الاتصال، يرجى المحاولة مجدداً");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-muted border border-white/10 focus:border-primary text-foreground text-sm px-3 py-2.5 outline-none transition-colors placeholder:text-foreground/30";
  const labelClass = "text-xs text-foreground/60 block mb-1.5";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600"
            alt="Travel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/90" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-3">
              {isEn ? "Get in touch" : "تواصل معنا"}
            </p>
            <h1 className="font-serif text-5xl text-foreground mb-3">
              {isEn ? "Contact Us" : "تواصل معنا"}
            </h1>
            <p className="text-foreground/40 text-sm mb-2">
              {isEn ? "تواصل معنا" : "Contact Us"}
            </p>
            <p className="text-foreground/50 text-sm max-w-lg mx-auto leading-relaxed">
              {isEn
                ? "Send us your travel request and our team will get back to you as soon as possible"
                : "أرسل لنا طلبك السياحي وسيتواصل معك فريقنا في أقرب وقت ممكن"}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-serif text-foreground text-xl mb-6">
                  {isEn ? "Contact Information" : "معلومات التواصل"}
                </h2>
                <div className="space-y-5">
                  <a
                    href="https://wa.me/962777066005"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-0.5">
                        {isEn ? "WhatsApp" : "واتساب"}
                      </p>
                      <p className="text-foreground text-sm font-medium" dir="ltr">+962 777 066 005</p>
                    </div>
                  </a>

                  <a
                    href="tel:+962777066800"
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-0.5">
                        {isEn ? "Phone" : "هاتف"}
                      </p>
                      <p className="text-foreground text-sm font-medium" dir="ltr">+962 777 066 800</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-0.5">
                        {isEn ? "Email" : "بريد إلكتروني"}
                      </p>
                      <p className="text-foreground text-sm font-medium">info@aljoodtravel.jo</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground/40 mb-0.5">
                        {isEn ? "Address" : "العنوان"}
                      </p>
                      <p className="text-foreground text-sm font-medium">
                        {isEn ? "Amman, Jordan" : "عمان، الأردن"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp CTA */}
              <div className="border border-primary/20 bg-primary/5 p-5">
                <p className="text-primary text-sm font-semibold mb-1">
                  {isEn ? "Need a quick reply?" : "تريد رداً سريعاً؟"}
                </p>
                <p className="text-foreground/50 text-xs mb-4">
                  {isEn
                    ? "Message us directly on WhatsApp for an instant response"
                    : "راسلنا مباشرة على واتساب للحصول على رد فوري"}
                </p>
                <a
                  href="https://wa.me/962777066005"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 text-xs font-semibold transition-colors w-fit"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {isEn ? "Open WhatsApp" : "فتح واتساب"}
                </a>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-card border border-white/10 p-6 md:p-8">
                <h2 className="font-serif text-foreground text-xl mb-6">
                  {isEn ? "Send a Travel Request" : "أرسل طلب سياحي"}
                </h2>

                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-serif text-foreground text-2xl mb-2">
                        {isEn ? "Request Received!" : "تم استلام طلبك!"}
                      </h3>
                      <p className="text-foreground/50 text-sm mb-6">
                        {isEn
                          ? "Our team will contact you as soon as possible"
                          : "سيتواصل معك فريقنا في أقرب وقت ممكن"}
                      </p>
                      <button
                        onClick={() => setSuccess(false)}
                        className="border border-primary/40 hover:border-primary text-primary px-6 py-2 text-sm transition-colors"
                      >
                        {isEn ? "Send Another Request" : "إرسال طلب آخر"}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      {/* Name + Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            {isEn ? "Full Name *" : "الاسم الكامل *"}
                          </label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            className={inputClass}
                            placeholder={isEn ? "Enter your full name" : "أدخل اسمك الكامل"}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            {isEn ? "Phone Number *" : "رقم الهاتف *"}
                          </label>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            className={inputClass}
                            placeholder="+962..."
                            dir="ltr"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className={labelClass}>
                          {isEn ? "Email Address" : "البريد الإلكتروني"}
                          <span className="text-foreground/30 mr-1 ml-1">
                            {isEn ? "(optional)" : "(اختياري)"}
                          </span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                          className={inputClass}
                          placeholder="example@email.com"
                          dir="ltr"
                        />
                      </div>

                      {/* Destination */}
                      <div>
                        <label className={labelClass}>
                          {isEn ? "Preferred Destination" : "الوجهة المفضلة"}
                          <span className="text-foreground/30 mr-1 ml-1">
                            {isEn ? "(optional)" : "(اختياري)"}
                          </span>
                        </label>
                        <select
                          value={form.destination}
                          onChange={(e) => set("destination", e.target.value)}
                          className={inputClass}
                        >
                          <option value="">{isEn ? "Choose a destination..." : "اختر وجهة..."}</option>
                          {destList.map((d) => (
                            <option key={d.id} value={d.slug}>
                              {isEn ? d.nameEn : d.nameAr}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Adults + Children + Date */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>
                            <Users className="inline w-3 h-3 mr-1" />
                            {isEn ? "Adults" : "عدد البالغين"}
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={form.adults}
                            onChange={(e) => set("adults", Number(e.target.value))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            <Baby className="inline w-3 h-3 mr-1" />
                            {isEn ? "Children" : "عدد الأطفال"}
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={20}
                            value={form.children}
                            onChange={(e) => set("children", Number(e.target.value))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>
                            {isEn ? "Expected Travel Date" : "تاريخ السفر المتوقع"}
                          </label>
                          <input
                            type="date"
                            value={form.travelDate}
                            onChange={(e) => set("travelDate", e.target.value)}
                            className={inputClass}
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className={labelClass}>
                          {isEn ? "Additional Notes" : "ملاحظات إضافية"}
                          <span className="text-foreground/30 mr-1 ml-1">
                            {isEn ? "(optional)" : "(اختياري)"}
                          </span>
                        </label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => set("notes", e.target.value)}
                          rows={3}
                          className={`${inputClass} resize-none`}
                          placeholder={isEn ? "Any additional details or requirements..." : "أي تفاصيل أو متطلبات إضافية..."}
                        />
                      </div>

                      {/* Error */}
                      {error && (
                        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 px-3 py-2">
                          {error}
                        </p>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        {loading
                          ? (isEn ? "Submitting..." : "جاري الإرسال...")
                          : (isEn ? "Submit Request" : "إرسال الطلب")}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
