import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { supabase } from '@/core/lib/supabase';
import { CalificacionConductor } from '@/core/models/CalificacionConductor';

export async function POST(request: Request) {
    try {
        const { userId, viajeId, conductorId, puntuacion, comentario } = await request.json();

        if (!userId || !viajeId || !conductorId || !puntuacion) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const ds = await getDataSource();
        const calRepo = ds.getRepository(CalificacionConductor);

        const yaCalificado = await calRepo.findOne({
            where: {
                viaje:             { id_vj: Number(viajeId) },
                usuarioEmisor:     { id_user: Number(userId) },
                conductorReceptor: { id_user: Number(conductorId) }
            }
        });
        if (yaCalificado) return NextResponse.json({ error: "Ya calificaste a este conductor" }, { status: 400 });

        const nuevaCal = calRepo.create({
            puntuacion_calcon:   Number(puntuacion),
            comentario_calcon:   comentario || '',
            viaje:               { id_vj: Number(viajeId) }      as any,
            usuarioEmisor:       { id_user: Number(userId) }      as any,
            conductorReceptor:   { id_user: Number(conductorId) } as any,
        });

        await calRepo.save(nuevaCal);
        return NextResponse.json({ message: "Calificación guardada" }, { status: 201 });

    } catch (error: any) {
        console.error("Error POST calificacion conductor:", error);
        return NextResponse.json({ error: "Error al guardar calificación" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const tipo   = searchParams.get('tipo');

        if (!userId || !tipo) return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });

        const ds = await getDataSource();
        let promedio = null;
        let total = 0;

        if (tipo === 'conductor') {
            const { data, error } = await supabase
                .from('calificacion_conductor')
                .select('puntuacion_calcon')
                .eq('id_user_receptor', Number(userId));
            
            if (error) throw error;
            
            total = data.length;
            if (total > 0) {
                promedio = (data.reduce((acc, curr) => acc + Number(curr.puntuacion_calcon), 0) / total).toFixed(1);
            }
        } else {
            const { data, error } = await supabase
                .from('calificacion_estudiante')
                .select('puntuacion_cale')
                .eq('id_user_receptor', Number(userId));

            if (error) throw error;
            
            total = data.length;
            if (total > 0) {
                promedio = (data.reduce((acc, curr) => acc + Number(curr.puntuacion_cale), 0) / total).toFixed(1);
            }
        }

        return NextResponse.json({ promedio, total }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error GET calificaciones:", error);
        return NextResponse.json({ error: "Error al obtener calificaciones" }, { status: 500 });
    }
}