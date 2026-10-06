import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { Usuario } from '@/core/models/Usuario';
import { esGeneroValido, esMujer } from '@/core/lib/modoElla';

// GET /api/pasajero/modo-ella?userId=1  -> { genero, modo_ella, puede_activar }
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({ error: "userId requerido" }, { status: 400 });
        }

        const ds = await getDataSource();
        const usuario = await ds.getRepository(Usuario).findOne({ where: { id_user: Number(userId) } });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        return NextResponse.json({
            genero:         usuario.genero_user ?? null,
            modo_ella:      !!usuario.modo_ella_user && esMujer(usuario.genero_user),
            puede_activar:  esMujer(usuario.genero_user),
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error GET modo-ella:", error);
        return NextResponse.json({ error: "Error al obtener el Modo Ella" }, { status: 500 });
    }
}

// PATCH /api/pasajero/modo-ella
//   { userId, activar: boolean }  -> activa/desactiva el modo (solo mujeres)
//   { userId, genero: 'male'|'female' } -> define el género SOLO si aún no estaba definido (usuarios antiguos)
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { userId, activar, genero } = body;

        if (!userId || isNaN(Number(userId))) {
            return NextResponse.json({ error: "userId requerido" }, { status: 400 });
        }

        const ds = await getDataSource();
        const repo = ds.getRepository(Usuario);
        const usuario = await repo.findOne({ where: { id_user: Number(userId) } });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        // --- Definir género (una sola vez) ---
        if (genero !== undefined) {
            if (!esGeneroValido(genero)) {
                return NextResponse.json({ error: "Género inválido (male o female)" }, { status: 400 });
            }
            if (usuario.genero_user) {
                return NextResponse.json({ error: "Tu género ya está definido y no puede modificarse" }, { status: 403 });
            }
            usuario.genero_user = genero;
            await repo.save(usuario);
        }

        // --- Activar / desactivar Modo Ella ---
        if (activar !== undefined) {
            if (typeof activar !== 'boolean') {
                return NextResponse.json({ error: "El campo 'activar' debe ser booleano" }, { status: 400 });
            }
            if (activar && !esMujer(usuario.genero_user)) {
                return NextResponse.json({ error: "El Modo Ella solo está disponible para usuarias" }, { status: 403 });
            }
            usuario.modo_ella_user = activar;
            await repo.save(usuario);
        }

        return NextResponse.json({
            genero:         usuario.genero_user ?? null,
            modo_ella:      !!usuario.modo_ella_user && esMujer(usuario.genero_user),
            puede_activar:  esMujer(usuario.genero_user),
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error PATCH modo-ella:", error);
        return NextResponse.json({ error: "Error al actualizar el Modo Ella" }, { status: 500 });
    }
}
