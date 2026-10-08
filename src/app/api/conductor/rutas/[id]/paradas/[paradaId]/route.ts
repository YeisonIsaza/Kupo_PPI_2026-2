import { NextResponse } from "next/server";
import { In, Not } from "typeorm";
import { getDataSource } from '@/core/database/db';
import { Parada } from '@/core/models/Parada';
import { Reserva } from '@/core/models/Reserva';
import { ESTADOS_RESERVA_INACTIVOS } from '@/core/lib/modoElla';

class ParadaError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string, paradaId: string }> }
) {
    try {
        const { id, paradaId } = await params;  // ← await aquí
        const ds = await getDataSource();

        await ds.transaction(async manager => {
            const paradaRepo  = manager.getRepository(Parada);
            const reservaRepo = manager.getRepository(Reserva);

            const parada = await paradaRepo.findOne({
                where: { id_pds: Number(paradaId), rutaConductor: { id_rc: Number(id) } }
            });
            if (!parada) throw new ParadaError("Parada no encontrada", 404);

            // No se puede borrar una parada con pasajeros esperando en ella
            const reservasActivas = await reservaRepo.count({
                where: {
                    parada: { id_pds: parada.id_pds },
                    estado: { nombre_estado: Not(In(ESTADOS_RESERVA_INACTIVOS)) },
                    viaje:  { estado: { nombre_estado: Not(In(['Finalizado', 'Cancelado'])) } },
                },
            });
            if (reservasActivas > 0) {
                throw new ParadaError("Esta parada tiene reservas activas. Recházalas o espera a que finalicen antes de eliminarla.", 409);
            }

            // Las reservas históricas conservan su aporte pero se desvinculan de la parada
            await reservaRepo
                .createQueryBuilder()
                .update(Reserva)
                .set({ parada: null as any })
                .where('id_pds = :id', { id: parada.id_pds })
                .execute();

            const ordenEliminado = parada.orden_pds;
            await paradaRepo.remove(parada);

            // Compactar el orden de las paradas restantes
            await paradaRepo
                .createQueryBuilder()
                .update(Parada)
                .set({ orden_pds: () => 'orden_pds - 1' })
                .where('id_rc = :idRc AND orden_pds > :orden', { idRc: Number(id), orden: ordenEliminado })
                .execute();
        });

        return NextResponse.json({ message: "Parada eliminada" }, { status: 200 });

    } catch (error: any) {
        if (error instanceof ParadaError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error("Error DELETE parada:", error);
        return NextResponse.json({ error: "Error al eliminar parada" }, { status: 500 });
    }
}