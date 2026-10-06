// Utilidades compartidas del "Modo Ella" (viajes solo para mujeres)

export type Genero = 'male' | 'female';

// Estados de reserva que ya NO ocupan un lugar en el viaje
export const ESTADOS_RESERVA_INACTIVOS = ['Cancelada', 'Rechazada'];

export function esMujer(genero?: string | null): boolean {
    return genero === 'female';
}

export function esGeneroValido(genero: unknown): genero is Genero {
    return genero === 'male' || genero === 'female';
}
