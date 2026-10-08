/**
 * Kupo · Motor geoespacial de rutas
 * ------------------------------------------------------------------
 * Funciones puras (sin dependencias) usadas tanto en el servidor como
 * en el cliente para:
 *   1. Calcular coincidencias entre la ubicación de un pasajero y el
 *      corredor de una ruta (trazado real o líneas entre paradas).
 *   2. Ajustar dinámicamente el aporte según la parada elegida
 *      (proporcional al tramo recorrido + costo adicional del conductor).
 */

export type LatLng = { lat: number; lng: number };
export type Sentido = 'hacia_universidad' | 'desde_universidad';

const RADIO_TIERRA_KM = 6371;

/** Un pasajero que recorre un tramo mínimo nunca paga menos de este % de la tarifa base. */
export const FACTOR_MINIMO_TRAMO = 0.4;
/** Radio por defecto (km) para considerar que una ruta "pasa cerca". */
export const RADIO_COINCIDENCIA_KM = 2;

// ──────────────────────────────────────────────────────────────────
// Utilidades básicas
// ──────────────────────────────────────────────────────────────────

export function esCoordenadaValida(p: any): p is LatLng {
    return !!p
        && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng))
        && Math.abs(Number(p.lat)) <= 90 && Math.abs(Number(p.lng)) <= 180
        && !(Number(p.lat) === 0 && Number(p.lng) === 0);
}

export function aLatLng(lat: any, lng: any): LatLng | null {
    if (lat === null || lat === undefined || lng === null || lng === undefined || lat === '' || lng === '') return null;
    const p = { lat: Number(lat), lng: Number(lng) };
    return esCoordenadaValida(p) ? p : null;
}

const rad = (g: number) => (g * Math.PI) / 180;

export function haversineKm(a: LatLng, b: LatLng): number {
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function longitudTrazadoKm(path: LatLng[]): number {
    let total = 0;
    for (let i = 1; i < path.length; i++) total += haversineKm(path[i - 1], path[i]);
    return total;
}

export function redondearCOP(valor: number): number {
    return Math.round(valor / 100) * 100;
}

export function formatearDistancia(km: number | null | undefined): string {
    if (km === null || km === undefined || !Number.isFinite(km)) return '';
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

// ──────────────────────────────────────────────────────────────────
// Trazado (polilínea) de la ruta
// ──────────────────────────────────────────────────────────────────

/** Convierte el JSON guardado en BD ([[lat,lng],...]) en LatLng[]. Devuelve null si es inválido. */
export function parsearPath(raw: unknown): LatLng[] | null {
    if (!raw) return null;
    try {
        const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!Array.isArray(arr)) return null;
        const puntos = arr
            .map((p: any) => Array.isArray(p) ? aLatLng(p[0], p[1]) : aLatLng(p?.lat, p?.lng))
            .filter((p): p is LatLng => p !== null);
        return puntos.length >= 2 ? puntos : null;
    } catch {
        return null;
    }
}

export function serializarPath(path: LatLng[]): string {
    return JSON.stringify(path.map(p => [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))]));
}

/** Distancia perpendicular aproximada (km) de p al segmento a-b usando proyección local equirectangular. */
function proyectarEnSegmento(p: LatLng, a: LatLng, b: LatLng): { distanciaKm: number; t: number } {
    const kx = 111.32 * Math.cos(rad((a.lat + b.lat + p.lat) / 3));
    const ky = 110.574;
    const ax = a.lng * kx, ay = a.lat * ky;
    const bx = b.lng * kx, by = b.lat * ky;
    const px = p.lng * kx, py = p.lat * ky;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    return { distanciaKm: Math.hypot(px - cx, py - cy), t };
}

/** Simplificación Douglas-Peucker + muestreo, para guardar trazados livianos. */
export function simplificarPath(path: LatLng[], toleranciaKm = 0.015, maxPuntos = 300): LatLng[] {
    if (path.length <= 2) return path.slice();
    const conservar = new Array(path.length).fill(false);
    conservar[0] = conservar[path.length - 1] = true;
    const pila: Array<[number, number]> = [[0, path.length - 1]];
    while (pila.length) {
        const [ini, fin] = pila.pop()!;
        let maxD = 0, idx = -1;
        for (let i = ini + 1; i < fin; i++) {
            const d = proyectarEnSegmento(path[i], path[ini], path[fin]).distanciaKm;
            if (d > maxD) { maxD = d; idx = i; }
        }
        if (idx !== -1 && maxD > toleranciaKm) {
            conservar[idx] = true;
            pila.push([ini, idx], [idx, fin]);
        }
    }
    let resultado = path.filter((_, i) => conservar[i]);
    if (resultado.length > maxPuntos) {
        const paso = (resultado.length - 1) / (maxPuntos - 1);
        resultado = Array.from({ length: maxPuntos }, (_, i) => resultado[Math.round(i * paso)]);
    }
    return resultado;
}

export interface ProyeccionRuta {
    distanciaKm: number;   // distancia del punto al corredor de la ruta
    posicionKm: number;    // km recorridos desde el origen hasta el punto proyectado
}

export function proyectarEnTrazado(p: LatLng, path: LatLng[]): ProyeccionRuta {
    let mejor: ProyeccionRuta = { distanciaKm: Infinity, posicionKm: 0 };
    let acumulado = 0;
    for (let i = 1; i < path.length; i++) {
        const a = path[i - 1], b = path[i];
        const largo = haversineKm(a, b);
        const { distanciaKm, t } = proyectarEnSegmento(p, a, b);
        if (distanciaKm < mejor.distanciaKm) mejor = { distanciaKm, posicionKm: acumulado + t * largo };
        acumulado += largo;
    }
    return mejor;
}

// ──────────────────────────────────────────────────────────────────
// Análisis de ruta: sentido, tramos y aporte dinámico por parada
// ──────────────────────────────────────────────────────────────────

export interface ParadaGeo {
    id: number;
    nombre?: string;
    orden: number;
    lat: number | null;
    lng: number | null;
    costoAdicional: number;
}

export interface RutaGeo {
    origen: LatLng | null;
    destino: LatLng | null;
    path?: LatLng[] | null;
    paradas: ParadaGeo[];
    tarifa: number;
    universidad?: LatLng | null;
}

/** Construye un RutaGeo a partir de la entidad RutaConductor (con relaciones paradas/universidad). */
export function rutaGeoDesdeEntidad(ruta: any): RutaGeo {
    return {
        origen:      aLatLng(ruta?.punto_origen_latitud_rc, ruta?.punto_origen_longitud_rc),
        destino:     aLatLng(ruta?.punto_destino_latitud_rc, ruta?.punto_destino_longitud_rc),
        path:        parsearPath(ruta?.ruta_path_rc),
        tarifa:      Number(ruta?.tarifa_rc) || 0,
        universidad: aLatLng(ruta?.universidad?.direccion_latitud_uni, ruta?.universidad?.direccion_longitud_uni),
        paradas: (ruta?.paradas || []).map((p: any) => ({
            id:             Number(p.id_pds),
            nombre:         p.punto_recogida_pds,
            orden:          Number(p.orden_pds) || 0,
            lat:            p.latitud_pds !== null && p.latitud_pds !== undefined ? Number(p.latitud_pds) : null,
            lng:            p.longitud_pds !== null && p.longitud_pds !== undefined ? Number(p.longitud_pds) : null,
            costoAdicional: Number(p.costo_adicional_pds) || 0,
        })),
    };
}

export interface ParadaAnalizada extends ParadaGeo {
    aporte: number;          // aporte final que paga el pasajero en esta parada
    fraccion: number;        // fracción (0..1) del trayecto que recorre el pasajero
    tramoKm: number | null;  // km aproximados que recorre el pasajero
    posicionKm: number | null;
}

export interface RutaAnalizada {
    trazado: LatLng[] | null;
    totalKm: number | null;
    sentido: Sentido;
    paradas: ParadaAnalizada[];
}

/**
 * Hacia la universidad → la parada es punto de RECOGIDA (el pasajero va de la parada al destino).
 * Desde la universidad → la parada es punto de BAJADA (el pasajero va del origen a la parada).
 */
export function detectarSentido(origen: LatLng | null, destino: LatLng | null, universidad?: LatLng | null): Sentido {
    if (origen && destino && universidad && esCoordenadaValida(universidad)) {
        return haversineKm(origen, universidad) < haversineKm(destino, universidad)
            ? 'desde_universidad'
            : 'hacia_universidad';
    }
    return 'hacia_universidad';
}

/** Aporte = tarifa base × factor del tramo (mín. 40%) redondeado a $100 + costo adicional. */
export function calcularAporteTramo(tarifaBase: number, fraccion: number, costoAdicional = 0): number {
    const base = Number(tarifaBase) || 0;
    const f = Number.isFinite(fraccion) ? Math.max(0, Math.min(1, fraccion)) : 1;
    const factor = FACTOR_MINIMO_TRAMO + (1 - FACTOR_MINIMO_TRAMO) * f;
    return redondearCOP(base * factor) + Math.max(0, Number(costoAdicional) || 0);
}

export function construirTrazado(origen: LatLng | null, destino: LatLng | null, paradas: ParadaGeo[], path?: LatLng[] | null): LatLng[] | null {
    if (path && path.length >= 2) return path;
    if (!origen || !destino) return null;
    const intermedias = [...paradas]
        .sort((a, b) => a.orden - b.orden)
        .map(p => aLatLng(p.lat, p.lng))
        .filter((p): p is LatLng => p !== null);
    return [origen, ...intermedias, destino];
}

export function analizarRuta(ruta: RutaGeo): RutaAnalizada {
    const tarifa = Number(ruta.tarifa) || 0;
    const trazado = construirTrazado(ruta.origen, ruta.destino, ruta.paradas, ruta.path);
    const totalKm = trazado ? longitudTrazadoKm(trazado) : null;
    const sentido = detectarSentido(ruta.origen, ruta.destino, ruta.universidad);

    const paradas: ParadaAnalizada[] = [...ruta.paradas]
        .sort((a, b) => a.orden - b.orden)
        .map(p => {
            const coord = aLatLng(p.lat, p.lng);
            if (!coord || !trazado || !totalKm || totalKm < 0.05) {
                // Sin coordenadas: se conserva el comportamiento histórico (tarifa completa + adicional)
                return { ...p, aporte: calcularAporteTramo(tarifa, 1, p.costoAdicional), fraccion: 1, tramoKm: totalKm, posicionKm: null };
            }
            const { posicionKm } = proyectarEnTrazado(coord, trazado);
            const fraccion = sentido === 'hacia_universidad'
                ? (totalKm - posicionKm) / totalKm
                : posicionKm / totalKm;
            const f = Math.max(0, Math.min(1, fraccion));
            return {
                ...p,
                aporte: calcularAporteTramo(tarifa, f, p.costoAdicional),
                fraccion: f,
                tramoKm: f * totalKm,
                posicionKm,
            };
        });

    return { trazado, totalKm, sentido, paradas };
}

// ──────────────────────────────────────────────────────────────────
// Coincidencias pasajero ↔ ruta
// ──────────────────────────────────────────────────────────────────

export interface PuntoEncuentro {
    tipo: 'origen' | 'destino' | 'parada';
    id_pds: number | null;
    nombre: string;
    lat: number;
    lng: number;
    distanciaKm: number;   // distancia en línea recta desde el pasajero
    aporte: number;
}

export interface Coincidencia {
    distanciaRutaKm: number;      // qué tan lejos pasa la ruta del pasajero
    puntoSugerido: PuntoEncuentro | null;
    cumple: boolean;
}

export function calcularCoincidencia(
    analisis: RutaAnalizada,
    datos: { origen: LatLng | null; destino: LatLng | null; origenNombre?: string; destinoNombre?: string; tarifa: number },
    puntoPasajero: LatLng,
    radioKm = RADIO_COINCIDENCIA_KM,
): Coincidencia {
    if (!analisis.trazado) return { distanciaRutaKm: Infinity, puntoSugerido: null, cumple: false };

    const { distanciaKm: distanciaRutaKm } = proyectarEnTrazado(puntoPasajero, analisis.trazado);
    const tarifa = Number(datos.tarifa) || 0;

    // Puntos donde el pasajero puede subir (hacia la U) o bajar (desde la U)
    const candidatos: PuntoEncuentro[] = [];
    const extremo = analisis.sentido === 'hacia_universidad'
        ? { tipo: 'origen' as const, p: datos.origen, nombre: datos.origenNombre || 'Origen del viaje' }
        : { tipo: 'destino' as const, p: datos.destino, nombre: datos.destinoNombre || 'Destino del viaje' };
    if (extremo.p) {
        candidatos.push({
            tipo: extremo.tipo, id_pds: null, nombre: extremo.nombre,
            lat: extremo.p.lat, lng: extremo.p.lng,
            distanciaKm: haversineKm(puntoPasajero, extremo.p),
            aporte: redondearCOP(tarifa),
        });
    }
    analisis.paradas.forEach(p => {
        const c = aLatLng(p.lat, p.lng);
        if (!c) return;
        candidatos.push({
            tipo: 'parada', id_pds: p.id, nombre: p.nombre || `Parada ${p.orden}`,
            lat: c.lat, lng: c.lng,
            distanciaKm: haversineKm(puntoPasajero, c),
            aporte: p.aporte,
        });
    });

    const puntoSugerido = candidatos.sort((a, b) => a.distanciaKm - b.distanciaKm)[0] || null;
    const distanciaMinima = Math.min(distanciaRutaKm, puntoSugerido?.distanciaKm ?? Infinity);

    return { distanciaRutaKm, puntoSugerido, cumple: distanciaMinima <= radioKm };
}
