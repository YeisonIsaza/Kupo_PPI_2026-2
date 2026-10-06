const { DataSource } = require('typeorm');
const options = {
    type: 'postgres',
    url: 'postgresql://postgres.sfboanhdbrukeyirmjlu:130823PYppi$@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
};
const ds = new DataSource(options);
ds.initialize().then(async () => {
    const res = await ds.query("SELECT id_estado FROM estado WHERE nombre_estado='ACTIVO' AND categoria='CUENTA' LIMIT 1");
    if (res.length > 0) {
        const idActivo = res[0].id_estado;
        await ds.query("UPDATE usuario SET id_estado_cuenta = $1", [idActivo]);
        console.log('Todos los usuarios han sido activados. Estado =', idActivo);
    }
    await ds.destroy();
}).catch(console.error);
