import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Universidad } from "@/entities/Universidad";

export async function GET() {
    try {
        const ds   = await getDataSource();
        const unis = await ds.getRepository(Universidad).find({ order: { nombre_uni: 'ASC' } });
        return NextResponse.json(unis, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al obtener universidades" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { nit_uni, nombre_uni, direccion_uni } = body; // Desestructuramos para validar

        // validación para que no falten campos obligatorios    
        if (!nit_uni || !nombre_uni) {
            return NextResponse.json({ error: "El NIT y el nombre son obligatorios" }, { status: 400 });
        }

        const ds   = await getDataSource();
        const repo = ds.getRepository(Universidad);

        const existe = await repo.findOne({ where: { nit_uni: body.nit_uni } });
        if (existe) return NextResponse.json({ error: "La universidad ya existe" }, { status: 400 });

        const nueva = repo.create(body);
        await repo.save(nueva);
        return NextResponse.json(nueva, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al crear universidad" }, { status: 500 });
    }
}