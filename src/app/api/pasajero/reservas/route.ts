import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { Reserva } from '@/core/models/Reserva';
import { Viaje } from '@/core/models/Viaje';
import { Estado } from '@/core/models/Estado';
import { Usuario } from '@/core/models/Usuario';
import { In, Not } from "typeorm";
import { ESTADOS_RESERVA_INACTIVOS, esMujer } from '@/core/lib/modoElla';
import { analizarRuta, redondearCOP, rutaGeoDesdeEntidad } from '@/core/lib/geo';

// Error controlado para devolver un status HTTP concreto desde dentro de la transacción
class ReservaError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

export async function POST(request: Request) {
    try {
        const { userId, viajeId, paradaId } = await request.json();
        if (!userId || !viajeId) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const ds = await getDataSource();
        let aporteCalculado = 0;

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
                relations: [
                    'estado',
                    'rutaConductor', 'rutaConductor.conductor', 'rutaConductor.conductor.usuario',
                    'rutaConductor.paradas', 'rutaConductor.universidad',
                ],
            });

            if (viaje?.estado?.nombre_estado && viaje.estado.nombre_estado !== 'Disponible') {
                throw new ReservaError("Este viaje ya no está disponible para reservas", 400);
            }

            // --- Aporte dinámico según la parada elegida (calculado en el servidor) ---
            const analisis = analizarRuta(rutaGeoDesdeEntidad(viaje?.rutaConductor));
            if (paradaId) {
                const parada = analisis.paradas.find(p => p.id === Number(paradaId));
                if (!parada) throw new ReservaError("La parada seleccionada no pertenece a este viaje", 400);
                aporteCalculado = parada.aporte;
            } else {
                aporteCalculado = redondearCOP(Number(viaje?.rutaConductor?.tarifa_rc) || 0);
            }

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
            
            const rawModoElla = usuario.modo_ella_user;
            const isModoElla = rawModoElla === true || rawModoElla === 1 || String(rawModoElla) === '1' || String(rawModoElla) === 'true';
            
            const quiereModoElla  = isModoElla && usuarioEsMujer;

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
                estado:  estadoSolicitada,
                aporte_res: aporteCalculado,
                ...(paradaId ? { parada: { id_pds: Number(paradaId) } as any } : {})
            });
            await reservaRepo.save(nuevaReserva);

            // Primera reserva con Modo Ella: el viaje queda reservado solo para mujeres
            if (quiereModoElla && !viajeLock.solo_mujeres_vj) {
                await manager.getRepository(Viaje).update({ id_vj: Number(viajeId) }, { solo_mujeres_vj: true });
            }
        });

        return NextResponse.json({ message: "Reserva solicitada correctamente", aporte: aporteCalculado }, { status: 201 });

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
            relations: [
                'viaje', 'viaje.rutaConductor', 'viaje.rutaConductor.universidad',
                'viaje.rutaConductor.conductor', 'viaje.rutaConductor.conductor.usuario',
                'viaje.estado', 'estado', 'parada',
            ],
            order: { id_res: 'DESC' }
        });

        // Solo datos públicos del conductor; se omite el trazado (pesado e innecesario aquí)
        const seguras = reservas.map(r => {
            const ruta: any = r.viaje?.rutaConductor;
            const usuarioCond = ruta?.conductor?.usuario;
            if (ruta) {
                delete ruta.ruta_path_rc;
                ruta.conductor = ruta.conductor ? {
                    id_user: ruta.conductor.id_user,
                    usuario: usuarioCond ? {
                        nombre_user:     usuarioCond.nombre_user,
                        primer_apellido: usuarioCond.primer_apellido,
                        foto_perf:       usuarioCond.foto_perf,
                    } : null,
                } : null;
            }
            return r;
        });

        return NextResponse.json(seguras, { status: 200 });

    } catch (error: any) {
        console.error(" Error GET reservas:", error);
        return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { reservaId, userId } = await request.json();
        if (!reservaId || !userId) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });

        const ds = await getDataSource();
        
        await ds.transaction(async manager => {
            const reservaRepo = manager.getRepository(Reserva);
            const estadoRepo = manager.getRepository(Estado);
            const viajeRepo = manager.getRepository(Viaje);

            const reserva = await reservaRepo.findOne({
                where: { id_res: Number(reservaId), usuario: { id_user: Number(userId) } },
                relations: ['estado', 'viaje']
            });

            if (!reserva) throw new ReservaError("Reserva no encontrada", 404);
            
            if (reserva.estado?.nombre_estado === 'Cancelada' || reserva.estado?.nombre_estado === 'Rechazada') {
                throw new ReservaError("La reserva ya está cancelada o rechazada", 400);
            }

            const estadoCancelada = await estadoRepo.findOne({ where: { nombre_estado: 'Cancelada', categoria: 'RESERVA' } });
            if (!estadoCancelada) throw new ReservaError("Estado Cancelada no encontrado", 500);

            // Si estaba "Aceptada", devolver cupo
            if (reserva.estado?.nombre_estado === 'Aceptada') {
                await viajeRepo.increment({ id_vj: reserva.viaje?.id_vj }, 'cupos_disponibles_vj', 1);
            }

            reserva.estado = estadoCancelada;
            await reservaRepo.save(reserva);
        });

        return NextResponse.json({ message: "Reserva cancelada correctamente" }, { status: 200 });

    } catch (error: any) {
        if (error instanceof ReservaError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error(" Error PUT reserva:", error);
        return NextResponse.json({ error: "Error al cancelar reserva" }, { status: 500 });
    }
}