import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe, getGetAdminMeQueryKey } from "@workspace/api-client-react";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: me, isLoading, error } = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      retry: false,
    },
  });

  useEffect(() => {
    if (!isLoading && (error || !me)) {
      setLocation("/admin/login");
    }
  }, [isLoading, error, me, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !me) {
    return null;
  }

  return <>{children}</>;
}
