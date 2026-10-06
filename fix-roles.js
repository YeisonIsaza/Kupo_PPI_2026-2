const { DataSource } = require('typeorm');
const ds = new DataSource({ type: 'postgres', url: 'postgresql://postgres.sfboanhdbrukeyirmjlu:130823PYppi$@aws-0-us-east-1.pooler.supabase.com:6543/postgres', ssl: { rejectUnauthorized: false } });
ds.initialize().then(async () => {
    await ds.query("UPDATE perfil SET id_rol = 1 WHERE nombre_perfil = 'AdministradorGeneral'");
    await ds.query("UPDATE perfil SET id_rol = 2 WHERE nombre_perfil = 'ConductorCarro'");
    await ds.query("UPDATE perfil SET id_rol = 3 WHERE nombre_perfil LIKE 'Estudiante%'");
    await ds.query("UPDATE perfil SET id_rol = 4 WHERE nombre_perfil LIKE 'Mixto%'");
    console.log('Roles asignados correctamente en la tabla perfil');
    await ds.destroy();
}).catch(console.error);
