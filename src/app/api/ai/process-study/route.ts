import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, action, country, university } = body;

    if (!content) {
      return NextResponse.json({ error: 'Falta el contenido a procesar.' }, { status: 400 });
    }

    let systemPrompt = `Eres un Docente Universitario experto y estricto de la carrera de Licenciatura en Enfermería. 
Tu objetivo es ayudar a los estudiantes procesando material académico y transformándolo en herramientas de estudio altamente efectivas y profesionales.
Usa siempre lenguaje técnico médico adecuado y estructurado en Markdown (con listas, negritas y tablas cuando sea necesario).`;

    if (country === 'Argentina') {
      systemPrompt += `\nIMPORTANTE CONTEXTO LOCAL: El estudiante es de Argentina. Aplica la terminología médica, guías del Ministerio de Salud de la Nación y marco normativo local aplicable, como la Ley Nacional de Enfermería N° 24.004 y leyes provinciales pertinentes.`;
    }

    let actionPrompt = '';
    switch (action) {
      case 'resumen':
        actionPrompt = 'Genera un resumen estructurado del siguiente texto, extrayendo los conceptos clave, definiciones principales y procedimientos fundamentales.';
        break;
      case 'ficha_farmaco':
        actionPrompt = 'Basado en el texto, extrae la información farmacológica y genera una Ficha Farmacológica incluyendo: Nombre Genérico, Grupo Farmacológico, Mecanismo de Acción, Indicaciones, Contraindicaciones, Efectos Adversos y Cuidados Específicos de Enfermería. Usa una tabla Markdown si es posible.';
        break;
      case 'preguntas_examen':
        actionPrompt = 'Formula 5 preguntas de opción múltiple de nivel de examen universitario basadas en el texto, y al final provee las respuestas correctas con su respectiva justificación.';
        break;
      case 'esquema_pae':
        actionPrompt = 'Extrae los datos clínicos del texto y formula un esquema básico de Proceso de Atención de Enfermería (PAE): Valoración, Diagnósticos de Enfermería (NANDA), Planificación/Objetivos (NOC), Intervenciones (NIC) y Evaluación.';
        break;
      default:
        actionPrompt = 'Analiza y sintetiza la información clínica del siguiente texto.';
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${actionPrompt}\n\nAquí tienes el material bibliográfico:\n\n${content}`
        }
      ]
    });

    const responseContent = message.content[0].type === 'text' ? message.content[0].text : 'No se pudo generar una respuesta en formato texto.';

    return NextResponse.json({ result: responseContent });
  } catch (error: any) {
    console.error('Error procesando con IA:', error);
    return NextResponse.json({ error: 'Ocurrió un error al procesar el material.' }, { status: 500 });
  }
}
