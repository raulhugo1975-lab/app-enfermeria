import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
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
      "respuesta_correcta_index": 0,
      "explicacion": "Explicación exhaustiva del fundamento médico y/o de enfermería de por qué es la correcta y por qué las demás son falsas."
    }
  ]
}`;

    const actionPrompt = `${systemPrompt}\n\nMateria: ${materia}\nTema específico a evaluar: ${tema}\n\nGenera el examen en formato JSON ahora.`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: actionPrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    let responseText = response.text ?? '';
    // Limpieza defensiva de posibles backticks
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonParsed = JSON.parse(responseText);
      return NextResponse.json({ result: jsonParsed });
    } catch (parseError) {
      console.error('Error parseando JSON de Gemini:', responseText);
      return NextResponse.json({ error: 'Gemini no generó un JSON válido.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error generando examen con IA:', error);
    return NextResponse.json({ error: 'Ocurrió un error al generar el examen.' }, { status: 500 });
  }
}

