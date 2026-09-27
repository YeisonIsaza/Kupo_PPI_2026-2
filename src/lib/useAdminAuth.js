'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function useAdminAuth() {
    const router   = useRouter();
    const pathname = usePathname();
    const [nombre,   setNombre]   = useState('');
    const [listo,    setListo]    = useState(false);
    const [permisos, setPermisos] = useState(null);

    useEffect(() => {
        const userId   = localStorage.getItem('userId');
        const userRol  = localStorage.getItem('userRol');
        const userName = localStorage.getItem('userName');

        if (!userId || userRol !== '1') {
            router.push('/login');
            return;
        }

        fetch(`/api/admin/menu-permisos?userId=${userId}`)
            .then(r => r.json())
            .then(data => {
                setPermisos(data);
                setNombre(userName || 'Admin');
                setListo(true);
            })
            .catch(() => {
                setPermisos({});
                setNombre(userName || 'Admin');
                setListo(true);
            });
    }, [pathname]);

    function cerrarSesion() {
        localStorage.clear();
        router.push('/login');
    }

    // Mientras carga permisos
    if (permisos === null) {
        return {
            nombre, listo: false, acceso: true, cerrarSesion,
            puedeCrear: false, puedeActualizar: false, puedeEliminar: false,
        };
    }

    // Permisos reales de la página actual
    const permisoPagina = permisos[pathname];

    // Si no hay permiso configurado → permitir todo
    if (!permisoPagina) {
        return {
            nombre, listo, acceso: true, cerrarSesion,
            puedeCrear: true, puedeActualizar: true, puedeEliminar: true,
        };
    }

    return {
        nombre,
        listo,
        acceso:          permisoPagina.leer,       // ← leer controla el acceso completo
        cerrarSesion,
        puedeCrear:      permisoPagina.crear,
        puedeActualizar: permisoPagina.actualizar,
        puedeEliminar:   permisoPagina.eliminar,
    };
}