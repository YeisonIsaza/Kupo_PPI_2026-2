import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { UniversidadEstudiante } from "@/entities/UniversidadEstudiante";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        const { userId, certificado, fotoPerfil, certNombre } = await request.json();

        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });
        if (!certificado) return NextResponse.json({ error: "Certificado requerido" }, { status: 400 });

        // --- Crear carpetas si no existen ---
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const fotosDir  = path.join(uploadDir, 'fotos');
        const certsDir  = path.join(uploadDir, 'certificados');

        if (!existsSync(fotosDir)) await mkdir(fotosDir, { recursive: true });
        if (!existsSync(certsDir)) await mkdir(certsDir, { recursive: true });

        const ds = await getDataSource();
        const usuarioRepo = ds.getRepository(Usuario);
        const uniEstRepo  = ds.getRepository(UniversidadEstudiante);

        const usuario = await usuarioRepo.findOne({ where: { id_user: Number(userId) } });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        // --- Guardar foto de perfil ---
        if (fotoPerfil) {
            const base64Data = fotoPerfil.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fotoPath = path.join(fotosDir, `${userId}_foto.jpg`);
            await writeFile(fotoPath, buffer);
            usuario.foto_perf = `/uploads/fotos/${userId}_foto.jpg`;
            await usuarioRepo.save(usuario);
        }

        // --- Guardar certificado ---
        const vinculacion = await uniEstRepo.findOne({ where: { id_user: Number(userId) } });
        if (vinculacion) {
            const base64Cert = certificado.replace(/^data:\w+\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Cert, 'base64');
            const ext = certNombre?.endsWith('.pdf') ? 'pdf' : 'jpg';
            const certPath = path.join(certsDir, `${userId}_cert.${ext}`);
            await writeFile(certPath, buffer);
            vinculacion.certificado_estudio_une = `/uploads/certificados/${userId}_cert.${ext}`;
            await uniEstRepo.save(vinculacion);
        }

        return NextResponse.json({ message: "Documentos guardados correctamente" }, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error guardando documentos:", error);
        return NextResponse.json({ error: "Error al guardar documentos" }, { status: 500 });
    }
}