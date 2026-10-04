import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";
import InitSeeder        from './seeds/init.estadorol';
import PerfilSeeder      from './seeds/perfil.seeder';
import UniversidadSeeder from './seeds/universidad.seeder';
import MenuSeeder        from './seeds/menu.seeder';
import MenuPermisoSeeder from './seeds/MenuPermiso.seeder';
import UsuarioSeeder     from './seeds/usuario.seeder';

// --- IMPORTACIÓN DE ENTIDADES ---
import { CalificacionConductor }  from '../models/CalificacionConductor';
import { CalificacionEstudiante } from '../models/CalificacionEstudiante';
import { Conductor }              from '../models/Conductor';
import { Estado }                 from '../models/Estado'; 
import { Menu }                   from '../models/Menu';
import { MenuPermiso }            from '../models/Menu_permiso';
import { Parada }                 from '../models/Parada';
import { Perfil }                 from '../models/Perfil';
import { Reserva }                from '../models/Reserva';
import { Rol }                    from '../models/Rol';
import { RutaConductor }          from '../models/RutaConductor';
import { Universidad }            from '../models/Universidad';
import { UniversidadEstudiante }  from '../models/UniversidadEstudiante';
import { Usuario }                from '../models/Usuario'; 
import { Vehiculo }               from '../models/Vehiculo';
import { Viaje }                  from '../models/Viaje';

const options: DataSourceOptions & SeederOptions = {
    type: "postgres",
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Requerido por Supabase
    synchronize: true, // Esto creará todas las tablas en Supabase automáticamente basado en tus modelos
    logging: true,
    //logging: false,

    entities: [
        CalificacionConductor,
        CalificacionEstudiante,
        Conductor,
        Estado,
        Menu,
        MenuPermiso,
        Parada,
        Perfil,
        Reserva,
        Rol,
        RutaConductor,
        Universidad,
        UniversidadEstudiante,
        Usuario,
        Vehiculo,
        Viaje
    ],
    seeds: [
        InitSeeder,
        PerfilSeeder,
        UniversidadSeeder,
        MenuSeeder,
        MenuPermisoSeeder,
        UsuarioSeeder,
    ]
};

export const AppDataSource = new DataSource(options);

let initialized = false;

export async function getDataSource() {
    if (!initialized) {
        try {
            if (AppDataSource.isInitialized) {
                initialized = true;
                return AppDataSource;
            }
            await AppDataSource.initialize();
            initialized = true;
            console.log("¡Conexión con Supabase (PostgreSQL) establecida!");
        } catch (error: any) {
            if (error.message?.includes("already established")) {
                initialized = true;
                return AppDataSource;
            }
            throw error;
        }
    }
    return AppDataSource;
}

/* Función para ejecutar los seeders
export async function runSeeders() {
    const ds = await getDataSource();
    await ds.runMigrations();
    await ds.seed(InitSeeder);
    await ds.seed(PerfilSeeder);
    await ds.seed(UniversidadSeeder);
    await ds.seed(MenuSeeder);
    await ds.seed(MenuPermisoSeeder);
    await ds.seed(UsuarioSeeder);
}
// Ejecutar los seeders al iniciar la aplicación
getDataSource()
    .then(() => runSeeders())
    .catch((error) => console.error("Error al ejecutar seeders:", error));

    
// Para ejecutar manualmente los seeders, puedes usar el siguiente comando en tu terminal:

    npm run db:migrate
    npm run db:seed


*/