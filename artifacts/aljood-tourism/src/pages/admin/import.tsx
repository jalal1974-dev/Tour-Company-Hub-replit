import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Download, CheckCircle, AlertCircle, FileText, X, ChevronDown, ChevronUp } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { useToast } from "@/hooks/use-toast";

type DestRow = {
  slug: string; nameAr: string; nameEn: string; country: string;
  flag: string; heroImage: string; descriptionAr: string; descriptionEn: string; isFeatured: string;
};
type HotelRow = {
  destinationSlug: string; nameAr: string; nameEn: string; stars: string;
  area: string; description: string; imageUrl: string;
};
type PackageRow = {
  destinationSlug: string; hotelNameEn: string; nights: string; mealPlan: string;
  roomType: string; basePriceUsd: string; dateFrom: string; dateTo: string;
};

type ImportResult = { destinations: number; hotels: number; packages: number; errors: string[] };

const DEST_HEADERS = ["slug","nameAr","nameEn","country","flag","heroImage","descriptionAr","descriptionEn","isFeatured"];
const HOTEL_HEADERS = ["destinationSlug","nameAr","nameEn","stars","area","description","imageUrl"];
const PKG_HEADERS = ["destinationSlug","hotelNameEn","nights","mealPlan","roomType","basePriceUsd","dateFrom","dateTo"];

const DEST_SAMPLE = [
  "turkey,تركيا,Turkey,Turkey,🇹🇷,https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800,وجهة سياحية رائعة,Amazing tourist destination,true",
  "egypt,مصر,Egypt,Egypt,🇪🇬,https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800,أرض الفراعنة,Land of the Pharaohs,false",
];
const HOTEL_SAMPLE = [
  "turkey,فندق هيلتون إسطنبول,Hilton Istanbul,5,Bosphorus,Luxury hotel on the Bosphorus,",
  "turkey,فندق نوفوتيل,Novotel Istanbul,4,City Center,Modern hotel in city center,",
  "egypt,فندق ماريوت القاهرة,Cairo Marriott,5,Zamalek,Historic hotel on Nile island,",
];
const PKG_SAMPLE = [
  "turkey,Hilton Istanbul,7,All Inclusive,Double Room,450,2025-06-01,2025-08-31",
  "turkey,Hilton Istanbul,5,Bed and Breakfast,Single Room,320,2025-06-01,2025-08-31",
  "turkey,Novotel Istanbul,7,Half Board,Double Room,300,2025-05-01,2025-09-30",
  "egypt,Cairo Marriott,5,Full Board,Double Room,280,2025-04-01,2025-10-31",
];

function makeCSV(headers: string[], rows: string[]): string {
  return [headers.join(","), ...rows].join("\n");
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV<T extends Record<string, string>>(text: string, expectedHeaders: string[]): { rows: T[]; error?: string } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { rows: [], error: "File must have a header row and at least one data row" };

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const missing = expectedHeaders.filter(h => !headers.includes(h));
  if (missing.length > 0) return { rows: [], error: `Missing columns: ${missing.join(", ")}` };

  const rows: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
    rows.push(row as T);
  }
  return { rows };
}

interface FileZoneProps {
  label: string;
  labelEn: string;
  headers: string[];
  sampleRows: string[];
  templateName: string;
  onParsed: (rows: Record<string, string>[]) => void;
  rowCount: number;
  error?: string;
}

function FileZone({ label, labelEn, headers, sampleRows, templateName, onParsed, rowCount, error }: FileZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [filename, setFilename] = useState("");

  const handle = (file: File) => {
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { rows, error: parseErr } = parseCSV(text, headers);
      if (parseErr) {
        onParsed([]);
        setFilename("");
        alert(`Error in ${file.name}: ${parseErr}`);
      } else {
        onParsed(rows);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="bg-card px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-foreground/40 mr-2">/ {labelEn}</span>
          {rowCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> {rowCount} صفوف
            </span>
          )}
        </div>
        <button
          onClick={() => downloadCSV(templateName, makeCSV(headers, sampleRows))}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          قالب CSV
        </button>
      </div>

      <div
        className={`p-4 transition-colors ${dragging ? "bg-primary/5 border-primary" : "bg-background/30"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handle(file);
        }}
      >
        {filename ? (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-foreground">{filename}</span>
            <button onClick={() => { setFilename(""); onParsed([]); }} className="text-foreground/30 hover:text-foreground/60">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center gap-2 py-4 cursor-pointer text-center"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-6 h-6 text-foreground/30" />
            <p className="text-xs text-foreground/50">اسحب ملف CSV هنا أو <span className="text-primary">اضغط للاختيار</span></p>
            <p className="text-[10px] text-foreground/30">Drag & drop or click to browse</p>
          </div>
        )}
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handle(f);
          e.target.value = "";
        }} />
      </div>

      <div className="px-4 py-2 bg-muted/20 border-t border-white/10">
        <p className="text-[10px] text-foreground/30 font-mono">{headers.join(", ")}</p>
      </div>
    </div>
  );
}

interface PreviewTableProps {
  title: string;
  rows: Record<string, string>[];
  headers: string[];
}

function PreviewTable({ title, rows, headers }: PreviewTableProps) {
  const [expanded, setExpanded] = useState(false);
  if (rows.length === 0) return null;
  const shown = expanded ? rows : rows.slice(0, 3);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <div className="px-4 py-2 bg-card border-b border-white/10 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground/70">{title} — {rows.length} صف</span>
        {rows.length > 3 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary flex items-center gap-1">
            {expanded ? <><ChevronUp className="w-3 h-3" /> أقل</> : <><ChevronDown className="w-3 h-3" /> كل الصفوف</>}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-white/10 bg-muted/20">
              {headers.map(h => <th key={h} className="px-3 py-1.5 text-left text-foreground/40 font-medium whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                {headers.map(h => (
                  <td key={h} className="px-3 py-1.5 text-foreground/70 whitespace-nowrap max-w-[200px] truncate">{row[h] || "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminImportPage() {
  const { toast } = useToast();
  const [destRows, setDestRows] = useState<DestRow[]>([]);
  const [hotelRows, setHotelRows] = useState<HotelRow[]>([]);
  const [pkgRows, setPkgRows] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const totalRows = destRows.length + hotelRows.length + pkgRows.length;

  const handleImport = async () => {
    if (totalRows === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        destinations: destRows.length > 0 ? destRows.map(r => ({
          slug: r.slug, nameAr: r.nameAr, nameEn: r.nameEn, country: r.country,
          flag: r.flag, heroImage: r.heroImage, descriptionAr: r.descriptionAr,
          descriptionEn: r.descriptionEn, isFeatured: r.isFeatured?.toLowerCase() === "true",
        })) : undefined,
        hotels: hotelRows.length > 0 ? hotelRows.map(r => ({
          destinationSlug: r.destinationSlug, nameAr: r.nameAr, nameEn: r.nameEn,
          stars: r.stars ? parseInt(r.stars) : 4, area: r.area,
          description: r.description, imageUrl: r.imageUrl,
        })) : undefined,
        packages: pkgRows.length > 0 ? pkgRows.map(r => ({
          destinationSlug: r.destinationSlug, hotelNameEn: r.hotelNameEn,
          nights: parseInt(r.nights), mealPlan: r.mealPlan, roomType: r.roomType,
          basePriceUsd: parseFloat(r.basePriceUsd), dateFrom: r.dateFrom, dateTo: r.dateTo,
        })) : undefined,
      };

      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: ImportResult = await res.json();
      setResult(data);

      if (data.errors.length === 0) {
        toast({ title: "تم الاستيراد بنجاح", description: `${data.destinations} وجهات، ${data.hotels} فنادق، ${data.packages} باقات` });
        setDestRows([]);
        setHotelRows([]);
        setPkgRows([]);
      } else {
        toast({ title: "اكتمل الاستيراد مع تحذيرات", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "فشل الاستيراد", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <AdminLayout title="الاستيراد السريع" titleEn="Quick Import">
        <div className="max-w-4xl space-y-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
            <p className="text-sm text-foreground/60">
              استورد وجهات وفنادق وباقات دفعة واحدة من ملفات CSV. قم بتنزيل القالب، أضف بياناتك، ثم ارفع الملف.
            </p>
            <p className="text-xs text-foreground/30">
              Bulk-import destinations, hotels and packages from CSV files. Download the template, fill your data, then upload.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid gap-4 md:grid-cols-1">
            <FileZone
              label="الوجهات" labelEn="Destinations"
              headers={DEST_HEADERS}
              sampleRows={DEST_SAMPLE}
              templateName="destinations-template.csv"
              onParsed={(rows) => setDestRows(rows as DestRow[])}
              rowCount={destRows.length}
            />
            <FileZone
              label="الفنادق" labelEn="Hotels"
              headers={HOTEL_HEADERS}
              sampleRows={HOTEL_SAMPLE}
              templateName="hotels-template.csv"
              onParsed={(rows) => setHotelRows(rows as HotelRow[])}
              rowCount={hotelRows.length}
            />
            <FileZone
              label="الباقات" labelEn="Packages"
              headers={PKG_HEADERS}
              sampleRows={PKG_SAMPLE}
              templateName="packages-template.csv"
              onParsed={(rows) => setPkgRows(rows as PackageRow[])}
              rowCount={pkgRows.length}
            />
          </motion.div>

          {totalRows > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h3 className="text-sm font-medium text-foreground/70 border-b border-white/10 pb-2">
                معاينة البيانات / Data Preview
              </h3>
              <PreviewTable title="الوجهات" rows={destRows as unknown as Record<string, string>[]} headers={DEST_HEADERS} />
              <PreviewTable title="الفنادق" rows={hotelRows as unknown as Record<string, string>[]} headers={HOTEL_HEADERS} />
              <PreviewTable title="الباقات" rows={pkgRows as unknown as Record<string, string>[]} headers={PKG_HEADERS} />

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {loading ? "جارٍ الاستيراد..." : `استيراد ${totalRows} صف`}
                </button>
                <span className="text-xs text-foreground/40">
                  {destRows.length} وجهات · {hotelRows.length} فنادق · {pkgRows.length} باقات
                </span>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 space-y-3 ${result.errors.length === 0 ? "border-green-500/30 bg-green-500/5" : "border-yellow-500/30 bg-yellow-500/5"}`}>
              <div className="flex items-center gap-2">
                {result.errors.length === 0
                  ? <CheckCircle className="w-4 h-4 text-green-400" />
                  : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                <span className="text-sm font-medium text-foreground">
                  {result.errors.length === 0 ? "تم الاستيراد بنجاح" : "اكتمل الاستيراد مع أخطاء"}
                </span>
              </div>
              <div className="flex gap-6 text-sm">
                <span className="text-foreground/60">✓ {result.destinations} وجهة</span>
                <span className="text-foreground/60">✓ {result.hotels} فندق</span>
                <span className="text-foreground/60">✓ {result.packages} باقة</span>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-foreground/50 font-medium">الأخطاء / Errors:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-yellow-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" /> {e}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="border border-white/10 rounded-lg p-4 space-y-3 bg-muted/10">
            <p className="text-xs font-medium text-foreground/50">تعليمات / Instructions</p>
            <ul className="space-y-1.5 text-xs text-foreground/40 list-none">
              <li>① قم بتنزيل قالب CSV لكل نوع بياني باستخدام زر "قالب CSV"</li>
              <li>② افتح الملف في Excel أو Google Sheets وأضف بياناتك</li>
              <li>③ احفظ الملف بصيغة CSV وارفعه هنا</li>
              <li>④ يجب أن يتطابق <code className="bg-muted px-1 rounded">slug</code> في الوجهات مع <code className="bg-muted px-1 rounded">destinationSlug</code> في الفنادق والباقات</li>
              <li>⑤ يجب أن يتطابق <code className="bg-muted px-1 rounded">nameEn</code> في الفنادق مع <code className="bg-muted px-1 rounded">hotelNameEn</code> في الباقات</li>
            </ul>
          </motion.div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
