"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ShieldCheck, Zap, Clock, BookOpen, Brain, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function PagoPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión primero.");
      router.push("/login");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          user_email: user.email,
        }),
      });

      const data = await response.json();

      if (response.ok && data.init_point) {
        // Redirigir al checkout de Mercado Pago
        window.location.href = data.init_point;
      } else {
        toast.error(data.error || "Error al iniciar el pago. Intenta nuevamente.");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error("Error de conexión. Verifica tu internet y vuelve a intentarlo.");
      setIsProcessing(false);
    }
  };

  const daysLeft = profile?.subscription_ends_at
    ? Math.ceil((new Date(profile.subscription_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isTrialExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Alert de acceso vencido */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-800">Tu período de prueba ha vencido</p>
              <p className="text-sm text-red-600 mt-0.5">Suscríbete para seguir accediendo a la plataforma.</p>
            </div>
          </div>
        )}

        {isTrialExpiring && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start">
            <Clock className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-amber-800">Tu acceso gratuito vence en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}</p>
              <p className="text-sm text-amber-600 mt-0.5">¡Suscríbete ahora para no perder el acceso!</p>
            </div>
          </div>
        )}

        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">EnferApp Pro</h1>
            <p className="text-blue-100 text-sm">Plataforma Educativa de Enfermería con IA</p>
          </div>

          {/* Precio */}
          <div className="text-center py-8 border-b border-slate-100">
            <div className="flex items-end justify-center">
              <span className="text-slate-500 text-lg font-medium mr-1">$</span>
              <span className="text-6xl font-black text-slate-900 leading-none">50.000</span>
              <span className="text-slate-500 ml-2 mb-1">ARS</span>
            </div>
            <p className="text-slate-500 mt-2 font-medium flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
              45 días de acceso completo
            </p>
          </div>

          {/* Beneficios */}
          <div className="p-6 space-y-3">
            {[
              { icon: Brain, text: "Asistente IA para procesar bibliografía médica" },
              { icon: BookOpen, text: "Simulador de Examen con corrección docente" },
              { icon: Zap, text: "Escaneo y corrección de exámenes por foto" },
              { icon: CheckCircle2, text: "Fichas y resúmenes guardados en la nube" },
              { icon: ShieldCheck, text: "Acceso sin publicidad en todos tus dispositivos" },
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-slate-700 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Medios de pago */}
          <div className="px-6 pb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Medios de pago aceptados</p>
            <div className="flex flex-wrap gap-2">
              {["Tarjeta de Crédito", "Tarjeta de Débito", "Transferencia MP", "Rapipago", "Pago Fácil"].map(m => (
                <span key={m} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">{m}</span>
              ))}
            </div>
          </div>

          {/* Botón de pago */}
          <div className="p-6 pt-4">
            <button
              onClick={handlePay}
              disabled={isProcessing || loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-lg flex items-center justify-center transition-all shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Redirigiendo a Mercado Pago...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  Pagar Suscripción — $50.000 ARS
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">
              🔒 Pago seguro procesado por Mercado Pago. Tu acceso se activa automáticamente.
            </p>
          </div>
        </div>

        {/* Si aún está en período de prueba, ofrecer volver */}
        {!isExpired && (
          <div className="text-center mt-6">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
            >
              Volver al inicio (acceso de prueba activo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
