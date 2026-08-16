"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { UserCircle, Save, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PerfilPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  
  const [nombre, setNombre] = useState("");
  const [pais, setPais] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || "");
      setPais(profile.pais || "");
      setUniversidad(profile.universidad || "");
    }
  }, [profile]);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin h-8 w-8 text-blue-500" /></div>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ nombre, pais, universidad })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success("Perfil actualizado correctamente. Recarga para ver los cambios.");
    } catch (error: any) {
      toast.error("Error al actualizar el perfil: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center">
          <UserCircle className="h-12 w-12 text-blue-600 mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mi Perfil</h1>
            <p className="text-slate-500 text-sm">Gestiona tu información académica ({user.email})</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">País</label>
              <select
                required
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              >
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Colombia">Colombia</option>
                <option value="España">España</option>
                <option value="México">México</option>
                <option value="Perú">Perú</option>
                <option value="Uruguay">Uruguay</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Universidad / Institución</label>
              <input
                type="text"
                required
                value={universidad}
                onChange={(e) => setUniversidad(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
