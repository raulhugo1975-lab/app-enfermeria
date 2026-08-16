"use client";

import Link from "next/link";
import { UserCircle, BookOpen, MapPin, Brain, LogOut, FileQuestion, FolderHeart, Share2, ShieldCheck, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600 mr-2" />
            <span className="font-bold text-xl text-blue-900 tracking-tight">
              Enfermería <span className="text-blue-500">Edu</span>
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/examen" className="hidden md:flex items-center text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors shadow-sm">
              <FileQuestion className="h-4 w-4 mr-2 text-emerald-600" />
              <span>Simulador</span>
            </Link>

            <Link href="/estudio" className="hidden md:flex items-center text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors shadow-sm">
              <Brain className="h-4 w-4 mr-2 text-blue-600" />
              <span>Asistente IA</span>
            </Link>

            {!loading && !user && (
              <div className="flex items-center space-x-2 pl-2">
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/registro" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Registrarse
                </Link>
              </div>
            )}

            {!loading && user && profile && (
              <>
                <Link href="/compartir" className="hidden lg:flex items-center text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-4 py-2 rounded-full hover:bg-purple-100 transition-colors shadow-sm">
                  <Share2 className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Invitar</span>
                </Link>

                <Link href="/mis-notas" className="hidden lg:flex items-center text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full hover:bg-amber-100 transition-colors shadow-sm">
                  <FolderHeart className="h-4 w-4 mr-2 text-amber-600" />
                  <span>Mis Notas</span>
                </Link>

                <div className="hidden md:flex items-center text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full">
                  <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                  <span>{profile.universidad} ({profile.pais})</span>
                </div>
                
                <Link href="/perfil" className="flex items-center space-x-3 pl-2 group cursor-pointer">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{profile.nombre}</span>
                  </div>
                  <UserCircle className="h-9 w-9 text-blue-600 group-hover:text-blue-800 transition-colors" />
                </Link>
                <button onClick={signOut} title="Cerrar Sesión" className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
