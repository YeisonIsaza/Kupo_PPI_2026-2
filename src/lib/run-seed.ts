import "reflect-metadata";
import { runSeeders } from "typeorm-extension";
import { AppDataSource } from "./db";


import InitSeeder        from "../db/seeds/init.estadorol";
import PerfilSeeder      from "../db/seeds/perfil.seeder";
import UniversidadSeeder from "../db/seeds/universidad.seeder";
import MenuSeeder        from "../db/seeds/menu.seeder";
import MenuPermisoSeeder from "../db/seeds/MenuPermiso.seeder";
import UsuarioSeeder     from "../db/seeds/usuario.seeder";

async function run() {
    try {
        console.log("Inicializando conexión con Oracle...");
        await AppDataSource.initialize();

        console.log(" Corriendo cadena de Seeders...");
        
        await runSeeders(AppDataSource, {
            seeds: [
                InitSeeder,         // 1ro: Roles y Estados
                PerfilSeeder,       // 2do: Perfiles
                UniversidadSeeder,  // 3ro: Universidades
                MenuSeeder,         // 4to: Menús
                MenuPermisoSeeder,  // 5to: Permisos
                UsuarioSeeder,      // 6to: Usuario admin
            ]
        });

        console.log(" ¡Todo el sistema ha sido inicializado con éxito!");
        
    } catch (error) {
        console.error(" Error en la cadena de seeds:", error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log("🔌 Conexión cerrada.");
        }
    }
}

run();