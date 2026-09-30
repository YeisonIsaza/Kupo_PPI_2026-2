'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function usePermisos() {
    const pathname = usePathname();
    const [permisos, setPermisos] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) { setCargando(false); return; }

        fetch(`/api/admin/menu-permisos?userId=${userId}`)
            .then(r => r.json())
            .then(data => {
                setPermisos(data);
                setCargando(false);
            })
            .catch(() => {
                setPermisos({});
                setCargando(false);
            });
    }, []); // ← solo se ejecuta una vez al montar

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