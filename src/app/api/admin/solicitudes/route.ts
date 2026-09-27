import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import {UniversidadEstudiante} from "@/entities/UniversidadEstudiante";

export async function GET() {
    try {
        const ds = await getDataSource();
        const usuarioRepo = ds.getRepository(Usuario);
        const uniEstRepo  = ds.getRepository(UniversidadEstudiante);

        const usuariosPendientes = await usuarioRepo.find({
            where: {
                estadoCuenta: { nombre_estado: 'PENDIENTE', categoria: 'VERIFICACION' }
            },
            relations: ['perfil', 'perfil.rol', 'estadoCuenta', 'estadoVerificacion'],
            order: { fecha_registro: 'DESC' }
        });

        const resultado = await Promise.all(usuariosPendientes.map(async (u) => {
            const vinculacion = await uniEstRepo.findOne({
                where: { id_user: u.id_user }
            });

            return {

            id_user:        u.id_user,
            nombre:         `${u.nombre_user} ${u.primer_apellido} ${u.segundo_apellido}`,
            documento:      u.documento_identidad_user,
            correo:         u.correo_personal_user,
            celular:        u.celular,
            fecha_registro: u.fecha_registro,
            perfil:         u.perfil?.nombre_perfil,
            rol:            u.perfil?.rol?.nombre_rol,
            foto_perf:      u.foto_perf || null,  
            certificado:    vinculacion?.certificado_estudio_une || null,
            };
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error("Error trayendo solicitudes:", error);
        return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
    }
}