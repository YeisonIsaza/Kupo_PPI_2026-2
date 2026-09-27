import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Reserva } from "@/entities/Reserva";
import { Viaje } from "@/entities/Viaje";
import { Estado } from "@/entities/Estado";

export async function POST(request: Request) {
    try {
        const { userId, viajeId, paradaId } = await request.json();
        if (!userId || !viajeId || !paradaId) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const ds = await getDataSource();
        const reservaRepo = ds.getRepository(Reserva);
        const estadoRepo  = ds.getRepository(Estado);

        // Verificar que no tenga ya una reserva activa en este viaje
        const yaReservado = await reservaRepo.findOne({
            where: {
                viaje:   { id_vj: Number(viajeId) },
                usuario: { id_user: Number(userId) },
            },
            relations: ['estado']
        });

        if (yaReservado && yaReservado.estado?.nombre_estado !== 'Cancelada') {
            return NextResponse.json({ error: "Ya tienes una reserva en este viaje" }, { status: 400 });
        }

        const estadoSolicitada = await estadoRepo.findOne({
            where: { nombre_estado: 'Solicitada', categoria: 'RESERVA' }
        });
        if (!estadoSolicitada) return NextResponse.json({ error: "Estado Solicitada no encontrado" }, { status: 400 });

        const nuevaReserva = reservaRepo.create({
            viaje:   { id_vj:   Number(viajeId) }  as any,
            usuario: { id_user: Number(userId) }    as any,
            parada:  { id_pds:  Number(paradaId) }  as any,
            estado:  estadoSolicitada,
        });

        await reservaRepo.save(nuevaReserva);
        return NextResponse.json({ message: "Reserva solicitada correctamente" }, { status: 201 });

    } catch (error: any) {
        console.error(" Error POST reserva:", error);
        return NextResponse.json({ error: "Error al crear reserva" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();
        const reservas = await ds.getRepository(Reserva).find({
            where: { usuario: { id_user: Number(userId) } },
            relations: ['viaje', 'viaje.rutaConductor', 'viaje.rutaConductor.universidad', 'viaje.estado', 'estado', 'parada'],
            order: { id_res: 'DESC' }
        });

        return NextResponse.json(reservas, { status: 200 });

    } catch (error: any) {
        console.error(" Error GET reservas:", error);
        return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
    }
}