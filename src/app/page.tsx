import { Search, Book, Brain, ChevronRight, Activity, Users, ShieldAlert, Baby, FileText, HeartPulse } from "lucide-react";

export default function Home() {
  const materias = [
    { id: 1, nombre: "Anatomofisiología", icon: <Brain className="h-6 w-6" />, color: "bg-red-50 text-red-600 border-red-200 hover:border-red-300" },
    { id: 2, nombre: "Farmacología", icon: <Activity className="h-6 w-6" />, color: "bg-green-50 text-green-600 border-green-200 hover:border-green-300" },
    { id: 3, nombre: "Enf. Comunitaria", icon: <Users className="h-6 w-6" />, color: "bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300" },
    { id: 4, nombre: "Maternoinfantil", icon: <Baby className="h-6 w-6" />, color: "bg-pink-50 text-pink-600 border-pink-200 hover:border-pink-300" },
    { id: 5, nombre: "Adulto y Anciano", icon: <Users className="h-6 w-6" />, color: "bg-teal-50 text-teal-600 border-teal-200 hover:border-teal-300" },
    { id: 6, nombre: "Cuidados Críticos", icon: <HeartPulse className="h-6 w-6" />, color: "bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-300" },
    { id: 7, nombre: "Ética y Legislación", icon: <ShieldAlert className="h-6 w-6" />, color: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-300" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header Section */}
      <div className="text-center mb-14">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Tu compañero de estudio en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Enfermería</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Accede a bibliografía verificada, resúmenes optimizados por IA y colabora con otros estudiantes de tu universidad.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-20">
        <div className="relative flex items-center w-full h-16 rounded-full shadow-md bg-white border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500 overflow-hidden transition-all">
          <div className="grid place-items-center h-full w-14 text-slate-400">
            <Search className="h-6 w-6" />
          </div>

          <input
            className="peer h-full w-full outline-none text-base text-slate-700 pr-4 bg-transparent placeholder:text-slate-400"
            type="text"
            id="search"
            placeholder="Buscar apuntes, protocolos, medicamentos, procedimientos..." 
          />
          
          <button className="h-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">
            Buscar
          </button>
        </div>
      </div>

      {/* Core Subjects Grid */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <Book className="h-7 w-7 mr-3 text-blue-500" />
            Materias Troncales
          </h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors">
            Ver todas <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materias.map((materia) => (
            <div 
              key={materia.id} 
              className={`group p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between bg-white ${materia.color.split(' ').find(c => c.startsWith('border-'))} ${materia.color.split(' ').find(c => c.startsWith('hover:border-'))}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl ${materia.color.split(' ').filter(c => c.startsWith('bg-') || c.startsWith('text-')).join(' ')}`}>
                  {materia.icon}
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-blue-500 h-5 w-5 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-800 group-hover:text-blue-700 transition-colors">{materia.nombre}</h3>
                <div className="flex items-center mt-2 text-sm text-slate-500">
                  <FileText className="h-4 w-4 mr-1" />
                  <span>Explorar material</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
