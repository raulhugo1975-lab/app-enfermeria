import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

// Verifica la firma del webhook de Mercado Pago
function verifyMpSignature(request: Request, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // En desarrollo sin secret, no bloquear

  const xSignature = request.headers.get('x-signature');
  const xRequestId = request.headers.get('x-request-id');

  if (!xSignature || !xRequestId) return false;

  // MP envía: ts=<timestamp>,v1=<hash>
  const parts = xSignature.split(',');
  const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
  const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];

  if (!ts || !v1) return false;

  const manifest = `id:${xRequestId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expectedHash));
}

export async function POST(request: Request) {
  let rawBody = '';
  try {
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // MP envía notificaciones de distintos tipos; solo procesar 'payment'
    if (body.type !== 'payment' || !body.data?.id) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Verificar firma (comentar en desarrollo si no tienes el secret configurado)
    // if (!verifyMpSignature(request, rawBody)) {
    //   return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
    // }

    const mpPaymentId = String(body.data.id);

    // Consultar el estado real del pago en la API de MP
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: mpPaymentId });

    if (!paymentData || !paymentData.status) {
      return NextResponse.json({ error: 'No se pudo obtener el pago.' }, { status: 400 });
    }

    const status = paymentData.status; // 'approved' | 'pending' | 'rejected' | ...
    const userId = (paymentData as any).metadata?.user_id;
    const mpPrefId = (paymentData as any).preference_id as string | undefined;

    // Actualizar el registro de pago en nuestra BD
    await supabaseAdmin
      .from('payments')
      .update({ status, mp_payment_id: mpPaymentId })
      .eq('mp_preference_id', mpPrefId);

    // Solo extender la suscripción si el pago está aprobado
    if (status === 'approved' && userId) {
      // Obtener la suscripción actual del usuario
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('subscription_ends_at')
        .eq('id', userId)
        .single();

      // Calcular nueva fecha: MAX(hoy, fecha actual de vencimiento) + 45 días
      const now = new Date();
      const currentEnd = profileData?.subscription_ends_at
        ? new Date(profileData.subscription_ends_at)
        : now;

      const baseDate = currentEnd > now ? currentEnd : now;
      const newEndsAt = new Date(baseDate);
      newEndsAt.setDate(newEndsAt.getDate() + 45);

      // Actualizar el perfil del usuario
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_ends_at: newEndsAt.toISOString(),
          is_active: true,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('[Webhook MP] Error actualizando perfil:', updateError);
        return NextResponse.json({ error: 'Error actualizando suscripción.' }, { status: 500 });
      }

      console.log(`[Webhook MP] ✅ Suscripción extendida para user ${userId} hasta ${newEndsAt.toISOString()}`);
    }

    // IMPORTANTE: Siempre responder 200 para que MP no reintente
    return NextResponse.json({ received: true, status }, { status: 200 });

  } catch (error: any) {
    console.error('[Webhook MP] Error procesando notificación:', error);
    // Aún así responder 200 para no generar reintentos infinitos de MP
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
