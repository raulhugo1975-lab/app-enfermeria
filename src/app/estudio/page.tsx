"use client";

import { useState } from "react";
import {
  Brain,
  FileText,
  Activity,
  Layers,
  Save,
  Loader2,
  ArrowLeft,
  Search,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SubscriptionGuard from "@/components/SubscriptionGuard";

// ------------------------------------------------------------------
// Formatos de salida disponibles
// ------------------------------------------------------------------
const FORMATOS = [
  {
    id: "resumen",
    label: "Resumen Estructurado",
    icon: FileText,
    description: "Conceptos clave y definiciones organizadas",
  },
  {
    id: "ficha_farmaco",
    label: "Ficha Farmacológica",
    icon: Activity,
    description: "Ficha completa con mecanismo, dosis y cuidados",
  },
  {
    id: "esquema_pae",
    label: "Esquema PAE",
    icon: Layers,
    description: "Proceso de Atención de Enfermería (NANDA/NOC/NIC)",
  },
  {
    id: "preguntas_examen",
    label: "5 Preguntas de Examen",
    icon: Brain,
    description: "Opción múltiple con respuestas justificadas",
  },
] as const;

type FormatoId = (typeof FORMATOS)[number]["id"];

// ------------------------------------------------------------------
// Sugerencias de temas rápidos
// ------------------------------------------------------------------
const TEMAS_RAPIDOS = [
  "Mecanismo de acción de la digoxina",
  "PAE en paciente con insuficiencia cardíaca",
  "Signos vitales normales en el adulto mayor",
  "Administración de insulina NPH",
  "Protocolo de RCP básico en adultos",
  "Diagnósticos NANDA en paciente diabético",
  "Vacunación hepatitis B en Argentina",
  "Cuidados postoperatorios de apendicectomía",
];

// ------------------------------------------------------------------
// Helper: obtener JWT
// ------------------------------------------------------------------
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// ------------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------------
function EstudioContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [tema, setTema] = useState("");
  const [formato, setFormato] = useState<FormatoId>("resumen");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Mi Resumen");
  const [copied, setCopied] = useState(false);

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Contenido copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async (temaOverride?: string) => {
    const temaFinal = (temaOverride ?? tema).trim();
    if (!temaFinal) return toast.error("Ingresá un tema o concepto a estudiar.");

    setLoading(true);
    setResult("");

    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error("Sesión expirada. Volvé a iniciar sesión.");
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: temaFinal,
          context: formato,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
        setTitle(`${FORMATOS.find((f) => f.id === formato)?.label ?? "Resultado"}: ${temaFinal.slice(0, 40)}`);
        toast.success("¡Contenido generado con éxito!");
      } else if (response.status === 403) {
        toast.error(data.error, { duration: 6000 });
      } else if (response.status === 401) {
        toast.error("Sesión expirada. Volvé a iniciar sesión.");
      } else {
        toast.error("Error: " + data.error);
      }
    } catch {
      toast.error("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!result) return;

    if (!user) {
      toast.error("Debes iniciar sesión para guardar notas.");
      return;
    }

    const { error } = await supabase.from("study_notes").insert([
      {
        titulo: title,
        contenido: result,
        estudiante_id: user.id,
        is_ai_generated: true,
      },
    ]);

    if (error) {
      toast.error("Error guardando nota: " + error.message);
    } else {
      toast.success("¡Nota guardada en Mis Notas!");
    }
  };

  const handleQuickTopic = (t: string) => {
    setTema(t);
    handleGenerate(t);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Volver */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <Sparkles className="h-8 w-8 mr-3 text-blue-600" />
          Explorar Material con IA
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Escribí cualquier tema, concepto o fármaco y la IA generará el contenido académico
          directamente. Sin necesidad de subir archivos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* -------------------------------------------------------- */}
        {/* Panel Izquierdo: Controles (2/5 del ancho en lg) */}
        {/* -------------------------------------------------------- */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Buscador de tema */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tema o Concepto a Estudiar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                placeholder="Ej: Mecanismo de acción de la adrenalina..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Temas rápidos */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                Temas frecuentes
              </p>
              <div className="flex flex-wrap gap-2">
                {TEMAS_RAPIDOS.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleQuickTopic(t)}
                    disabled={loading}
                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selector de formato */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Formato de Salida
            </label>
            <div className="space-y-2">
              {FORMATOS.map((f) => {
                const Icon = f.icon;
                const active = formato === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormato(f.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
                    <div>
                      <p className={`text-sm font-semibold ${active ? "text-blue-700" : "text-slate-700"}`}>
                        {f.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{f.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botón generar */}
          <button
            onClick={() => handleGenerate()}
            disabled={loading || !tema.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center disabled:opacity-60 shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Generando contenido...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5 mr-2" />
                Generar con IA
              </>
            )}
          </button>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Panel Derecho: Resultado (3/5 del ancho en lg) */}
        {/* -------------------------------------------------------- */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
          {/* Header del resultado */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-wrap gap-2">
            <h2 className="text-base font-semibold text-slate-800">Contenido Generado</h2>
            {result && !loading && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyResult}
                  className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 flex items-center transition-colors border border-slate-200"
                >
                  {copied ? <Check className="h-4 w-4 mr-1.5 text-emerald-600" /> : <Copy className="h-4 w-4 mr-1.5" />}
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
                <button
                  onClick={handleSaveNote}
                  className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 flex items-center transition-colors border border-emerald-200"
                >
                  <Save className="h-4 w-4 mr-1.5" />
                  Guardar en Mis Notas
                </button>
              </div>
            )}
          </div>

          {/* Cuerpo del resultado */}
          <div className="flex-grow bg-slate-50 p-6 overflow-y-auto rounded-b-2xl">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                <Loader2 className="h-10 w-10 animate-spin mb-3 text-blue-500" />
                <p className="text-base font-medium text-slate-700">
                  La Inteligencia Artificial está generando el contenido...
                </p>
                <p className="text-sm mt-1 text-slate-400 text-center max-w-xs">
                  Aplicando contexto clínico, taxonomía NANDA/NIC/NOC y normativa de salud.
                </p>
              </div>
            ) : result ? (
              <div className="prose prose-blue max-w-none prose-headings:font-bold prose-h2:text-blue-800 bg-white p-6 rounded-xl border border-slate-100">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText className="h-14 w-14 mb-4 opacity-20 text-blue-400" />
                <p className="text-base">El contenido generado aparecerá aquí.</p>
                <p className="text-sm mt-1 max-w-xs text-center">
                  Ingresá un tema a la izquierda y presioná &quot;Generar con IA&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Campo de título para guardar */}
          {result && (
            <div className="px-6 py-4 border-t border-slate-100">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-slate-700 bg-slate-50"
                placeholder="Título para guardar tu nota..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Export con SubscriptionGuard
// ------------------------------------------------------------------
export default function EstudioIA() {
  return (
    <SubscriptionGuard>
      <EstudioContent />
    </SubscriptionGuard>
  );
}
