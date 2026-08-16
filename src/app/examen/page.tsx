"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Brain, FileText, CheckCircle, XCircle, AlertTriangle, Loader2, Play, RefreshCw, Save, Clock, Camera, Upload, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Pregunta = {
  enunciado: string;
  opciones: string[];
  respuesta_correcta_index: number;
  explicacion: string;
};

type VisionResult = {
  nota_obtenida: number;
  total_preguntas_detectadas: number;
  correcciones: {
    pregunta: string;
    respuesta_alumno: string;
    es_correcta: boolean;
    explicacion: string;
  }[];
  recomendaciones: string;
};

type ExamState = "SETUP" | "LOADING" | "IN_PROGRESS" | "RESULTS" | "LOADING_VISION" | "RESULTS_VISION";
type SetupMode = "SIMULADOR" | "FOTO";

export default function SimuladorExamen() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [setupMode, setSetupMode] = useState<SetupMode>("SIMULADOR");
  const [materia, setMateria] = useState("Anatomofisiología");
  const [tema, setTema] = useState("");
  
  // States Simulador
  const [examState, setExamState] = useState<ExamState>("SETUP");
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);

  // States Vision
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [visionResult, setVisionResult] = useState<VisionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const materiasOptions = [
    "Anatomofisiología",
    "Farmacología",
    "Enfermería Comunitaria",
    "Maternoinfantil",
    "Adulto y Anciano",
    "Cuidados Críticos",
    "Ética y Legislación",
  ];

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === "IN_PROGRESS" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === "IN_PROGRESS") {
      handleFinishExam();
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ----- LOGIC: SIMULADOR -----
  const handleStartExam = async () => {
    if (!tema.trim()) {
      toast.error("Por favor ingresa un tema a evaluar.");
      return;
    }

    setExamState("LOADING");
    setPreguntas([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeLeft(600);

    try {
      const response = await fetch("/api/ai/generate-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materia,
          tema,
          pais: profile?.pais || "Argentina",
          universidad: profile?.universidad || "General"
        }),
      });

      const data = await response.json();
      if (response.ok && data.result && data.result.preguntas) {
        setPreguntas(data.result.preguntas);
        setUserAnswers(new Array(data.result.preguntas.length).fill(null));
        setExamState("IN_PROGRESS");
        toast.success("Examen generado con éxito.");
      } else {
        toast.error("Error generando el examen.");
        setExamState("SETUP");
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.");
      setExamState("SETUP");
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < preguntas.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleFinishExam();
    }
  };

  const handleFinishExam = () => {
    setExamState("RESULTS");
  };

  const calcularNota = () => {
    let correctas = 0;
    preguntas.forEach((q, idx) => {
      if (userAnswers[idx] === q.respuesta_correcta_index) correctas++;
    });
    const notaBase10 = (correctas / preguntas.length) * 10;
    return { correctas, nota: notaBase10.toFixed(1) };
  };

  // ----- LOGIC: VISION -----
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGradePhoto = async () => {
    if (!imageBase64) {
      toast.error("Sube una imagen del examen primero.");
      return;
    }

    setExamState("LOADING_VISION");

    try {
      const response = await fetch("/api/ai/grade-photo-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, materia }),
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setVisionResult(data.result);
        setExamState("RESULTS_VISION");
        toast.success("Examen corregido exitosamente.");
      } else {
        toast.error("Error analizando foto: " + (data.error || "Formato inválido."));
        setExamState("SETUP");
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.");
      setExamState("SETUP");
    }
  };

  // ----- LOGIC: SAVE TO DB -----
  const handleSaveResult = async (isScanned: boolean, score: number, totalQ: number) => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar resultados.");
      return;
    }

    const { error } = await supabase.from('exam_results').insert([{
      user_id: user.id,
      materia,
      score,
      total_questions: totalQ,
      is_scanned: isScanned
    }]);

    if (error) {
      toast.error("Error guardando el resultado: " + error.message);
    } else {
      toast.success("¡Resultado guardado exitosamente en tu historial!");
    }
  };

  const handleReset = () => {
    setExamState("SETUP");
    setTema("");
    setImageBase64(null);
    setVisionResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      {/* HEADER GLOBAl */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <Brain className="h-8 w-8 mr-3 text-indigo-600" />
          Evaluación y Simulador
        </h1>
        <p className="text-slate-600 mt-2">
          Practica con simulacros generados por IA o sube una foto de tu examen físico para corrección automática.
        </p>
      </div>

      {/* STATE: SETUP */}
      {examState === "SETUP" && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          
          <div className="flex space-x-4 mb-8 border-b border-slate-100 pb-4">
            <button 
              onClick={() => setSetupMode("SIMULADOR")}
              className={`pb-2 text-lg font-semibold border-b-2 transition-colors ${setupMode === "SIMULADOR" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Simulador Digital
            </button>
            <button 
              onClick={() => setSetupMode("FOTO")}
              className={`pb-2 text-lg font-semibold border-b-2 transition-colors ${setupMode === "FOTO" ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Escanear Examen (Foto)
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Materia</label>
              <select
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium"
              >
                {materiasOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {setupMode === "SIMULADOR" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tema Específico</label>
                  <textarea
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    rows={4}
                    placeholder="Ej. Farmacodinamia de los AINEs..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                  />
                </div>
                <button
                  onClick={handleStartExam}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-sm"
                >
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  Comenzar Examen (10 Minutos)
                </button>
              </>
            )}

            {setupMode === "FOTO" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50">
                  {imageBase64 ? (
                    <div className="flex flex-col items-center">
                      <img src={imageBase64} alt="Examen preview" className="max-h-64 object-contain mb-4 rounded-lg shadow-sm" />
                      <button onClick={() => setImageBase64(null)} className="text-sm text-red-500 font-medium hover:underline">Eliminar imagen</button>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-12 w-12 text-slate-400 mb-3" />
                      <p className="text-slate-600 text-center mb-4">Toma una foto de tu examen resuelto o sube una imagen.</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 flex items-center shadow-sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Seleccionar Archivo
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={handleGradePhoto}
                  disabled={!imageBase64}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center transition-colors shadow-sm"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Analizar y Corregir con IA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE: LOADING (Both) */}
      {(examState === "LOADING" || examState === "LOADING_VISION") && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {examState === "LOADING" ? "Claude está elaborando el parcial..." : "Claude Visión está leyendo y corrigiendo el examen..."}
          </h2>
        </div>
      )}

      {/* STATE: IN PROGRESS SIMULADOR */}
      {examState === "IN_PROGRESS" && preguntas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
            <div className="flex items-center">
              <span className="bg-indigo-100 text-indigo-800 text-sm font-bold px-3 py-1 rounded-full">
                Pregunta {currentQuestionIndex + 1} de {preguntas.length}
              </span>
            </div>
            <div className={`flex items-center font-mono font-bold text-lg ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              <Clock className="h-5 w-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-medium text-slate-900 mb-8 leading-relaxed">
              {preguntas[currentQuestionIndex].enunciado}
            </h3>

            <div className="space-y-4">
              {preguntas[currentQuestionIndex].opciones.map((opcion, index) => (
                <div 
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center ${
                    userAnswers[currentQuestionIndex] === index 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                    userAnswers[currentQuestionIndex] === index ? 'border-indigo-600' : 'border-slate-300'
                  }`}>
                    {userAnswers[currentQuestionIndex] === index && <div className="h-3 w-3 bg-indigo-600 rounded-full" />}
                  </div>
                  <span className="text-base font-medium">{opcion}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-end">
              <button
                onClick={handleNextQuestion}
                disabled={userAnswers[currentQuestionIndex] === null}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
              >
                {currentQuestionIndex === preguntas.length - 1 ? 'Finalizar Examen' : 'Siguiente Pregunta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE: RESULTS SIMULADOR */}
      {examState === "RESULTS" && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Resultado Final</h2>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-indigo-100 mb-4">
              <span className="text-4xl font-black text-indigo-600">{calcularNota().nota}</span>
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <button onClick={handleReset} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center transition-colors">
                <RefreshCw className="h-5 w-5 mr-2" />
                Nuevo Examen
              </button>
              <button onClick={() => handleSaveResult(false, parseFloat(calcularNota().nota), preguntas.length)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center transition-colors shadow-sm">
                <Save className="h-5 w-5 mr-2" />
                Guardar Progreso
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 ml-2">Corrección Detallada</h3>
            {preguntas.map((q, idx) => {
              const esCorrecta = userAnswers[idx] === q.respuesta_correcta_index;
              return (
                <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${esCorrecta ? 'border-emerald-500' : 'border-rose-500'}`}>
                  <div className="flex items-start">
                    {esCorrecta ? <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1" /> : <XCircle className="h-6 w-6 text-rose-500 mr-3 mt-1" />}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">{q.enunciado}</h4>
                      <div className="bg-indigo-50 p-4 rounded-xl mt-3 border border-indigo-100">
                        <p className="text-sm text-indigo-800"><span className="font-bold">Explicación Docente:</span> {q.explicacion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STATE: RESULTS VISION */}
      {examState === "RESULTS_VISION" && visionResult && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Examen Corregido por IA</h2>
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-indigo-100 mb-4">
              <span className="text-4xl font-black text-indigo-600">{visionResult.nota_obtenida.toFixed(1)}</span>
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <button onClick={handleReset} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center transition-colors">
                <Camera className="h-5 w-5 mr-2" />
                Reintentar / Cambiar Foto
              </button>
              <button onClick={() => handleSaveResult(true, visionResult.nota_obtenida, visionResult.total_preguntas_detectadas)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center transition-colors shadow-sm">
                <Save className="h-5 w-5 mr-2" />
                Guardar Progreso
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-amber-800 mb-2 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Recomendaciones Pedagógicas
            </h3>
            <p className="text-amber-900">{visionResult.recomendaciones}</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 ml-2">Análisis Pregunta por Pregunta</h3>
            {visionResult.correcciones.map((corr, idx) => (
              <div key={idx} className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${corr.es_correcta ? 'border-emerald-500' : 'border-rose-500'}`}>
                <div className="flex items-start">
                  {corr.es_correcta ? <CheckCircle className="h-6 w-6 text-emerald-500 mr-3 mt-1" /> : <XCircle className="h-6 w-6 text-rose-500 mr-3 mt-1" />}
                  <div>
                    <h4 className="text-md font-semibold text-slate-800 mb-2">{corr.pregunta}</h4>
                    <p className="text-sm bg-slate-100 px-3 py-2 rounded-lg text-slate-700 inline-block mb-3">
                      <span className="font-bold">Respuesta detectada:</span> {corr.respuesta_alumno}
                    </p>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <p className="text-sm text-indigo-800"><span className="font-bold">Corrección:</span> {corr.explicacion}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
