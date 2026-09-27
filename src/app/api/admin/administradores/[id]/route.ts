import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Estado } from "@/entities/Estado";
import * as bcrypt from "bcryptjs";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const ds = await getDataSource();
        const repo = ds.getRepository(Usuario);

        const usuario = await repo.findOne({ where: { id_user: Number(id) } });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        if (body.nombre)           usuario.nombre_user              = body.nombre;
        if (body.primer_apellido)  usuario.primer_apellido          = body.primer_apellido;
        if (body.segundo_apellido) usuario.segundo_apellido         = body.segundo_apellido;
        if (body.celular)          usuario.celular                  = body.celular;
        if (body.password)         usuario.contrasena               = await bcrypt.hash(body.password, 10);

      if (body.id_estado) {
            const estado = await ds.getRepository(Estado).findOne({ 
                where: { id_estado: Number(body.id_estado) } 
            });
            if (estado) usuario.estadoCuenta = estado;
        }

        await repo.save(usuario);
        return NextResponse.json({ message: "Administrador actualizado" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ds = await getDataSource();
        const repo = ds.getRepository(Usuario);

        const usuario = await repo.findOne({ where: { id_user: Number(id) } });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        await repo.remove(usuario);
        return NextResponse.json({ message: "Administrador eliminado" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
    }
}