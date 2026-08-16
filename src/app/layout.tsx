import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from 'sonner';
import InstallPwaPrompt from "@/components/InstallPwaPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EnferApp | Plataforma de Estudio de Enfermería",
  description: "Plataforma educativa con IA para estudiantes de Licenciatura en Enfermería.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EnferApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EnferApp" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[SW] Registrado:', reg.scope); })
                    .catch(function(err) { console.warn('[SW] Error:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <Navbar />
          {/* Main Content */}
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster richColors position="top-center" />
          <InstallPwaPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
