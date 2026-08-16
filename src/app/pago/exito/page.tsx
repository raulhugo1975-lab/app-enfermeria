"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PagoExitoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">¡Pago exitoso!</h1>
        <p className="text-slate-500 mb-2">Tu suscripción de <strong>45 días</strong> está activa.</p>
        <p className="text-slate-400 text-sm mb-8">El acceso se actualiza automáticamente. Podés comenzar a estudiar ahora mismo.</p>
        <Link
          href="/estudio"
          className="inline-flex items-center px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors"
        >
          Ir al Asistente IA
          <ArrowRight className="h-5 w-5 ml-2" />
        </Link>
      </div>
    </div>
  );
}
