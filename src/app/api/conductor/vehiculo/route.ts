import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Vehiculo } from "@/entities/Vehiculo";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();
        const vehiculo = await ds.getRepository(Vehiculo).findOne({
            where: { usuario: { id_user: Number(userId) } },
            relations: ['estado']
        });

        return NextResponse.json(vehiculo || null, { status: 200 });

    } catch (error: any) {
        console.error(" Error GET vehiculo:", error);
        return NextResponse.json({ error: "Error al obtener vehículo" }, { status: 500 });
    }
}
export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const body = await request.json();
        const ds = await getDataSource();
        const vehiculoRepo = ds.getRepository(Vehiculo);

        const vehiculo = await vehiculoRepo.findOne({
            where: { usuario: { id_user: Number(userId) } }
        });
        if (!vehiculo) return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });

        vehiculo.marca_veh         = body.marca_veh         || vehiculo.marca_veh;
        vehiculo.modelo_veh        = body.modelo_veh        || vehiculo.modelo_veh;
        vehiculo.color_veh         = body.color_veh         || vehiculo.color_veh;
        vehiculo.anno_creacion_veh = body.anno_creacion_veh || vehiculo.anno_creacion_veh;
        vehiculo.numero_soat_veh   = body.numero_soat_veh   || vehiculo.numero_soat_veh;
        vehiculo.total_cupos_veh   = body.total_cupos_veh   || vehiculo.total_cupos_veh;

        await vehiculoRepo.save(vehiculo);
        return NextResponse.json(vehiculo, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error PUT vehiculo:", error);
        return NextResponse.json({ error: "Error al actualizar vehículo" }, { status: 500 });
    }
}