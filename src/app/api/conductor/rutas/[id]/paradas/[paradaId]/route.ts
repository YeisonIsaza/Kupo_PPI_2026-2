import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Parada } from "@/entities/Parada";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string, paradaId: string }> }
) {
    try {
        const { paradaId } = await params;  // ← await aquí
        const ds = await getDataSource();
        const paradaRepo = ds.getRepository(Parada);

        const parada = await paradaRepo.findOne({
            where: { id_pds: Number(paradaId) }
        });
        if (!parada) return NextResponse.json({ error: "Parada no encontrada" }, { status: 404 });

        await paradaRepo.remove(parada);
        return NextResponse.json({ message: "Parada eliminada" }, { status: 200 });

    } catch (error: any) {
        console.error("Error DELETE parada:", error);
        return NextResponse.json({ error: "Error al eliminar parada" }, { status: 500 });
    }
}