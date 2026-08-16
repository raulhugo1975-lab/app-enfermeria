"use client";

import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, Loader2, Gift } from "lucide-react";

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [pais, setPais] = useState("");
  const [universidad, setUniversidad] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refId = searchParams.get("ref"); // ID del usuario que invitó

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. SignUp in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Calcular subscription_ends_at (7 días si viene con ?ref=, de lo contrario null)
      const trialEnd = refId
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // 3. Insert into profiles table
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email,
          nombre,
          pais,
          universidad,
          role: refId ? 'beta_tester' : 'user',
          subscription_ends_at: trialEnd,
          is_active: true,
        },
      ]);

      if (profileError) {
        console.error("Profile creation error:", profileError);
        setError("Usuario creado, pero hubo un error guardando el perfil.");
        setLoading(false);
        return;
      }

      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center">
          <BookOpen className="h-10 w-10 text-blue-600 mr-2" />
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Enfermería <span className="text-blue-500">Edu</span>
          </h2>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
          Crea tu cuenta de estudiante
        </h2>
        {refId && (
          <div className="mt-4 flex items-center justify-center bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-2.5 rounded-xl">
            <Gift className="h-4 w-4 mr-2" />
            ¡Fuiste invitado! Obtendrás <strong className="mx-1">7 días de acceso gratuito</strong> al registrarte.
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Contraseña</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">País</label>
                <div className="mt-1">
                  <select
                    required
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                  >
                    <option value="">Selecciona un país</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Universidad / Institución</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={universidad}
                    onChange={(e) => setUniversidad(e.target.value)}
                    placeholder="Ej. UBA, Cruz Roja..."
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Completar Registro"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              ¿Ya tienes cuenta? Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
