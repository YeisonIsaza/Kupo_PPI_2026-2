import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { supabase } from '@/core/lib/supabase';
import { Viaje } from '@/core/models/Viaje';
import { Usuario } from '@/core/models/Usuario';
import { Reserva } from '@/core/models/Reserva';
import { In, Not } from "typeorm";
import { ESTADOS_RESERVA_INACTIVOS, esMujer } from '@/core/lib/modoElla';
import { aLatLng, analizarRuta, calcularCoincidencia, parsearPath, rutaGeoDesdeEntidad, RADIO_COINCIDENCIA_KM } from '@/core/lib/geo';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userIdParam = searchParams.get('userId');

        // --- Búsqueda por coordenadas (opcional) ---
        const puntoPasajero = aLatLng(searchParams.get('lat'), searchParams.get('lng'));
        const radioParam = Number(searchParams.get('radio'));
        const radioKm = Number.isFinite(radioParam) && radioParam > 0 ? Math.min(radioParam, 25) : RADIO_COINCIDENCIA_KM;

        const ds = await getDataSource();

        // --- Perfil de género / Modo Ella del solicitante (siempre leído desde la BD) ---
        let generoUsuario: string | null = null;
        let modoElla = false;
        if (userIdParam && !isNaN(Number(userIdParam))) {
            const usuario = await ds.getRepository(Usuario).findOne({ where: { id_user: Number(userIdParam) } });
            generoUsuario = usuario?.genero_user ?? null;
            
            const rawModoElla = usuario?.modo_ella_user;
            const isModoElla = rawModoElla === true || rawModoElla === 1 || String(rawModoElla) === '1' || String(rawModoElla) === 'true';
            
            modoElla = isModoElla && esMujer(generoUsuario);
        }

        const viajesBD = await ds.getRepository(Viaje).find({
            where: { estado: { nombre_estado: 'Disponible', categoria: 'VIAJE' } },
            relations: [
                'rutaConductor',
                'rutaConductor.conductor',
                'rutaConductor.conductor.usuario',
                'rutaConductor.universidad',
                'rutaConductor.paradas',
                'vehiculo',
                'estado'
            ],
            order: { id_vj: 'DESC' }
        });

        // Viajes exclusivos para mujeres solo los ven usuarias
        let viajes = esMujer(generoUsuario)
            ? viajesBD
            : viajesBD.filter(v => !v.solo_mujeres_vj);

        // --- Modo Ella: conductora mujer + todas las acompañantes mujeres ---
        if (modoElla && viajes.length > 0) {
            const reservasActivas = await ds.getRepository(Reserva).find({
                where: {
                    viaje:  { id_vj: In(viajes.map(v => v.id_vj)) },
                    estado: { nombre_estado: Not(In(ESTADOS_RESERVA_INACTIVOS)) },
                },
                relations: ['viaje', 'usuario', 'estado'],
            });

            const viajesConHombres = new Set<number>(
                reservasActivas
                    .filter(r => !esMujer(r.usuario?.genero_user))
                    .map(r => r.viaje.id_vj)
            );

            viajes = viajes.filter(v =>
                esMujer(v.rutaConductor?.conductor?.usuario?.genero_user) &&
                !viajesConHombres.has(v.id_vj)
            );
        }

        const resultado = await Promise.all(viajes.map(async v => {
            const ruta = v.rutaConductor;
            const conductor = ruta?.conductor?.usuario;

            // --- Análisis geoespacial: sentido, tramos y aporte dinámico por parada ---
            const geo = rutaGeoDesdeEntidad(ruta);
            const analisis = analizarRuta(geo);
            const coincidencia = puntoPasajero
                ? calcularCoincidencia(analisis, {
                    origen: geo.origen, destino: geo.destino,
                    origenNombre: ruta?.origen_nombre, destinoNombre: ruta?.destino_nombre || ruta?.universidad?.nombre_uni,
                    tarifa: geo.tarifa,
                }, puntoPasajero, radioKm)
                : null;

            // Con búsqueda por ubicación solo se devuelven rutas que pasan cerca
            if (coincidencia && !coincidencia.cumple) return null;

            // Calcular promedio de calificaciones del conductor
            let promedio = null;
            let totalCal = 0;
            if (ruta?.conductor?.id_user) {
                const { data: calResult, error: calError } = await supabase
                    .from('calificacion_conductor')
                    .select('puntuacion_calcon')
                    .eq('id_user_receptor', Number(ruta.conductor.id_user));
                
                if (!calError && calResult) {
                    totalCal = calResult.length;
                    if (totalCal > 0) {
                        promedio = (calResult.reduce((acc, curr) => acc + Number(curr.puntuacion_calcon), 0) / totalCal).toFixed(1);
                    }
                }
            }

            const paradaOriginal = (id: number) => ruta?.paradas?.find(p => Number(p.id_pds) === id);

            return {
                id_vj:          v.id_vj,
                hora_salida:    v.hora_salida_vj || ruta?.hora_salida_rc || null,
                tarifa:         ruta?.tarifa_rc,
                origen_nombre:  ruta?.origen_nombre,
                destino_nombre: ruta?.destino_nombre || ruta?.universidad?.nombre_uni,
                universidad:    ruta?.universidad?.nombre_uni,
                nit_uni:        ruta?.universidad?.nit_uni,
                cupos_totales:  v.vehiculo?.total_cupos_veh || 4,
                conductor: {
                    nombre:    conductor ? `${conductor.nombre_user} ${conductor.primer_apellido}` : 'Conductor',
                    foto:      conductor?.foto_perf || null,
                    genero:    conductor?.genero_user || null,
                    promedio,
                    totalCal,
                },
                paradas: analisis.paradas.map(p => ({
                    id_pds:             p.id,
                    nombre:             p.nombre,
                    orden:              p.orden,
                    costo_adicional:    p.costoAdicional,
                    es_universidad:     paradaOriginal(p.id)?.es_universidad_pds,
                    lat:                p.lat,
                    lng:                p.lng,
                    aporte_estimado:    p.aporte,
                    tramo_km:           p.tramoKm !== null ? Number(p.tramoKm.toFixed(2)) : null,
                })),
                // --- Geometría para el mapa del pasajero ---
                origen:        geo.origen,
                destino:       geo.destino,
                ruta_path:     parsearPath(ruta?.ruta_path_rc),
                sentido:       analisis.sentido,
                distancia_km:  analisis.totalKm !== null ? Number(analisis.totalKm.toFixed(2)) : null,
                duracion_min:  ruta?.duracion_min_rc ?? null,
                coincidencia:  coincidencia ? {
                    distancia_ruta_km: Number(coincidencia.distanciaRutaKm.toFixed(3)),
                    punto_sugerido:    coincidencia.puntoSugerido ? {
                        ...coincidencia.puntoSugerido,
                        distanciaKm: Number(coincidencia.puntoSugerido.distanciaKm.toFixed(3)),
                    } : null,
                } : null,
                estado: v.estado?.nombre_estado,
                solo_mujeres: !!v.solo_mujeres_vj,
            };
        }));

        const lista = resultado.filter((v): v is NonNullable<typeof v> => v !== null);

        // Con ubicación: primero las rutas cuyo punto de encuentro queda más cerca
        if (puntoPasajero) {
            lista.sort((a, b) =>
                (a.coincidencia?.punto_sugerido?.distanciaKm ?? a.coincidencia?.distancia_ruta_km ?? Infinity) -
                (b.coincidencia?.punto_sugerido?.distanciaKm ?? b.coincidencia?.distancia_ruta_km ?? Infinity)
            );
        }

        return NextResponse.json(lista, { status: 200 });

    } catch (error: any) {
        console.error("Error GET viajes pasajero:", error);
        return NextResponse.json({ error: "Error al obtener viajes" }, { status: 500 });
    }
}