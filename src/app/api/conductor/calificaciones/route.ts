import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Reserva } from "@/entities/Reserva";
import { CalificacionEstudiante } from "@/entities/CalificacionEstudiante";
import { Viaje } from "@/entities/Viaje";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const viajeId = searchParams.get('viajeId');
        if (!viajeId) return NextResponse.json({ error: "viajeId requerido" }, { status: 400 });

        const ds = await getDataSource();

        // Traer reservas del viaje con datos del usuario
        const reservas = await ds.getRepository(Reserva).find({
            where: { viaje: { id_vj: Number(viajeId) } },
            relations: ['usuario', 'estado', 'parada']
        });

        // Verificar cuáles ya fueron calificados
        const calificaciones = await ds.getRepository(CalificacionEstudiante).find({
            where: { viaje: { id_vj: Number(viajeId) } },
            relations: ['usuarioReceptor']
        });

        const resultado = reservas.map(r => ({
            id_res:      r.id_res,
            id_user:     r.usuario?.id_user,
            nombre:      `${r.usuario?.nombre_user} ${r.usuario?.primer_apellido}`,
            foto_perf:   r.usuario?.foto_perf,
            parada:      r.parada?.punto_recogida_pds,
            estado:      r.estado?.nombre_estado,
            calificado:  calificaciones.some(c => c.usuarioReceptor?.id_user === r.usuario?.id_user)
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error(" Error GET calificaciones:", error);
        return NextResponse.json({ error: "Error al obtener pasajeros" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { viajeId, userId, receptorId, puntuacion, comentario } = body;

        if (!viajeId || !userId || !receptorId || !puntuacion) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const ds = await getDataSource();
        const calRepo  = ds.getRepository(CalificacionEstudiante);
        const viajeRepo = ds.getRepository(Viaje);

        // Verificar que no haya calificado ya a este estudiante
        const yaCalificado = await calRepo.findOne({
            where: {
                viaje:            { id_vj: Number(viajeId) },
                usuarioReceptor:  { id_user: Number(receptorId) },
                usuarioEmisor:    { id_user: Number(userId) }
            }
        });
        if (yaCalificado) return NextResponse.json({ error: "Ya calificaste a este estudiante" }, { status: 400 });

        const viaje = await viajeRepo.findOne({ where: { id_vj: Number(viajeId) } });
        if (!viaje) return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });

        const nuevaCal = calRepo.create({
            puntuacion_cale:  Number(puntuacion),
            comentario_cale:  comentario || '',
            viaje:            { id_vj: Number(viajeId) } as any,
            usuarioEmisor:    { id_user: Number(userId) } as any,
            usuarioReceptor:  { id_user: Number(receptorId) } as any,
        });

        await calRepo.save(nuevaCal);
        return NextResponse.json({ message: "Calificación guardada" }, { status: 201 });

    } catch (error: any) {
        console.error(" Error POST calificacion:", error);
        return NextResponse.json({ error: "Error al guardar calificación" }, { status: 500 });
    }
}