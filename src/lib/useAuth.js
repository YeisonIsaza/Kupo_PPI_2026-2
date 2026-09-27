'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Qué sección corresponde a cada modo
const SECCION_POR_MODO = {
    conductor: [2, 4],  // páginas que aceptan rol 2 y 4
    pasajero:  [3, 4],  // páginas que aceptan rol 3 y 4
};

export default function useAuth(rolesPermitidos = []) {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [idRol, setIdRol]   = useState(null);
    const [listo, setListo]   = useState(false);

    useEffect(() => {
        const userId   = localStorage.getItem('userId');
        const userRol  = parseInt(localStorage.getItem('userRol'));
        const userName = localStorage.getItem('userName');

        if (!userId) {
            router.push('/login');
            return;
        }

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(userRol)) {
            router.push('/login');
            return;
        }

        // Validación extra para rol mixto (4)
        if (userRol === 4) {
            const modoMixto = localStorage.getItem('modoMixto');
            if (!modoMixto) {
                // Solo redirigir si NO estamos ya en /dashboard/mixto
                if (!window.location.pathname.includes('/dashboard/mixto')) {
                    router.push('/dashboard/mixto');
                }
                return;
            }
            const seccionActual = rolesPermitidos.includes(2) ? 'conductor' : 'pasajero';
            if (modoMixto !== seccionActual) {
                router.push('/dashboard/mixto');
                return;
            }
        }

        setNombre(userName || 'Usuario');
        setIdRol(userRol);
        setListo(true);
    }, [router]);

    function cerrarSesion() {
        localStorage.clear();
        router.push('/login');
    }

    return { nombre, idRol, listo, cerrarSesion };
}