import 'dotenv/config';
import { getDataSource } from './src/core/database/db';
import InitSeeder        from './src/core/database/seeds/init.estadorol';
import PerfilSeeder      from './src/core/database/seeds/perfil.seeder';
import UniversidadSeeder from './src/core/database/seeds/universidad.seeder';
import MenuSeeder        from './src/core/database/seeds/menu.seeder';
import MenuPermisoSeeder from './src/core/database/seeds/MenuPermiso.seeder';

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
        await initSeeder.run(ds, null as any);
        
        const perfilSeeder = new PerfilSeeder();
        await perfilSeeder.run(ds, null as any);
        
        const uniSeeder = new UniversidadSeeder();
        await uniSeeder.run(ds, null as any);
        
        const menuSeeder = new MenuSeeder();
        await menuSeeder.run(ds, null as any);
        
        const menuPermisoSeeder = new MenuPermisoSeeder();
        await menuPermisoSeeder.run(ds, null as any);

        console.log('✅ Seeders ejecutados exitosamente!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al ejecutar seeders:', error);
        process.exit(1);
    }
}

seed();
