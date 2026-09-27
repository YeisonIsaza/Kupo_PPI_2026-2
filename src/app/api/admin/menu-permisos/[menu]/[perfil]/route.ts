//se crean dos folder de menu y perfil para recibir los parametros de la ruta dinamica
//ejemplo: /api/admin/menu-permisos/1/2
//donde 1 es el codigo_menu y 2 es el codigo_perfil
import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { MenuPermiso } from "@/entities/Menu_permiso";
import { Menu } from "@/entities/Menu";
import { Perfil } from "@/entities/Perfil";

export async function PUT(request: Request, { params }: { params: Promise<{ menu: string, perfil: string }> }) {
    try {
        const { menu, perfil } = await params;
        const { puede_crear, puede_leer, puede_actualizar, puede_eliminar } = await request.json();

        const ds   = await getDataSource();
        const repo = ds.getRepository(MenuPermiso);

        const permiso = await repo.findOne({ where: { codigo_menu: menu, codigo_perfil: Number(perfil) } });
        if (!permiso) return NextResponse.json({ error: "Permiso no encontrado" }, { status: 404 });

        permiso.puede_crear      = puede_crear;
        permiso.puede_leer       = puede_leer;
        permiso.puede_actualizar = puede_actualizar;
        permiso.puede_eliminar   = puede_eliminar;

        await repo.save(permiso);
        return NextResponse.json(permiso, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al actualizar permiso" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ menu: string, perfil: string }> }) {
    try {
        const { menu, perfil } = await params;
        const ds   = await getDataSource();
        const repo = ds.getRepository(MenuPermiso);

        const permiso = await repo.findOne({ where: { codigo_menu: menu, codigo_perfil: Number(perfil) } });
        if (!permiso) return NextResponse.json({ error: "Permiso no encontrado" }, { status: 404 });

        await repo.remove(permiso);
        return NextResponse.json({ message: "Permiso eliminado" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al eliminar permiso" }, { status: 500 });
    }
}