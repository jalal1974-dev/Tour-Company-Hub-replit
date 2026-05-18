import { Link } from "wouter";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-card mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">ج</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-primary text-sm font-semibold">الجود للسياحة والسفر</span>
                <span className="text-foreground/40 text-[10px] tracking-widest uppercase">Al Jood Travel & Tourism</span>
              </div>
            </div>
            <p className="text-foreground/50 text-sm leading-relaxed">
              نقدم لكم أفضل باقات السياحة والسفر إلى أجمل الوجهات العالمية بأسعار تنافسية وخدمة متميزة.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-serif text-primary text-sm mb-4">الوجهات / Destinations</h3>
            <div className="grid grid-cols-2 gap-1">
              {["إسطنبول", "أنطاليا", "طرابزون", "شرم الشيخ", "بالي", "ماليزيا"].map((dest) => (
                <Link
                  key={dest}
                  href="/destinations"
                  className="text-foreground/50 hover:text-primary text-xs transition-colors py-0.5"
                >
                  {dest}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-serif text-primary text-sm mb-4">تواصل معنا / Contact</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/962777066001"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-foreground/50 hover:text-primary text-sm transition-colors"
                data-testid="link-footer-whatsapp"
              >
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">+962 77 706 6001</span>
              </a>
              <div className="flex items-center gap-2 text-foreground/50 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span>info@aljoodtravel.jo</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/50 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span>عمان، الأردن</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/30 text-xs">
            © 2024 الجود للسياحة والسفر. جميع الحقوق محفوظة.
          </p>
          <p className="text-foreground/30 text-xs">
            © 2024 Al Jood Travel & Tourism. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
