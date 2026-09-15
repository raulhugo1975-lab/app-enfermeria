import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, materia } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Falta la imagen del examen.' }, { status: 400 });
    }

    // Extraer sólo el base64 puro (sin el prefijo data:image/...;base64,)
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    const mediaType = imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';

    const systemPrompt = `Eres un Docente Universitario estricto de Licenciatura en Enfermería.
Se te proporciona una imagen de un examen físico (parcial o prueba). Tu tarea es analizar visualmente la imagen, extraer las preguntas y las respuestas marcadas o escritas por el alumno.
Corrige el examen basándote en conocimientos médicos y de enfermería de nivel universitario para la materia: ${materia || 'Enfermería General'}.

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA Y NADA MÁS (sin texto introductorio, sin backticks):
{
  "nota_obtenida": 0.0,
  "total_preguntas_detectadas": 0,
  "correcciones": [
    {
      "pregunta": "Enunciado extraído...",
      "respuesta_alumno": "Lo que marcó o escribió el alumno",
      "es_correcta": true,
      "explicacion": "Breve explicación docente de la corrección."
    }
  ],
  "recomendaciones": "Texto con recomendaciones pedagógicas sobre qué temas repasar según los errores observados."
}`;

    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mediaType as 'image/jpeg' | 'image/png',
                data: base64Data,
              },
            },
            {
              text: systemPrompt + '\n\nAnaliza este examen y devuélveme la corrección en el JSON estructurado solicitado.',
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    let responseText = response.text ?? '';
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonParsed = JSON.parse(responseText);
      return NextResponse.json({ result: jsonParsed });
    } catch (parseError) {
      console.error('Error parseando JSON Vision de Gemini:', responseText);
      return NextResponse.json({ error: 'Gemini no pudo generar un JSON válido desde la imagen.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error procesando imagen del examen:', error);
    return NextResponse.json({ error: 'Ocurrió un error al analizar la foto del examen.' }, { status: 500 });
  }
}

