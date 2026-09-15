"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Brain,
  FileText,
  Send,
  Loader2,
  Save,
  ArrowLeft,
  History,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

// ------------------------------------------------------------------
// Tipos
// ------------------------------------------------------------------
interface HistoryItem {
  id: number;
  query: string;
  result: string;
  timestamp: Date;
}

// ------------------------------------------------------------------
// Hook para obtener el JWT de Supabase
// ------------------------------------------------------------------
async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// ------------------------------------------------------------------
// Componente principal
// ------------------------------------------------------------------
function ChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const materia = searchParams.get("materia") || "";

  const { user } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Respuesta IA");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasFetched = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Contenido copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  // ----------------------------------------------------------------
  // Función central: llamar a /api/generate con el JWT del usuario
  // ----------------------------------------------------------------
  const fetchAIResponse = async (searchQuery: string, subjectContext?: string) => {
    if (!searchQuery && !subjectContext) return;

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
          query: searchQuery,
          materia: subjectContext,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);

        // Agregar al historial de la sesión
        setHistory((prev) => [
          {
            id: Date.now(),
            query: searchQuery,
            result: data.result,
            timestamp: new Date(),
          },
          ...prev,
        ]);

        // Desplazar al resultado
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
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

  // Disparar búsqueda automática si venimos del Home con parámetros en la URL
  useEffect(() => {
    if ((initialQuery || materia) && !hasFetched.current) {
      hasFetched.current = true;
      const autoQuery =
        initialQuery ||
        `Explicame los conceptos clave de la materia: ${materia.replace(/-/g, " ")}`;
      setQuery(autoQuery);
      fetchAIResponse(autoQuery, materia || undefined);

      if (materia) {
        setTitle(
          `Apuntes de ${
            materia.replace(/-/g, " ").charAt(0).toUpperCase() + materia.slice(1)
          }`
        );
      } else if (initialQuery) {
        setTitle(`Consulta: ${initialQuery.slice(0, 40)}...`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, materia]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (query.trim().length > 1) {
      setTitle(`Consulta: ${query.slice(0, 40)}${query.length > 40 ? "..." : ""}`);
    }
    fetchAIResponse(query);
  };

  const handleSaveNote = async () => {
    if (!result) return;
    if (!user) {
      toast.error("Debés iniciar sesión para guardar notas.");
      router.push("/login");
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
      toast.success("¡Nota guardada en Mis Notas con éxito!");
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setQuery(item.query);
    setResult(item.result);
    setTitle(`Consulta: ${item.query.slice(0, 40)}${item.query.length > 40 ? "..." : ""}`);
    setShowHistory(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al Inicio
        </Link>

        {/* Botón Historial */}
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm transition-colors"
          >
            <History className="h-4 w-4" />
            Historial ({history.length})
            {showHistory ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {/* Panel de Historial */}
      {showHistory && history.length > 0 && (
        <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              Consultas de esta sesión
            </h3>
          </div>
          <ul className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {history.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => loadFromHistory(item)}
                  className="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-slate-700 font-medium group-hover:text-blue-700 line-clamp-1">
                      {item.query}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {item.timestamp.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    {item.result.slice(0, 80)}...
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center">
          <Brain className="h-7 w-7 sm:h-8 sm:w-8 mr-3 text-blue-600" />
          Asistente de Estudio IA
        </h1>
        {result && !loading && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyResult}
              className="text-sm font-medium text-slate-600 bg-slate-100 px-3.5 py-2 rounded-lg hover:bg-slate-200 flex items-center transition-colors border border-slate-200 shadow-sm"
            >
              {copied ? <Check className="h-4 w-4 mr-1.5 text-emerald-600" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copied ? "¡Copiado!" : "Copiar"}
            </button>
            <button
              onClick={handleSaveNote}
              className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 flex items-center transition-colors border border-emerald-200 shadow-sm"
            >
              <Save className="h-4 w-4 mr-1.5" />
              Guardar en Mis Notas
            </button>
          </div>
        )}
      </div>

      {/* Área de chat */}
      <div
        ref={resultRef}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[75vh]"
      >
        {/* Resultado */}
        <div className="flex-grow bg-slate-50 p-6 overflow-y-auto">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-500" />
              <p className="text-lg font-medium text-slate-700">
                La Inteligencia Artificial está redactando tu respuesta...
              </p>
              <p className="text-sm mt-2 max-w-sm text-center text-slate-400">
                Consultando bibliografía médica, farmacología y estructurando el contenido para vos.
              </p>
            </div>
          ) : result ? (
            <div className="prose prose-blue max-w-none prose-headings:font-bold prose-h2:text-blue-800 prose-a:text-blue-600 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
              {/* Campo de título editable */}
              <div className="mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-400 uppercase whitespace-nowrap">
                    Título:
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-base bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  />
                </div>
              </div>
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText className="h-16 w-16 mb-4 opacity-20 text-blue-500" />
              <p className="text-lg">Realizá una consulta para que la IA genere el contenido.</p>
              <p className="text-sm mt-1 max-w-sm text-center">
                Ejemplo: &quot;¿Cuál es el esquema de vacunación para hepatitis B?&quot;
              </p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Preguntale al Asistente sobre un tema, procedimiento o fármaco..."
              className="w-full bg-slate-100 border-none rounded-full py-4 pl-6 pr-14 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full transition-colors flex items-center justify-center shadow-md"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Wrapper con SubscriptionGuard (protección client-side adicional)
// ------------------------------------------------------------------
export default function ChatPage() {
  return (
    <SubscriptionGuard>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-[70vh] text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </SubscriptionGuard>
  );
}
