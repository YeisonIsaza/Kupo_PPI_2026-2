import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { supabase } from '@/core/lib/supabase';
import { Reserva } from '@/core/models/Reserva';
import { CalificacionConductor } from '@/core/models/CalificacionConductor';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();

        // Reservas confirmadas de viajes finalizados
        const reservas = await ds.getRepository(Reserva).find({
            where: {
                usuario: { id_user: Number(userId) },
                estado:  { nombre_estado: 'Confirmada' },
                viaje:   { estado: { nombre_estado: 'Finalizado' } }
            },
            relations: [
                'viaje',
                'viaje.rutaConductor',
                'viaje.rutaConductor.conductor',
                'viaje.rutaConductor.conductor.usuario',
                'viaje.rutaConductor.universidad',
                'estado'
            ]
        });

        const resultado = await Promise.all(reservas.map(async r => {
            const conductor = r.viaje?.rutaConductor?.conductor;
            const conductorUsuario = conductor?.usuario;

            // Verificar si ya calificó
            const yaCalificado = await ds.getRepository(CalificacionConductor).findOne({
                where: {
                    viaje:           { id_vj: r.viaje?.id_vj },
                    usuarioEmisor:   { id_user: Number(userId) },
                    conductorReceptor: { id_user: conductor?.id_user }
                }
            });

            // Promedio del conductor
            let promedio = null;
            let totalCal = 0;
            if (conductor?.id_user) {
                const { data: calResult, error: calError } = await supabase
                    .from('calificacion_conductor')
                    .select('puntuacion_calcon')
                    .eq('id_user_receptor', Number(conductor.id_user));
                
                if (!calError && calResult) {
                    totalCal = calResult.length;
                    if (totalCal > 0) {
                        promedio = (calResult.reduce((acc, curr) => acc + Number(curr.puntuacion_calcon), 0) / totalCal).toFixed(1);
                    }
                }
            }

            return {
                id_vj:               r.viaje?.id_vj,
                conductor_id:        conductor?.id_user,
                conductor_nombre:    conductorUsuario ? `${conductorUsuario.nombre_user} ${conductorUsuario.primer_apellido}` : 'Conductor',
                conductor_foto:      conductorUsuario?.foto_perf,
                origen:              r.viaje?.rutaConductor?.origen_nombre,
                destino:             r.viaje?.rutaConductor?.destino_nombre || r.viaje?.rutaConductor?.universidad?.nombre_uni,
                promedio_conductor:  promedio,
                total_calificaciones: totalCal,
                calificado:          !!yaCalificado,
            };
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error GET viajes finalizados:", error);
        return NextResponse.json({ error: "Error al obtener viajes" }, { status: 500 });
    }
}