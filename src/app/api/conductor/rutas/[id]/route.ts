import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { RutaConductor } from "@/entities/RutaConductor";
import { Viaje } from "@/entities/Viaje";
import { Vehiculo } from "@/entities/Vehiculo";
import { Estado } from "@/entities/Estado";
import { Parada } from "@/entities/Parada";
import { Reserva } from "@/entities/Reserva";

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
            relations: ['estado', 'conductor']
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

            // Crear el viaje
            const nuevoViaje = viajeRepo.create({
                fecha_vj:      new Date(),
                rutaConductor: ruta,
                vehiculo,
                estado:        estadoDisponible,
            });
            const viajeGuardado = await viajeRepo.save(nuevoViaje);

            // Guardar hora_salida_vj con query nativa
            // ✅ Pon esto
                if (ruta.hora_salida_rc) {
                    await ds.query(
                        `UPDATE VIAJE SET HORA_SALIDA_VJ = TO_DATE('1970-01-01 ' || :1, 'YYYY-MM-DD HH24:MI') WHERE ID_VJ = :2`,
                        [ruta.hora_salida_rc, viajeGuardado.id_vj]
                    );
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
        await ds.query(
            `DELETE FROM PARADA WHERE ID_RC = :1`,
            [Number(id)]
        );

        // 5. Borrar ruta
        await rutaRepo.remove(ruta);
        return NextResponse.json({ message: "Ruta eliminada" }, { status: 200 });

    } catch (error: any) {
        console.error("Error DELETE ruta:", error);
        return NextResponse.json({ error: "Error al eliminar ruta" }, { status: 500 });
    }
}