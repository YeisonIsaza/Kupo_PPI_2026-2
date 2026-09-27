import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import * as bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const ds = await getDataSource();
        const usuario = await ds.getRepository(Usuario).findOne({
            where: { id_user: Number(userId) },
            relations: ['perfil', 'perfil.rol', 'estadoCuenta']
        });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        return NextResponse.json({
            id_user:               usuario.id_user,
            nombre_user:           usuario.nombre_user,
            primer_apellido:       usuario.primer_apellido,
            segundo_apellido:      usuario.segundo_apellido,
            celular:               usuario.celular,
            correo_personal_user:  usuario.correo_personal_user,
            documento_identidad:   usuario.documento_identidad_user,
            fecha_nacimiento_user: usuario.fecha_nacimiento_user,
            foto_perf:             usuario.foto_perf,
            perfil:                usuario.perfil?.nombre_perfil,
            rol:                   usuario.perfil?.rol?.nombre_rol,
            estado:                usuario.estadoCuenta?.nombre_estado,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Error GET perfil:", error);
        return NextResponse.json({ error: "Error al obtener perfil" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        if (!userId) return NextResponse.json({ error: "userId requerido" }, { status: 400 });

        const body = await request.json();
        const ds = await getDataSource();
        const usuarioRepo = ds.getRepository(Usuario);

        const usuario = await usuarioRepo.findOne({ where: { id_user: Number(userId) } });
        if (!usuario) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        // Actualizar campos permitidos
        if (body.nombre_user)      usuario.nombre_user      = body.nombre_user;
        if (body.primer_apellido)  usuario.primer_apellido  = body.primer_apellido;
        if (body.segundo_apellido) usuario.segundo_apellido = body.segundo_apellido;
        if (body.celular)          usuario.celular          = body.celular;

        // Cambiar contraseña si se envía
        if (body.nuevaContrasena && body.nuevaContrasena.trim() !== '') {
            usuario.contrasena = await bcrypt.hash(body.nuevaContrasena, 10);
        }

        // Guardar foto si se envía en base64
        if (body.fotoPerfil) {
            const fotosDir = path.join(process.cwd(), 'public', 'uploads', 'fotos');
            if (!existsSync(fotosDir)) await mkdir(fotosDir, { recursive: true });
            const base64Data = body.fotoPerfil.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fotoPath = path.join(fotosDir, `${userId}_foto.jpg`);
            await writeFile(fotoPath, buffer);
            usuario.foto_perf = `/uploads/fotos/${userId}_foto.jpg`;
        }

        await usuarioRepo.save(usuario);
        return NextResponse.json({ message: "Perfil actualizado correctamente" }, { status: 200 });

    } catch (error: any) {
        console.error(" Error PUT perfil:", error);
        return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
    }
}