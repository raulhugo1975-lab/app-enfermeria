"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

export default function PagoPendientePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Pago en proceso</h1>
        <p className="text-slate-500 mb-3">
          Tu pago está siendo verificado por Mercado Pago. Esto puede tardar algunos minutos.
        </p>
        <p className="text-slate-400 text-sm mb-8">
          Tu acceso se activará automáticamente en cuanto el pago sea confirmado. No necesitas hacer nada más.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
