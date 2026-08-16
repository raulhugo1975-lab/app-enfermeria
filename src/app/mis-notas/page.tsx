"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { FolderHeart, FileText, ClipboardList, Search, Loader2, Calendar, Brain, Camera, Copy, Check, ArrowLeft, Trash2, Edit2, Save, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Note = {
  id: string;
  titulo: string;
  contenido: string;
  created_at: string;
  is_ai_generated: boolean;
};

type ExamResult = {
  id: string;
  materia: string;
  score: number;
  total_questions: number;
  is_scanned: boolean;
  created_at: string;
};

export default function MisNotasPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"NOTAS" | "EXAMENES">("NOTAS");
  
  const [notas, setNotas] = useState<Note[]>([]);
  const [examenes, setExamenes] = useState<ExamResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    } else if (!authLoading) {
      setLoadingData(false);
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    setLoadingData(true);
    
    // Fetch notas
    const { data: notasData } = await supabase
      .from('study_notes')
      .select('*')
      .eq('estudiante_id', user!.id)
      .order('created_at', { ascending: false });

    // Fetch examenes
    const { data: examenesData } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (notasData) setNotas(notasData);
    if (examenesData) setExamenes(examenesData);
    
    setLoadingData(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Texto copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este apunte?")) return;
    
    try {
      const { error } = await supabase.from('study_notes').delete().eq('id', id);
      if (error) throw error;
      setNotas(notas.filter(n => n.id !== id));
      toast.success("Apunte eliminado.");
    } catch (error: any) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  const handleStartEdit = (nota: Note) => {
    setEditingId(nota.id);
    setEditTitle(nota.titulo);
    setEditContent(nota.contenido);
  };

  const handleSaveEdit = async (id: string) => {
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from('study_notes')
        .update({ titulo: editTitle, contenido: editContent })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotas(notas.map(n => n.id === id ? { ...n, titulo: editTitle, contenido: editContent } : n));
      setEditingId(null);
      toast.success("Apunte actualizado.");
    } catch (error: any) {
      toast.error("Error al actualizar: " + error.message);
    } finally {
      setSavingNote(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-blue-500" /></div>;

  if (!user) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <FolderHeart className="h-20 w-20 text-slate-300 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Inicia Sesión para ver tus notas</h2>
      <p className="text-slate-600">Debes tener una cuenta activa para guardar y revisar tu material de estudio y exámenes.</p>
    </div>
  );

  const filteredNotas = notas.filter(n => n.titulo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <FolderHeart className="h-8 w-8 mr-3 text-amber-600" />
          Mis Notas y Evaluaciones
        </h1>
        <p className="text-slate-600 mt-2">
          Todo tu material de estudio estructurado y el historial de tu rendimiento académico.
        </p>
      </div>

      {/* TABS */}
      <div className="flex space-x-2 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("NOTAS")}
          className={`flex items-center px-6 py-3 font-semibold transition-colors rounded-t-xl ${activeTab === "NOTAS" ? "bg-amber-50 text-amber-700 border-b-2 border-amber-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
        >
          <FileText className="h-5 w-5 mr-2" />
          Resúmenes y Apuntes
        </button>
        <button 
          onClick={() => setActiveTab("EXAMENES")}
          className={`flex items-center px-6 py-3 font-semibold transition-colors rounded-t-xl ${activeTab === "EXAMENES" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
        >
          <ClipboardList className="h-5 w-5 mr-2" />
          Historial de Exámenes
        </button>
      </div>

      {loadingData ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
          <p className="text-slate-500">Cargando tus datos...</p>
        </div>
      ) : (
        <>
          {/* CONTENT: NOTAS */}
          {activeTab === "NOTAS" && (
            <div>
              <div className="mb-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por título de apunte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 shadow-sm"
                />
              </div>

              {filteredNotas.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No tienes apuntes guardados</h3>
                  <p className="text-slate-500 mt-2">Utiliza el Asistente IA para procesar bibliografía y guardarla aquí.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotas.map(nota => {
                    const isEditing = editingId === nota.id;
                    return (
                      <div key={nota.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col max-h-[500px]">
                        
                        {isEditing ? (
                          <div className="p-4 flex flex-col h-full">
                            <input 
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none text-sm font-bold text-slate-800 mb-3"
                            />
                            <textarea 
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full flex-grow p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 resize-none outline-none focus:border-amber-300"
                            />
                            <div className="flex justify-end space-x-2 mt-4">
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium flex items-center hover:bg-slate-200">
                                <X className="h-4 w-4 mr-1" /> Cancelar
                              </button>
                              <button onClick={() => handleSaveEdit(nota.id)} disabled={savingNote} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium flex items-center hover:bg-amber-700">
                                {savingNote ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-slate-800 line-clamp-1">{nota.titulo}</h3>
                                <p className="text-xs text-slate-500 mt-1 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(nota.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                {nota.is_ai_generated && <Brain className="h-5 w-5 text-blue-500 mx-1" />}
                                <button onClick={() => handleStartEdit(nota)} className="text-slate-400 hover:text-amber-600 transition-colors p-1" title="Editar">
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDeleteNote(nota.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Eliminar">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="p-4 flex-grow overflow-y-auto prose prose-sm prose-amber max-w-none">
                              <ReactMarkdown>{nota.contenido}</ReactMarkdown>
                            </div>
                            <div className="p-3 border-t border-slate-100 bg-white flex justify-end">
                              <button 
                                onClick={() => handleCopy(nota.id, nota.contenido)}
                                className="flex items-center text-sm font-medium text-slate-600 hover:text-amber-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                              >
                                {copiedId === nota.id ? <Check className="h-4 w-4 mr-1.5 text-emerald-500" /> : <Copy className="h-4 w-4 mr-1.5" />}
                                {copiedId === nota.id ? 'Copiado!' : 'Copiar Texto'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONTENT: EXAMENES */}
          {activeTab === "EXAMENES" && (
            <div>
              {examenes.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <ClipboardList className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No hay historial de exámenes</h3>
                  <p className="text-slate-500 mt-2">Completa simulacros o escanea exámenes para ver tu progreso.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Materia</th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Origen</th>
                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {examenes.map((exam) => (
                        <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                            {new Date(exam.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {exam.materia}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            {exam.is_scanned ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Camera className="h-3 w-3 mr-1" /> Físico (Foto)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                <Brain className="h-3 w-3 mr-1" /> Simulador Digital
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold ${
                              exam.score >= 6 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}>
                              {Number(exam.score).toFixed(1)} / 10
                            </span>
                            <div className="text-xs text-slate-400 mt-1">
                              De {exam.total_questions} preguntas
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
