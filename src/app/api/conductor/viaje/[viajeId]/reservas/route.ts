import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Reserva } from "@/entities/Reserva";
import { Estado } from "@/entities/Estado";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ viajeId: string }> }
) {
    try {
        const { viajeId } = await params;
        const ds = await getDataSource();

        const reservas = await ds.getRepository(Reserva).find({
            where: { viaje: { id_vj: Number(viajeId) } },
            relations: ['usuario', 'estado', 'parada']
        });

        const resultado = reservas.map(r => ({
            id_res:    r.id_res,
            id_user:   r.usuario?.id_user,
            nombre:    `${r.usuario?.nombre_user} ${r.usuario?.primer_apellido}`,
            foto:      r.usuario?.foto_perf,
            parada:    r.parada?.punto_recogida_pds,
            estado:    r.estado?.nombre_estado,
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error("Error GET reservas viaje:", error);
        return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ viajeId: string }> }
) {
    try {
        const { viajeId } = await params;
        const { reservaId, accion } = await request.json();
        const ds = await getDataSource();
        const reservaRepo = ds.getRepository(Reserva);
        const estadoRepo  = ds.getRepository(Estado);

        const reserva = await reservaRepo.findOne({
            where: { id_res: Number(reservaId) }
        });
        if (!reserva) return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });

        const nombreEstado = accion === 'confirmar' ? 'Confirmada' : 'Rechazada';
        const nuevoEstado = await estadoRepo.findOne({
            where: { nombre_estado: nombreEstado, categoria: 'RESERVA' }
        });
        if (!nuevoEstado) return NextResponse.json({ error: "Estado no encontrado" }, { status: 400 });

        reserva.estado = nuevoEstado;
        await reservaRepo.save(reserva);

        return NextResponse.json({ message: `Reserva ${nombreEstado}` }, { status: 200 });

    } catch (error: any) {
        console.error(" Error PATCH reserva:", error);
        return NextResponse.json({ error: "Error al actualizar reserva" }, { status: 500 });
    }
}