import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Estado } from "@/entities/Estado";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { nombre_estado, categoria } = await request.json();

        if(!nombre_estado || nombre_estado.trim() === "" || !categoria || categoria.trim() === "") {
            return NextResponse.json({ error: "Nombre de estado y categoría son requeridos" }, { status: 400 });
        }

        const ds   = await getDataSource();
        const repo = ds.getRepository(Estado);

        const estado = await repo.findOne({ where: { id_estado: Number(id) } });
        if (!estado) return NextResponse.json({ error: "Estado no encontrado" }, { status: 404 });

        estado.nombre_estado = nombre_estado.toUpperCase().trim();
        estado.categoria     = categoria.toUpperCase().trim();
        
        await repo.save(estado);
        return NextResponse.json(estado, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al editar estado" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ds   = await getDataSource();
        const repo = ds.getRepository(Estado);

        const estado = await repo.findOne({ where: { id_estado: Number(id) } });
        if (!estado) return NextResponse.json({ error: "Estado no encontrado" }, { status: 404 });

        await repo.remove(estado);
        return NextResponse.json({ message: "Estado eliminado" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al eliminar estado" }, { status: 500 });
    }
}