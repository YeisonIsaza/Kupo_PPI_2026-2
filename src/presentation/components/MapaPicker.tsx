'use client';
import { useEffect, useRef, useState } from 'react';

interface MapaPickerProps { onOrigenChange: (coords: {lat: number; lng: number; nombre?: string; direccion?: string; nitUni?: string}) => void; onDestinoChange: (coords: {lat: number; lng: number; nombre?: string; direccion?: string; nitUni?: string}) => void; universidades?: any[]; }
export default function MapaPicker({ onOrigenChange, onDestinoChange, universidades = [] }: MapaPickerProps): React.JSX.Element | null {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const origenMarkerRef = useRef<any>(null);
    const destinoMarkerRef = useRef<any>(null);
    const directionsRendererRef = useRef<any>(null); // ← reutilizable, evita memory leak
    const searchOrigenRef = useRef<any>(null);
    const searchDestinoRef = useRef<any>(null);
    const modoRef               = useRef('origen');

    const [modo, setModo]           = useState('origen');
    const [origenDir, setOrigenDir] = useState<string>('');
    const [destinoDir, setDestinoDir] = useState<string>('');
    const [tipoOrigen, setTipoOrigen]   = useState<string>('');
    const [tipoDestino, setTipoDestino] = useState<string>('');

    useEffect(() => {
        if (!(window as any).google) return;
        inicializarMapa();
    }, []);

    useEffect(() => {
        if (tipoOrigen === 'barrio' && searchOrigenRef.current && (window as any).google) {
            inicializarAutocomplete(searchOrigenRef.current, 'origen');
        }
    }, [tipoOrigen]);

    useEffect(() => {
        if (tipoDestino === 'barrio' && searchDestinoRef.current && (window as any).google) {
            inicializarAutocomplete(searchDestinoRef.current, 'destino');
        }
    }, [tipoDestino]);

    function inicializarMapa() {
        const mapa = new (window as any).google.maps.Map(mapRef.current, {
            center: { lat: 6.2442, lng: -75.5812 },
            zoom: 12,
        });
        mapInstanceRef.current = mapa;

        mapa.addListener('click', (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            procesarPunto(lat, lng, modoRef.current);
        });
    }

    function inicializarAutocomplete(inputEl: any, tipo: any) {
        const bounds = new (window as any).google.maps.LatLngBounds(
            { lat: 6.1000, lng: -75.7000 },
            { lat: 6.4000, lng: -75.4000 }
        );

        const autocomplete = new (window as any).google.maps.places.Autocomplete(inputEl, {
            bounds,
            strictBounds: true,
            componentRestrictions: { country: 'co' },
            fields: ['geometry', 'formatted_address', 'name'],
        });

        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const direccion = place.formatted_address || place.name;
            procesarPunto(lat, lng, tipo, direccion);
        });
    }

    function procesarPunto(lat: any, lng: any, tipo: any, direccionOverride = null) {
        if (direccionOverride) {
            finalizarPunto(lat, lng, tipo, direccionOverride);
        } else {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                if (status === 'OK' && results[0]) {
                    finalizarPunto(lat, lng, tipo, results[0].formatted_address);
                }
            });
        }
    }

    // ── Una sola definición de finalizarPunto ────────────────────
    function finalizarPunto(lat: any, lng: any, tipo: any, direccion: any, nitUni = null) {
        colocarMarcador(lat, lng, tipo);
        if (tipo === 'origen') {
            setOrigenDir(direccion);
            onOrigenChange({ lat, lng, direccion, nitUni: nitUni || undefined });
        } else {
            setDestinoDir(direccion);
            onDestinoChange({ lat, lng, direccion, nitUni: nitUni || undefined });
        }
        mapInstanceRef.current?.panTo({ lat, lng });
    }

    function seleccionarUniversidad(uni: any, tipo: any) {
        const lat = Number(uni.direccion_latitud_uni);
        const lng = Number(uni.direccion_longitud_uni);
        finalizarPunto(lat, lng, tipo, uni.nombre_uni, uni.nit_uni);
    }

    function colocarMarcador(lat: any, lng: any, tipo: any) {
        const mapa = mapInstanceRef.current;
        if (tipo === 'origen') {
            if (origenMarkerRef.current) origenMarkerRef.current.setMap(null);
            origenMarkerRef.current = new (window as any).google.maps.Marker({
                position: { lat, lng }, map: mapa,
                label: { text: 'A', color: 'white' },
                icon: {
                    path: (window as any).google.maps.SymbolPath.CIRCLE,
                    scale: 12, fillColor: '#4f46e5', fillOpacity: 1,
                    strokeWeight: 2, strokeColor: 'white',
                }
            });
        } else {
            if (destinoMarkerRef.current) destinoMarkerRef.current.setMap(null);
            destinoMarkerRef.current = new (window as any).google.maps.Marker({
                position: { lat, lng }, map: mapa,
                label: { text: 'B', color: 'white' },
                icon: {
                    path: (window as any).google.maps.SymbolPath.CIRCLE,
                    scale: 12, fillColor: '#22c55e', fillOpacity: 1,
                    strokeWeight: 2, strokeColor: 'white',
                }
            });
        }

        if (origenMarkerRef.current && destinoMarkerRef.current) {
            dibujarLinea();
        }
    }

    // ── DirectionsRenderer reutilizable ─────────────────────────
    function dibujarLinea() {
        if (!directionsRendererRef.current) {
            directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({
                map: mapInstanceRef.current,
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#4f46e5',
                    strokeWeight: 4,
                    strokeOpacity: 0.8,
                }
            });
        }

        const directionsService = new (window as any).google.maps.DirectionsService();
        directionsService.route({
            origin:      origenMarkerRef.current.getPosition(),
            destination: destinoMarkerRef.current.getPosition(),
            travelMode:  (window as any).google.maps.TravelMode.DRIVING,
        }, (result: any, status: any) => {
            if (status === 'OK') {
                directionsRendererRef.current.setDirections(result);
            }
        });
    }

    function cambiarModo(nuevoModo: any) {
        setModo(nuevoModo);
        modoRef.current = nuevoModo;
    }

    return (
        <div style={{ marginBottom: '16px' }}>

            {/* Selector Origen */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                    📍 Punto de Origen (A)
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button type="button" onClick={() => { setTipoOrigen('barrio'); cambiarModo('origen'); }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: tipoOrigen === 'barrio' ? '#4f46e5' : '#e2e8f0',
                            color: tipoOrigen === 'barrio' ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                        🏘️ Barrio / Dirección
                    </button>
                    <button type="button" onClick={() => { setTipoOrigen('universidad'); cambiarModo('origen'); }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: tipoOrigen === 'universidad' ? '#4f46e5' : '#e2e8f0',
                            color: tipoOrigen === 'universidad' ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                        🎓 Universidad
                    </button>
                </div>

                {tipoOrigen === 'barrio' && (
                    <input ref={searchOrigenRef} type="text" placeholder="Busca una dirección en Medellín..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                )}

                {tipoOrigen === 'universidad' && (
                    <select onChange={e => {
                        const uni = universidades.find(u => u.nit_uni === e.target.value);
                        if (uni) seleccionarUniversidad(uni, 'origen');
                    }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <option value="">Selecciona la universidad</option>
                        {universidades.map(u => <option key={u.nit_uni} value={u.nit_uni}>{u.nombre_uni}</option>)}
                    </select>
                )}

                {origenDir && (
                    <div style={{ background: '#eef2ff', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#4f46e5' }}>
                        ✅ {origenDir}
                    </div>
                )}
            </div>

            {/* Selector Destino */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                    🏁 Punto de Destino (B)
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button type="button" onClick={() => { setTipoDestino('barrio'); cambiarModo('destino'); }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: tipoDestino === 'barrio' ? '#22c55e' : '#e2e8f0',
                            color: tipoDestino === 'barrio' ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                        🏘️ Barrio / Dirección
                    </button>
                    <button type="button" onClick={() => { setTipoDestino('universidad'); cambiarModo('destino'); }}
                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: tipoDestino === 'universidad' ? '#22c55e' : '#e2e8f0',
                            color: tipoDestino === 'universidad' ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                        🎓 Universidad
                    </button>
                </div>

                {tipoDestino === 'barrio' && (
                    <input ref={searchDestinoRef} type="text" placeholder="Busca una dirección en Medellín..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '0.85rem' }} />
                )}

                {tipoDestino === 'universidad' && (
                    <select onChange={e => {
                        const uni = universidades.find(u => u.nit_uni === e.target.value);
                        if (uni) seleccionarUniversidad(uni, 'destino');
                    }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <option value="">Selecciona la universidad</option>
                        {universidades.map(u => <option key={u.nit_uni} value={u.nit_uni}>{u.nombre_uni}</option>)}
                    </select>
                )}

                {destinoDir && (
                    <div style={{ background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#16a34a' }}>
                        {destinoDir}
                    </div>
                )}
            </div>

            {/* Mapa */}
            <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '10px', border: '1px solid #e2e8f0' }} />

            <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '8px 0 0' }}>
                También puedes hacer clic directamente en el mapa para marcar el punto activo.
            </p>
        </div>
    );
}