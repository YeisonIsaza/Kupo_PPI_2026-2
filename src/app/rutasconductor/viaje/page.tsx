'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserNavbar from '@/presentation/components/UserNavbar';
import useAuth from '@/core/hooks/useAuth';
import usePermisos from '@/core/hooks/usePermisos';        // ← NUEVO
import SinPermiso from '@/presentation/components/SinPermiso';   // ← NUEVO

function ViajeContent() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const { puedeLeer, puedeActualizar, cargando: cargandoPermisos } = usePermisos();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const viajeId = searchParams.get('viajeId');
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<HTMLDivElement | null>(null);

    const [viaje, setViaje] = useState<any>(null);
    const [cargandoViaje, setCargandoViaje] = useState<boolean>(true); // ← renombrado para no chocar con cargandoPermisos
    const [reservas, setReservas] = useState<any[]>([]);
    const [toast, setToast] = useState<string>('');
    const [toastVisible, setToastVisible] = useState<boolean>(false);
    const toastTimer = useRef<any>(null);
    const [modoPruebaLocal, setModoPruebaLocal] = useState<boolean>(false);
    const fallbackPolylineRef = useRef<any>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (listo && isClient) cargarViaje();
    }, [listo, isClient]);

    useEffect(() => {
        if (viaje && (window as any).google) inicializarMapa();
    }, [viaje]);

    useEffect(() => {
        if (viaje) cargarReservas();
    }, [viaje]);

    function showToast(msg: any) {
        setToast(msg);
        setToastVisible(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
    }

    async function cargarReservas() {
        if (!viaje?.id_vj) return;
        try {
            const res = await fetch(`/api/conductor/viaje/${viaje.id_vj}/reservas`);
            const data = await res.json();
            setReservas(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando reservas'); }
    }

    async function gestionarReserva(reservaId: any, accion: any) {
        try {
            const res = await fetch(`/api/conductor/viaje/${viaje.id_vj}/reservas`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservaId, accion })
            });
            if (res.ok) {
                cargarReservas();
                showToast(accion === 'confirmar' ? '✅ Reserva confirmada' : '❌ Reserva rechazada');
            }
        } catch { showToast('❌ Error de conexión'); }
    }

    async function cargarViaje() {
        setCargandoViaje(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/viaje?userId=${userId}`);
            const data = await res.json();
            setViaje(data);
        } catch { console.error('Error cargando viaje'); }
        finally { setCargandoViaje(false); }
    }

    function inicializarMapa() {
        const ruta = viaje?.rutaConductor;
        if (!ruta) return;
        const origen  = { lat: Number(ruta.punto_origen_latitud_rc),  lng: Number(ruta.punto_origen_longitud_rc) };
        const destino = { lat: Number(ruta.punto_destino_latitud_rc), lng: Number(ruta.punto_destino_longitud_rc) };
        const mapa = new (window as any).google.maps.Map(mapRef.current, { center: origen, zoom: 13 });
        mapInstanceRef.current = mapa;
        new (window as any).google.maps.Marker({
            position: origen, map: mapa,
            label: { text: 'A', color: 'white' },
            icon: { path: (window as any).google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#4f46e5', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' }
        });
        new (window as any).google.maps.Marker({
            position: destino, map: mapa,
            label: { text: 'B', color: 'white' },
            icon: { path: (window as any).google.maps.SymbolPath.CIRCLE, scale: 12, fillColor: '#22c55e', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' }
        });
        ruta.paradas?.forEach((p: any) => {
            new (window as any).google.maps.Marker({
                position: origen, map: mapa,
                label: { text: String(p.orden_pds), color: 'white' },
                icon: { path: (window as any).google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#f59e0b', fillOpacity: 1, strokeWeight: 2, strokeColor: 'white' }
            });
        });
        const directionsService  = new (window as any).google.maps.DirectionsService();
        const directionsRenderer = new (window as any).google.maps.DirectionsRenderer({
            map: mapa, suppressMarkers: true,
            polylineOptions: { strokeColor: '#4f46e5', strokeWeight: 4, strokeOpacity: 0.8 }
        });
        
        directionsService.route({
            origin: origen, destination: destino,
            travelMode: (window as any).google.maps.TravelMode.DRIVING,
        })
        .then((result: any) => {
            if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
            directionsRenderer.setDirections(result);
            setModoPruebaLocal(false);
        })
        .catch((e: any) => {
            console.warn("No se pudo trazar la ruta de Google Maps por problemas con la API Key / Facturación:", e);
            setModoPruebaLocal(true);

            // Fallback: draw straight lines
            if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
            const path = [origen];
            ruta.paradas?.forEach((p: any) => path.push({ lat: Number(p.latitud_pds || p.punto_recogida_latitud_pds), lng: Number(p.longitud_pds || p.punto_recogida_longitud_pds) }));
            path.push(destino);

            // Note: If lat/lng properties differ in paradas object, use safe fallback or ignore intermediate points for simplicity
            // In API route GET, it brings paradas as they are in DB. Let's just use origin and destination for safety if paradas lat/lng are undefined.
            const validPath = [origen];
            if (ruta.paradas && ruta.paradas.length > 0) {
                // If we don't have accurate coordinates for stops in this exact object shape, just connect origin -> destination directly
            }
            validPath.push(destino);

            fallbackPolylineRef.current = new (window as any).google.maps.Polyline({
                path: validPath,
                geodesic: true,
                strokeColor: '#f59e0b', // Naranja para advertencia
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: mapInstanceRef.current,
            });
        });
    }

    async function cambiarEstado(nuevoEstado: any) {
        try {
            const idViaje = viaje?.id_vj || viajeId;
            const res = await fetch(`/api/conductor/viaje/${idViaje}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            if (res.ok) cargarViaje();
        } catch { console.error('Error cambiando estado'); }
    }

    function formatHora(h: any) {
        if (!h) return '';
        try {
            const d = new Date(h);
            const hours = d.getUTCHours();
            const mins = String(d.getUTCMinutes()).padStart(2, '0');
            return `${hours > 12 ? hours - 12 : hours || 12}:${mins} ${hours >= 12 ? 'PM' : 'AM'}`;
        } catch { return h; }
    }

    // ← GUARDS en orden correcto
    if (!isClient) return null;
    if (!listo || cargandoPermisos) return null;

    // ← BLOQUEO si no puede leer
    if (!puedeLeer) return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

    if (cargandoViaje) return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <p style={{ padding: '40px' }}>Cargando viaje...</p>
        </div>
    );

    if (!viaje || viaje.error) return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>🚗</div>
                <h2 style={{ color: '#1e293b' }}>No tienes viajes activos</h2>
                <p style={{ color: '#64748b' }}>Activa una ruta para comenzar un viaje</p>
                <button onClick={() => router.push('/rutasconductor')}
                    style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', marginTop: '16px' }}>
                    ← Volver a Mis Rutas
                </button>
            </div>
        </div>
    );

    const ruta = viaje.rutaConductor;
    const estadoColorMap: Record<string, { bg: string; color: string }> = {
        'Disponible':  { bg: '#dcfce7', color: '#16a34a' },
        'Lleno':       { bg: '#fef3c7', color: '#92400e' },
        'En Progreso': { bg: '#dbeafe', color: '#1d4ed8' },
        'Finalizado':  { bg: '#f1f5f9', color: '#64748b' },
        'Cancelado':   { bg: '#fee2e2', color: '#dc2626' },
    };
    const estadoColor = estadoColorMap[String(viaje.estado?.nombre_estado)] || { bg: '#f1f5f9', color: '#64748b' };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', padding: '24px', height: 'calc(100vh - 60px)' }}>

                {/* Columna izquierda: Mapa */}
                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                    {modoPruebaLocal && (
                        <div style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #fcd34d', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            ⚠️ Modo de prueba local: trazado de ruta directa activado
                        </div>
                    )}
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
                                {ruta?.origen_nombre || 'Origen'} → {ruta?.destino_nombre || ruta?.universidad?.nombre_uni}
                            </h2>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                                🕐 Salida: {formatHora(ruta?.hora_salida_rc)}
                            </p>
                        </div>
                        <span style={{ padding: '4px 12px', borderRadius: '99px', fontWeight: 700, fontSize: '0.8rem', background: estadoColor.bg, color: estadoColor.color }}>
                            {viaje.estado?.nombre_estado}
                        </span>
                    </div>
                    <div ref={mapRef} style={{ width: '100%', height: 'calc(100% - 70px)' }} />
                </div>

                {/* Columna derecha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>

                    {/* Paradas */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem' }}>📍 Paradas</h3>
                        {(!ruta?.paradas || ruta.paradas.length === 0) ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sin paradas definidas</p>
                        ) : (
                            [...ruta.paradas].sort((a: any, b: any) => a.orden_pds - b.orden_pds).map((p: any) => (
                                <div key={p.id_pds} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                        {p.orden_pds}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{p.punto_recogida_pds}</div>
                                        {p.costo_adicional_pds > 0 && (
                                            <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>+${Number(p.costo_adicional_pds).toLocaleString('es-CO')} COP</div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pasajeros */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>
                                👥 Pasajeros ({reservas.length})
                            </h3>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4f46e5', background: '#e0e7ff', padding: '4px 10px', borderRadius: '8px' }}>
                                {viaje.vehiculo?.total_cupos_veh ? (viaje.vehiculo.total_cupos_veh - reservas.filter(r => r.estado === 'Confirmada').length) : 0} cupos disponibles
                            </span>
                        </div>
                        {reservas.length === 0 ? (
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Los pasajeros que reserven aparecerán aquí</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {reservas.map(r => (
                                    <div key={r.id_res} style={{
                                        padding: '12px', borderRadius: '10px',
                                        border: `1px solid ${r.estado === 'Confirmada' ? '#86efac' : r.estado === 'Rechazada' ? '#fca5a5' : '#e2e8f0'}`,
                                        background: r.estado === 'Confirmada' ? '#f0fdf4' : r.estado === 'Rechazada' ? '#fef2f2' : 'white'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                {r.foto
                                                    ? <img src={r.foto} alt={r.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    : <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.9rem' }}>{r.nombre?.charAt(0)}</span>
                                                }
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{r.nombre}</div>
                                                {r.parada && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {r.parada}</div>}
                                                {r.aporte != null && (
                                                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                                                        💵 Aporte: ${Number(r.aporte).toLocaleString('es-CO')} COP
                                                    </div>
                                                )}
                                            </div>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                                                background: r.estado === 'Confirmada' ? '#dcfce7' : r.estado === 'Rechazada' ? '#fee2e2' : '#fef3c7',
                                                color: r.estado === 'Confirmada' ? '#16a34a' : r.estado === 'Rechazada' ? '#dc2626' : '#92400e'
                                            }}>
                                                {r.estado}
                                            </span>
                                        </div>
                                        {r.estado === 'Solicitada' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => gestionarReserva(r.id_res, 'confirmar')}
                                                    style={{ flex: 1, padding: '6px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                                    ✓ Confirmar
                                                </button>
                                                <button onClick={() => gestionarReserva(r.id_res, 'rechazar')}
                                                    style={{ flex: 1, padding: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                                    ✕ Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Controles del viaje */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 12px', color: '#1e293b', fontSize: '1rem' }}>Mi Ruta</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* ← puedeActualizar controla los botones de cambio de estado */}
                            {puedeActualizar && viaje.estado?.nombre_estado === 'Disponible' && (
                                <button onClick={() => cambiarEstado('En Progreso')}
                                    style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    ▶ Iniciar Viaje
                                </button>
                            )}
                            {puedeActualizar && viaje.estado?.nombre_estado === 'En Progreso' && (
                                <button onClick={() => cambiarEstado('Finalizado')}
                                    style={{ padding: '10px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    ✅ Finalizar Viaje
                                </button>
                            )}
                            {puedeActualizar && (viaje.estado?.nombre_estado === 'Disponible' || viaje.estado?.nombre_estado === 'Lleno') && (
                                <button onClick={() => cambiarEstado('Cancelado')}
                                    style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    ❌ Cancelar Viaje
                                </button>
                            )}
                            {viaje.estado?.nombre_estado === 'Finalizado' && (
                                <button onClick={() => router.push(`/rutasconductor/calificaciones?viajeId=${viajeId}`)}
                                    style={{ padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    ⭐ Calificar Pasajeros
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast - estaba fuera del return, ahora está dentro */}
            <div className={`toast ${toastVisible ? 'show' : ''}`}>
                <span>{toast}</span>
            </div>
        </div>
    );
}

export default function ViajePage(): React.JSX.Element | null {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ViajeContent />
        </Suspense>
    );
}