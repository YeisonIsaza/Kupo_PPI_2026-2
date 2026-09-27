import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Estado } from "@/entities/Estado";

export async function GET() {
    try {
        const ds     = await getDataSource();
        const estados = await ds.getRepository(Estado).find({ order: { categoria: 'ASC' } });
        return NextResponse.json(estados, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al obtener estados" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { nombre_estado, categoria } = await request.json();
        if (!nombre_estado || !categoria)
            return NextResponse.json({ error: "nombre_estado y categoria son requeridos" }, { status: 400 });

        const ds   = await getDataSource();
        const repo = ds.getRepository(Estado);

        const nombreFormateado = nombre_estado.toUpperCase().trim();
        const catFormateada = categoria.toUpperCase().trim();

        const existe = await repo.findOne({ 
    where: { nombre_estado: nombreFormateado, categoria: catFormateada } });
        if (existe) return NextResponse.json({ error: "El estado ya existe en esa categoría" }, { status: 400 });

        const nuevo = repo.create({ nombre_estado:nombreFormateado, categoria:catFormateada });
        await repo.save(nuevo);
        return NextResponse.json(nuevo, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al crear estado" }, { status: 500 });
    }
}