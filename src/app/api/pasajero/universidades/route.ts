import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { UniversidadEstudiante } from "@/entities/UniversidadEstudiante";
import { Universidad } from "@/entities/Universidad";
import { Estado } from "@/entities/Estado";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();
        const vinculaciones = await ds.getRepository(UniversidadEstudiante).find({
            where: { usuario: { id_user: Number(userId) } },
            relations: ['universidad', 'estado']
        });

        return NextResponse.json(vinculaciones, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error GET universidades estudiante:", error);
        return NextResponse.json({ error: "Error al obtener universidades" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, nitUni, correoInstitucional, certificadoBase64 } = body;

        if (!userId || !nitUni || !correoInstitucional) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        const ds = await getDataSource();
        const uniEstRepo  = ds.getRepository(UniversidadEstudiante);
        const estadoRepo  = ds.getRepository(Estado);
        const uniRepo     = ds.getRepository(Universidad);

        // Verificar que el correo no esté en uso por otro usuario
        const correoEnUso = await uniEstRepo.findOne({
            where: { correo_institucional_une: correoInstitucional }
        });
        if (correoEnUso) {
            return NextResponse.json({ error: "Este correo institucional ya está en uso" }, { status: 400 });
        }

        // Verificar que no esté ya vinculado a esta universidad
        const yaVinculado = await uniEstRepo.findOne({
            where: {
                usuario:     { id_user: Number(userId) },
                universidad: { nit_uni: nitUni }
            }
        });
        if (yaVinculado) {
            return NextResponse.json({ error: "Ya estás vinculado a esta universidad" }, { status: 400 });
        }

        const universidad = await uniRepo.findOne({ where: { nit_uni: nitUni } });
        if (!universidad) return NextResponse.json({ error: "Universidad no encontrada" }, { status: 404 });

        const estadoPendiente = await estadoRepo.findOne({
            where: { nombre_estado: 'Pendiente de Verificación', categoria: 'VINCULACION' }
        });
        if (!estadoPendiente) return NextResponse.json({ error: "Estado no encontrado" }, { status: 400 });

        // Guardar certificado si se envió
        let rutaCertificado = null;
        if (certificadoBase64) {
            const certDir = path.join(process.cwd(), 'public', 'uploads', 'certificados');
            if (!existsSync(certDir)) await mkdir(certDir, { recursive: true });
            const base64Data = certificadoBase64.replace(/^data:application\/pdf;base64,/, '')
                                                .replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const nombreArchivo = `${userId}_${nitUni}_${Date.now()}.pdf`;
            await writeFile(path.join(certDir, nombreArchivo), buffer);
            rutaCertificado = `/uploads/certificados/${nombreArchivo}`;
        }

        const nuevaVinculacion = uniEstRepo.create({
            correo_institucional_une: correoInstitucional,
            certificado_estudio_une:  rutaCertificado ?? undefined,
            universidad,
            usuario:   { id_user: Number(userId) } as any,
            estado:    estadoPendiente,
        });

        await uniEstRepo.save(nuevaVinculacion);
        return NextResponse.json({ message: "Solicitud enviada al administrador" }, { status: 201 });

    } catch (error: any) {
        console.error("❌ Error POST universidad estudiante:", error);
        return NextResponse.json({ error: "Error al vincular universidad" }, { status: 500 });
    }
}