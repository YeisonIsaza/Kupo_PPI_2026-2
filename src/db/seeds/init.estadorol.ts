import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Rol } from '../../entities/Rol';
import { Estado } from '../../entities/Estado';

export default class InitSeeder implements Seeder {
    public async run(
        dataSource: DataSource,
        factoryManager: SeederFactoryManager
    ): Promise<any> {
        const rolRepository    = dataSource.getRepository(Rol);
        const estadoRepository = dataSource.getRepository(Estado);

        // --- ROLES ---
        console.log(' Insertando roles iniciales...');
        const roles = [
            { nombre_rol: 'ADMINISTRADOR' },
            { nombre_rol: 'CONDUCTOR' },
            { nombre_rol: 'ESTUDIANTE' },
            { nombre_rol: 'MIXTO' }
        ];

        for (const r of roles) {
            const existe = await rolRepository.findOne({ where: { nombre_rol: r.nombre_rol } });
            if (!existe) {
                await rolRepository.save(rolRepository.create(r));
                console.log(` Rol: ${r.nombre_rol}`);
            } else {
                console.log(` Ya existe: ${r.nombre_rol}`);
            }
        }

        // --- ESTADOS ---
        console.log(' Insertando estados iniciales...');
        const estados = [
            { nombre_estado: 'ACTIVO',    categoria: 'CUENTA' },
            { nombre_estado: 'INACTIVO',  categoria: 'CUENTA' },
            { nombre_estado: 'PENDIENTE', categoria: 'VERIFICACION' },
            { nombre_estado: 'APROBADO',  categoria: 'VERIFICACION' },
            { nombre_estado: 'RECHAZADO', categoria: 'VERIFICACION' },
            { nombre_estado: 'OCUPADO',   categoria: 'USUARIO' },
            { nombre_estado: 'INACTIVO',  categoria: 'USUARIO' },
            { nombre_estado: 'BLOQUEADO', categoria: 'USUARIO' },
            { nombre_estado: 'PENDIENTE', categoria: 'USUARIO' },
            { nombre_estado: 'Pendiente', categoria: 'CONDUCTOR' },
            { nombre_estado: 'Aprobado',  categoria: 'CONDUCTOR' },
            { nombre_estado: 'Rechazado', categoria: 'CONDUCTOR' },
            { nombre_estado: 'Activo',    categoria: 'VEHICULO' },
            { nombre_estado: 'En Revisión', categoria: 'VEHICULO' },
            { nombre_estado: 'Inactivo',  categoria: 'VEHICULO' },
            { nombre_estado: 'Disponible',  categoria: 'VIAJE' },
            { nombre_estado: 'Lleno',       categoria: 'VIAJE' },
            { nombre_estado: 'En Progreso', categoria: 'VIAJE' },
            { nombre_estado: 'Finalizado',  categoria: 'VIAJE' },
            { nombre_estado: 'Cancelado',   categoria: 'VIAJE' },
            { nombre_estado: 'Solicitada',  categoria: 'RESERVA' },
            { nombre_estado: 'Confirmada',  categoria: 'RESERVA' },
            { nombre_estado: 'Rechazada',   categoria: 'RESERVA' },
            { nombre_estado: 'Cancelada',   categoria: 'RESERVA' },
            { nombre_estado: 'Activa',      categoria: 'RUTA' },
            { nombre_estado: 'Inactiva',    categoria: 'RUTA' },
            { nombre_estado: 'Pendiente de Verificación', categoria: 'VINCULACION' },
            { nombre_estado: 'Verificada',  categoria: 'VINCULACION' },
            { nombre_estado: 'Rechazada',   categoria: 'VINCULACION' },
            { nombre_estado: 'En Espera',   categoria: 'VINCULACION' },
        ];

        for (const e of estados) {
            const existe = await estadoRepository.findOne({
                where: { nombre_estado: e.nombre_estado, categoria: e.categoria }
            });
            if (!existe) {
                await estadoRepository.save(estadoRepository.create(e));
                console.log(`✅ Estado: ${e.nombre_estado} - ${e.categoria}`);
            } else {
                console.log(`⏭️  Ya existe: ${e.nombre_estado} - ${e.categoria}`);
            }
        }

        console.log('🎉 ¡Roles y Estados insertados con éxito!');
    }
}