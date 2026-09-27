import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import { Perfil } from "@/entities/Perfil";
import { Estado } from "@/entities/Estado";
import * as bcrypt from "bcryptjs";

export async function GET() {
    try {
        const ds = await getDataSource();
        const usuarios = await ds.getRepository(Usuario).find({
            where: { perfil: { rol: { nombre_rol: 'ADMINISTRADOR' } } },
            relations: ['perfil', 'perfil.rol', 'estadoCuenta'],
            order: { id_user: 'ASC' }
        });

        const resultado = usuarios.map(u => ({
            id_user:              u.id_user,
            nombre:               u.nombre_user,
            primer_apellido:      u.primer_apellido,
            documento:            u.documento_identidad_user,
            correo:               u.correo_personal_user,
            celular:              u.celular,
            perfil:               u.perfil?.nombre_perfil,
            estado:               u.estadoCuenta?.nombre_estado,
        }));

        return NextResponse.json(resultado, { status: 200 });
    } catch (error: any) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Error al obtener administradores" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const ds = await getDataSource();
        const usuarioRepo = ds.getRepository(Usuario);
        const perfilRepo  = ds.getRepository(Perfil);
        const estadoRepo  = ds.getRepository(Estado);

        const nombrePerfil = body.codigo_perfil === '21' || body.codigo_perfil === 21 
        ? 'AdministradorSecundario' 
        : 'AdministradorGeneral';

        const perfil = await perfilRepo.findOne({ where: { nombre_perfil: nombrePerfil } });
        if (!perfil) return NextResponse.json({ error: "Perfil administrador no encontrado" }, { status: 400 });

       const estadoCuenta = body.id_estado
            ? await estadoRepo.findOne({ where: { id_estado: Number(body.id_estado) } })
            : await estadoRepo.findOne({ where: { nombre_estado: 'ACTIVO', categoria: 'CUENTA' } });
        
            if (!estadoCuenta) return NextResponse.json({ error: "Estado no encontrado" }, { status: 400 });

        const contrasena = await bcrypt.hash(body.password, 10);

        const nuevo = usuarioRepo.create({
            nombre_user:              body.nombre,
            primer_apellido:          body.primer_apellido,
            segundo_apellido:         body.segundo_apellido,
            documento_identidad_user: body.documento,
            celular:                  body.celular,
            fecha_nacimiento_user:    new Date(body.fecha_nacimiento),
            correo_personal_user:     body.correo,
            contrasena,
            perfil,
            estadoCuenta,
        });

        await usuarioRepo.save(nuevo);
        return NextResponse.json({ message: "Administrador creado" }, { status: 201 });
    } catch (error: any) {
        console.error("Error:", error);
        let msg = "Error al crear administrador";
        if (error.errorNum === 1) {
            if (error.message?.includes('UK_CORREO_USER')) msg = "El correo ya está registrado.";
            else if (error.message?.includes('UK_DOC_USER')) msg = "El documento ya está registrado.";
            else if (error.message?.includes('UK_CELULAR_USER')) msg = "El celular ya está registrado.";
        }
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}