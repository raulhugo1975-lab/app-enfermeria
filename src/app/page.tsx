"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Book,
  Brain,
  ChevronRight,
  Activity,
  Users,
  ShieldAlert,
  Baby,
  HeartPulse,
  FileQuestion,
  FolderHeart,
  Share2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Clock,
  CheckCircle2,
} from "lucide-react";

const herramientas = [
  {
    id: "asistente",
    titulo: "Asistente y Apuntes IA",
    descripcion: "Generá resúmenes estructurados, fichas farmacológicas y esquemas PAE (NANDA/NOC/NIC) en segundos.",
    icono: Brain,
    link: "/estudio",
    badge: "Más utilizado",
    colorBg: "bg-blue-50/80 hover:bg-blue-100/80",
    colorBorder: "border-blue-200",
    colorIcon: "bg-blue-600 text-white",
    colorText: "text-blue-900",
    colorBadge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "simulador",
    titulo: "Simulador de Exámenes",
    descripcion: "Rendí parciales múltiple choice de 10 min o subí una foto de tu examen escrito para corrección docente.",
    icono: FileQuestion,
    link: "/examen",
    badge: "Con corrección",
    colorBg: "bg-emerald-50/80 hover:bg-emerald-100/80",
    colorBorder: "border-emerald-200",
    colorIcon: "bg-emerald-600 text-white",
    colorText: "text-emerald-900",
    colorBadge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    id: "notas",
    titulo: "Mis Notas y Rendimiento",
    descripcion: "Revisá tus resúmenes guardados, editá apuntes y consultá el historial con todas tus notas de exámenes.",
    icono: FolderHeart,
    link: "/mis-notas",
    badge: "En la nube",
    colorBg: "bg-amber-50/80 hover:bg-amber-100/80",
    colorBorder: "border-amber-200",
    colorIcon: "bg-amber-600 text-white",
    colorText: "text-amber-900",
    colorBadge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    id: "invitar",
    titulo: "Invitar Compañeros",
    descripcion: "Compartí tu enlace o código QR para que tus compañeros obtengan 7 días de acceso completo gratuito.",
    icono: Share2,
    link: "/compartir",
    badge: "Beneficio",
    colorBg: "bg-purple-50/80 hover:bg-purple-100/80",
    colorBorder: "border-purple-200",
    colorIcon: "bg-purple-600 text-white",
    colorText: "text-purple-900",
    colorBadge: "bg-purple-100 text-purple-800 border-purple-200",
  },
];

const materias = [
  { id: 1, nombre: "Anatomofisiología",   slug: "anatomofisiologia",  icon: <Brain className="h-6 w-6" />,      color: "bg-red-50 text-red-600 border-red-200 hover:border-red-300" },
  { id: 2, nombre: "Farmacología",        slug: "farmacologia",       icon: <Activity className="h-6 w-6" />,   color: "bg-green-50 text-green-600 border-green-200 hover:border-green-300" },
  { id: 3, nombre: "Enf. Comunitaria",    slug: "comunitaria",        icon: <Users className="h-6 w-6" />,      color: "bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300" },
  { id: 4, nombre: "Maternoinfantil",     slug: "maternoinfantil",    icon: <Baby className="h-6 w-6" />,       color: "bg-pink-50 text-pink-600 border-pink-200 hover:border-pink-300" },
  { id: 5, nombre: "Adulto y Anciano",    slug: "adulto-anciano",     icon: <Users className="h-6 w-6" />,      color: "bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-300" },
  { id: 6, nombre: "Cuidados Críticos",   slug: "cuidados-criticos",  icon: <HeartPulse className="h-6 w-6" />, color: "bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300" },
  { id: 7, nombre: "Ética y Legislación", slug: "etica-legislacion",  icon: <ShieldAlert className="h-6 w-6" />, color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-300" },
];

const sugerenciasRapidas = [
  "Mecanismo de acción de la digoxina",
  "Esquema PAE en insuficiencia cardíaca",
  "Signos vitales normales en adulto mayor",
  "Administración y cuidados de insulina NPH",
  "Protocolo de RCP básico en adultos",
  "Diagnósticos NANDA en paciente quirúrgico",
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleMateriaClick = (slug: string) => {
    router.push(`/chat?materia=${encodeURIComponent(slug)}`);
  };

  const handleSugerenciaClick = (sug: string) => {
    router.push(`/chat?q=${encodeURIComponent(sug)}`);
  };

  // Filtramos las materias si el usuario está tipeando y no hizo submit aún
  const materiasFiltradas = searchTerm
    ? materias.filter((m) =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : materias;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* Header / Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
          <span>Inteligencia Artificial Médica para Estudiantes de Enfermería</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-5 tracking-tight leading-tight">
          Tu compañero integral de estudio en{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
            Enfermería
          </span>
        </h1>
        <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Consultá dudas clínicas, creá resúmenes con normas PAE NANDA/NIC/NOC, practicá simulacros de examen y gestioná tus apuntes en un solo lugar.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex flex-col sm:flex-row items-center w-full rounded-2xl sm:rounded-full shadow-lg bg-white border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 overflow-hidden transition-all p-1.5"
        >
          <div className="flex items-center w-full flex-grow px-3 py-2 sm:py-0">
            <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
            <input
              className="peer h-12 w-full outline-none text-sm sm:text-base text-slate-700 bg-transparent placeholder:text-slate-400"
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribí tu duda. Ej: 'Cuidados de enfermería en sonda vesical'..."
            />
          </div>

          <button
            type="submit"
            disabled={!searchTerm.trim()}
            className="w-full sm:w-auto h-12 px-7 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl sm:rounded-full transition-colors flex items-center justify-center shrink-0 shadow-sm"
          >
            <Brain className="h-4 w-4 mr-2" />
            <span>Consultar IA</span>
          </button>
        </form>

        {/* Sugerencias Rápidas */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-400 mr-1">Pruebas sugeridas:</span>
          {sugerenciasRapidas.slice(0, 4).map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSugerenciaClick(sug)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg transition-colors border border-slate-200"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 1: HUB PRINCIPAL DE FUNCIONALIDADES (FÁCIL DE ENCONTRAR) */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-16 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <GraduationCap className="h-7 w-7 mr-2.5 text-blue-600" />
              Herramientas de Estudio
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Accedé rápidamente a cada una de las funcionalidades de la plataforma
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {herramientas.map((tool) => {
            const Icon = tool.icono;
            return (
              <Link
                key={tool.id}
                href={tool.link}
                className={`group relative p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg flex flex-col justify-between bg-white ${tool.colorBorder} ${tool.colorBg}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${tool.colorIcon} shadow-sm`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tool.colorBadge}`}>
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className={`font-bold text-lg mb-2 group-hover:text-blue-700 transition-colors ${tool.colorText}`}>
                    {tool.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {tool.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Ingresar ahora</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECCIÓN 2: CONSULTAS RÁPIDAS POR MATERIA */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
              <Book className="h-7 w-7 mr-2.5 text-blue-600" />
              Consultas Rápidas por Materia
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Seleccioná tu asignatura para generar apuntes y explicaciones específicas
            </p>
          </div>
        </div>

        {materiasFiltradas.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Book className="h-12 w-12 mx-auto mb-3 opacity-30 text-blue-500" />
            <p className="font-semibold text-slate-600">No se encontraron materias para "{searchTerm}".</p>
            <p className="text-sm mt-1">Podés presionar "Consultar IA" arriba para enviar tu pregunta directamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {materiasFiltradas.map((materia) => {
              const borderClass = materia.color.split(" ").find((c) => c.startsWith("border-"));
              const hoverBorderClass = materia.color.split(" ").find((c) => c.startsWith("hover:border-"));
              const iconClasses = materia.color
                .split(" ")
                .filter((c) => c.startsWith("bg-") || c.startsWith("text-"))
                .join(" ");

              return (
                <button
                  key={materia.id}
                  onClick={() => handleMateriaClick(materia.slug)}
                  className={`group p-5 text-left rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between bg-white ${borderClass} ${hoverBorderClass}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${iconClasses}`}>
                      {materia.icon}
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-500 h-5 w-5 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800 group-hover:text-blue-700 transition-colors">
                      {materia.nombre}
                    </h3>
                    <div className="flex items-center mt-2 text-xs text-slate-500 group-hover:text-blue-600 transition-colors">
                      <Brain className="h-3.5 w-3.5 mr-1" />
                      <span>Generar Apuntes IA</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

