import { motion } from "framer-motion";
import { MapPin, Building2, Package, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminGuard } from "@/components/AdminGuard";

function StatCard({ label, labelEn, value, icon: Icon, index }: {
  label: string; labelEn: string; value: number; icon: typeof MapPin; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-card border border-white/10 p-5"
      data-testid={`stat-admin-${labelEn.toLowerCase().replace(/ /g, '-')}`}
    >
      <div className="flex items-start justify-between mb-3">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="font-serif text-3xl text-foreground font-semibold mb-1">{value}</div>
      <div className="text-foreground/50 text-sm">{label}</div>
      <div className="text-foreground/30 text-xs">{labelEn}</div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() },
  });

  return (
    <AdminGuard>
      <AdminLayout title="لوحة التحكم" titleEn="Dashboard">
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-muted animate-pulse" />)}
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="الوجهات" labelEn="Destinations" value={Number(stats.totalDestinations)} icon={MapPin} index={0} />
              <StatCard label="الفنادق" labelEn="Hotels" value={Number(stats.totalHotels)} icon={Building2} index={1} />
              <StatCard label="إجمالي الباقات" labelEn="Total Packages" value={Number(stats.totalPackages)} icon={Package} index={2} />
              <StatCard label="الباقات النشطة" labelEn="Active Packages" value={Number(stats.activePackages)} icon={CheckCircle} index={3} />
            </div>

            {/* Destinations Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-white/10"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="font-serif text-foreground text-base">توزيع الباقات حسب الوجهة</h2>
                <Link
                  href="/admin/destinations"
                  className="text-primary text-xs flex items-center gap-1 hover:underline"
                  data-testid="link-manage-destinations"
                >
                  إدارة <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-foreground/40">
                      <th className="text-right p-3 font-medium">الوجهة</th>
                      <th className="text-right p-3 font-medium">الفنادق</th>
                      <th className="text-right p-3 font-medium">الباقات</th>
                      <th className="text-right p-3 font-medium" />
                    </tr>
                  </thead>
                  <tbody>
                    {stats.destinations.map((d, i) => (
                      <motion.tr
                        key={d.slug}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="border-b border-white/5 hover:bg-muted/30 transition-colors"
                        data-testid={`row-dest-${d.slug}`}
                      >
                        <td className="p-3 text-foreground">{d.nameEn}</td>
                        <td className="p-3 text-foreground/60">{d.hotelCount}</td>
                        <td className="p-3 text-foreground/60">{d.packageCount}</td>
                        <td className="p-3">
                          <Link
                            href={`/admin/packages?destinationSlug=${d.slug}`}
                            className="text-primary/60 hover:text-primary text-xs"
                          >
                            عرض
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        ) : null}
      </AdminLayout>
    </AdminGuard>
  );
}
