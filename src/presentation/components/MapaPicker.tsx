'use client';
import { useEffect, useRef, useState } from 'react';

interface MapaPickerProps {
    onOrigenChange: (coords: {lat: number; lng: number; nombre?: string; direccion?: string; nitUni?: string}) => void;
    onDestinoChange: (coords: {lat: number; lng: number; nombre?: string; direccion?: string; nitUni?: string}) => void;
    onParadasChange?: (paradas: {lat: number; lng: number; nombre: string; costoAdicional: number}[]) => void;
    universidades?: any[];
}

export default function MapaPicker({ onOrigenChange, onDestinoChange, onParadasChange, universidades = [] }: MapaPickerProps): React.JSX.Element | null {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const origenMarkerRef = useRef<any>(null);
    const destinoMarkerRef = useRef<any>(null);
    const paradasMarkersRef = useRef<any[]>([]);
    const directionsRendererRef = useRef<any>(null);
    const searchOrigenRef = useRef<any>(null);
    const searchDestinoRef = useRef<any>(null);
    const searchParadaRef = useRef<any>(null);
    const modoRef = useRef('origen');

    const [modo, setModo] = useState('origen');
    const [origenDir, setOrigenDir] = useState<string>('');
    const [destinoDir, setDestinoDir] = useState<string>('');
    const [tipoOrigen, setTipoOrigen] = useState<string>('');
    const [tipoDestino, setTipoDestino] = useState<string>('');
    const [paradas, setParadas] = useState<{lat: number; lng: number; nombre: string; costoAdicional: number}[]>([]);
    const [modoPruebaLocal, setModoPruebaLocal] = useState<boolean>(false);
    const fallbackPolylineRef = useRef<any>(null);

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

    useEffect(() => {
        if (searchParadaRef.current && (window as any).google) {
            inicializarAutocomplete(searchParadaRef.current, 'parada');
        }
    }, [modo]); // Re-bind if searchParadaRef appears when modo changes or components re-render

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
        // Evitar duplicados si ya tiene pac-container
        if (inputEl.hasAttribute('data-ac-initialized')) return;
        
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
            if (tipo === 'parada') {
                inputEl.value = ''; // limpiar despues de seleccionar
            }
        });
        
        inputEl.setAttribute('data-ac-initialized', 'true');
    }

    function procesarPunto(lat: any, lng: any, tipo: any, direccionOverride: string | null = null) {
        if (direccionOverride) {
            finalizarPunto(lat, lng, tipo, direccionOverride);
        } else {
            const geocoder = new (window as any).google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } })
            .then((response: any) => {
                if (response.results && response.results[0]) {
                    finalizarPunto(lat, lng, tipo, response.results[0].formatted_address);
                } else {
                    finalizarPunto(lat, lng, tipo, `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                }
            })
            .catch((e: any) => {
                console.warn("Geocoding failed, using coordinates instead:", e);
                finalizarPunto(lat, lng, tipo, `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            });
        }
    }

    function finalizarPunto(lat: any, lng: any, tipo: any, direccion: any, nitUni = null) {
        if (tipo === 'origen') {
            colocarMarcador(lat, lng, tipo);
            setOrigenDir(direccion);
            onOrigenChange({ lat, lng, direccion, nitUni: nitUni || undefined });
            mapInstanceRef.current?.panTo({ lat, lng });
        } else if (tipo === 'destino') {
            colocarMarcador(lat, lng, tipo);
            setDestinoDir(direccion);
            onDestinoChange({ lat, lng, direccion, nitUni: nitUni || undefined });
            mapInstanceRef.current?.panTo({ lat, lng });
        } else if (tipo === 'parada') {
            // Fix: Usar función de actualización de estado para asegurar que usamos el valor más reciente de paradas
            setParadas(prevParadas => {
                const nuevaParada = { lat, lng, nombre: direccion, costoAdicional: 0 };
                const nuevasParadas = [...prevParadas, nuevaParada];
                if (onParadasChange) onParadasChange(nuevasParadas);
                dibujarLinea(nuevasParadas);
                return nuevasParadas;
            });
            mapInstanceRef.current?.panTo({ lat, lng });
            if (modoRef.current === 'parada') cambiarModo('origen'); // Reset mode after clicking map
        }
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
        } else if (tipo === 'destino') {
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
            // Necesitamos asegurarnos de usar el último estado de paradas
            setParadas(prevParadas => {
                dibujarLinea(prevParadas);
                return prevParadas;
            });
        }
    }

    function dibujarLinea(paradasList = paradas) {
        if (!origenMarkerRef.current || !destinoMarkerRef.current) return;

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

        // Actualizar marcadores de paradas
        paradasMarkersRef.current.forEach(m => m.setMap(null));
        paradasMarkersRef.current = paradasList.map((p, i) => new (window as any).google.maps.Marker({
            position: { lat: p.lat, lng: p.lng },
            map: mapInstanceRef.current,
            label: { text: String(i + 1), color: 'white' },
            icon: {
                path: (window as any).google.maps.SymbolPath.CIRCLE,
                scale: 10, fillColor: '#f59e0b', fillOpacity: 1,
                strokeWeight: 2, strokeColor: 'white',
            }
        }));

        const waypoints = paradasList.map(p => ({
            location: { lat: p.lat, lng: p.lng },
            stopover: true
        }));

        const directionsService = new (window as any).google.maps.DirectionsService();
        directionsService.route({
            origin:      origenMarkerRef.current.getPosition(),
            destination: destinoMarkerRef.current.getPosition(),
            waypoints:   waypoints,
            travelMode:  (window as any).google.maps.TravelMode.DRIVING,
        })
        .then((result: any) => {
            if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
            directionsRendererRef.current.setDirections(result);
            setModoPruebaLocal(false);
        })
        .catch((e: any) => {
            console.warn("Directions request failed due to billing/API issues:", e);
            setModoPruebaLocal(true);
            
            // Fallback: draw straight lines
            if (fallbackPolylineRef.current) fallbackPolylineRef.current.setMap(null);
            
            const path = [origenMarkerRef.current.getPosition()];
            paradasList.forEach(p => path.push({ lat: p.lat, lng: p.lng }));
            path.push(destinoMarkerRef.current.getPosition());
            
            fallbackPolylineRef.current = new (window as any).google.maps.Polyline({
                path,
                geodesic: true,
                strokeColor: '#f59e0b', // Naranja para advertencia
                strokeOpacity: 0.8,
                strokeWeight: 4,
                map: mapInstanceRef.current,
            });
        });
    }

    function cambiarModo(nuevoModo: any) {
        setModo(nuevoModo);
        modoRef.current = nuevoModo;
    }

    function actualizarCostoParada(idx: number, costo: number) {
        setParadas(prevParadas => {
            const nuevas = [...prevParadas];
            nuevas[idx] = { ...nuevas[idx], costoAdicional: costo };
            if (onParadasChange) onParadasChange(nuevas);
            return nuevas;
        });
    }

    function eliminarParada(idx: number) {
        setParadas(prevParadas => {
            const nuevas = prevParadas.filter((_, i) => i !== idx);
            if (onParadasChange) onParadasChange(nuevas);
            dibujarLinea(nuevas);
            return nuevas;
        });
    }

    return (
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', height: '100%' }}>
            
            {/* Panel Izquierdo: Formularios */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '8px' }}>
                
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
                            🏘️ Barrio
                        </button>
                        <button type="button" onClick={() => { setTipoOrigen('universidad'); cambiarModo('origen'); }}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: tipoOrigen === 'universidad' ? '#4f46e5' : '#e2e8f0',
                                color: tipoOrigen === 'universidad' ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                            🎓 U
                        </button>
                    </div>

                    {tipoOrigen === 'barrio' && (
                        <input ref={searchOrigenRef} type="text" placeholder="Busca una dirección..."
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
                        <div style={{ background: '#eef2ff', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ✅ {origenDir}
                        </div>
                    )}
                </div>

                {/* Paradas Intermedias */}
                <div style={{ marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '8px' }}>
                        🛣️ Paradas Intermedias
                    </label>
                    
                    {paradas.map((p, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center', background: 'white', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{i + 1}</div>
                            <div style={{ flex: 1, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.nombre}>{p.nombre}</div>
                            <input type="number" placeholder="$ Extra" value={p.costoAdicional || ''} onChange={e => actualizarCostoParada(i, Number(e.target.value))}
                                style={{ width: '70px', padding: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }} />
                            <button type="button" onClick={() => eliminarParada(i)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 4px' }}>✕</button>
                        </div>
                    ))}
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <input ref={searchParadaRef} type="text" placeholder="Buscar parada..."
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }} />
                        <button type="button" onClick={() => cambiarModo('parada')}
                            style={{ padding: '0 10px', borderRadius: '8px', border: 'none', background: modo === 'parada' ? '#f59e0b' : '#e2e8f0', color: modo === 'parada' ? 'white' : '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }} title="Añadir haciendo clic en el mapa">
                            📍
                        </button>
                    </div>
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
                            🏘️ Barrio
                        </button>
                        <button type="button" onClick={() => { setTipoDestino('universidad'); cambiarModo('destino'); }}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                background: tipoDestino === 'universidad' ? '#22c55e' : '#e2e8f0',
                                color: tipoDestino === 'universidad' ? 'white' : '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>
                            🎓 U
                        </button>
                    </div>

                    {tipoDestino === 'barrio' && (
                        <input ref={searchDestinoRef} type="text" placeholder="Busca una dirección..."
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
                        <div style={{ background: '#f0fdf4', padding: '6px 10px', borderRadius: '6px', marginTop: '6px', fontSize: '0.78rem', color: '#16a34a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ✅ {destinoDir}
                        </div>
                    )}
                </div>

            </div>

            {/* Mapa (Panel Derecho) */}
            <div style={{ flex: '2', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {modoPruebaLocal && (
                    <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #fcd34d', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        ⚠️ Modo de prueba local: trazado de ruta directa activado
                    </div>
                )}
                <div ref={mapRef} style={{ width: '100%', flex: 1, borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '8px 0 0', textAlign: 'center' }}>
                    {modo === 'parada' ? '🟡 Haz clic en el mapa para añadir una parada.' : 'Haz clic en el mapa para marcar el punto activo.'}
                </p>
            </div>

        </div>
    );
}
