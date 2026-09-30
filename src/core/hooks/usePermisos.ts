'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Permiso {
  leer: boolean;
  crear: boolean;
  actualizar: boolean;
  eliminar: boolean;
}

interface PermisosMap {
  [ruta: string]: Permiso;
}

interface UsePermisosReturn {
  permisos: PermisosMap | null;
  cargando: boolean;
  puedeLeer: boolean;
  puedeCrear: boolean;
  puedeActualizar: boolean;
  puedeEliminar: boolean;
}

export default function usePermisos(): UsePermisosReturn {
    const pathname = usePathname();
    const [permisos, setPermisos] = useState<PermisosMap | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) { setCargando(false); return; }

        fetch(`/api/admin/menu-permisos?userId=${userId}`)
            .then(r => r.json())
            .then((data: PermisosMap) => {
                setPermisos(data);
                setCargando(false);
            })
            .catch(() => {
                setPermisos({});
                setCargando(false);
            });
    }, []);

    if (cargando || permisos === null) {
        return {
            permisos: null,
            cargando: true,
            puedeLeer:       false,
            puedeCrear:      false,
            puedeActualizar: false,
            puedeEliminar:   false,
        };
    }

    const permisoPagina = permisos[pathname];

    if (!permisoPagina) {
        return {
            permisos,
            cargando: false,
            puedeLeer:       true,
            puedeCrear:      true,
            puedeActualizar: true,
            puedeEliminar:   true,
        };
    }

    return {
        permisos,
        cargando: false,
        puedeLeer:       permisoPagina.leer,
        puedeCrear:      permisoPagina.crear,
        puedeActualizar: permisoPagina.actualizar,
        puedeEliminar:   permisoPagina.eliminar,
    };
}
