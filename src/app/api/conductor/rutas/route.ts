import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { RutaConductor } from "@/entities/RutaConductor";
import { Estado } from "@/entities/Estado";
import { Conductor } from "@/entities/Conductor";
import { Universidad } from "@/entities/Universidad";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();
        const rutas = await ds.getRepository(RutaConductor).find({
            where: { conductor: { id_user: Number(userId) } },
            relations: ['estado', 'universidad', 'conductor'],
            order: { id_rc: 'DESC' }
        });

        return NextResponse.json(rutas, { status: 200 });

    } catch (error: any) {
        console.error("Error GET rutas:", error);
        return NextResponse.json({ error: "Error al obtener rutas" }, { status: 500 });
    }
}
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const ds = await getDataSource();
        const rutaRepo      = ds.getRepository(RutaConductor);
        const estadoRepo    = ds.getRepository(Estado);
        const conductorRepo = ds.getRepository(Conductor);
        const uniRepo       = ds.getRepository(Universidad);

        const estadoInactivo = await estadoRepo.findOne({
            where: { nombre_estado: 'Inactiva', categoria: 'RUTA' }
        });
        if (!estadoInactivo) return NextResponse.json({ error: "Estado 'Inactiva' no encontrado en categoría RUTA" }, { status: 400 });

        const conductor = await conductorRepo.findOne({
            where: { id_user: Number(body.userId) }
        });
        if (!conductor) return NextResponse.json({ error: "Conductor no encontrado" }, { status: 404 });

        const universidad = await uniRepo.findOne({
            where: { nit_uni: body.nitUni }
        });
        if (!universidad) return NextResponse.json({ error: "Universidad no encontrada" }, { status: 404 });

        const nuevaRuta = rutaRepo.create({
            hora_salida_rc:           body.horaSalida, 
            tarifa_rc:                Number(body.tarifa),
            punto_origen_latitud_rc:  body.origenLat,
            punto_origen_longitud_rc: body.origenLng,
            punto_destino_latitud_rc: body.destinoLat,
            punto_destino_longitud_rc: body.destinoLng,
            dias_semana:    body.diasSemana   || null,
            origen_nombre:  body.origenNombre || null,
            destino_nombre: body.destinoNombre || null,
            conductor,
            universidad,
            estado: estadoInactivo,
        });

        const rutaGuardada = await rutaRepo.save(nuevaRuta);
        return NextResponse.json(rutaGuardada, { status: 201 });

        
        } catch (error: any) {
            console.error(" Error POST ruta:", error);
            return NextResponse.json({ error: "Error al crear ruta" }, { status: 500 });
        }
    }