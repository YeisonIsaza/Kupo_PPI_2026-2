import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Rol } from "@/entities/Rol";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { nombre_rol } = await request.json();


        if (!nombre_rol || nombre_rol.trim() === "") {
            return NextResponse.json({ error: "nombre_rol es requerido" }, { status: 400 });
        }
        const ds   = await getDataSource();
        const repo = ds.getRepository(Rol);

        const rol = await repo.findOne({ where: { id_rol: Number(id) } });
        if (!rol) return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });

        const nombreEnMayusculas = nombre_rol.toUpperCase().trim();
        rol.nombre_rol = nombreEnMayusculas;
        await repo.save(rol);
        return NextResponse.json(rol, { status: 200 });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error al editar rol" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ds   = await getDataSource();
        const repo = ds.getRepository(Rol);

        const rol = await repo.findOne({ where: { id_rol: Number(id) } });
        if (!rol) return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });

        await repo.remove(rol);
        return NextResponse.json({ message: "Rol eliminado" }, { status: 200 });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error al eliminar rol" }, { status: 500 });
    }
}