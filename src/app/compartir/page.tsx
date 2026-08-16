"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Check, Users, ArrowLeft, Link2 } from "lucide-react";
import { toast } from "sonner";

export default function CompartirPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const referralLink = user ? `${appUrl}/registro?ref=${user.id}` : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({
          title: "EnferApp — Plataforma de Enfermería con IA",
          text: "Registrate con mi enlace y obtené 7 días de acceso gratuito 🎓",
          url: referralLink,
        });
      } catch (_) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  if (loading) return null;

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
          <Share2 className="h-8 w-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Invitar Compañeros</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Comparte tu enlace. Cada compañero que se registre obtiene{" "}
          <span className="font-bold text-indigo-600">7 días de acceso gratuito</span>.
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center mb-6">
        <div className="p-4 bg-white rounded-xl border-4 border-indigo-100 shadow-inner mb-4">
          {referralLink ? (
            <QRCodeSVG
              value={referralLink}
              size={180}
              bgColor="#ffffff"
              fgColor="#1d4ed8"
              level="M"
            />
          ) : (
            <div className="w-44 h-44 bg-slate-100 rounded-lg animate-pulse" />
          )}
        </div>
        <p className="text-xs text-slate-400 text-center">
          Escanea este QR o comparte el enlace de abajo
        </p>
      </div>

      {/* Enlace copiable */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
          <Link2 className="h-3.5 w-3.5 mr-1" />
          Tu enlace de invitación
        </label>
        <div className="flex items-center space-x-3">
          <div className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono truncate">
            {referralLink}
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
            title="Copiar enlace"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Botón compartir nativo */}
      <button
        onClick={handleShare}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center transition-colors shadow-sm text-lg mb-8"
      >
        <Share2 className="h-5 w-5 mr-2" />
        Compartir Enlace
      </button>

      {/* Info extra */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <h3 className="font-bold text-indigo-800 mb-2">¿Cómo funciona?</h3>
        <ul className="space-y-2 text-sm text-indigo-700">
          <li className="flex items-start"><span className="mr-2">📲</span>Compartís tu enlace o QR con compañeros de la facultad.</li>
          <li className="flex items-start"><span className="mr-2">✅</span>Al registrarse, reciben automáticamente <strong>7 días de acceso gratuito</strong>.</li>
          <li className="flex items-start"><span className="mr-2">💳</span>Pasado el período de prueba, pueden suscribirse por <strong>$50.000 ARS / 45 días</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
