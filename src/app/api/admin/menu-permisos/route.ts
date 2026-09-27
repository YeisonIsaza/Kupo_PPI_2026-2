import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { MenuPermiso } from "@/entities/Menu_permiso";
import { Menu } from "@/entities/Menu";
import { Perfil } from "@/entities/Perfil";
import { Usuario } from "@/entities/Usuario";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const ds = await getDataSource();

        // Si viene userId devuelve mapa de permisos del usuario
        if (userId) {
            const usuario = await ds.getRepository(Usuario).findOne({
                where: { id_user: Number(userId) },
                relations: ['perfil']
            });
            if (!usuario) return NextResponse.json({}, { status: 200 });

            const permisos = await ds.getRepository(MenuPermiso).find({
                where: { codigo_perfil: usuario.perfil.codigo_perfil },
                relations: ['menu']
            });

            const mapa: Record<string, any> = {};
                for (const p of permisos) {
                    if (p.menu?.url_menu) {
                        console.log(`Menu: ${p.menu.url_menu}, puede_leer: '${p.puede_leer}', tipo: ${typeof p.puede_leer}`); // ← agrega
                        mapa[p.menu.url_menu] = {
                            crear:      p.puede_crear      === 'S',
                            leer:       p.puede_leer       === 'S',
                            actualizar: p.puede_actualizar === 'S',
                            eliminar:   p.puede_eliminar   === 'S',
                        };
                    }
                }
            return NextResponse.json(mapa, { status: 200 });
        }

        // Sin userId devuelve todos los permisos (para la página de permisos del admin)
        const permisos = await ds.getRepository(MenuPermiso).find({
            relations: ['menu', 'perfil'],
            order: { codigo_perfil: 'ASC' }
        });
        return NextResponse.json(permisos, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: "Error al obtener permisos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { codigo_menu, codigo_perfil, puede_crear, puede_leer, puede_actualizar, puede_eliminar } = await request.json();
        const ds   = await getDataSource();
        const repo = ds.getRepository(MenuPermiso);

        const existe = await repo.findOne({ where: { codigo_menu, codigo_perfil: Number(codigo_perfil) } });
        if (existe) return NextResponse.json({ error: "Ya existe ese permiso para ese perfil y menú" }, { status: 400 });

        const menu   = await ds.getRepository(Menu).findOne({ where: { codigo_menu } });
        const perfil = await ds.getRepository(Perfil).findOne({ where: { codigo_perfil: Number(codigo_perfil) } });

        if (!menu || !perfil) return NextResponse.json({ error: "Menú o perfil no encontrado" }, { status: 404 });

        const nuevo = repo.create({
            codigo_menu, codigo_perfil: Number(codigo_perfil),
            puede_crear:      puede_crear      || 'N',
            puede_leer:       puede_leer       || 'N',
            puede_actualizar: puede_actualizar || 'N',
            puede_eliminar:   puede_eliminar   || 'N',
            menu, perfil
        });
        await repo.save(nuevo);
        return NextResponse.json(nuevo, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: "Error al crear permiso" }, { status: 500 });
    }
}