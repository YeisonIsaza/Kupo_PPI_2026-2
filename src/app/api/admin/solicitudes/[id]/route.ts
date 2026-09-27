import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Estado } from "@/entities/Estado";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; // ← await aquí
        const { accion, mensaje } = await request.json();

        if (!id || isNaN(Number(id))) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const ds = await getDataSource();
        const usuarioRepo = ds.getRepository(Usuario);
        const estadoRepo  = ds.getRepository(Estado);

        const usuario = await usuarioRepo.findOne({
            where: { id_user: Number(id) },
            relations: ['estadoCuenta', 'estadoVerificacion']
        });

        if (!usuario) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        let nuevoEstado;
        if (accion === 'aprobar') {
            nuevoEstado = await estadoRepo.findOne({
                where: { nombre_estado: 'ACTIVO', categoria: 'CUENTA' }
            });
        } else if (accion === 'rechazar') {
            nuevoEstado = await estadoRepo.findOne({
                where: { nombre_estado: 'RECHAZADO', categoria: 'VERIFICACION' }
            });
        } else {
            return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
        }

        if (!nuevoEstado) {
            return NextResponse.json({ error: "Estado no encontrado" }, { status: 400 });
        }

        usuario.estadoCuenta = nuevoEstado;
        await usuarioRepo.save(usuario);

        console.log(` Usuario ${id} ${accion === 'aprobar' ? 'aprobado' : 'rechazado'}`);

        return NextResponse.json({
            message: `Usuario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente`
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error procesando solicitud:", error);
        return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 });
    }
}