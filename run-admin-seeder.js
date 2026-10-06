const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');

const options = {
    type: 'postgres',
    url: 'postgresql://postgres.sfboanhdbrukeyirmjlu:130823PYppi$@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
};

const ds = new DataSource(options);

ds.initialize().then(async () => {
    // 1. Get Perfil AdministradorGeneral
    const perfRes = await ds.query("SELECT codigo_perfil FROM perfil WHERE nombre_perfil='AdministradorGeneral' LIMIT 1");
    if (perfRes.length === 0) {
        console.error("Falta el perfil AdministradorGeneral");
        process.exit(1);
    }
    const codPerfil = perfRes[0].codigo_perfil;

    // 2. Get Estado ACTIVO para CUENTA
    const actRes = await ds.query("SELECT id_estado FROM estado WHERE nombre_estado='ACTIVO' AND categoria='CUENTA' LIMIT 1");
    if (actRes.length === 0) {
        console.error("Falta el estado ACTIVO-CUENTA");
        process.exit(1);
    }
    const idActivo = actRes[0].id_estado;

    // 3. Get Estado APROBADO para VERIFICACION
    const aprRes = await ds.query("SELECT id_estado FROM estado WHERE nombre_estado='APROBADO' AND categoria='VERIFICACION' LIMIT 1");
    if (aprRes.length === 0) {
        console.error("Falta el estado APROBADO-VERIFICACION");
        process.exit(1);
    }
    const idAprobado = aprRes[0].id_estado;

    const email = 'lalagon0607@gmail.com';
    const exists = await ds.query("SELECT id_user FROM usuario WHERE correo_personal_user=$1", [email]);
    if (exists.length > 0) {
        console.log("El admin ya existe.");
    } else {
        const hash = await bcrypt.hash('prueba123', 10);
        await ds.query(`
            INSERT INTO usuario (
                nombre_user, primer_apellido, segundo_apellido, documento_identidad_user,
                celular, correo_personal_user, contrasena, codigo_perfil, id_estado_cuenta, id_estado_verificacion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, ['Laura', 'González', 'Muñoz', '1035414668', '3000000001', email, hash, codPerfil, idActivo, idAprobado]);
        console.log("Admin creado exitosamente.");
    }
    await ds.destroy();
}).catch(console.error);
