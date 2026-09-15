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
      console.error('Faltan variables de entorno de Supabase Admin');
      return NextResponse.json(
        { error: 'Error de configuración del servidor' },
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
      const trialEnd = refId
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // 3. Insertar perfil
      const { error: profileError } = await supabaseAdmin.from('profiles').insert([
        {
          id: user.id,
          email,
          nombre,
          pais,
          universidad,
          role: refId ? 'beta_tester' : 'user',
          subscription_ends_at: trialEnd,
          is_active: true,
        },
      ]);

      if (profileError) {
        console.error('Error insertando perfil:', profileError);
        // Podríamos intentar borrar el usuario en auth.users acá si falla el perfil, 
        // pero por simplicidad devolvemos error.
        return NextResponse.json(
          { error: 'Usuario creado, pero hubo un error guardando el perfil.' },
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
