import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Universidad } from "@/entities/Universidad";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body   = await request.json();

        const ds   = await getDataSource();
        const repo = ds.getRepository(Universidad);

        const uni = await repo.findOne({ where: { nit_uni: id.trim() } });
        if (!uni) return NextResponse.json({ error: "Universidad no encontrada" }, { status: 404 });

        Object.assign(uni, body);
        await repo.save(uni);
        return NextResponse.json(uni, { status: 200 });
    } catch (error: any) {
        console.error("Error PUT Universidades:", error);
        return NextResponse.json({ error: "Error al editar universidad" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const ds   = await getDataSource();
        const repo = ds.getRepository(Universidad);

        const uni = await repo.findOne({ where: { nit_uni: id.trim() } });
        if (!uni) return NextResponse.json({ error: "Universidad no encontrada" }, { status: 404 });

        await repo.remove(uni);
        return NextResponse.json({ message: "Universidad eliminada" }, { status: 200 });
    } catch (error: any) {
        console.error("Error DELETE Universidades:", error);
        return NextResponse.json({ error: "Error al eliminar universidad" }, { status: 500 });
    }
}