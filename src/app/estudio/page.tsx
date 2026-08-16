"use client";

import { useState } from "react";
import { Brain, FileText, Activity, Layers, Save, Loader2, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EstudioIA() {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [action, setAction] = useState("resumen");
  const [country, setCountry] = useState("Argentina");
  const [university, setUniversity] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Mi Resumen");

  const handleProcess = async () => {
    if (!content.trim()) return toast.error("Pega el texto que deseas procesar.");
    
    setLoading(true);
    setResult("");
    
    try {
      const response = await fetch("/api/ai/process-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, action, country, university })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        toast.success("¡Material procesado con éxito!");
      } else {
        toast.error("Error: " + data.error);
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!result) return;
    
    if (!user) {
      toast.error("Debes iniciar sesión para guardar notas en tu cuenta.");
      return;
    }

    const { error } = await supabase.from('study_notes').insert([
      { 
        titulo: title, 
        contenido: result, 
        estudiante_id: user.id,
        is_ai_generated: true
      }
    ]);

    if (error) {
      toast.error("Error guardando nota: " + error.message);
    } else {
      toast.success("¡Nota guardada en Supabase con éxito!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <Brain className="h-8 w-8 mr-3 text-blue-600" />
          Asistente IA de Estudio
        </h1>
        <p className="text-slate-600 mt-2">
          Pega tu bibliografía, capítulos o apuntes sueltos, y selecciona cómo deseas estructurarlos para estudiar mejor con la ayuda de Claude 3.5.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel Izquierdo: Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Material de Estudio</h2>
          
          <textarea
            className="w-full flex-grow p-4 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 text-sm mb-4"
            placeholder="Pega aquí el texto del capítulo, apunte de clase o artículo médico..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Salida Deseado</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setAction("resumen")}
                  className={`p-2 text-sm border rounded-lg flex items-center justify-center transition-colors ${action === "resumen" ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  <FileText className="h-4 w-4 mr-2" /> Resumen
                </button>
                <button 
                  onClick={() => setAction("ficha_farmaco")}
                  className={`p-2 text-sm border rounded-lg flex items-center justify-center transition-colors ${action === "ficha_farmaco" ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  <Activity className="h-4 w-4 mr-2" /> Ficha Fármaco
                </button>
                <button 
                  onClick={() => setAction("esquema_pae")}
                  className={`p-2 text-sm border rounded-lg flex items-center justify-center transition-colors ${action === "esquema_pae" ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  <Layers className="h-4 w-4 mr-2" /> Esquema PAE
                </button>
                <button 
                  onClick={() => setAction("preguntas_examen")}
                  className={`p-2 text-sm border rounded-lg flex items-center justify-center transition-colors ${action === "preguntas_examen" ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  <Brain className="h-4 w-4 mr-2" /> 5 Preguntas
                </button>
              </div>
            </div>

            <button 
              onClick={handleProcess}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Brain className="h-5 w-5 mr-2" />}
              {loading ? "Procesando con Claude 3.5..." : "Procesar Material"}
            </button>
          </div>
        </div>

        {/* Panel Derecho: Output */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[700px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Resultado Generado</h2>
            {result && (
              <button 
                onClick={handleSaveNote}
                className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 flex items-center transition-colors border border-emerald-200"
              >
                <Save className="h-4 w-4 mr-1.5" />
                Guardar en Mis Notas
              </button>
            )}
          </div>
          
          <div className="flex-grow bg-slate-50 border border-slate-200 rounded-xl p-5 overflow-y-auto prose prose-sm prose-blue max-w-none">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-500" />
                <p>Claude está analizando la bibliografía y estructurando el contenido...</p>
                <p className="text-xs mt-2 text-slate-500">(Aplicando contexto médico y local...)</p>
              </div>
            ) : result ? (
              <ReactMarkdown>{result}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText className="h-12 w-12 mb-3 opacity-20" />
                <p>El resultado procesado aparecerá aquí.</p>
              </div>
            )}
          </div>
          
          {result && (
             <div className="mt-4">
               <input 
                 type="text" 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-700"
                 placeholder="Título para guardar tu nota (ej. Resumen Anatomía Cap 2)..."
               />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
