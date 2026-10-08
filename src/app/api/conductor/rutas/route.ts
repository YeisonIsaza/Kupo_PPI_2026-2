import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getDataSource } from '@/core/database/db';
import { RutaConductor } from '@/core/models/RutaConductor';
import { Estado } from '@/core/models/Estado';
import { Conductor } from '@/core/models/Conductor';
import { Universidad } from '@/core/models/Universidad';
import { Parada } from '@/core/models/Parada';
import { aLatLng, parsearPath, serializarPath, simplificarPath } from '@/core/lib/geo';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();
        const rutas = await ds.getRepository(RutaConductor).find({
            where: { conductor: { id_user: Number(userId) } },
            relations: ['estado', 'universidad', 'conductor', 'paradas'],
            order: { id_rc: 'DESC' }
        });

        return NextResponse.json(rutas, { status: 200 });

    } catch (error: any) {
        console.error("Error GET rutas:", error);
        return NextResponse.json({ error: "Error al obtener rutas" }, { status: 500 });
    }
}

class RutaError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const origen  = aLatLng(body.origenLat, body.origenLng);
        const destino = aLatLng(body.destinoLat, body.destinoLng);
        if (!origen || !destino) {
            return NextResponse.json({ error: "Origen y destino deben tener coordenadas válidas" }, { status: 400 });
        }
        const tarifa = Number(body.tarifa);
        if (!Number.isFinite(tarifa) || tarifa <= 0) {
            return NextResponse.json({ error: "La tarifa debe ser mayor a 0" }, { status: 400 });
        }

        // Trazado real enviado por el mapa (opcional). Se simplifica para mantenerlo liviano.
        const pathCrudo = parsearPath(body.rutaPath);
        const rutaPath  = pathCrudo ? serializarPath(simplificarPath(pathCrudo)) : null;
        const distanciaKm = Number(body.distanciaKm);
        const duracionMin = Number(body.duracionMin);

        // Paradas intermedias definidas en el mapa
        const paradasEntrada: any[] = Array.isArray(body.paradas) ? body.paradas : [];
        const paradasValidas = paradasEntrada
            .map((p, i) => ({
                nombre: String(p?.nombre || '').trim().slice(0, 200),
                coord:  aLatLng(p?.lat, p?.lng),
                costo:  Math.max(0, Number(p?.costoAdicional) || 0),
                orden:  i + 1,
            }))
            .filter(p => p.nombre && p.coord);
        if (paradasValidas.length !== paradasEntrada.length) {
            return NextResponse.json({ error: "Todas las paradas deben tener nombre y ubicación en el mapa" }, { status: 400 });
        }

        const ds = await getDataSource();

        const rutaGuardada = await ds.transaction(async manager => {
            const rutaRepo      = manager.getRepository(RutaConductor);
            const estadoRepo    = manager.getRepository(Estado);
            const conductorRepo = manager.getRepository(Conductor);
            const uniRepo       = manager.getRepository(Universidad);
            const paradaRepo    = manager.getRepository(Parada);

            const estadoInactivo = await estadoRepo.findOne({
                where: { nombre_estado: 'Inactiva', categoria: 'RUTA' }
            });
            if (!estadoInactivo) throw new RutaError("Estado 'Inactiva' no encontrado en categoría RUTA", 400);

            const conductor = await conductorRepo.findOne({
                where: { id_user: Number(body.userId) }
            });
            if (!conductor) throw new RutaError("Conductor no encontrado", 404);

            const universidad = await uniRepo.findOne({
                where: { nit_uni: body.nitUni }
            });
            if (!universidad) throw new RutaError("Universidad no encontrada", 404);

            const nuevaRuta = rutaRepo.create({
                hora_salida_rc:            body.horaSalida,
                tarifa_rc:                 tarifa,
                punto_origen_latitud_rc:   origen.lat,
                punto_origen_longitud_rc:  origen.lng,
                punto_destino_latitud_rc:  destino.lat,
                punto_destino_longitud_rc: destino.lng,
                dias_semana:     body.diasSemana    || null,
                origen_nombre:   body.origenNombre  || null,
                destino_nombre:  body.destinoNombre || null,
                ruta_path_rc:    rutaPath,
                distancia_km_rc: Number.isFinite(distanciaKm) && distanciaKm > 0 ? Number(distanciaKm.toFixed(2)) : null,
                duracion_min_rc: Number.isFinite(duracionMin) && duracionMin > 0 ? Math.round(duracionMin) : null,
                conductor,
                universidad,
                estado: estadoInactivo,
            });
            const ruta = await rutaRepo.save(nuevaRuta);

            if (paradasValidas.length > 0) {
                const estadoParada = await estadoRepo.findOne({
                    where: { nombre_estado: 'Activa', categoria: 'RUTA' }
                });
                if (!estadoParada) throw new RutaError("Estado 'Activa' no encontrado para las paradas", 400);

                await paradaRepo.save(paradasValidas.map(p => paradaRepo.create({
                    punto_recogida_pds:  p.nombre,
                    orden_pds:           p.orden,
                    es_universidad_pds:  'NO',
                    costo_adicional_pds: p.costo,
                    latitud_pds:         p.coord!.lat,
                    longitud_pds:        p.coord!.lng,
                    rutaConductor:       ruta,
                    estado:              estadoParada,
                })));
            }
            return ruta;
        });

        return NextResponse.json(rutaGuardada, { status: 201 });

    } catch (error: any) {
        if (error instanceof RutaError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error(" Error POST ruta:", error);
        return NextResponse.json({ error: "Error al crear ruta" }, { status: 500 });
    }
}