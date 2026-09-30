'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type RolesPermitidos = number[];

interface UseAuthReturn {
  nombre: string;
  idRol: number | null;
  listo: boolean;
  cerrarSesion: () => void;
}

const SECCION_POR_MODO: Record<string, number[]> = {
    conductor: [2, 4],
    pasajero:  [3, 4],
};

export default function useAuth(rolesPermitidos: RolesPermitidos = []): UseAuthReturn {
    const router = useRouter();
    const [nombre, setNombre] = useState<string>('');
    const [idRol, setIdRol]   = useState<number | null>(null);
    const [listo, setListo]   = useState<boolean>(false);

    useEffect(() => {
        const userId   = localStorage.getItem('userId');
        const userRol  = parseInt(localStorage.getItem('userRol') ?? '0');
        const userName = localStorage.getItem('userName');

        if (!userId) {
            router.push('/login');
            return;
        }

        if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(userRol)) {
            router.push('/login');
            return;
        }

        if (userRol === 4) {
            const modoMixto = localStorage.getItem('modoMixto');
            if (!modoMixto) {
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

        setNombre(userName ?? 'Usuario');
        setIdRol(userRol);
        setListo(true);
    }, [router]);

    function cerrarSesion(): void {
        localStorage.clear();
        router.push('/login');
    }

    return { nombre, idRol, listo, cerrarSesion };
}
