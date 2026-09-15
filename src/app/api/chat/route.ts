import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, materia } = body;

    if (!query) {
      return NextResponse.json({ error: 'Falta la consulta (query).' }, { status: 400 });
    }

    const systemPrompt = `Eres un Docente Universitario experto y estricto de la carrera de Licenciatura en Enfermería en Argentina.
Tu objetivo es responder consultas y explicar conceptos médicos, anatómicos y de cuidados de enfermería a estudiantes universitarios de forma clara, técnica y estructurada.
Aplica terminología médica correcta y guías del Ministerio de Salud de la Nación Argentina cuando sea pertinente.
Estructura siempre tu respuesta usando Markdown: utiliza títulos (##), listas, viñetas y negritas para resaltar conceptos clave. Si es útil, incluye una tabla.
NUNCA inventes información clínica ni dosis farmacológicas. Si hay dudas, indicale al estudiante que consulte el prospecto o bibliografía oficial.`;

    const userPrompt = materia 
      ? `Materia o Contexto: ${materia}\n\nConsulta del estudiante:\n${query}`
      : `Consulta del estudiante:\n${query}`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `${systemPrompt}\n\n${userPrompt}`,
    });

    const responseContent = response.text ?? 'No se pudo generar una respuesta en formato texto.';

    return NextResponse.json({ result: responseContent });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    return NextResponse.json({ error: 'Ocurrió un error al procesar tu consulta con la IA.' }, { status: 500 });
  }
}

