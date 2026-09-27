import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Menu } from "@/entities/Menu";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { url_menu, nombre_menu, codigo_padre } = await request.json();

        if (!nombre_menu || !url_menu) {
            return NextResponse.json({ error: "Nombre y URL son requeridos" }, { status: 400 });
        }

        const ds   = await getDataSource();
        const repo = ds.getRepository(Menu);

        const menu = await repo.findOne({ where: { codigo_menu: id } });
        if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });

        menu.url_menu    = url_menu;
        menu.nombre_menu = nombre_menu;

        if (codigo_padre && codigo_padre.trim() !== "") {
            const padre = await repo.findOne({ where: { codigo_menu: codigo_padre } });
            if(padre) menu.menuPadre = padre;
        }else {
            menu.menuPadre = null as any; // Lo desvincula si se remueve el padre
        }   

        await repo.save(menu);
        return NextResponse.json(menu, { status: 200 });
    } catch (error: any) {
        console.error("Error PUT Menu:", error);
        return NextResponse.json({ error: "Error al editar menú" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ds   = await getDataSource();
        const repo = ds.getRepository(Menu);

        const menu = await repo.findOne({ where: { codigo_menu: id } });
        if (!menu) return NextResponse.json({ error: "Menú no encontrado" }, { status: 404 });

        await repo.remove(menu);
        return NextResponse.json({ message: "Menú eliminado" }, { status: 200 });
    } catch (error: any) {
        console.error("Error DELETE Menu:", error);
        return NextResponse.json({ error: "Error al eliminar menú" }, { status: 500 });
    }
}