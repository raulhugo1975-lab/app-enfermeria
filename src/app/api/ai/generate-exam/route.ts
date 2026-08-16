import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { materia, tema, pais, universidad } = body;

    if (!materia || !tema) {
      return NextResponse.json({ error: 'Falta la materia o el tema a evaluar.' }, { status: 400 });
    }

    let systemPrompt = `Eres un estricto Docente Universitario de la carrera de Licenciatura en Enfermería que prepara exámenes parciales.
Tu objetivo es generar exactamente 5 preguntas de opción múltiple (Multiple Choice) de nivel universitario avanzado.
Incluye una mezcla equilibrada de casos clínicos prácticos y conceptos teóricos fundamentales.`;

    if (pais && universidad) {
      systemPrompt += `\nIMPORTANTE CONTEXTO ACADÉMICO: El estudiante asiste a la institución "${universidad}" en "${pais}". Ajusta la exigencia académica al nivel de esta institución y aplica la normativa, leyes de salud, epidemiología y guías de práctica clínica locales de dicho país.`;
    }

    systemPrompt += `\n\nDEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA Y NADA MÁS (sin backticks de markdown, sin texto introductorio):
{
  "preguntas": [
    {
      "enunciado": "Texto detallado de la pregunta o caso clínico...",
      "opciones": [
        "Primera opción posible",
        "Segunda opción posible",
        "Tercera opción posible",
        "Cuarta opción posible"
      ],
      "respuesta_correcta_index": 0, // Índice numérico de 0 a 3 indicando cuál es la correcta
      "explicacion": "Explicación exhaustiva del fundamento médico y/o de enfermería de por qué es la correcta y por qué las demás son falsas."
    }
  ]
}`;

    const actionPrompt = `Materia: ${materia}\nTema específico a evaluar: ${tema}\n\nGenera el examen en formato JSON ahora.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 3000,
      temperature: 0.2, // Baja temperatura para consistencia de JSON
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: actionPrompt
        }
      ]
    });

    let responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Limpieza de posibles tags markdown de JSON si Claude los agregó
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonParsed = JSON.parse(responseText);
      return NextResponse.json({ result: jsonParsed });
    } catch (parseError) {
      console.error('Error parseando JSON de Claude:', responseText);
      return NextResponse.json({ error: 'Claude no generó un JSON válido.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error generando examen con IA:', error);
    return NextResponse.json({ error: 'Ocurrió un error al generar el examen.' }, { status: 500 });
  }
}
