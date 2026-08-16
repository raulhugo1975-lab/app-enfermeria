import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const mpClient = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { user_id, user_email } = body;

    if (!user_id || !user_email) {
      return NextResponse.json({ error: 'Faltan datos del usuario.' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Crear preferencia de pago en Mercado Pago
    const preference = new Preference(mpClient);
    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: 'enferapp-45-dias',
            title: 'EnferApp — Suscripción 45 días',
            description: 'Acceso completo a la plataforma educativa de Enfermería con Asistente IA y Simulador de Exámenes.',
            quantity: 1,
            unit_price: 50000,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: user_email,
        },
        payment_methods: {
          // Aceptar todos los medios: crédito, débito, transferencia, Rapipago, Pago Fácil
          excluded_payment_types: [],
          installments: 1,
        },
        back_urls: {
          success: `${appUrl}/pago/exito`,
          failure: `${appUrl}/pago/error`,
          pending: `${appUrl}/pago/pendiente`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`,
        metadata: {
          user_id: user_id,
        },
        statement_descriptor: 'EnferApp',
        expires: false,
      },
    });

    // Registrar el pago como 'pending' en la BD
    const { error: dbError } = await supabaseAdmin.from('payments').insert([{
      user_id,
      amount: 50000,
      mp_preference_id: preferenceData.id,
      status: 'pending',
    }]);

    if (dbError) {
      console.error('Error registrando pago en BD:', dbError);
      // No falla el flujo, el webhook lo resolverá igualmente
    }

    return NextResponse.json({
      init_point: preferenceData.init_point,
      preference_id: preferenceData.id,
    });

  } catch (error: any) {
    console.error('Error creando preferencia MP:', error);
    return NextResponse.json(
      { error: 'Error al iniciar el proceso de pago. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
