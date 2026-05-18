import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Moon, Utensils, BedDouble, Phone, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGenerateQuote } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface PackageResult {
  id: number;
  hotelId: number;
  hotelNameAr: string;
  hotelNameEn: string;
  stars: number;
  area: string | null;
  mealPlan: string;
  roomType: string;
  nights: number;
  finalPriceJod: number;
  finalPriceUsd?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  isActive: boolean;
  hotelImageUrl?: string | null;
  hotelDescription?: string | null;
}

interface PackageCardProps {
  pkg: PackageResult;
  destinationNameAr?: string;
  destinationNameEn?: string;
  index?: number;
}

export function PackageCard({ pkg, destinationNameAr, destinationNameEn, index = 0 }: PackageCardProps) {
  const [open, setOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const generateQuote = useGenerateQuote();
  const { toast } = useToast();

  const handleWhatsApp = () => {
    if (!guestName.trim()) {
      toast({ title: "يرجى إدخال اسمك", variant: "destructive" });
      return;
    }
    generateQuote.mutate(
      {
        data: {
          packageId: pkg.id,
          nights: pkg.nights,
          roomType: pkg.roomType,
          guestName,
          guestPhone: guestPhone || null,
          adults,
          children,
        },
      },
      {
        onSuccess: (quote) => {
          const encoded = encodeURIComponent(quote.whatsappMessage);
          window.open(`https://wa.me/${quote.whatsappNumber}?text=${encoded}`, "_blank");
          setOpen(false);
        },
        onError: () => {
          toast({ title: "حدث خطأ، يرجى المحاولة مجدداً", variant: "destructive" });
        },
      },
    );
  };

  const quickWhatsApp = () => {
    const msg = `مرحباً، أود الاستفسار عن باقة:\n${destinationNameAr ? `الوجهة: ${destinationNameAr}` : ""}\nالفندق: ${pkg.hotelNameAr}\nعدد الليالي: ${pkg.nights}\nالسعر: ${pkg.finalPriceJod} د.أ`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/962777066001?text=${encoded}`, "_blank");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className="group bg-card border border-white/10 hover:border-primary/30 transition-all duration-300 overflow-hidden"
        data-testid={`card-package-${pkg.id}`}
      >
        {/* Hotel Image */}
        <div className="relative h-48 overflow-hidden">
          {pkg.hotelImageUrl ? (
            <img
              src={pkg.hotelImageUrl}
              alt={pkg.hotelNameEn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
              <BedDouble className="w-8 h-8 text-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          {/* Stars */}
          <div className="absolute top-3 right-3 flex items-center gap-0.5">
            {Array.from({ length: pkg.stars }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
            ))}
          </div>
          {/* Price Badge */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-primary text-primary-foreground px-3 py-1">
              <span className="text-lg font-bold">{pkg.finalPriceJod}</span>
              <span className="text-xs ml-1">د.أ</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-serif text-foreground text-base font-medium leading-tight mb-0.5">{pkg.hotelNameAr}</h3>
            <p className="text-foreground/40 text-xs">{pkg.hotelNameEn}</p>
            {pkg.area && (
              <p className="text-primary/70 text-xs mt-0.5">{pkg.area}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1 text-xs text-foreground/60 bg-muted px-2 py-1">
              <Moon className="w-3 h-3" /> {pkg.nights} ليلة
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground/60 bg-muted px-2 py-1">
              <Utensils className="w-3 h-3" /> {pkg.mealPlan}
            </span>
            <span className="flex items-center gap-1 text-xs text-foreground/60 bg-muted px-2 py-1">
              <BedDouble className="w-3 h-3" /> {pkg.roomType}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold py-2 px-3 transition-colors flex items-center justify-center gap-1"
              data-testid={`button-book-${pkg.id}`}
            >
              <Phone className="w-3 h-3" />
              احجز الآن
            </button>
            <button
              onClick={quickWhatsApp}
              className="bg-muted hover:bg-muted/80 text-foreground/70 hover:text-foreground text-xs py-2 px-3 transition-colors"
              data-testid={`button-quick-whatsapp-${pkg.id}`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Inquiry Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-white/10 text-foreground max-w-sm" data-testid="dialog-inquiry">
          <DialogHeader>
            <DialogTitle className="font-serif text-primary">استفسار عن الباقة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="text-sm text-foreground/60 bg-muted/50 p-3">
              <p className="font-medium text-foreground">{pkg.hotelNameAr}</p>
              <p className="text-xs">{pkg.nights} ليلة · {pkg.mealPlan} · {pkg.roomType}</p>
              <p className="text-primary font-bold mt-1">{pkg.finalPriceJod} د.أ للشخص</p>
            </div>
            <div>
              <label className="text-xs text-foreground/60 block mb-1">الاسم الكريم *</label>
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary"
                placeholder="أدخل اسمك"
                data-testid="input-guest-name"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 block mb-1">رقم الهاتف</label>
              <input
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary"
                placeholder="+962..."
                dir="ltr"
                data-testid="input-guest-phone"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-foreground/60 block mb-1">بالغين</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary"
                  data-testid="input-adults"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-foreground/60 block mb-1">أطفال</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="w-full bg-muted border border-white/10 text-foreground text-sm px-3 py-2 focus:outline-none focus:border-primary"
                  data-testid="input-children"
                />
              </div>
            </div>
            <button
              onClick={handleWhatsApp}
              disabled={generateQuote.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="button-confirm-inquiry"
            >
              <Phone className="w-4 h-4" />
              {generateQuote.isPending ? "جاري الإرسال..." : "إرسال عبر واتساب"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
