import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { supabase } from '@/core/lib/supabase';
import { RutaConductor } from '@/core/models/RutaConductor';
import { Viaje } from '@/core/models/Viaje';
import { Vehiculo } from '@/core/models/Vehiculo';
import { Estado } from '@/core/models/Estado';
import { Parada } from '@/core/models/Parada';
import { Reserva } from '@/core/models/Reserva';
import { Usuario } from '@/core/models/Usuario';
import { esMujer } from '@/core/lib/modoElla';
import { analizarRuta, parsearPath, rutaGeoDesdeEntidad, serializarPath, simplificarPath } from '@/core/lib/geo';

/** Detalle de la ruta con geometría, paradas y aporte dinámico calculado por parada. */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ds = await getDataSource();
        const ruta = await ds.getRepository(RutaConductor).findOne({
            where: { id_rc: Number(id) },
            relations: ['estado', 'universidad', 'paradas'],
        });
        if (!ruta) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });

        const analisis = analizarRuta(rutaGeoDesdeEntidad(ruta));
        const { ruta_path_rc, ...resto } = ruta as any;

        return NextResponse.json({
            ...resto,
            paradas: analisis.paradas.map(p => {
                const original = ruta.paradas.find((x: any) => Number(x.id_pds) === p.id);
                return { ...original, aporte_estimado: p.aporte, tramo_km: p.tramoKm, fraccion: p.fraccion };
            }),
            ruta_path: parsearPath(ruta_path_rc),
            sentido:   analisis.sentido,
            total_km:  analisis.totalKm,
        }, { status: 200 });
    } catch (error: any) {
        console.error("Error GET ruta:", error);
        return NextResponse.json({ error: "Error al obtener ruta" }, { status: 500 });
    }
}

/** Actualiza el trazado real de la ruta (se recalcula en el mapa al agregar/quitar paradas). */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const path = parsearPath(body.rutaPath);
        if (!path) return NextResponse.json({ error: "Trazado inválido" }, { status: 400 });

        const ds = await getDataSource();
        const rutaRepo = ds.getRepository(RutaConductor);
        const ruta = await rutaRepo.findOne({ where: { id_rc: Number(id) } });
        if (!ruta) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });

        const distanciaKm = Number(body.distanciaKm);
        const duracionMin = Number(body.duracionMin);
        ruta.ruta_path_rc    = serializarPath(simplificarPath(path));
        ruta.distancia_km_rc = Number.isFinite(distanciaKm) && distanciaKm > 0 ? Number(distanciaKm.toFixed(2)) : ruta.distancia_km_rc;
        ruta.duracion_min_rc = Number.isFinite(duracionMin) && duracionMin > 0 ? Math.round(duracionMin) : ruta.duracion_min_rc;
        await rutaRepo.save(ruta);

        return NextResponse.json({ message: "Trazado actualizado" }, { status: 200 });
    } catch (error: any) {
        console.error("Error PUT ruta (trazado):", error);
        return NextResponse.json({ error: "Error al actualizar trazado" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { accion } = await request.json();
        const ds = await getDataSource();
        const rutaRepo    = ds.getRepository(RutaConductor);
        const viajeRepo   = ds.getRepository(Viaje);
        const vehiculoRepo = ds.getRepository(Vehiculo);
        const estadoRepo  = ds.getRepository(Estado);

        const ruta = await rutaRepo.findOne({
            where: { id_rc: Number(id) },
            relations: ['estado', 'conductor', 'conductor.usuario']
        });
        if (!ruta) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });

        if (accion === 'activar') {
            // Verificar que no tenga ya un viaje activo hoy
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const viajeExistente = await viajeRepo
                .createQueryBuilder('v')
                .innerJoin('v.estado', 'e')
                .where('v.rutaConductor = :idRc', { idRc: Number(id) })
                .andWhere('v.fecha_vj >= :hoy', { hoy })
                .andWhere("e.nombre_estado NOT IN ('Finalizado', 'Cancelado')")
                .getOne();

            if (viajeExistente) {
                return NextResponse.json({ error: "Ya tienes un viaje activo para esta ruta hoy" }, { status: 400 });
            }

            // Cambiar estado de ruta a Activa
            const estadoActiva = await estadoRepo.findOne({
                where: { nombre_estado: 'Activa', categoria: 'RUTA' }
            });
            if (!estadoActiva) return NextResponse.json({ error: "Estado Activa no encontrado" }, { status: 400 });
            ruta.estado = estadoActiva;
            await rutaRepo.save(ruta);

            // Buscar vehículo del conductor
            const vehiculo = await vehiculoRepo.findOne({
                where: { usuario: { id_user: ruta.conductor.id_user } }
            });
            if (!vehiculo) return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 400 });

            // Buscar estado Disponible
            const estadoDisponible = await estadoRepo.findOne({
                where: { nombre_estado: 'Disponible', categoria: 'VIAJE' }
            });
            if (!estadoDisponible) return NextResponse.json({ error: "Estado Disponible no encontrado" }, { status: 400 });

            // Verificar si la conductora tiene Modo Ella activo
            const esConductoraMujer = esMujer(ruta.conductor?.usuario?.genero_user);
            
            const rawModoElla = ruta.conductor?.usuario?.modo_ella_user;
            const isModoElla = rawModoElla === true || rawModoElla === 1 || String(rawModoElla) === '1' || String(rawModoElla) === 'true';
            
            const modoEllaActivo = isModoElla && esConductoraMujer;

            // Crear el viaje
            const nuevoViaje = viajeRepo.create({
                fecha_vj:      new Date(),
                rutaConductor: ruta,
                vehiculo,
                estado:        estadoDisponible,
                solo_mujeres_vj: modoEllaActivo
            });
            const viajeGuardado = await viajeRepo.save(nuevoViaje);

            // Guardar hora_salida_vj con query nativa
            // ✅ Pon esto
                if (ruta.hora_salida_rc) {
                    const { error } = await supabase
                        .from('viaje')
                        .update({ hora_salida_vj: `1970-01-01 ${ruta.hora_salida_rc}:00` })
                        .eq('id_vj', viajeGuardado.id_vj);
                    if (error) throw error;
                }

            return NextResponse.json({ message: "Ruta activada y viaje creado", viajeId: viajeGuardado.id_vj }, { status: 200 });

        } else {
            // Desactivar
            const estadoInactiva = await estadoRepo.findOne({
                where: { nombre_estado: 'Inactiva', categoria: 'RUTA' }
            });
            if (!estadoInactiva) return NextResponse.json({ error: "Estado Inactiva no encontrado" }, { status: 400 });
            ruta.estado = estadoInactiva;
            await rutaRepo.save(ruta);
            return NextResponse.json({ message: "Ruta desactivada" }, { status: 200 });
        }

    } catch (error: any) {
        console.error("Error PATCH ruta:", error);
        return NextResponse.json({ error: "Error al actualizar ruta" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ds = await getDataSource();
        const rutaRepo   = ds.getRepository(RutaConductor);
        const paradaRepo = ds.getRepository(Parada);
        const viajeRepo  = ds.getRepository(Viaje);
        const reservaRepo = ds.getRepository(Reserva);

        const ruta = await rutaRepo.findOne({ where: { id_rc: Number(id) } });
        if (!ruta) return NextResponse.json({ error: "Ruta no encontrada" }, { status: 404 });

        // 1. Buscar viajes de esta ruta
        const viajes = await viajeRepo.find({
            where: { rutaConductor: { id_rc: Number(id) } }
        });

        // 2. Borrar reservas de cada viaje
        for (const viaje of viajes) {
            await reservaRepo.delete({ viaje: { id_vj: viaje.id_vj } });
        }

        // 3. Borrar viajes
        await viajeRepo.delete({ rutaConductor: { id_rc: Number(id) } });

        // 4. Borrar paradas
        const { error: errParada } = await supabase
            .from('parada')
            .delete()
            .eq('id_rc', Number(id));
        if (errParada) throw errParada;

        // 5. Borrar ruta
        await rutaRepo.remove(ruta);
        return NextResponse.json({ message: "Ruta eliminada" }, { status: 200 });

    } catch (error: any) {
        console.error("Error DELETE ruta:", error);
        return NextResponse.json({ error: "Error al eliminar ruta" }, { status: 500 });
    }
}