import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Reserva } from "@/entities/Reserva";
import { CalificacionConductor } from "@/entities/CalificacionConductor";

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
            const calResult = await ds.query(
                `SELECT AVG(PUNTUACION_CALCON) as promedio, COUNT(*) as total
                 FROM CALIFICACION_CONDUCTOR WHERE ID_USER_RECEPTOR = :1`,
                [conductor?.id_user]
            );

            return {
                id_vj:               r.viaje?.id_vj,
                conductor_id:        conductor?.id_user,
                conductor_nombre:    conductorUsuario ? `${conductorUsuario.nombre_user} ${conductorUsuario.primer_apellido}` : 'Conductor',
                conductor_foto:      conductorUsuario?.foto_perf,
                origen:              r.viaje?.rutaConductor?.origen_nombre,
                destino:             r.viaje?.rutaConductor?.destino_nombre || r.viaje?.rutaConductor?.universidad?.nombre_uni,
                promedio_conductor:  calResult[0]?.PROMEDIO ? Number(calResult[0].PROMEDIO).toFixed(1) : null,
                total_calificaciones: Number(calResult[0]?.TOTAL) || 0,
                calificado:          !!yaCalificado,
            };
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error GET viajes finalizados:", error);
        return NextResponse.json({ error: "Error al obtener viajes" }, { status: 500 });
    }
}