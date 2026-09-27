import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Rol } from "@/entities/Rol";

export async function GET() {
    try {
        const ds = await getDataSource();
        const roles = await ds.getRepository(Rol).find({ order: { id_rol: 'ASC' } });
        return NextResponse.json(roles, { status: 200 });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error al obtener roles" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { nombre_rol } = await request.json();
        if (!nombre_rol) return NextResponse.json({ error: "nombre_rol es requerido" }, { status: 400 });

        const ds   = await getDataSource();
        const repo = ds.getRepository(Rol);
        
        const nombreEnMayusculas = nombre_rol.toUpperCase().trim();

        const existe = await repo.findOne({ where: { nombre_rol: nombreEnMayusculas } });
        if (existe) return NextResponse.json({ error: "El rol ya existe" }, { status: 400 });

        const nuevo = repo.create({ nombre_rol: nombreEnMayusculas });
        await repo.save(nuevo);
        return NextResponse.json(nuevo, { status: 201 });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error al crear rol" }, { status: 500 });
    }
}