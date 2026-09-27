import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { Usuario } from "../../entities/Usuario";
import { Perfil }  from "../../entities/Perfil";
import { Estado }  from "../../entities/Estado";

export default class UsuarioSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo       = dataSource.getRepository(Usuario);
        const perfilRepo = dataSource.getRepository(Perfil);
        const estadoRepo = dataSource.getRepository(Estado);

        // --- Buscamos solo el perfil que necesitamos ---
        const perfilAdmin = await perfilRepo.findOne({ where: { nombre_perfil: 'AdministradorGeneral' } });
        console.log("Perfil encontrado:", perfilAdmin);
        // --- Buscamos los estados ---
        const estadoActivo   = await estadoRepo.findOne({ where: { nombre_estado: 'ACTIVO',   categoria: 'CUENTA' } });
        const estadoAprobado = await estadoRepo.findOne({ where: { nombre_estado: 'APROBADO', categoria: 'VERIFICACION' } });

        if (!perfilAdmin) {
            console.error("Falta el perfil Administrador General. Corre PerfilSeeder primero.");
            return;
        }
        if (!estadoActivo || !estadoAprobado) {
            console.error("Faltan estados. Corre InitSeeder primero.");
            return;
        }

        // --- Encriptamos la contraseña ---
        const contrasena = await bcrypt.hash("prueba123", 10);

        const usuarios = [
            {
                documento_identidad_user: '1035414668',
                nombre_user:              'Laura',
                primer_apellido:          'González',
                segundo_apellido:         'Muñoz',
                celular:                  '3000000001',
                fecha_nacimiento_user:    new Date('1990-01-01'),
                correo_personal_user:     'lalagon0607@gmail.com',
                contrasena,               //  La contraseña ya encriptada
                perfil:                   perfilAdmin,   
                estadoCuenta:             estadoActivo,   
                estadoVerificacion:       estadoAprobado, 
            },
        ];

        console.log("🌱 Insertando usuario administrador...");
        for (const u of usuarios) {
            const existe = await repo.findOne({
                where: { correo_personal_user: u.correo_personal_user }
            });
            if (!existe) {
                await repo.save(repo.create(u));
                console.log(` Usuario: ${u.nombre_user} ${u.primer_apellido} ${u.segundo_apellido} — ${u.correo_personal_user}`);
            } else {
                console.log(`  Ya existe: ${u.correo_personal_user}`);
            }
        }
    }
}