import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Conductor } from "@/entities/Conductor";

export async function GET() {
    try {
        const ds = await getDataSource();
        const conductorRepo = ds.getRepository(Conductor);

        const conductores = await conductorRepo.find();
        return NextResponse.json(conductores);
    } catch (error) {
        return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
    }
}