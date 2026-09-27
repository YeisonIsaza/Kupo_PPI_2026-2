import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Parada } from "@/entities/Parada";
import { RutaConductor } from "@/entities/RutaConductor";
import { Estado } from "@/entities/Estado";
import { Universidad } from "@/entities/Universidad";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ds = await getDataSource();
        const paradas = await ds.getRepository(Parada).find({
            where: { rutaConductor: { id_rc: Number(id) } },
            relations: ['universidad', 'estado'],
            order: { orden_pds: 'ASC' }
        });
        return NextResponse.json(paradas, { status: 200 });

    } catch (error: any) {
        console.error("Error GET paradas:", error);
        return NextResponse.json({ error: "Error al obtener paradas" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const ds = await getDataSource();
        const paradaRepo = ds.getRepository(Parada);
        const estadoRepo = ds.getRepository(Estado);
        const rutaRepo   = ds.getRepository(RutaConductor);
        const uniRepo    = ds.getRepository(Universidad);

        const ruta = await rutaRepo.findOne({ where: { id_rc: Number(id) } });
        if (!ruta) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });

        const estadoActivo = await estadoRepo.findOne({
            where: { nombre_estado: 'Activa', categoria: 'RUTA' }
        });
        if (!estadoActivo) return NextResponse.json({ error: "Estado 'Activa' no encontrado" }, { status: 400 });

        let universidad = null;
        if (body.esUniversidad && body.nitUni) {
            universidad = await uniRepo.findOne({ where: { nit_uni: body.nitUni } });
        }

        // Crear parada sin hora_estimada primero
        const parada = paradaRepo.create({
            punto_recogida_pds:  body.nombre,
            orden_pds:           body.orden,
            es_universidad_pds:  body.esUniversidad ? 'SI' : 'NO',
            costo_adicional_pds: body.costoAdicional || 0,
            rutaConductor:       ruta,
            universidad:         universidad || undefined,
            estado:              estadoActivo,
        });

        const paradaGuardada = await paradaRepo.save(parada);

        // Actualizar hora con query nativa para evitar problema de timezone
        if (body.horaEstimada) {
            await ds.query(
                `UPDATE PARADA SET HORA_ESTIMADA_PDS = TO_DATE('1970-01-01 ${body.horaEstimada}', 'YYYY-MM-DD HH24:MI') WHERE ID_PDS = :1`,
                [paradaGuardada.id_pds]
            );
        }

        return NextResponse.json(paradaGuardada, { status: 201 });

    } catch (error: any) {
        console.error("Error POST parada:", error);
        return NextResponse.json({ error: "Error al crear parada" }, { status: 500 });
    }
}