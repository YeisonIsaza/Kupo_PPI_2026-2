import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { MenuPermiso } from "../../entities/Menu_permiso";
import { Menu } from "../../entities/Menu";
import { Perfil } from "../../entities/Perfil";

export default class MenuPermisoSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo      = dataSource.getRepository(MenuPermiso);
        const menuRepo  = dataSource.getRepository(Menu);
        const perfilRepo = dataSource.getRepository(Perfil);

        // S = puede, N = no puede
        // [codigo_menu, codigo_perfil, crear, leer, actualizar, eliminar]
        const permisos = [
            // Admin (1) — acceso total a todo
            ['M001', 1, 'S','S','S','S'],
            ['M002', 1, 'S','S','S','S'],
            ['M003', 1, 'S','S','S','S'],
            ['M004', 1, 'S','S','S','S'],
            ['M005', 1, 'S','S','S','S'],
            ['M011', 1, 'S','S','S','S'],
            ['M012', 1, 'S','S','S','S'],
            ['M021', 1, 'S','S','S','S'],
            ['M022', 1, 'S','S','S','S'],
            ['M031', 1, 'S','S','S','S'], 
            ['M032', 1, 'S','S','S','S'],
            ['M033', 1, 'S','S','S','S'],
            ['M034', 1, 'S','S','S','S'],
            ['M035', 1, 'S','S','S','S'],
            ['M036', 1, 'S','S','S','S'],
            ['M037', 1, 'S','S','S','S'],
            ['M038', 1, 'S','S','S','S'],

            // Superadmin (2) — acceso total a todo (igual que admin, pero sin gestión de usuarios)
            
            ['M031', 21, 'S','S','S','N'],  // Solicitudes: puede todo menos eliminar
            ['M032', 21, 'N','S','N','N'],  // Roles: solo leer
            ['M033', 21, 'N','S','N','N'],  // Estados: solo leer
            ['M034', 21, 'N','S','N','N'],  // Perfiles: solo leer
            ['M035', 21, 'N','S','N','N'],  // Menús: solo leer
            ['M036', 21, 'S','S','S','N'],  // Universidades: puede todo menos eliminar
            ['M037', 21, 'N','N','N','N'],  // Permisos: sin acceso
            ['M038', 21, 'N','N','N','N'],  // Administradores: sin acceso

            
            // Conductor (2) — solo su dashboard y comunidad (lectura)
            ['M001', 2, 'N','S','N','N'],
            ['M011', 2, 'N','S','S','N'],
            ['M002', 2, 'N','S','N','N'],
            ['M021', 2, 'N','S','N','N'],
            ['M005', 2, 'N','S','N','N'],
            ['M041', 2, 'S','S','S','S'],
            ['M042', 2, 'S','S','S','S'],
            ['M043', 2, 'S','S','S','S'],
            ['M044', 2, 'S','S','S','S'],
            ['M046', 2, 'S','S','S','S'],
            

            // Pasajero (3) — solo su dashboard y comunidad (lectura)
            ['M001', 3, 'N','S','N','N'],
            ['M012', 3, 'N','S','S','N'],
            ['M002', 3, 'N','S','N','N'],
            ['M022', 3, 'N','S','N','N'],
            ['M005', 3, 'N','S','N','N'],
            ['M051', 3, 'S','S','S','S'],
            ['M052', 3, 'S','S','S','S'],


            // Mixto (4) — acceso a ambos dashboards
            ['M001', 4, 'N','S','N','N'],
            ['M011', 4, 'N','S','S','N'],
            ['M012', 4, 'N','S','S','N'],
            ['M002', 4, 'N','S','N','N'],
            ['M021', 4, 'N','S','N','N'],
            ['M022', 4, 'N','S','N','N'],
            ['M005', 4, 'N','S','N','N'],
            ['M041', 4, 'S','S','S','S'],
            ['M042', 4, 'S','S','S','S'],
            ['M043', 4, 'S','S','S','S'],
            ['M044', 4, 'S','S','S','S'],
            ['M046', 4, 'S','S','S','S'],
            ['M051', 4, 'S','S','S','S'],
            ['M052', 4, 'S','S','S','S'],
        ];

        console.log(" Insertando permisos de menú...");
        for (const [cod_menu, cod_perfil, crear, leer, actualizar, eliminar] of permisos) {
            const existe = await repo.findOne({
                where: { codigo_menu: cod_menu as string, codigo_perfil: cod_perfil as number }
            });
            if (!existe) {
                const menu   = await menuRepo.findOne({ where: { codigo_menu: cod_menu as string } });
                const perfil = await perfilRepo.findOne({ where: { codigo_perfil: cod_perfil as number } });
                await repo.save(repo.create({
                    codigo_menu:      cod_menu as string,
                    codigo_perfil:    cod_perfil as number,
                    puede_crear:      crear as string,
                    puede_leer:       leer as string,
                    puede_actualizar: actualizar as string,
                    puede_eliminar:   eliminar as string,
                    menu:             menu!,
                    perfil:           perfil!,
                }));
                console.log(`Permiso: menú ${cod_menu} → perfil ${cod_perfil}`);
            }
        }
    }
}