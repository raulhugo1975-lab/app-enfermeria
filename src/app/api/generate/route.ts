import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from '@/lib/supabase-admin';

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// -------------------------------------------------------
// Verificación de acceso (suscripción o trial de 7 días)
// -------------------------------------------------------
async function verificarAcceso(req: NextRequest): Promise<
  | { ok: true; userId: string }
  | { ok: false; status: 401 | 403; error: string }
> {
  // 1. Extraer token JWT del header Authorization
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  // --- BYPASS TEMPORAL PARA DESARROLLO/TESTING ---
  // El usuario pidió omitir o permitir el acceso sin importar la suscripción para que funcione el buscador ahora.
  // En producción, aquí iría toda la lógica original de Supabase.
  
  if (!token) {
    // Si no hay token en absoluto, podríamos rechazar, pero para forzar el funcionamiento podemos aceptarlo temporalmente.
  }
  
  // Aceptamos temporalmente todas las consultas.
  return { ok: true, userId: 'test-user-bypass' };
}

// -------------------------------------------------------
// POST /api/generate
// Body: { query: string, materia?: string, context?: string }
// -------------------------------------------------------
export async function POST(req: NextRequest) {
  console.log('[/api/generate] Request recibida.');
  console.log('[/api/generate] GEMINI_API_KEY configurada:', !!process.env.GEMINI_API_KEY);

  try {
    // — Verificar acceso —
    const acceso = await verificarAcceso(req);
    if (!acceso.ok) {
      return NextResponse.json({ error: acceso.error }, { status: acceso.status });
    }

    // — Parsear body —
    const body = await req.json();
    const { query, materia, context } = body as {
      query?: string;
      materia?: string;
      context?: string; // contexto extra: 'resumen' | 'ficha_farmaco' | 'esquema_pae' | 'preguntas_examen'
    };

    if (!query && !materia) {
      return NextResponse.json(
        { error: 'Ingresá una consulta o seleccioná una materia.' },
        { status: 400 }
      );
    }

    // — Construir prompts —
    const systemPrompt = `Eres un Docente Universitario experto y estricto de la carrera de Licenciatura en Enfermería en Argentina.
Tu objetivo es responder consultas y explicar conceptos médicos, anatómicos y de cuidados de enfermería a estudiantes universitarios de forma clara, técnica y estructurada.
Aplica terminología médica correcta y guías del Ministerio de Salud de la Nación Argentina cuando sea pertinente, así como la Ley Nacional de Enfermería N° 24.004.
Estructura siempre tu respuesta usando Markdown: utiliza títulos (##), subtítulos (###), listas con viñetas, negritas para conceptos clave y tablas cuando sean útiles.
NUNCA inventes información clínica ni dosis farmacológicas. Si hay dudas, indicale al estudiante que consulte el prospecto o bibliografía oficial.`;

    let userContent = '';

    // Instrucción específica según el contexto/acción
    if (context) {
      const acciones: Record<string, string> = {
        resumen: 'Genera un resumen estructurado y detallado del siguiente tema, extrayendo los conceptos clave, definiciones principales y procedimientos fundamentales:',
        ficha_farmaco: 'Genera una Ficha Farmacológica completa sobre el siguiente tema/fármaco. Incluye: Nombre Genérico y Comercial, Grupo Farmacológico, Mecanismo de Acción, Indicaciones, Contraindicaciones, Efectos Adversos, Dosis habitual de referencia, y Cuidados Específicos de Enfermería. Usa una tabla Markdown para los datos principales:',
        preguntas_examen: 'Formula 5 preguntas de opción múltiple (4 opciones cada una) de nivel examen universitario sobre el siguiente tema. Luego de todas las preguntas, incluye las respuestas correctas con su justificación clínica detallada:',
        esquema_pae: 'Elabora un esquema completo del Proceso de Atención de Enfermería (PAE) para el siguiente caso/tema. Incluye: 1) Valoración (datos subjetivos y objetivos), 2) Diagnósticos de Enfermería (NANDA), 3) Planificación/Objetivos (NOC), 4) Intervenciones de Enfermería (NIC) y 5) Evaluación esperada:',
      };
      userContent = `${acciones[context] ?? 'Analizá el siguiente tema:'}\n\nTema: ${query}`;
    } else if (materia) {
      userContent = `Materia: ${materia.replace(/-/g, ' ')}\n\nConsulta del estudiante: ${query || `Explicame los conceptos clave de ${materia.replace(/-/g, ' ')}`}`;
    } else {
      userContent = `Consulta del estudiante:\n${query}`;
    }

    // — Llamar a Gemini —
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\n\n${userContent}`,
    });

    const responseText = response.text ?? 'No se pudo generar una respuesta.';

    return NextResponse.json({ result: responseText });
  } catch (error: any) {
    console.error('[/api/generate] Error DETALLADO:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      response: error.response?.data || error.response,
      status: error.status
    });
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar tu consulta. Intentá de nuevo.' },
      { status: 500 }
    );
  }
}
