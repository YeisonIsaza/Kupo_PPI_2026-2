import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Perfil } from "../../entities/Perfil";
import { Rol } from "../../entities/Rol";

export default class PerfilSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo    = dataSource.getRepository(Perfil);
        const rolRepo = dataSource.getRepository(Rol);

        // Buscamos los roles por nombre, no por ID
        const rolAdmin     = await rolRepo.findOne({ where: { nombre_rol: 'ADMINISTRADOR' } });
        const rolConductor = await rolRepo.findOne({ where: { nombre_rol: 'CONDUCTOR' } });
        const rolEstudiante = await rolRepo.findOne({ where: { nombre_rol: 'ESTUDIANTE' } });
        const rolMixto     = await rolRepo.findOne({ where: { nombre_rol: 'MIXTO' } });

        if (!rolAdmin || !rolConductor || !rolEstudiante || !rolMixto) {
            console.error(" Faltan roles. Corre InitSeeder primero.");
            return;
        }

        const perfiles = [
            { nombre_perfil: 'AdministradorGeneral', rol: rolAdmin },
            { nombre_perfil: 'ConductorCarro',       rol: rolConductor },
            { nombre_perfil: 'Estudiante Poli',       rol: rolEstudiante },
            { nombre_perfil: 'Estudiante María Cano', rol: rolEstudiante },
            { nombre_perfil: 'Estudiante UdeA',       rol: rolEstudiante },
            { nombre_perfil: 'Estudiante SENA',       rol: rolEstudiante },
            { nombre_perfil: 'Estudiante UNAL',       rol: rolEstudiante },
            { nombre_perfil: 'Estudiante TdeA',       rol: rolEstudiante },
            { nombre_perfil: 'Estudiante Pascual',    rol: rolEstudiante },
            { nombre_perfil: 'Estudiante Uniminuto',  rol: rolEstudiante },
            { nombre_perfil: 'Mixto Poli',            rol: rolMixto },
            { nombre_perfil: 'Mixto María Cano',      rol: rolMixto },
            { nombre_perfil: 'Mixto UdeA',            rol: rolMixto },
            { nombre_perfil: 'Mixto SENA',            rol: rolMixto },
            { nombre_perfil: 'Mixto UNAL',            rol: rolMixto },
            { nombre_perfil: 'Mixto TdeA',            rol: rolMixto },
            { nombre_perfil: 'Mixto Pascual',         rol: rolMixto },
            { nombre_perfil: 'Mixto Uniminuto',       rol: rolMixto },
        ];

        console.log("🌱 Insertando perfiles...");
        for (const p of perfiles) {
            const existe = await repo.findOne({ where: { nombre_perfil: p.nombre_perfil } });
            if (!existe) {
                await repo.save(repo.create(p));
                console.log(`Perfil: ${p.nombre_perfil}`);
            } else {
                console.log(` Ya existe: ${p.nombre_perfil}`);
            }
        }
    }
}