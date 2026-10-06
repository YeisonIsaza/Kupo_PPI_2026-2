import 'dotenv/config';
import { getDataSource } from './src/core/database/db';
import InitSeeder        from './src/core/database/seeds/init.estadorol';
import PerfilSeeder      from './src/core/database/seeds/perfil.seeder';
import UniversidadSeeder from './src/core/database/seeds/universidad.seeder';
import MenuSeeder        from './src/core/database/seeds/menu.seeder';
import MenuPermisoSeeder from './src/core/database/seeds/MenuPermiso.seeder';
import UsuarioSeeder     from './src/core/database/seeds/usuario.seeder';

async function seed() {
    try {
        console.log('Iniciando seeders...');
        const ds = await getDataSource();
        
        console.log('Insertando Estados y Roles...');
        await ds.transaction(async (manager) => {
            // Typeorm-extension seed signature is usually (dataSource, factoryManager)
            // But we'll try to instantiate and run directly if they are classes.
        });
        
        // La forma correcta según typeorm-extension:
        const initSeeder = new InitSeeder();
        // @ts-ignore
        await initSeeder.run(ds);
        
        const perfilSeeder = new PerfilSeeder();
        // @ts-ignore
        await perfilSeeder.run(ds);
        
        const uniSeeder = new UniversidadSeeder();
        // @ts-ignore
        await uniSeeder.run(ds);
        
        const menuSeeder = new MenuSeeder();
        // @ts-ignore
        await menuSeeder.run(ds);
        
        const menuPermisoSeeder = new MenuPermisoSeeder();
        // @ts-ignore
        await menuPermisoSeeder.run(ds);

        const usuarioSeeder = new UsuarioSeeder();
        // @ts-ignore
        await usuarioSeeder.run(ds);

        console.log('✅ Seeders ejecutados exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar seeders:', error);
        process.exit(1);
    }
}

seed();
