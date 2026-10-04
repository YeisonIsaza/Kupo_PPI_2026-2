import { NextResponse } from "next/server";
import { getDataSource } from '@/core/database/db';
import { supabase } from '@/core/lib/supabase';
import { Viaje } from '@/core/models/Viaje';

export async function GET(request: Request) {
    try {
        const ds = await getDataSource();
        const viajes = await ds.getRepository(Viaje).find({
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

        const resultado = await Promise.all(viajes.map(async v => {
            const ruta = v.rutaConductor;
            const conductor = ruta?.conductor?.usuario;

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

            return {
                id_vj:          v.id_vj,
                hora_salida:    v.hora_salida_vj,
                tarifa:         ruta?.tarifa_rc,
                origen_nombre:  ruta?.origen_nombre,
                destino_nombre: ruta?.destino_nombre || ruta?.universidad?.nombre_uni,
                universidad:    ruta?.universidad?.nombre_uni,
                nit_uni:        ruta?.universidad?.nit_uni,
                cupos_totales:  v.vehiculo?.total_cupos_veh || 4,
                conductor: {
                    nombre:    conductor ? `${conductor.nombre_user} ${conductor.primer_apellido}` : 'Conductor',
                    foto:      conductor?.foto_perf || null,
                    promedio,
                    totalCal,
                },
                paradas: ruta?.paradas?.sort((a, b) => a.orden_pds - b.orden_pds).map(p => ({
                    id_pds:             p.id_pds,
                    nombre:             p.punto_recogida_pds,
                    orden:              p.orden_pds,
                    costo_adicional:    p.costo_adicional_pds,
                    es_universidad:     p.es_universidad_pds,
                })) || [],
                estado: v.estado?.nombre_estado,
            };
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error("Error GET viajes pasajero:", error);
        return NextResponse.json({ error: "Error al obtener viajes" }, { status: 500 });
    }
}