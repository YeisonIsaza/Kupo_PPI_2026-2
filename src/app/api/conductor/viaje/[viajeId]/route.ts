import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Viaje } from "@/entities/Viaje";
import { Estado } from "@/entities/Estado";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ viajeId: string }> }
) {
    try {
        const { viajeId } = await params;
        const { estado } = await request.json();
        const ds = await getDataSource();
        const viajeRepo  = ds.getRepository(Viaje);
        const estadoRepo = ds.getRepository(Estado);

        const viaje = await viajeRepo.findOne({ where: { id_vj: Number(viajeId) } });
        if (!viaje) return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });

        const nuevoEstado = await estadoRepo.findOne({
            where: { nombre_estado: estado, categoria: 'VIAJE' }
        });
        if (!nuevoEstado) return NextResponse.json({ error: `Estado ${estado} no encontrado` }, { status: 400 });

        viaje.estado = nuevoEstado;
        await viajeRepo.save(viaje);

        return NextResponse.json({ message: `Viaje ${estado}` }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error PATCH viaje:", error);
        return NextResponse.json({ error: "Error al actualizar viaje" }, { status: 500 });
    }
}