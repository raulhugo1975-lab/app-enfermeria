"use client";

import { XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function PagoErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-3">Pago no completado</h1>
        <p className="text-slate-500 mb-8">El pago fue cancelado o hubo un error. No se realizó ningún cobro. Podés intentarlo nuevamente.</p>
        <Link
          href="/pago"
          className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-colors"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Reintentar pago
        </Link>
      </div>
    </div>
  );
}
