'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Permiso {
  leer: boolean;
  crear: boolean;
  actualizar: boolean;
  eliminar: boolean;
}

interface PermisosMap {
  [ruta: string]: Permiso;
}

interface UseAdminAuthReturn {
  nombre: string;
  listo: boolean;
  acceso: boolean;
  cerrarSesion: () => void;
  puedeCrear: boolean;
  puedeActualizar: boolean;
  puedeEliminar: boolean;
}

export default function useAdminAuth(): UseAdminAuthReturn {
    const router   = useRouter();
    const pathname = usePathname();
    const [nombre,   setNombre]   = useState<string>('');
    const [listo,    setListo]    = useState<boolean>(false);
    const [permisos, setPermisos] = useState<PermisosMap | null>(null);

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
            .then((data: PermisosMap) => {
                setPermisos(data);
                setNombre(userName ?? 'Admin');
                setListo(true);
            })
            .catch(() => {
                setPermisos({});
                setNombre(userName ?? 'Admin');
                setListo(true);
            });
    }, [pathname]);

    function cerrarSesion(): void {
        localStorage.clear();
        router.push('/login');
    }

    if (permisos === null) {
        return {
            nombre, listo: false, acceso: true, cerrarSesion,
            puedeCrear: false, puedeActualizar: false, puedeEliminar: false,
        };
    }

    const permisoPagina = permisos[pathname];

    if (!permisoPagina) {
        return {
            nombre, listo, acceso: true, cerrarSesion,
            puedeCrear: true, puedeActualizar: true, puedeEliminar: true,
        };
    }

    return {
        nombre,
        listo,
        acceso:          permisoPagina.leer,
        cerrarSesion,
        puedeCrear:      permisoPagina.crear,
        puedeActualizar: permisoPagina.actualizar,
        puedeEliminar:   permisoPagina.eliminar,
    };
}
