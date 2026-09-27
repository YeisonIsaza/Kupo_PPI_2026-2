import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Perfil } from "@/entities/Perfil";
import { Rol } from "@/entities/Rol";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { nombre_perfil, id_rol } = await request.json();

        const ds   = await getDataSource();
        const repo = ds.getRepository(Perfil);

        const perfil = await repo.findOne({ where: { codigo_perfil: Number(id) } });
        if (!perfil) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

        if (nombre_perfil) perfil.nombre_perfil = nombre_perfil;
        if (id_rol) {
            const rol = await ds.getRepository(Rol).findOne({ where: { id_rol: Number(id_rol) } });
            if (rol) perfil.rol = rol;
        }

        await repo.save(perfil);
        return NextResponse.json(perfil, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al editar perfil" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ds   = await getDataSource();
        const repo = ds.getRepository(Perfil);

        const perfil = await repo.findOne({ where: { codigo_perfil: Number(id) } });
        if (!perfil) return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });

        await repo.remove(perfil);
        return NextResponse.json({ message: "Perfil eliminado" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al eliminar perfil" }, { status: 500 });
    }
}