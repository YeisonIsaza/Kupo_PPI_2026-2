import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Perfil } from "@/entities/Perfil";
import { Rol } from "@/entities/Rol";

export async function GET() {
    try {
        const ds = await getDataSource();
        const perfiles = await ds.getRepository(Perfil).find({
            relations: ['rol'],
            order: { codigo_perfil: 'ASC' }
        });
        return NextResponse.json(perfiles, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al obtener perfiles" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { nombre_perfil, id_rol } = await request.json();
        if (!nombre_perfil || !id_rol)
            return NextResponse.json({ error: "nombre_perfil e id_rol son requeridos" }, { status: 400 });

        const ds   = await getDataSource();
        const repo = ds.getRepository(Perfil);

        const rol = await ds.getRepository(Rol).findOne({ where: { id_rol: Number(id_rol) } });
        if (!rol) return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });

        const existe = await repo.findOne({ where: { nombre_perfil } });
        if (existe) return NextResponse.json({ error: "El perfil ya existe" }, { status: 400 });

        const nuevo = repo.create({ nombre_perfil, rol });
        await repo.save(nuevo);
        return NextResponse.json(nuevo, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al crear perfil" }, { status: 500 });
    }
}