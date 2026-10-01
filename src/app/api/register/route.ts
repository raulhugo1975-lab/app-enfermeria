import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, nombre, pais, universidad, refId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[register] Faltan variables de entorno:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      return NextResponse.json(
        { error: 'Error de configuración del servidor. Contactá al administrador.' },
        { status: 500 }
      );
    }

    // Crear cliente de Supabase con Service Role Key (omite RLS y reglas públicas)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Crear el usuario en auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Confirmar automáticamente el email
    });

    if (authError) {
      console.error('Error creando usuario Admin:', authError);
      // Traducir mensajes de error de Supabase al español
      let errorMsg = authError.message;
      if (
        errorMsg.includes('already been registered') ||
        errorMsg.includes('already registered') ||
        errorMsg.includes('already exists')
      ) {
        errorMsg = 'Este correo ya tiene una cuenta registrada. Por favor, iniciá sesión.';
      } else if (errorMsg.includes('invalid email')) {
        errorMsg = 'El correo electrónico no es válido.';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      );
    }

    const user = authData.user;

    if (user) {
      // 2. Calcular subscription_ends_at
      let trialEnd = null;
      let userRole = 'user';

      if (refId === 'BETA_ILIMITADA') {
        // Acceso vitalicio (hasta 2099) para los testers permanentes
        trialEnd = new Date('2099-12-31T23:59:59.999Z').toISOString();
        userRole = 'beta_tester';
      } else if (refId) {
        // Acceso de 7 días por invitación normal
        trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        userRole = 'beta_tester';
      }

      // 3. Insertar perfil — intentamos con todos los campos primero
      let profileError: any = null;

      const fullInsert = await supabaseAdmin.from('profiles').insert([
        {
          id: user.id,
          email,
          nombre,
          pais,
          universidad,
          role: userRole,
          subscription_ends_at: trialEnd,
          is_active: true,
        },
      ]);
      profileError = fullInsert.error;

      // Si falla por columnas inexistentes (PGRST204 / 42703), hacemos fallback con campos base
      if (profileError && (profileError.code === '42703' || profileError.message?.includes('column'))) {
        console.warn('[register] Columnas extendidas no existen en profiles, usando fallback básico:', profileError.message);
        const baseInsert = await supabaseAdmin.from('profiles').insert([
          {
            id: user.id,
            email,
            nombre,
            pais,
            universidad,
          },
        ]);
        profileError = baseInsert.error;
      }

      if (profileError) {
        console.error('[register] Error insertando perfil:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint,
        });
        // Intentar borrar el usuario en auth para no dejar estado inconsistente
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        return NextResponse.json(
          { error: 'Error al guardar el perfil del usuario. Por favor intentá de nuevo.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json(
      { error: 'Error desconocido al crear usuario' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('Exception in register route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
