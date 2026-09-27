import { Seeder } from "typeorm-extension";
import { DataSource } from "typeorm";
import { Universidad } from "../../entities/Universidad"; 

export default class UniversidadSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repo = dataSource.getRepository(Universidad);

        const universidadesIniciales = [
            {
                nit_uni:                ' 890.980.136-6',
                nombre_uni:             'Politécnico Jaime Isaza Cadavid',
                dominio_correo_uni:     'elpoli.edu.co',
                direccion_longitud_uni:   -75.56446359363021,
                direccion_latitud_uni:    6.31806888010193,
               
            },
            {
                nit_uni:                '800.036.781-1',
                nombre_uni:             'Fundación Universitaria María Cano',
                dominio_correo_uni:     'fumc.edu.co',
                direccion_longitud_uni: -75.55950431771805,
                direccion_latitud_uni:   6.25134429111018, 
            },
            {
                nit_uni:                ' 890.980.040-8',
                nombre_uni:             'Universidad de Antioquia',
                dominio_correo_uni:     'udea.edu.co',
                direccion_longitud_uni:  -75.56720809456982,
                direccion_latitud_uni:   6.268397337304238,
            },
            {
                nit_uni:                '899.999.034-1',
                nombre_uni:             'SENA(Servicio Nacional de Aprendizaje)',
                dominio_correo_uni:     'soy.sena.edu.co',
                direccion_longitud_uni: -75.57502462442848,
                direccion_latitud_uni:   6.257093310067363, 
            },
            {
                nit_uni:                '890980040-5',
                nombre_uni:             'Universidad Nacional de Colombia - Sede Medellín',
                dominio_correo_uni:     'unal.edu.co',
                direccion_longitud_uni:  -75.58000280387449,
                direccion_latitud_uni:  6.262724358849135,
            },
            {
                nit_uni:                '890.905.419-6',
                nombre_uni:             'Tecnologico de Antioquia',
                dominio_correo_uni:     'tdea.edu.co',
                direccion_longitud_uni:  -75.58296829446472,
                direccion_latitud_uni: 6.28020387577566,
                
            },
            {
                nit_uni:                '890.980.153-1',
                nombre_uni:             ' Institución Universitaria Pascual Bravo',
                dominio_correo_uni:     'pascualbravo.edu.co',
                direccion_longitud_uni:  -75.58550126378461,
                direccion_latitud_uni:  6.273146762737191,
               
            },
             {
                nit_uni:                '800.116.217-2',
                nombre_uni:             ' Corporación Universitaria Minuto de Dios - UNIMINUTO',
                dominio_correo_uni:     'uniminuto.edu.co',
                direccion_longitud_uni:  -75.55450973042096,
                direccion_latitud_uni:  6.311282539163044,
               
            },
        ];

        console.log("🌱 Insertando universidades...");

        for (const uni of universidadesIniciales) {
            const existe = await repo.findOne({ 
                where: { nit_uni: uni.nit_uni } 
            });

            if (!existe) {
                const nuevaUni = repo.create(uni);
                await repo.save(nuevaUni);
                console.log(`✅ Agregada: ${uni.nombre_uni}`);
            }
        }
    }
}