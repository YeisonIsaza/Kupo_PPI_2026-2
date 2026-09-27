import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Viaje } from "@/entities/Viaje";
import { In } from "typeorm";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId      = searchParams.get('userId');
        const estadoParam = searchParams.get('estado');

        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const estados = estadoParam
            ? [estadoParam]
            : ['Disponible', 'Lleno', 'En Progreso'];

        const ds = await getDataSource();
        const viaje = await ds.getRepository(Viaje).findOne({
            where: {
                rutaConductor: { conductor: { id_user: Number(userId) } },
                estado: { nombre_estado: In(estados) }
            },
            relations: [
                'rutaConductor',
                'rutaConductor.paradas',
                'rutaConductor.universidad',
                'vehiculo',
                'estado'
            ],
            order: { id_vj: 'DESC' }
        });

        return NextResponse.json(viaje || null, { status: 200 });

    } catch (error: any) {
        console.error(" Error GET viaje:", error);
        return NextResponse.json({ error: "Error al obtener viaje" }, { status: 500 });
    }
}