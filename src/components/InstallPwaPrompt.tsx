"use client";

import { useState, useEffect } from "react";
import { X, Share, Plus, Smartphone, Download } from "lucide-react";

// Tipado para el evento BeforeInstallPrompt (no está en los tipos estándar de TypeScript)
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPwaPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar si el usuario ya descartó el prompt (persistido en localStorage)
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Capturar el evento de instalación de Android/Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detectar iOS (Safari no soporta beforeinstallprompt)
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches;
    if (isIos && !isInStandaloneMode) {
      // Mostrar guía iOS después de 3 segundos
      const timer = setTimeout(() => setShowIosGuide(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIosGuide(false);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // No mostrar nada si ya está instalada, descartada, o no hay prompt disponible
  if (isInstalled || dismissed || (!installPrompt && !showIosGuide)) return null;

  return (
    <>
      {/* BANNER: Android / Desktop Chrome */}
      {installPrompt && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 rounded-xl p-2 flex-shrink-0">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-slate-900 text-sm">Instalar EnferApp</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accede desde tu pantalla de inicio, sin internet y más rápido.
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex-grow py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center"
                  >
                    <Download className="h-4 w-4 mr-1.5" />
                    Instalar
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Ahora no
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Guía para iOS */}
      {showIosGuide && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 pb-8 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-900 text-lg">Instalar EnferApp</h3>
              <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-slate-600 text-sm mb-6">
              Sigue estos pasos para instalar EnferApp en tu iPhone o iPad:
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-slate-700 text-sm">Toca el botón de</p>
                  <div className="bg-slate-100 rounded-lg px-2 py-1 flex items-center border border-slate-200">
                    <Share className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-xs font-semibold text-slate-700">Compartir</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">2</span>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-slate-700 text-sm">Selecciona</p>
                  <div className="bg-slate-100 rounded-lg px-2 py-1 flex items-center border border-slate-200">
                    <Plus className="h-4 w-4 text-slate-600 mr-1" />
                    <span className="text-xs font-semibold text-slate-700">Añadir a pantalla de inicio</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-700 font-bold text-sm">3</span>
                </div>
                <p className="text-slate-700 text-sm">Confirma tocando <strong>Añadir</strong> en la esquina superior derecha.</p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
