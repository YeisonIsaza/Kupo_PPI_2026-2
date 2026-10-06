import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { Reserva } from '@/core/models/Reserva';
import { Viaje } from '@/core/models/Viaje';
import { Estado } from '@/core/models/Estado';
import { Usuario } from '@/core/models/Usuario';
import { In, Not } from "typeorm";
import { ESTADOS_RESERVA_INACTIVOS, esMujer } from '@/core/lib/modoElla';

// Error controlado para devolver un status HTTP concreto desde dentro de la transacción
class ReservaError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

export async function POST(request: Request) {
    try {
        const { userId, viajeId, paradaId } = await request.json();
        if (!userId || !viajeId || !paradaId) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const ds = await getDataSource();

        await ds.transaction(async manager => {
            const reservaRepo = manager.getRepository(Reserva);
            const estadoRepo  = manager.getRepository(Estado);

            // Bloqueamos la fila del viaje para que dos reservas simultáneas no rompan la regla "solo mujeres"
            const viajeLock = await manager.getRepository(Viaje).findOne({
                where: { id_vj: Number(viajeId) },
                lock: { mode: 'pessimistic_write' },
            });
            if (!viajeLock) throw new ReservaError("Viaje no encontrado", 404);

            const viaje = await manager.getRepository(Viaje).findOne({
                where: { id_vj: Number(viajeId) },
                relations: ['rutaConductor', 'rutaConductor.conductor', 'rutaConductor.conductor.usuario'],
            });

            const usuario = await manager.getRepository(Usuario).findOne({ where: { id_user: Number(userId) } });
            if (!usuario) throw new ReservaError("Usuario no encontrado", 404);

            // Verificar que no tenga ya una reserva activa en este viaje
            const yaReservado = await reservaRepo.findOne({
                where: {
                    viaje:   { id_vj: Number(viajeId) },
                    usuario: { id_user: Number(userId) },
                },
                relations: ['estado']
            });

            if (yaReservado && yaReservado.estado?.nombre_estado !== 'Cancelada') {
                throw new ReservaError("Ya tienes una reserva en este viaje", 400);
            }

            // --- Reglas Modo Ella ---
            const usuarioEsMujer  = esMujer(usuario.genero_user);
            const quiereModoElla  = !!usuario.modo_ella_user && usuarioEsMujer;

            // Viaje ya bloqueado como "solo mujeres": ningún hombre puede unirse
            if (viaje?.solo_mujeres_vj && !usuarioEsMujer) {
                throw new ReservaError("Este viaje es exclusivo para mujeres (Modo Ella)", 403);
            }

            if (quiereModoElla) {
                const conductoraEsMujer = esMujer(viaje?.rutaConductor?.conductor?.usuario?.genero_user);
                if (!conductoraEsMujer) {
                    throw new ReservaError("Con el Modo Ella activo solo puedes reservar viajes con conductoras", 403);
                }

                const reservasActivas = await reservaRepo.find({
                    where: {
                        viaje:  { id_vj: Number(viajeId) },
                        estado: { nombre_estado: Not(In(ESTADOS_RESERVA_INACTIVOS)) },
                    },
                    relations: ['usuario', 'estado'],
                });
                if (reservasActivas.some(r => !esMujer(r.usuario?.genero_user))) {
                    throw new ReservaError("Este viaje ya tiene acompañantes hombres, no cumple con el Modo Ella", 403);
                }
            }

            const estadoSolicitada = await estadoRepo.findOne({
                where: { nombre_estado: 'Solicitada', categoria: 'RESERVA' }
            });
            if (!estadoSolicitada) throw new ReservaError("Estado Solicitada no encontrado", 400);

            const nuevaReserva = reservaRepo.create({
                viaje:   { id_vj:   Number(viajeId) }  as any,
                usuario: { id_user: Number(userId) }    as any,
                parada:  { id_pds:  Number(paradaId) }  as any,
                estado:  estadoSolicitada,
            });
            await reservaRepo.save(nuevaReserva);

            // Primera reserva con Modo Ella: el viaje queda reservado solo para mujeres
            if (quiereModoElla && !viajeLock.solo_mujeres_vj) {
                await manager.getRepository(Viaje).update({ id_vj: Number(viajeId) }, { solo_mujeres_vj: true });
            }
        });

        return NextResponse.json({ message: "Reserva solicitada correctamente" }, { status: 201 });

    } catch (error: any) {
        if (error instanceof ReservaError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
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