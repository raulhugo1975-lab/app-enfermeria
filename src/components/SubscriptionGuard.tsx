"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: Props) {
  const { profile, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Si no hay usuario autenticado, redirigir al login
    if (!user) {
      router.push("/login");
      return;
    }

    // Admins tienen acceso ilimitado
    if (profile?.role === "admin") return;

    // Verificar si la suscripción está activa
    if (profile) {
      const isActive = profile.is_active !== false; // undefined o true = activo
      const hasSubscription = profile.subscription_ends_at
        ? new Date(profile.subscription_ends_at) > new Date()
        : false;

      if (!isActive || !hasSubscription) {
        router.push("/pago");
      }
    }
  }, [profile, user, loading, router]);

  // Mostrar contenido solo si el acceso es válido
  if (loading) return null;
  if (!user) return null;
  if (profile?.role === "admin") return <>{children}</>;

  const hasAccess =
    profile?.is_active !== false &&
    profile?.subscription_ends_at &&
    new Date(profile.subscription_ends_at) > new Date();

  if (!hasAccess) return null;

  return <>{children}</>;
}
