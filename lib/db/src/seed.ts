import { db, destinationsTable, hotelsTable, packagesTable, pricingSettingsTable } from "@workspace/db";
import { count } from "drizzle-orm";

const RATE = 0.7085;

function usdPerNight(totalJod: number, nights: number): number {
  return totalJod / nights / RATE;
}

async function seed() {
  const [{ cnt }] = await db.select({ cnt: count() }).from(destinationsTable) as [{ cnt: number }];
  if (Number(cnt) > 0) {
    console.log(`Already seeded (${cnt} destinations). Skipping.`);
    return;
  }

  // Ensure pricing settings exist
  const settings = await db.select().from(pricingSettingsTable).limit(1);
  if (!settings[0]) {
    await db.insert(pricingSettingsTable).values({
      ticketPriceJod: "150",
      transportJod: "30",
      fixedProfitJod: "50",
      profitPct: "15",
      rateUsdToJod: "0.7085",
      rateEurToJod: "0.78",
      rateSarToJod: "0.189",
    });
    console.log("Inserted default pricing settings");
  }

  // ── DESTINATIONS ────────────────────────────────────────────────────────────
  const dests = await db.insert(destinationsTable).values([
    {
      slug: "bali",
      nameAr: "بالي",
      nameEn: "Bali",
      country: "Indonesia",
      flag: "🇮🇩",
      heroImage: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80",
      descriptionAr: "جزيرة الآلهة — وجهة العشاق والعائلات بين مناظر الأرز الخضراء والمعابد الباليّة",
      descriptionEn: "Island of the Gods — terraced rice fields, ancient temples, and pristine beaches",
      isActive: true,
      isFeatured: true,
      sortOrder: 1,
      ticketPriceJod: null,
    },
    {
      slug: "malaysia",
      nameAr: "ماليزيا",
      nameEn: "Malaysia",
      country: "Malaysia",
      flag: "🇲🇾",
      heroImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&q=80",
      descriptionAr: "تنوع ثقافي ساحر بين ناطحات كوالالمبور وشواطئ لنكاوي الذهبية",
      descriptionEn: "A vibrant blend of cultures, from Kuala Lumpur's skyline to Langkawi's golden beaches",
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
      ticketPriceJod: null,
    },
    {
      slug: "maldives",
      nameAr: "جزر المالديف",
      nameEn: "Maldives",
      country: "Maldives",
      flag: "🇲🇻",
      heroImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=80",
      descriptionAr: "ملاذ الرومانسية والرفاهية — فلل فوق المياه الفيروزية الصافية",
      descriptionEn: "Ultimate romance and luxury — overwater villas above crystal-clear turquoise lagoons",
      isActive: true,
      isFeatured: true,
      sortOrder: 3,
      ticketPriceJod: null,
    },
    {
      slug: "singapore",
      nameAr: "سنغافورة",
      nameEn: "Singapore",
      country: "Singapore",
      flag: "🇸🇬",
      heroImage: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80",
      descriptionAr: "مدينة المستقبل — تسوق وترفيه وغابات في قلب آسيا",
      descriptionEn: "The city of the future — world-class shopping, gardens, and iconic skylines",
      isActive: true,
      isFeatured: false,
      sortOrder: 4,
      ticketPriceJod: null,
    },
    {
      slug: "thailand",
      nameAr: "تايلاند",
      nameEn: "Thailand",
      country: "Thailand",
      flag: "🇹🇭",
      heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      descriptionAr: "أرض الابتسامة — شواطئ فوكيت الساحرة وروعة معابد بانكوك",
      descriptionEn: "Land of Smiles — Phuket's pristine beaches and Bangkok's magnificent temples",
      isActive: true,
      isFeatured: true,
      sortOrder: 5,
      ticketPriceJod: null,
    },
    {
      slug: "vietnam",
      nameAr: "فيتنام",
      nameEn: "Vietnam",
      country: "Vietnam",
      flag: "🇻🇳",
      heroImage: "https://images.unsplash.com/photo-1474303032768-dfc0e5b7e71b?w=1200&q=80",
      descriptionAr: "لآلئ الشرق — خليج هالونج وحقول الأرز وشواطئ دا نانغ الرائعة",
      descriptionEn: "Pearl of the Orient — Ha Long Bay, vibrant cities, and the beaches of Da Nang",
      isActive: true,
      isFeatured: true,
      sortOrder: 6,
      ticketPriceJod: null,
    },
    {
      slug: "georgia",
      nameAr: "جورجيا",
      nameEn: "Georgia",
      country: "Georgia",
      flag: "🇬🇪",
      heroImage: "https://images.unsplash.com/photo-1580499340591-a8aa45bb5254?w=1200&q=80",
      descriptionAr: "جوهرة القوقاز — باتومي الساحلية وتبليسي التاريخية وجبال القوقاز الشاهقة",
      descriptionEn: "Gem of the Caucasus — Batumi's beaches, Tbilisi's old city, and the Caucasus mountains",
      isActive: true,
      isFeatured: true,
      sortOrder: 7,
      ticketPriceJod: "0",
    },
    {
      slug: "sharm",
      nameAr: "شرم الشيخ",
      nameEn: "Sharm el-Sheikh",
      country: "Egypt",
      flag: "🇪🇬",
      heroImage: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80",
      descriptionAr: "لؤلؤة البحر الأحمر — شواطئ ساحرة وشعاب مرجانية لا مثيل لها",
      descriptionEn: "Pearl of the Red Sea — world-class diving, pristine beaches, and luxury resorts",
      isActive: true,
      isFeatured: true,
      sortOrder: 8,
      ticketPriceJod: null,
    },
    {
      slug: "istanbul",
      nameAr: "إسطنبول",
      nameEn: "Istanbul",
      country: "Turkey",
      flag: "🇹🇷",
      heroImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=80",
      descriptionAr: "مدينة القارتين — آيا صوفيا والبازار الكبير وشلالات البوسفور الأسطورية",
      descriptionEn: "City of two continents — Hagia Sophia, the Grand Bazaar, and the majestic Bosphorus",
      isActive: true,
      isFeatured: true,
      sortOrder: 9,
      ticketPriceJod: null,
    },
    {
      slug: "trabzon",
      nameAr: "طرابزون",
      nameEn: "Trabzon",
      country: "Turkey",
      flag: "🇹🇷",
      heroImage: "https://images.unsplash.com/photo-1578791478484-f5d8e0a7c0cb?w=1200&q=80",
      descriptionAr: "بحر الأسود وجبال البونطوس — طبيعة خلابة وتراث عريق وهواء نقي",
      descriptionEn: "Black Sea coast and Pontic mountains — breathtaking nature and rich heritage",
      isActive: true,
      isFeatured: false,
      sortOrder: 10,
      ticketPriceJod: null,
    },
    {
      slug: "antalya",
      nameAr: "أنطاليا",
      nameEn: "Antalya",
      country: "Turkey",
      flag: "🇹🇷",
      heroImage: "https://images.unsplash.com/photo-1636735048809-6ef5e0e94a32?w=1200&q=80",
      descriptionAr: "ريفيرا المتوسط — فنادق أول لاين وعروض Ultra All-Inclusive بلا منافس",
      descriptionEn: "Turkish Riviera — first-line Ultra All-Inclusive resorts on the Mediterranean",
      isActive: true,
      isFeatured: false,
      sortOrder: 11,
      ticketPriceJod: null,
    },
    {
      slug: "aqaba",
      nameAr: "العقبة",
      nameEn: "Aqaba",
      country: "Jordan",
      flag: "🇯🇴",
      heroImage: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&q=80",
      descriptionAr: "جوهرة البحر الأحمر الأردنية — شعاب مرجانية نادرة ومنتجعات فاخرة في قلب العقبة",
      descriptionEn: "Jordan's Red Sea jewel — vibrant coral reefs and luxury resorts in a sun-kissed city",
      isActive: true,
      isFeatured: false,
      sortOrder: 12,
      ticketPriceJod: "0",
    },
  ]).returning();

  const destMap: Record<string, number> = {};
  for (const d of dests) destMap[d.slug] = d.id;

  console.log(`Inserted ${dests.length} destinations`);

  // ── HELPER ──────────────────────────────────────────────────────────────────
  async function insertHotelPackage(
    destSlug: string,
    hotelName: string,
    hotelNameAr: string,
    stars: number,
    area: string | null,
    nights: number,
    basePriceUsd: number,
    currency: string,
    mealPlan: string,
    roomType: string,
    dateFrom?: string | null,
    dateTo?: string | null,
  ) {
    const destId = destMap[destSlug];
    const [hotel] = await db.insert(hotelsTable).values({
      destinationId: destId,
      nameAr: hotelNameAr,
      nameEn: hotelName,
      stars,
      area,
      isActive: true,
    }).returning();
    await db.insert(packagesTable).values({
      hotelId: hotel.id,
      destinationId: destId,
      nights,
      mealPlan,
      roomType,
      basePriceUsd: String(Math.round(basePriceUsd * 100) / 100),
      currency,
      isActive: true,
      dateFrom: dateFrom ?? null,
      dateTo: dateTo ?? null,
    });
    return hotel;
  }

  // ── BALI ─────────────────────────────────────────────────────────────────────
  // basePriceUsd = baseJOD / nights / RATE (DMC total per person per night in USD)
  const baliPackages = [
    { name: "Rama Beach Villas & Aloft Bali", nights: 8, baseJod: 313, meal: "HB", room: "Family 5★ Deluxe", isHoney: false },
    { name: "Aryaduta & Monoloco Bali", nights: 7, baseJod: 311, meal: "BB", room: "Honeymoon Deluxe", isHoney: true },
    { name: "Discovery Kartika & Monteigo", nights: 7, baseJod: 277, meal: "BB", room: "Family 5★ Superior", isHoney: false },
    { name: "Bintang Resort & Komaneka", nights: 7, baseJod: 225, meal: "BB", room: "Family 4★ Deluxe", isHoney: false },
    { name: "Bali Beach Sanur & Komaneka", nights: 7, baseJod: 540, meal: "BB", room: "Honeymoon 5★ Sea View", isHoney: true },
    { name: "Pesona Alam + Novotel Bali", nights: 8, baseJod: 535, meal: "BB", room: "Honeymoon Economy", isHoney: true },
    { name: "Pesona Alam + Rama Beach + Novotel", nights: 8, baseJod: 483, meal: "BB", room: "Family 4★ Package", isHoney: false },
    { name: "Le Eminence + Discovery + Waka Gangga + Wyndham", nights: 8, baseJod: 641, meal: "BB", room: "Honeymoon 5★ Luxury", isHoney: true },
  ];
  for (const p of baliPackages) {
    const bpn = usdPerNight(p.baseJod, p.nights);
    await insertHotelPackage("bali", p.name, p.name, p.isHoney ? 5 : 4, "Bali", p.nights, bpn, "USD", p.meal, p.room);
  }
  console.log("Bali: done");

  // ── MALAYSIA ─────────────────────────────────────────────────────────────────
  const malaysiaPackages = [
    { name: "Selangor + Langkawi 5★ Beach (8N Honeymoon)", nights: 8, baseJod: 859, stars: 5, isHoney: true },
    { name: "Selangor + Langkawi 5★ (7N Honeymoon)", nights: 7, baseJod: 636, stars: 5, isHoney: true },
    { name: "Selangor + Langkawi Beach (8N Honeymoon)", nights: 8, baseJod: 758, stars: 5, isHoney: true },
    { name: "KL + Langkawi City (7N Honeymoon)", nights: 7, baseJod: 847, stars: 5, isHoney: true },
    { name: "Selangor + Langkawi 4★ (8N Honeymoon)", nights: 8, baseJod: 560, stars: 4, isHoney: true },
    { name: "Selangor + Langkawi Budget 4★ (7N Honeymoon)", nights: 7, baseJod: 503, stars: 4, isHoney: true },
    { name: "Selangor + Langkawi 5★ (7N Family)", nights: 7, baseJod: 450, stars: 5, isHoney: false },
    { name: "Selangor + Langkawi 5★ Beach (8N Family)", nights: 8, baseJod: 562, stars: 5, isHoney: false },
    { name: "Selangor + Langkawi 4★ (7N Family)", nights: 7, baseJod: 404, stars: 4, isHoney: false },
  ];
  for (const p of malaysiaPackages) {
    const bpn = usdPerNight(p.baseJod, p.nights);
    const room = p.isHoney ? "Honeymoon Package" : "Family Package";
    const meal = "BB";
    await insertHotelPackage("malaysia", p.name, p.name, p.stars, "Kuala Lumpur & Langkawi", p.nights, bpn, "USD", meal, room);
  }
  console.log("Malaysia: done");

  // ── MALDIVES ─────────────────────────────────────────────────────────────────
  const maldivesPackages = [
    { name: "Fihalhohi Island Resort", nameAr: "فيهالهوهي آيلاند ريزورت", nights: 4, baseJod: 700, stars: 4, room: "Honeymoon Economy Beach Villa" },
    { name: "Kandima Maldives", nameAr: "كانديما المالديف", nights: 4, baseJod: 618, stars: 5, room: "Family Studio" },
    { name: "Noi Maldives Overwater Villa", nameAr: "نوي المالديف — فيلا فوق الماء", nights: 4, baseJod: 530, stars: 5, room: "Family Overwater Bungalow" },
    { name: "Noi Maldives Honeymoon Suite", nameAr: "نوي المالديف — جناح شهر العسل", nights: 4, baseJod: 726, stars: 5, room: "Honeymoon 5★ Overwater Suite" },
  ];
  for (const p of maldivesPackages) {
    const bpn = usdPerNight(p.baseJod, p.nights);
    await insertHotelPackage("maldives", p.name, p.nameAr, p.stars, "Maldives", p.nights, bpn, "USD", "BB", p.room);
  }
  console.log("Maldives: done");

  // ── SINGAPORE ────────────────────────────────────────────────────────────────
  const singaporePackages = [
    { name: "One Farrer Hotel Singapore", nameAr: "ون فارر هوتيل سنغافورة", nights: 4, baseJod: 494, stars: 5, room: "Family 5★ Deluxe" },
    { name: "Holiday Inn Katong Singapore", nameAr: "هوليداي إن كاتونغ", nights: 5, baseJod: 675, stars: 4, room: "Honeymoon Economy Superior" },
    { name: "Holiday Inn Katong (4N Family)", nameAr: "هوليداي إن كاتونغ عائلي", nights: 4, baseJod: 405, stars: 4, room: "Family 4★ Superior" },
    { name: "One Farrer Hotel (Honeymoon)", nameAr: "ون فارر هوتيل — شهر العسل", nights: 4, baseJod: 494, stars: 5, room: "Honeymoon 5★ Suite" },
  ];
  for (const p of singaporePackages) {
    const bpn = usdPerNight(p.baseJod, p.nights);
    await insertHotelPackage("singapore", p.name, p.nameAr, p.stars, "Singapore", p.nights, bpn, "USD", "BB", p.room);
  }
  console.log("Singapore: done");

  // ── THAILAND ─────────────────────────────────────────────────────────────────
  const thailandPackages = [
    { name: "Marina Gallery Resort + Solitaire Bangkok (7N Family)", nights: 7, baseJod: 324, stars: 4, honey: false },
    { name: "Movenpick + The Senses + Barceló + Avani Bangkok (8N Family 5★)", nights: 8, baseJod: 480, stars: 5, honey: false },
    { name: "Marina Gallery + Malabar Villa + Solitaire Bangkok (7N Honeymoon)", nights: 7, baseJod: 407, stars: 4, honey: true },
    { name: "The Senses Resort + Movenpick Bangkok (7N Family 5★)", nights: 7, baseJod: 371, stars: 5, honey: false },
    { name: "Barceló + The Senses + Avani Bangkok (8N Family 5★ Luxury)", nights: 8, baseJod: 664, stars: 5, honey: false },
    { name: "The Senses + Wanaretrea + Movenpick (7N Honeymoon 5★)", nights: 7, baseJod: 555, stars: 5, honey: true },
    { name: "Marina Gallery + Solitaire Bangkok (8N Family Economy)", nights: 8, baseJod: 513, stars: 4, honey: false },
  ];
  for (const p of thailandPackages) {
    const bpn = usdPerNight(p.baseJod, p.nights);
    const room = p.honey ? "Honeymoon Package" : "Family Package";
    await insertHotelPackage("thailand", p.name, p.name, p.stars, "Phuket & Bangkok", p.nights, bpn, "USD", "BB", room);
  }
  console.log("Thailand: done");

  // ── VIETNAM ──────────────────────────────────────────────────────────────────
  const vietnamPackages = [
    { name: "Fraser Suites + Wyndham Golden Bay + The Five Residences", nameAr: "فراسر سويتس + وينداهام + ذا فايف ريزيدنسز", nights: 8, baseJod: 443, stars: 5, honey: false },
    { name: "Flora Center + Balcona Da Nang + FV Hotel Hanoi", nameAr: "فلورا سنتر + بالكونا دا نانغ + إف في هوتيل هانوي", nights: 8, baseJod: 408, stars: 4, honey: false },
    { name: "FV Hotel + Four Points Sheraton + Fusion Villas + Movenpick (Honeymoon 5★)", nameAr: "فيوجن فيلاز + فور بوينتس شيراتون + موفنبيك هانوي", nights: 8, baseJod: 700, stars: 5, honey: true },
    { name: "FV Hotel + Balcona Da Nang + Wyndham Garden Hanoi (Economy Honeymoon)", nameAr: "إف في هوتيل + بالكونا + وينداهام جاردن هانوي", nights: 8, baseJod: 484, stars: 4, honey: true },
    { name: "La Siesta + Wyndham Grand Phu Quoc + Movenpick Villas (Honeymoon 5★)", nameAr: "لا سيستا + وينداهام غراند فو كوك + موفنبيك فيلاز", nights: 8, baseJod: 700, stars: 5, honey: true },
    { name: "Park Royal + Sol Bay Melia + Melia Vinpearl Phu Quoc (Economy Honeymoon)", nameAr: "بارك رويال + سول باي ميليا + ميليا فينبرل فو كوك", nights: 8, baseJod: 555, stars: 4, honey: true },
  ];
  for (const p of vietnamPackages) {
    const bpn = usdPerNight(p.baseJod, p.nights);
    const room = p.honey ? "Honeymoon Package" : "Family Package";
    const area = p.baseJod >= 700 && String(p.name).includes("Phu Quoc") ? "Phu Quoc" : "Hanoi & Da Nang";
    await insertHotelPackage("vietnam", p.name, p.nameAr, p.stars, area, p.nights, bpn, "USD", "BB", room);
  }
  console.log("Vietnam: done");

  // ── GEORGIA (ticket included — dest ticketPriceJod=0) ───────────────────────
  // d = total JOD per person for 7 nights including Amman-Batumi ticket
  const georgiaPrograms = [
    { name: "Program 1 — Batumi 7 Nights", nameAr: "برنامج ١ — باتومي ٧ ليالي", d: 479, stars: 3 },
    { name: "Program 2 — Batumi & Tbilisi 7 Nights", nameAr: "برنامج ٢ — باتومي وتبليسي ٧ ليالي", d: 499, stars: 4 },
    { name: "Program 3 — Golden Tour Batumi 7 Nights", nameAr: "برنامج ٣ — جولة ذهبية باتومي ٧ ليالي", d: 499, stars: 4 },
    { name: "Program 4 — Batumi & Trabzon 7 Nights", nameAr: "برنامج ٤ — باتومي وطرابزون ٧ ليالي", d: 499, stars: 3 },
    { name: "Program 5 — Trabzon from Batumi 7 Nights", nameAr: "برنامج ٥ — طرابزون عبر باتومي ٧ ليالي", d: 479, stars: 3 },
    { name: "Program 6 — Trabzon Direct 7 Nights", nameAr: "برنامج ٦ — طرابزون مباشر ٧ ليالي", d: 479, stars: 3 },
    { name: "Program 7 — Batumi & Sochi 7 Nights", nameAr: "برنامج ٧ — باتومي وسوتشي ٧ ليالي", d: 779, stars: 5 },
  ];
  for (const p of georgiaPrograms) {
    // d is total JOD per person for 7 nights (includes ticket). ticketPriceJod=0 on dest.
    const bpn = usdPerNight(p.d, 7);
    await insertHotelPackage("georgia", p.name, p.nameAr, p.stars, "Batumi / Tbilisi", 7, bpn, "USD", "BB", "Program Package");
  }
  console.log("Georgia: done");

  // ── SHARM EL-SHEIKH ─────────────────────────────────────────────────────────
  // dbl = USD per person per night (double room, 7 nights)
  const sharmHotels: { name: string; stars: number; dbl: number; meal: string; room: string; df?: string; dt?: string }[] = [
    { name: "AA Amwaj Resort", stars: 5, dbl: 52, meal: "S.All", room: "Superior Room PV", df: "25.03.2026", dt: "30.04.2026" },
    { name: "Albatros Palace", stars: 5, dbl: 87, meal: "H.All", room: "Standard Room", df: "11.04.2026", dt: "30.04.2026" },
    { name: "Royal Albatros Moderna", stars: 5, dbl: 77, meal: "H.All", room: "Standard Room", df: "21.04.2026", dt: "30.04.2026" },
    { name: "Albatros Laguna Vista", stars: 5, dbl: 87, meal: "H.All", room: "Standard Room", df: "21.04.2026", dt: "30.04.2026" },
    { name: "Albatros Aqua Park", stars: 5, dbl: 82, meal: "H.All", room: "Standard Room", df: "21.04.2026", dt: "30.04.2026" },
    { name: "Aqua Blu Resort", stars: 4, dbl: 82, meal: "H.All", room: "Standard Room", df: "21.04.2026", dt: "30.04.2026" },
    { name: "Pickalbatros Laguna Club Resort", stars: 4, dbl: 67, meal: "H.All", room: "Standard Room", df: "09.04.2026", dt: "30.04.2026" },
    { name: "Albatros Royal Grand Sharm", stars: 5, dbl: 77, meal: "H.All", room: "Standard Room", df: "19.04.2026", dt: "30.04.2026" },
    { name: "Beach Albatros", stars: 4, dbl: 62, meal: "H.All", room: "Standard Room", df: "21.04.2026", dt: "30.04.2026" },
    { name: "Pickalbatros Luxury Suites Sharm", stars: 4, dbl: 67, meal: "H.All", room: "Deluxe Room", df: "21.04.2026", dt: "30.04.2026" },
    { name: "Pickalbatros Golf Beach Resort Sharm", stars: 4, dbl: 67, meal: "H.All", room: "Superior Room", df: "09.04.2026", dt: "30.04.2026" },
    { name: "Aurora Oriental Resort", stars: 5, dbl: 52, meal: "All", room: "Standard Room", df: "26.04.2026", dt: "26.05.2026" },
    { name: "Amarina Sun Resort & Aqua Park", stars: 5, dbl: 52, meal: "All", room: "Standard Room", df: "05.04.2026", dt: "30.04.2026" },
    { name: "Amarina Star Resort & Aqua Park", stars: 5, dbl: 57, meal: "All", room: "Standard Room", df: "05.04.2026", dt: "30.04.2026" },
    { name: "Baron Palms", stars: 5, dbl: 140, meal: "All", room: "Classic Room", df: "01.04.2026", dt: "27.04.2026" },
    { name: "Baron Resort Sharm", stars: 5, dbl: 152, meal: "All", room: "Classic Room", df: "01.04.2026", dt: "27.04.2026" },
    { name: "Charmillion Club Aqua Park", stars: 5, dbl: 72, meal: "S.All", room: "Standard Room", df: "21.04.2026", dt: "25.05.2026" },
    { name: "Charmillion Club Resort", stars: 5, dbl: 67, meal: "S.All", room: "Superior Room", df: "21.04.2026", dt: "25.05.2026" },
    { name: "Charmillion Gardens Resort", stars: 5, dbl: 72, meal: "S.All", room: "Superior Room", df: "21.04.2026", dt: "25.05.2026" },
    { name: "Charmillion Sea Life", stars: 5, dbl: 62, meal: "S.All", room: "Standard Room", df: "21.04.2026", dt: "25.05.2026" },
    { name: "Cleopatra Luxury Resort", stars: 5, dbl: 82, meal: "S.All", room: "Superior Garden Room", df: "25.03.2026", dt: "08.04.2026" },
    { name: "Cleopatra Luxury Adult Only", stars: 5, dbl: 82, meal: "S.All", room: "Superior Garden Room", df: "25.03.2026", dt: "08.04.2026" },
    { name: "Coral Sea Aqua Club", stars: 4, dbl: 77, meal: "S.All", room: "Standard Room", df: "14.04.2026", dt: "30.04.2026" },
    { name: "Coral Sea Holidays", stars: 5, dbl: 92, meal: "S.All", room: "Standard Room", df: "14.04.2026", dt: "30.04.2026" },
    { name: "Coral Sea Sensatori", stars: 5, dbl: 127, meal: "S.All", room: "Standard Room", df: "14.04.2026", dt: "30.04.2026" },
    { name: "Coral Sea Waterworld", stars: 5, dbl: 92, meal: "S.All", room: "Standard Room", df: "14.04.2026", dt: "30.04.2026" },
    { name: "Continental Plaza Beach Resort", stars: 4, dbl: 62, meal: "S.All", room: "Standard Room", df: "01.05.2026", dt: "24.05.2026" },
    { name: "Dive Inn Sharm", stars: 4, dbl: 33, meal: "S.All", room: "Standard Room", df: "20.04.2026", dt: "30.04.2026" },
    { name: "Dreams Beach Resort", stars: 5, dbl: 67, meal: "S.All", room: "Standard Room", df: "05.04.2026", dt: "14.04.2026" },
    { name: "Dreams Vacation Resort", stars: 4, dbl: 67, meal: "S.All", room: "Standard Room", df: "20.03.2026", dt: "27.03.2026" },
    { name: "Grand Oasis Resort", stars: 4, dbl: 57, meal: "G-Class", room: "Standard Room GV", df: "07.04.2026", dt: "30.04.2026" },
    { name: "Grand Rotana Sharm", stars: 5, dbl: 92, meal: "S.All", room: "Standard Room", df: "24.03.2026", dt: "30.04.2026" },
    { name: "Il Mercato Hotel & Spa", stars: 5, dbl: 47, meal: "S.All", room: "Standard Room", df: "16.04.2026", dt: "30.04.2026" },
    { name: "Ivy Cyrene Island Resort", stars: 4, dbl: 47, meal: "S.All", room: "Standard Room", df: "30.04.2025", dt: "21.05.2026" },
    { name: "Ivy Cyrene Sharm Resort", stars: 4, dbl: 47, meal: "S.All", room: "Standard Room", df: "30.04.2025", dt: "21.05.2026" },
    { name: "Jaz Dreams Resort", stars: 5, dbl: 64, meal: "S.All", room: "Superior Room", df: "16.04.2026", dt: "23.05.2026" },
    { name: "Jaz Fayrouz Resort", stars: 4, dbl: 82, meal: "S.All", room: "Superior Room", df: "22.04.2026", dt: "30.04.2026" },
    { name: "Invidia Coral Beach Tiran", stars: 4, dbl: 72, meal: "All", room: "Classic Garden View", df: "01.04.2026", dt: "30.04.2026" },
    { name: "Lido Sharm Hotel", stars: 4, dbl: 47, meal: "S.All", room: "Superior Garden View", df: "26.04.2026", dt: "30.04.2026" },
    { name: "Maritim Jolie Ville Resort", stars: 5, dbl: 97, meal: "S.All", room: "Preferred Room", df: "04.04.2026", dt: "18.04.2026" },
    { name: "Marina Sharm Hotel", stars: 4, dbl: 72, meal: "S.All", room: "Superior Sea View", df: "27.03.2026", dt: "09.04.2026" },
    { name: "Movenpick Resort Sharm", stars: 5, dbl: 102, meal: "S.All", room: "Partial Sea View Room", df: "01.04.2026", dt: "30.04.2026" },
    { name: "Naama Bay Hotel", stars: 5, dbl: 60, meal: "S.All", room: "Standard Room", df: "23.04.2026", dt: "22.05.2026" },
    { name: "Naama Waves Hotel", stars: 5, dbl: 50, meal: "S.All", room: "Standard Room", df: "23.04.2026", dt: "22.05.2026" },
    { name: "Novotel Beach Side Sharm", stars: 5, dbl: 112, meal: "S.All", room: "Standard Room", df: "24.03.2026", dt: "30.04.2026" },
    { name: "Novotel Palm Side Sharm", stars: 4, dbl: 107, meal: "S.All", room: "Standard Room", df: "24.03.2026", dt: "30.04.2026" },
    { name: "Nubian Island Hotel", stars: 5, dbl: 93, meal: "S.All", room: "Superior Garden View", df: "28.04.2026", dt: "24.05.2026" },
    { name: "Nubian Village Resort", stars: 5, dbl: 87, meal: "S.All", room: "Superior Garden View", df: "28.04.2026", dt: "24.05.2026" },
    { name: "Old Vic Resort Sharm", stars: 4, dbl: 37, meal: "S.All", room: "Standard Room", df: "26.03.2026", dt: "23.05.2026" },
    { name: "Panorama Naama Heights", stars: 4, dbl: 28, meal: "S.All", room: "Standard Room", df: "21.04.2026", dt: "24.05.2026" },
    { name: "Palam Di Sharm Resort & Aqua Park", stars: 4, dbl: 37, meal: "S.All", room: "Standard Room", df: "25.03.2026", dt: "30.04.2026" },
    { name: "Park Regency Sharm", stars: 5, dbl: 82, meal: "S.All", room: "Sea View Room", df: "05.04.2026", dt: "30.04.2026" },
    { name: "Parrotel Beach Resort", stars: 5, dbl: 67, meal: "S.All", room: "Standard Room", df: "08.04.2026", dt: "30.04.2026" },
    { name: "Parrotel Lagoon Resort", stars: 5, dbl: 47, meal: "S.All", room: "Standard Room", df: "05.04.2026", dt: "24.05.2026" },
    { name: "Promenade Beach Resort", stars: 5, dbl: 67, meal: "S.All", room: "Superior Garden View", df: "22.04.2026", dt: "24.05.2026" },
    { name: "Promenade Mountain Side", stars: 4, dbl: 52, meal: "S.All", room: "Garden View Room", df: "22.04.2026", dt: "24.05.2026" },
    { name: "V Hotel Sharm El Sheikh", stars: 5, dbl: 102, meal: "S.All", room: "Premium Garden View", df: "08.04.2026", dt: "23.05.2026" },
    { name: "Reef Oasis Beach Resort", stars: 5, dbl: 127, meal: "H.All", room: "Superior Garden View", df: "19.03.2026", dt: "08.04.2026" },
    { name: "Reef Oasis Blue Bay", stars: 5, dbl: 127, meal: "H.All", room: "Superior Garden View", df: "19.03.2026", dt: "08.04.2026" },
    { name: "Regency Plaza Aqua Park", stars: 5, dbl: 62, meal: "S.All", room: "Standard Room", df: "21.04.2026", dt: "25.05.2026" },
    { name: "Renaissance Golden View Sharm", stars: 5, dbl: 65, meal: "S.All", room: "Deluxe Room", df: "05.04.2026", dt: "24.05.2026" },
    { name: "Romance Regency Plaza", stars: 5, dbl: 67, meal: "U.All", room: "Standard Room", df: "09.04.2026", dt: "25.05.2026" },
    { name: "Rehana Royal Beach Resort Aqua Park", stars: 5, dbl: 70, meal: "S.Premium UAll", room: "Deluxe Room", df: "18.04.2026", dt: "25.05.2026" },
    { name: "Rehana Sharm Resort Aqua Park", stars: 5, dbl: 52, meal: "S.Premium UAll", room: "Deluxe Room", df: "24.03.2026", dt: "09.04.2026" },
    { name: "Royal Regency Club Sharm", stars: 5, dbl: 72, meal: "S.All", room: "Standard Room", df: "21.04.2026", dt: "25.05.2026" },
    { name: "Royal Savoy Sharm", stars: 5, dbl: 148, meal: "EC", room: "Royal Savoy Room", df: "10.04.2026", dt: "30.04.2026" },
    { name: "Safir Water Falls Sharm", stars: 5, dbl: 54, meal: "S.All", room: "Standard Room", df: "28.03.2026", dt: "25.05.2026" },
    { name: "Savoy Sharm Hotel", stars: 5, dbl: 103, meal: "EC", room: "Garden View Room", df: "10.04.2026", dt: "30.04.2026" },
    { name: "Sea Beach Aqua Park", stars: 4, dbl: 82, meal: "S.All", room: "Standard Room", df: "25.03.2026", dt: "24.05.2026" },
    { name: "Sierra Sharm Resort", stars: 4, dbl: 67, meal: "Premium All", room: "Garden View Room", df: "06.04.2026", dt: "30.04.2026" },
    { name: "Sentido Reef Oasis Sharm", stars: 4, dbl: 107, meal: "H.All", room: "Superior Garden View", df: "26.04.2026", dt: "25.05.2026" },
    { name: "Sharm Bride Resort", stars: 3, dbl: 42, meal: "S.All", room: "Standard Room", df: "25.03.2026", dt: "30.04.2026" },
    { name: "Sheraton Sharm Main Building", stars: 5, dbl: 60, meal: "S.All", room: "Standard Sea View", df: "29.03.2026", dt: "30.04.2026" },
    { name: "Steigenberger Al Cazar Sharm", stars: 5, dbl: 218, meal: "U.All", room: "Superior Room", df: "27.02.2026", dt: "20.04.2026" },
    { name: "Stella Di Mare Sharm", stars: 5, dbl: 82, meal: "S.All", room: "Deluxe Sea View", df: "24.03.2026", dt: "30.04.2026" },
    { name: "Sultan Gardens Resort", stars: 5, dbl: 100, meal: "Ultra All", room: "Select Garden View", df: "01.04.2026", dt: "30.04.2026" },
    { name: "Sunrise Arabian Beach Resort", stars: 5, dbl: 123, meal: "All", room: "Superior Room (GV-PV-PSV)", df: "23.03.2026", dt: "08.04.2026" },
    { name: "Sunrise Diamond Beach Resort", stars: 5, dbl: 123, meal: "All", room: "Superior Room (GV-PV-PSV)", df: "23.03.2026", dt: "08.04.2026" },
    { name: "Sunrise Meraki Resort", stars: 5, dbl: 163, meal: "All", room: "Gypster Room", df: "23.03.2026", dt: "30.04.2026" },
    { name: "Sunrise Montemare Resort", stars: 5, dbl: 113, meal: "All", room: "Superior Room (GV-PSV)", df: "23.03.2026", dt: "08.04.2026" },
    { name: "Sunrise Remal Beach Resort", stars: 5, dbl: 178, meal: "All", room: "Standard Suite (GV-PSV)", df: "23.03.2026", dt: "01.04.2026" },
    { name: "Sunrise Remal Resort", stars: 5, dbl: 79, meal: "All", room: "Standard Room", df: "23.03.2026", dt: "30.04.2026" },
    { name: "Sunrise White Hills Resort", stars: 5, dbl: 180, meal: "All", room: "Superior Room (GV-PV-PSV)", df: "23.03.2026", dt: "08.04.2026" },
    { name: "Tivoli Hotel Sharm", stars: 4, dbl: 24, meal: "S.All", room: "Standard Room", df: "06.01.2026", dt: "30.04.2026" },
    { name: "Xperience Kiroseiz Park Land", stars: 5, dbl: 72, meal: "S.All", room: "Standard Room", df: "25.04.2025", dt: "25.05.2026" },
    { name: "Xperience Sea Breeze", stars: 5, dbl: 72, meal: "S.All", room: "Standard Room", df: "25.04.2025", dt: "25.05.2026" },
    { name: "Xperience Kiroseiz Premier", stars: 5, dbl: 67, meal: "S.All", room: "Standard Room", df: "25.04.2025", dt: "25.05.2026" },
    { name: "Xperience St. George Hotel", stars: 4, dbl: 45, meal: "S.All", room: "Standard Room", df: "25.04.2025", dt: "25.05.2026" },
  ];
  for (const h of sharmHotels) {
    await insertHotelPackage("sharm", h.name, h.name, h.stars, "Sharm el-Sheikh", 7, h.dbl, "USD", h.meal, h.room, h.df, h.dt);
  }
  console.log("Sharm el-Sheikh: done");

  // ── ISTANBUL (5 nights May, dbl = USD total per person) ─────────────────────
  const istanbulHotels: { n: string; s: number; l: string; dbl: number }[] = [
    { n: "Yalta Hotel", s: 3, l: "Fatih", dbl: 93 },
    { n: "Monopol Hotel", s: 3, l: "Taksim", dbl: 108 },
    { n: "Grand Liza Hotel", s: 3, l: "Fatih", dbl: 113 },
    { n: "Ozbek Hotel", s: 3, l: "Fatih", dbl: 118 },
    { n: "Grand Ons Hotel", s: 3, l: "Fatih", dbl: 120 },
    { n: "Hamit Hotel", s: 3, l: "Fatih", dbl: 130 },
    { n: "Sim Hotel", s: 3, l: "Fatih", dbl: 130 },
    { n: "Grand Ant Hotel", s: 3, l: "Fatih", dbl: 135 },
    { n: "Vatan Asur / Marmaray Hotel", s: 4, l: "Fatih", dbl: 153 },
    { n: "Bristol Hotel (Standard)", s: 4, l: "Taksim", dbl: 153 },
    { n: "Bristol Hotel (Deluxe)", s: 4, l: "Taksim", dbl: 203 },
    { n: "Regard Sisli Hotel", s: 4, l: "Sisli", dbl: 155 },
    { n: "Grand Emin Hotel", s: 3, l: "Fatih", dbl: 158 },
    { n: "Icon Istanbul Hotel (Deluxe)", s: 4, l: "Sisli", dbl: 180 },
    { n: "Crestium Taksim Prive Hotel", s: 4, l: "Taksim", dbl: 183 },
    { n: "Taksim Express Hotel", s: 4, l: "Taksim", dbl: 188 },
    { n: "Cartoon Taksim Hotel", s: 4, l: "Taksim", dbl: 190 },
    { n: "Dora Pera Hotel", s: 4, l: "Taksim", dbl: 193 },
    { n: "The Biancho Hotel Pera", s: 4, l: "Taksim", dbl: 193 },
    { n: "Nevi Hotel", s: 4, l: "Istiklal", dbl: 193 },
    { n: "Cher Hotel (Deluxe)", s: 5, l: "Taksim", dbl: 195 },
    { n: "Grand Durmaz Hotel (Economy)", s: 4, l: "Fatih", dbl: 197 },
    { n: "Grand Durmaz Hotel (Standard)", s: 4, l: "Fatih", dbl: 212 },
    { n: "Four Sides Taksim Hotel", s: 4, l: "Taksim", dbl: 212 },
    { n: "Grand Yavuz Sultan Ahmet", s: 4, l: "Fatih", dbl: 220 },
    { n: "Konak Hotel (Superior)", s: 4, l: "Taksim", dbl: 225 },
    { n: "Gonen Taksim Hotel", s: 4, l: "Taksim", dbl: 224 },
    { n: "Golden Age Hotel", s: 4, l: "Taksim", dbl: 232 },
    { n: "Piya Sport Hotel", s: 4, l: "Fatih", dbl: 239 },
    { n: "Metropolitan Hotel Taksim", s: 4, l: "Taksim", dbl: 254 },
    { n: "Avantgard Urban Sisli", s: 4, l: "Sisli", dbl: 268 },
    { n: "Avantgard Urban Taksim", s: 4, l: "Taksim", dbl: 268 },
    { n: "The Craton Hotel (Superior)", s: 5, l: "Sisli", dbl: 268 },
    { n: "Arts Hotel Taksim (Superior)", s: 4, l: "Taksim", dbl: 271 },
    { n: "Titanic City Taksim (Superior)", s: 4, l: "Taksim", dbl: 305 },
    { n: "Ottoman's Life Deluxe Hotel", s: 5, l: "Fatih", dbl: 313 },
    { n: "Wyndham Old City Istanbul", s: 5, l: "Fatih", dbl: 313 },
    { n: "Ring Stone Bosphorus Hotel", s: 4, l: "Istiklal", dbl: 313 },
    { n: "Point Hotel Istanbul", s: 5, l: "Taksim", dbl: 345 },
    { n: "Renaissance Polat Bosphorus (Deluxe)", s: 5, l: "Besiktas", dbl: 377 },
    { n: "Crowne Plaza Old City Istanbul", s: 5, l: "Fatih", dbl: 431 },
    { n: "Divan Hotel (Superior City View)", s: 5, l: "Taksim", dbl: 630 },
    { n: "CVK Park Bosphorus Hotel", s: 5, l: "Taksim", dbl: 703 },
  ];
  for (const h of istanbulHotels) {
    // dbl is USD total per person for 5 nights; basePriceUsd = dbl / 5 (per night)
    await insertHotelPackage("istanbul", h.n, h.n, h.s, h.l, 5, h.dbl / 5, "USD", "BB", "Standard Room", "01.05.2026", "31.05.2026");
  }
  console.log("Istanbul: done");

  // ── TRABZON (7 nights May, n7dbl = USD total per person) ────────────────────
  const trabzonHotels: { n: string; s: number; dbl: number }[] = [
    { n: "Nazar Hotel", s: 3, dbl: 195 },
    { n: "City Port Hotel (City View — Early May)", s: 3, dbl: 213 },
    { n: "City Port Hotel (City View — Late May)", s: 3, dbl: 248 },
    { n: "City Port Hotel (Sea View — Early May)", s: 3, dbl: 248 },
    { n: "City Port Hotel (Sea View — Late May)", s: 3, dbl: 300 },
    { n: "White House Hotel (Garden View)", s: 3, dbl: 237 },
    { n: "White House Hotel (Partial Sea View)", s: 3, dbl: 248 },
    { n: "White House Hotel (Sea View)", s: 3, dbl: 276 },
    { n: "Peerless Villas (Standard King — Early May)", s: 4, dbl: 248 },
    { n: "Peerless Villas (Standard King — Late May)", s: 4, dbl: 265 },
    { n: "Peerless Villas (Deluxe Sea View Garden Terrace — Early May)", s: 4, dbl: 283 },
    { n: "Peerless Villas (Deluxe Sea View Garden Terrace — Late May)", s: 4, dbl: 300 },
    { n: "Peerless Villas (Deluxe Suite Sea View Balcony — Early May)", s: 4, dbl: 318 },
    { n: "Peerless Villas (Deluxe Suite Sea View Balcony — Late May)", s: 4, dbl: 335 },
    { n: "Peerless Villas (Premium Suite — Early May)", s: 4, dbl: 335 },
    { n: "Peerless Villas (Premium Suite — Late May)", s: 4, dbl: 353 },
    { n: "Peerless Villas (Elite Suite Sea View Balcony — Early May)", s: 4, dbl: 370 },
    { n: "Peerless Villas (Elite Suite Sea View Balcony — Late May)", s: 4, dbl: 388 },
    { n: "Peerless Villas (Executive Suite — Early May)", s: 4, dbl: 423 },
    { n: "Peerless Villas (Executive Suite — Late May)", s: 4, dbl: 458 },
    { n: "Peerless Villas (Roof Suite + Jacuzzi)", s: 4, dbl: 535 },
    { n: "Peerless Villas (Akyazi Suite + Jacuzzi — Early May)", s: 4, dbl: 500 },
    { n: "Peerless Villas (Blacksea Suite + Jacuzzi — Late May)", s: 4, dbl: 570 },
    { n: "Saylamlar Hotel", s: 4, dbl: 265 },
    { n: "Mell Hotel (Superior Sea View)", s: 4, dbl: 283 },
    { n: "Mell Hotel (Deluxe Sea View with Balcony)", s: 4, dbl: 300 },
    { n: "Funda Hotel (City View)", s: 4, dbl: 309 },
    { n: "Funda Hotel (Sea View)", s: 4, dbl: 344 },
    { n: "Usta Park Hotel", s: 4, dbl: 335 },
    { n: "Zorlu Grand Hotel Trabzon", s: 5, dbl: 527 },
    { n: "Ramada Plaza Trabzon (Deluxe Land View — Early May)", s: 5, dbl: 568 },
    { n: "Ramada Plaza Trabzon (Deluxe Land View — Late May)", s: 5, dbl: 609 },
    { n: "Ramada Plaza Trabzon (Deluxe Sea View — Early May)", s: 5, dbl: 692 },
    { n: "Ramada Plaza Trabzon (Deluxe Sea View — Late May)", s: 5, dbl: 733 },
  ];
  for (const h of trabzonHotels) {
    // dbl is USD total per person for 7 nights; basePriceUsd = dbl / 7
    await insertHotelPackage("trabzon", h.n, h.n, h.s, "Trabzon", 7, h.dbl / 7, "USD", "BB", "Standard Room", "01.05.2026", "31.05.2026");
  }
  console.log("Trabzon: done");

  // ── ANTALYA (7 nights, ppd = EUR/USD per person per night) ─────────────────
  const antalyaHotels: { area: string; name: string; stars: number; cur: string; ppd: number; meal: string }[] = [
    { area: "Lara & Kundu", name: "Grand Park Lara", stars: 5, cur: "EUR", ppd: 65, meal: "UALL" },
    { area: "Lara & Kundu", name: "Grand Park Lara (YCB)", stars: 5, cur: "EUR", ppd: 67, meal: "UALL" },
    { area: "Lara & Kundu", name: "Limak Lara Deluxe Hotel", stars: 5, cur: "EUR", ppd: 95, meal: "UALL" },
    { area: "Lara & Kundu", name: "Wyndham Garden Lara", stars: 5, cur: "EUR", ppd: 59, meal: "UALL" },
    { area: "Lara & Kundu", name: "Ramada Resort Lara", stars: 5, cur: "EUR", ppd: 65, meal: "UALL" },
    { area: "Lara & Kundu", name: "Titanic Deluxe Lara", stars: 5, cur: "EUR", ppd: 138, meal: "UALL" },
    { area: "Lara & Kundu", name: "Ducale Lara Hotel", stars: 5, cur: "EUR", ppd: 84, meal: "UALL" },
    { area: "Lara & Kundu", name: "Dima Biz Hotel", stars: 5, cur: "EUR", ppd: 60, meal: "ALL" },
    { area: "Lara & Kundu", name: "Grand Ring Hotel", stars: 4, cur: "EUR", ppd: 41, meal: "ALL" },
    { area: "Lara & Kundu", name: "Swandor Topkapi Palace", stars: 5, cur: "EUR", ppd: 89, meal: "UALL" },
    { area: "Lara & Kundu", name: "IC Green Palace Antalya", stars: 5, cur: "EUR", ppd: 113, meal: "UALL" },
    { area: "Lara & Kundu", name: "Royal Holiday Palace", stars: 5, cur: "EUR", ppd: 136, meal: "UALL" },
    { area: "Lara & Kundu", name: "Royal Seginus Hotel", stars: 5, cur: "EUR", ppd: 140, meal: "UALL" },
    { area: "Lara & Kundu", name: "Royal Wings Hotel", stars: 5, cur: "EUR", ppd: 107, meal: "UALL" },
    { area: "Belek", name: "Aydinbey Famous Resort", stars: 5, cur: "EUR", ppd: 45, meal: "ALL" },
    { area: "Belek", name: "Aydinbey Queen Palace", stars: 5, cur: "EUR", ppd: 45, meal: "UALL" },
    { area: "Belek", name: "Granada Luxury Belek", stars: 5, cur: "EUR", ppd: 134, meal: "UALL" },
    { area: "Belek", name: "Orange County Resort Belek", stars: 5, cur: "EUR", ppd: 64, meal: "UALL" },
    { area: "Belek", name: "Selectum Family Resort Belek", stars: 5, cur: "USD", ppd: 68, meal: "UALL" },
    { area: "Belek", name: "Eldar Garden Hotel", stars: 4, cur: "EUR", ppd: 50, meal: "UAI" },
    { area: "Belek", name: "Eldar Resort Hotel", stars: 4, cur: "EUR", ppd: 75, meal: "UAI" },
    { area: "Belek", name: "Sunland Resort Hotel", stars: 5, cur: "EUR", ppd: 80, meal: "UALL" },
    { area: "Kemer", name: "Orange County Resort Kemer", stars: 5, cur: "EUR", ppd: 64, meal: "UALL" },
    { area: "Kemer", name: "Dosinia Luxury Resort", stars: 5, cur: "EUR", ppd: 67, meal: "UALL" },
    { area: "Kemer", name: "Transatlantic Hotel Kemer", stars: 5, cur: "EUR", ppd: 65, meal: "UALL" },
    { area: "Kemer", name: "Miarosa Kemer Beach", stars: 5, cur: "EUR", ppd: 80, meal: "ALL" },
    { area: "Kemer", name: "Queens Park Göynük", stars: 5, cur: "EUR", ppd: 52, meal: "UALL" },
    { area: "Kemer", name: "Ma Biche Hotel Kemer", stars: 5, cur: "EUR", ppd: 80, meal: "ALL" },
    { area: "Kemer", name: "Crystal Boutique Hotel", stars: 5, cur: "EUR", ppd: 80, meal: "ALL" },
    { area: "Alanya & Side", name: "Crystal Admiral Resort", stars: 5, cur: "EUR", ppd: 35, meal: "ALL" },
    { area: "Alanya & Side", name: "Crystal Sunset Luxury", stars: 5, cur: "EUR", ppd: 35, meal: "ALL" },
    { area: "Alanya & Side", name: "Kirman Arycanda De Luxe", stars: 5, cur: "EUR", ppd: 77, meal: "UALL" },
    { area: "Alanya & Side", name: "Kirman Calyptus Resort", stars: 5, cur: "EUR", ppd: 77, meal: "UALL" },
    { area: "Alanya & Side", name: "Selectum Family Resort Side", stars: 5, cur: "USD", ppd: 68, meal: "UALL" },
  ];
  for (const h of antalyaHotels) {
    // ppd is EUR/USD per person per night (All-Inclusive basis)
    await insertHotelPackage("antalya", h.name, h.name, h.stars, h.area, 7, h.ppd, h.cur, h.meal, "Standard Room", "01.05.2026", "22.05.2026");
  }
  console.log("Antalya: done");

  // ── AQABA (3 nights, ticketPriceJod=0 on dest) ──────────────────────────────
  // weekday = JOD per double room per night; per person = weekday/2
  // basePriceUsd = (weekday/2) / RATE
  const aqabaHotels: { name: string; stars: number; weekday: number; meal: string }[] = [
    { name: "Tala Bay Residence Aqaba", stars: 3, weekday: 99, meal: "RO" },
    { name: "Luxotel Aqaba", stars: 3, weekday: 90, meal: "RO" },
    { name: "Grand Season Hotel Aqaba", stars: 3, weekday: 40, meal: "RO" },
    { name: "City Tower Hotel Aqaba", stars: 3, weekday: 50, meal: "RO" },
    { name: "Lacosta Hotel Aqaba", stars: 3, weekday: 55, meal: "RO" },
    { name: "Ishq Hotel Aqaba", stars: 3, weekday: 50, meal: "RO" },
    { name: "Hill Top Hotel Aqaba", stars: 3, weekday: 50, meal: "RO" },
    { name: "Diamond Palm Hotel Aqaba", stars: 3, weekday: 55, meal: "RO" },
    { name: "The Loft Hotel Aqaba", stars: 3, weekday: 45, meal: "RO" },
    { name: "Aqaba Gulf Hotel", stars: 3, weekday: 55, meal: "RO" },
    { name: "Saraya Abdeen Hotel Aqaba", stars: 3, weekday: 45, meal: "RO" },
    { name: "Aqua Vista Hotel Aqaba", stars: 3, weekday: 40, meal: "RO" },
    { name: "My Hotel Aqaba", stars: 3, weekday: 45, meal: "RO" },
    { name: "Al Raad Hotel Aqaba", stars: 3, weekday: 35, meal: "RO" },
    { name: "Grand Tala Bay Resort", stars: 5, weekday: 85, meal: "BB" },
    { name: "Mövenpick Resort & Spa Tala Bay", stars: 5, weekday: 180, meal: "BB" },
    { name: "Hyatt Regency Aqaba Ayla", stars: 5, weekday: 155, meal: "BB" },
    { name: "Kempinski Hotel Aqaba Red Sea", stars: 5, weekday: 180, meal: "BB" },
    { name: "InterContinental Aqaba Resort", stars: 5, weekday: 149, meal: "BB" },
    { name: "Mövenpick City Hotel Aqaba", stars: 5, weekday: 130, meal: "BB" },
    { name: "Al Manara a Luxury Collection Aqaba", stars: 5, weekday: 200, meal: "BB" },
    { name: "The Westin Saraya Aqaba", stars: 5, weekday: 170, meal: "BB" },
    { name: "DoubleTree by Hilton Aqaba", stars: 4, weekday: 130, meal: "BB" },
    { name: "Cloud 7 Hotel Aqaba", stars: 4, weekday: 110, meal: "BB" },
  ];
  for (const h of aqabaHotels) {
    const perPersonJod = h.weekday / 2;
    const bpn = perPersonJod / RATE;
    await insertHotelPackage("aqaba", h.name, h.name, h.stars, "Aqaba", 3, bpn, "USD", h.meal, "Double Room");
  }
  console.log("Aqaba: done");

  const [hCount] = await db.select({ cnt: count() }).from(hotelsTable) as [{ cnt: number }];
  const [pCount] = await db.select({ cnt: count() }).from(packagesTable) as [{ cnt: number }];
  console.log(`\n✓ Seed complete: ${dests.length} destinations, ${Number(hCount.cnt)} hotels, ${Number(pCount.cnt)} packages`);
}

seed().catch(console.error).finally(() => process.exit());
