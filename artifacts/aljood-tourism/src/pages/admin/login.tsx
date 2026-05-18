import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const login = useAdminLogin();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { data: { username, password } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries();
          setLocation("/admin");
        },
        onError: () => {
          toast({
            title: "بيانات الدخول غير صحيحة",
            description: "Invalid credentials",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground text-lg font-bold font-serif">ج</span>
          </div>
          <h1 className="font-serif text-2xl text-foreground">لوحة التحكم</h1>
          <p className="text-foreground/40 text-xs mt-1">Admin Panel · Al Jood Travel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-foreground/60 block mb-1.5">اسم المستخدم / Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-card border border-white/10 focus:border-primary text-foreground text-sm px-4 py-2.5 outline-none transition-colors"
              placeholder="admin"
              data-testid="input-username"
            />
          </div>
          <div>
            <label className="text-xs text-foreground/60 block mb-1.5">كلمة المرور / Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-card border border-white/10 focus:border-primary text-foreground text-sm px-4 py-2.5 outline-none transition-colors"
              placeholder="••••••••"
              data-testid="input-password"
            />
          </div>
          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 mt-2"
            data-testid="button-login"
          >
            {login.isPending ? "جاري الدخول..." : "دخول / Login"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-foreground/20 text-xs">
            بيانات الدخول الافتراضية: admin / admin2024
          </p>
        </div>
      </div>
    </div>
  );
}
