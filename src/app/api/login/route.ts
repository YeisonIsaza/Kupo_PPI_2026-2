import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { Usuario } from "@/entities/Usuario";
import * as bcrypt from "bcryptjs"; //para comparar contraseñas encriptadas

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Correo y contraseña son obligatorios" }, { status: 400 });
        }

        const ds = await getDataSource();
        const userRepository = ds.getRepository(Usuario);

        // Buscamos el usuario con su perfil y rol incluidos
        const usuario = await userRepository.findOne({
            where: { correo_personal_user: email },
            relations: ['perfil', 'perfil.rol', 'estadoCuenta']
        });

        if (!usuario) {
            return NextResponse.json({ error: "El usuario no existe" }, { status: 404 });
        }

        // Verificamos la contraseña con bcrypt
        const contrasenaValida = await bcrypt.compare(password, usuario.contrasena);
        if (!contrasenaValida) {
            return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
        }

        // Verificamos que la cuenta esté activa
        if (usuario.estadoCuenta?.nombre_estado !== 'ACTIVO') {
            return NextResponse.json({ 
                error: "Tu cuenta está inactiva. Contacta al administrador." 
            }, { status: 403 });
        }
        // Devolvemos el rol para que el frontend redirija correctamente
        return NextResponse.json({
            success:    true,
            userId:     usuario.id_user,
            nombre:     usuario.nombre_user,
            apellido:   usuario.primer_apellido + " " + usuario.segundo_apellido,
            idRol:      usuario.perfil?.rol?.id_rol,
            nombreRol:  usuario.perfil?.rol?.nombre_rol,
            idPerfil:   usuario.perfil?.codigo_perfil,
            nombrePerfil: usuario.perfil?.nombre_perfil,
            
        });

    } catch (error: any) {
        console.error("DETALLE DEL ERROR:", error);
        return NextResponse.json({ error: "Fallo en la conexión con Oracle" }, { status: 500 });
    }
}