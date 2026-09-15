"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactNode;
}

export default function SubscriptionGuard({ children }: Props) {
  // BYPASS TEMPORAL: Permitir acceso a todos para probar
  return <>{children}</>;
}
