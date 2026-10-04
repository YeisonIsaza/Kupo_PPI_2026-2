import 'dotenv/config';
import { getDataSource } from './src/core/database/db';

async function testConnection() {
    try {
        console.log('Intentando conectar con TypeORM a Postgres...');
        const ds = await getDataSource();
        console.log('✅ ¡Conectado correctamente a Supabase con TypeORM!');
        process.exit(0);
    } catch (e: any) {
        console.error('❌ Error de conexión:', e.message || e);
        process.exit(1);
    }
}
testConnection();
