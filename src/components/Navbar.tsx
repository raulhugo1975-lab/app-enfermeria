"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCircle,
  BookOpen,
  MapPin,
  Brain,
  LogOut,
  FileQuestion,
  FolderHeart,
  Share2,
  Menu,
  X,
  Sparkles,
  LogIn,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setMobileMenuOpen(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo y Nombre */}
            <Link href="/" onClick={closeMenu} className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight block leading-tight">
                  Enfermería<span className="text-blue-600">Edu</span>
                </span>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wide uppercase block leading-none">
                  Plataforma de Estudio
                </span>
              </div>
            </Link>

            {/* Menú Desktop */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              <Link
                href="/estudio"
                className={`flex items-center text-xs lg:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                  isActive("/estudio")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-blue-700 bg-blue-50/80 border border-blue-200/60 hover:bg-blue-100/80"
                }`}
              >
                <Brain className="h-4 w-4 mr-1.5" />
                <span>Asistente IA</span>
              </Link>

              <Link
                href="/examen"
                className={`flex items-center text-xs lg:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                  isActive("/examen")
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 hover:bg-emerald-100/80"
                }`}
              >
                <FileQuestion className="h-4 w-4 mr-1.5" />
                <span>Simulador de Examen</span>
              </Link>

              {!loading && user && (
                <>
                  <Link
                    href="/mis-notas"
                    className={`flex items-center text-xs lg:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive("/mis-notas")
                        ? "bg-amber-600 text-white shadow-sm"
                        : "text-amber-700 bg-amber-50/80 border border-amber-200/60 hover:bg-amber-100/80"
                    }`}
                  >
                    <FolderHeart className="h-4 w-4 mr-1.5" />
                    <span>Mis Notas</span>
                  </Link>

                  <Link
                    href="/compartir"
                    className={`flex items-center text-xs lg:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
                      isActive("/compartir")
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-purple-700 bg-purple-50/80 border border-purple-200/60 hover:bg-purple-100/80"
                    }`}
                  >
                    <Share2 className="h-4 w-4 mr-1.5" />
                    <span>Invitar</span>
                  </Link>
                </>
              )}

              {/* Autenticación Desktop */}
              {!loading && !user && (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 ml-1">
                  <Link
                    href="/login"
                    className="text-xs lg:text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="text-xs lg:text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {!loading && user && (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 ml-1">
                  {profile && (
                    <Link
                      href="/perfil"
                      className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
                      title="Ver mi perfil"
                    >
                      <UserCircle className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                      <div className="hidden xl:flex flex-col text-left">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 leading-tight">
                          {profile.nombre || "Mi Cuenta"}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight">
                          {profile.pais || "Estudiante"}
                        </span>
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={signOut}
                    title="Cerrar Sesión"
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Botón menú móvil */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú de navegación"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Drawer / Menú Móvil desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/estudio"
                onClick={closeMenu}
                className={`flex items-center p-3 rounded-xl border text-sm font-semibold transition-colors ${
                  isActive("/estudio")
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                <Brain className="h-4 w-4 mr-2 shrink-0" />
                <span>Asistente IA</span>
              </Link>

              <Link
                href="/examen"
                onClick={closeMenu}
                className={`flex items-center p-3 rounded-xl border text-sm font-semibold transition-colors ${
                  isActive("/examen")
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <FileQuestion className="h-4 w-4 mr-2 shrink-0" />
                <span>Simulador</span>
              </Link>

              {user && (
                <>
                  <Link
                    href="/mis-notas"
                    onClick={closeMenu}
                    className={`flex items-center p-3 rounded-xl border text-sm font-semibold transition-colors ${
                      isActive("/mis-notas")
                        ? "bg-amber-600 text-white border-amber-600"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    <FolderHeart className="h-4 w-4 mr-2 shrink-0" />
                    <span>Mis Notas</span>
                  </Link>

                  <Link
                    href="/compartir"
                    onClick={closeMenu}
                    className={`flex items-center p-3 rounded-xl border text-sm font-semibold transition-colors ${
                      isActive("/compartir")
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    }`}
                  >
                    <Share2 className="h-4 w-4 mr-2 shrink-0" />
                    <span>Invitar</span>
                  </Link>
                </>
              )}
            </div>

            {/* Perfil o Login en móvil */}
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/perfil"
                    onClick={closeMenu}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <UserCircle className="h-7 w-7 text-blue-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{profile?.nombre || "Mi Perfil"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600">Ver perfil &rarr;</span>
                  </Link>

                  <button
                    onClick={() => {
                      closeMenu();
                      signOut();
                    }}
                    className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={closeMenu}
                    className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

