import 'dotenv/config';
import { supabase } from './src/core/lib/supabase';

async function testConnection() {
  console.log('Probando la conexión a Supabase...');
  
  try {
    // Prueba 1: Verificar el servicio de Autenticación de Supabase (valida URL y Key)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error de conexión con Supabase (Auth):', error.message);
    } else {
      console.log('✅ ¡Conexión exitosa al cliente de Supabase!');
    }

    // Prueba 2: Verificar la conexión a la base de datos SQL
    // Consultamos una tabla que no existe; si el error es de que la tabla no existe (42P01), 
    // significa que logramos llegar y comunicarnos con la base de datos exitosamente.
    const { error: dbError } = await supabase.from('test_connection_table').select('*').limit(1);
    
    if (dbError && dbError.code === '42P01') {
      console.log('✅ ¡Comunicación exitosa con la base de datos PostgreSQL!');
    } else if (dbError) {
      console.log('⚠️ Se recibió respuesta de la DB, pero con un error diferente:', dbError.message);
    } else {
      console.log('✅ Consulta exitosa a la base de datos!');
    }

  } catch (err) {
    console.error('❌ Ocurrió un error inesperado al intentar conectar:', err);
  }
}

testConnection();
