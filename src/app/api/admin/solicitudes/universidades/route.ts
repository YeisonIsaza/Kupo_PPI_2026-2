import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/db";
import { UniversidadEstudiante } from "@/entities/UniversidadEstudiante";
import { Estado } from "@/entities/Estado";

export async function GET() {
    try {
        const ds = await getDataSource();
        const solicitudes = await ds.getRepository(UniversidadEstudiante).find({
            where: { estado: { nombre_estado: 'Pendiente de Verificación', categoria: 'VINCULACION' } },
            relations: ['universidad', 'usuario', 'estado']
        });

        const resultado = solicitudes.map(s => ({
            nit_uni:            s.nit_uni,
            id_user:            s.usuario?.id_user,
            nombre_usuario:     `${s.usuario?.nombre_user} ${s.usuario?.primer_apellido} ${s.usuario?.segundo_apellido}`,
            correo_personal:    s.usuario?.correo_personal_user,
            correo_institucional: s.correo_institucional_une,
            nombre_uni:         s.universidad?.nombre_uni,
            foto_perf:          s.usuario?.foto_perf,
            certificado:        s.certificado_estudio_une,
            estado:             s.estado?.nombre_estado,
        }));

        return NextResponse.json(resultado, { status: 200 });

    } catch (error: any) {
        console.error("❌ Error GET solicitudes universidades:", error);
        return NextResponse.json({ error: "Error al obtener solicitudes" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { nitUni, idUser, accion } = await request.json();
        const ds = await getDataSource();
        const uniEstRepo  = ds.getRepository(UniversidadEstudiante);
        const estadoRepo  = ds.getRepository(Estado);

        const vinculacion = await uniEstRepo.findOne({
            where: {
                nit_uni: nitUni,
                usuario: { id_user: Number(idUser) }
            }
        });
        if (!vinculacion) return NextResponse.json({ error: "Vinculación no encontrada" }, { status: 404 });

        const nombreEstado = accion === 'aprobar' ? 'Verificada' : 'Rechazada';
        const nuevoEstado = await estadoRepo.findOne({
            where: { nombre_estado: nombreEstado, categoria: 'VINCULACION' }
        });
        if (!nuevoEstado) return NextResponse.json({ error: "Estado no encontrado" }, { status: 400 });

        vinculacion.estado = nuevoEstado;
        await uniEstRepo.save(vinculacion);

        return NextResponse.json({ message: `Vinculación ${nombreEstado}` }, { status: 200 });

    } catch (error: any) {
        console.error(" Error PATCH solicitud universidad:", error);
        return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 });
    }
}