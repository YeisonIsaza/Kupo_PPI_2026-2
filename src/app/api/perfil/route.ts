import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Vehiculo } from "@/entities/Vehiculo";
import { Conductor } from "@/entities/Conductor";
import { Usuario } from "@/entities/Usuario";
import { Estado } from "@/entities/Estado";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.userId || isNaN(Number(body.userId))) {
            return NextResponse.json({
                error: "userId es requerido y debe ser un número válido"
            }, { status: 400 });
        }

        const ds = await getDataSource();
        const vehiculoRepo  = ds.getRepository(Vehiculo);
        const conductorRepo = ds.getRepository(Conductor);
        const usuarioRepo   = ds.getRepository(Usuario);
        const estadoRepo    = ds.getRepository(Estado);

        // --- Buscar el usuario ---
        const usuario = await usuarioRepo.findOne({
            where: { id_user: Number(body.userId) }
        });

        if (!usuario) {
            return NextResponse.json({ error: "El usuario no existe" }, { status: 404 });
        }

        // --- Buscar estado activo para el vehículo ---
        const estadoVehiculo = await estadoRepo.findOne({
            where: { nombre_estado: 'Activo', categoria: 'VEHICULO' }
        });

        if (!estadoVehiculo) {
            return NextResponse.json({ error: "Estado de vehículo no encontrado" }, { status: 400 });
        }

        // --- Guardar el vehículo ---
        const nuevoVehiculo = vehiculoRepo.create({
            placa_veh:         body.placa,
            marca_veh:         body.marca,
            modelo_veh:        body.modeloNombre,
            color_veh:         body.color,
            anno_creacion_veh: Number(body.anno),
            numero_soat_veh:   body.soat,
            total_cupos_veh:   Number(body.cupos), // ← estaba mal: total_cupos
            usuario,
            estado:            estadoVehiculo,
        });

        await vehiculoRepo.save(nuevoVehiculo);

        // --- Guardar datos del conductor ---
        const nuevoConductor = conductorRepo.create({
            id_user:                    Number(body.userId),
            numero_licencia:            body.numeroLicencia,
            fecha_vencimiento_licencia: new Date(body.fechaVencLicencia),
            usuario,
        });

        await conductorRepo.save(nuevoConductor);

        return NextResponse.json({ 
            message: "Vehículo y datos de conductor guardados correctamente" 
        }, { status: 201 });

    } catch (error: any) {
        console.error(" Error en Oracle:", error);

        let mensajeError = "Error de base de datos";
        if (error.errorNum === 1 || error.code === 'ORA-00001') {
            if (error.message?.includes('UK_PLACA')) {
                mensajeError = "La placa ya está registrada.";
            } else if (error.message?.includes('NUMERO_SOAT')) {
                mensajeError = "El SOAT ya está registrado.";
            }
        }

        return NextResponse.json({ error: mensajeError }, { status: 500 });
    }
}