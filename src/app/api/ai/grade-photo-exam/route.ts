import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, materia } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Falta la imagen del examen.' }, { status: 400 });
    }

    // Clean base64 string if it has the data url prefix
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    // Determine media type (defaulting to jpeg if unknown)
    const mediaType = imageBase64.includes('image/png') ? 'image/png' : 'image/jpeg';

    const systemPrompt = `Eres un Docente Universitario estricto de Licenciatura en Enfermería.
Se te proporciona una imagen de un examen físico (parcial o prueba). Tu tarea es analizar visualmente la imagen, extraer las preguntas y las respuestas marcadas o escritas por el alumno.
Corrige el examen basándote en conocimientos médicos y de enfermería de nivel universitario para la materia: ${materia || 'Enfermería General'}.

DEBES DEVOLVER EXCLUSIVAMENTE UN OBJETO JSON VÁLIDO CON LA SIGUIENTE ESTRUCTURA Y NADA MÁS (sin texto introductorio, sin backticks):
{
  "nota_obtenida": 0.0, // Nota sobre 10 (ej. 7.5)
  "total_preguntas_detectadas": 0,
  "correcciones": [
    {
      "pregunta": "Enunciado extraído...",
      "respuesta_alumno": "Lo que marcó o escribió el alumno",
      "es_correcta": true, // o false
      "explicacion": "Breve explicación docente de la corrección."
    }
  ],
  "recomendaciones": "Texto con recomendaciones pedagógicas sobre qué temas repasar según los errores observados."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 3000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: 'Analiza este examen y devuélveme la corrección en el JSON estructurado solicitado.'
            }
          ],
        }
      ]
    });

    let responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const jsonParsed = JSON.parse(responseText);
      return NextResponse.json({ result: jsonParsed });
    } catch (parseError) {
      console.error('Error parseando JSON Vision:', responseText);
      return NextResponse.json({ error: 'Claude no pudo generar un JSON válido desde la imagen.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error procesando imagen del examen:', error);
    return NextResponse.json({ error: 'Ocurrió un error al analizar la foto del examen.' }, { status: 500 });
  }
}
