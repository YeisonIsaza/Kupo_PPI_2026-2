import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Menu } from "@/entities/Menu";

export async function GET() {
    try {
        const ds    = await getDataSource();
        const menus = await ds.getRepository(Menu).find({
            relations: ['menuPadre'],
            order: { codigo_menu: 'ASC' }
        });
        return NextResponse.json(menus, { status: 200 });
    } catch (error: any) {
        console.error("Error GET Menu:", error);
        return NextResponse.json({ error: "Error al obtener menús" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { codigo_menu, url_menu, nombre_menu, codigo_padre } = await request.json();
            
        if (!codigo_menu || !nombre_menu || !url_menu) {
            return NextResponse.json({ error: "Código, nombre y URL son obligatorios" }, { status: 400 });
        }
        
        const ds   = await getDataSource();
        const repo = ds.getRepository(Menu);

        const existe = await repo.findOne({ where: { codigo_menu: codigo_menu.trim() } });
        if (existe) return NextResponse.json({ error: "El código de menú ya existe" }, { status: 400 });


         let menuPadre: Menu | undefined = undefined;
        if (codigo_padre && codigo_padre.trim() !== "") {
            const padre = await repo.findOne({ where: { codigo_menu: codigo_padre } });
            menuPadre = padre ?? undefined; // null → undefined
            if(padre) menuPadre = padre;
        }

        const nuevo = repo.create({
            codigo_menu: codigo_menu.trim(),
            url_menu: url_menu.trim(),
            nombre_menu: nombre_menu.trim(),
            menuPadre : menuPadre, // undefined si no tiene padre
        });

        await repo.save(nuevo);
        return NextResponse.json(nuevo, { status: 201 });
    } catch (error: any) {
        console.error("Error POST Menu:", error);
        return NextResponse.json({ error: "Error al crear menú" }, { status: 500 });
    }
}