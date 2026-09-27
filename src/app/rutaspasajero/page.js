'use client';
import { useState, useRef, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import usePermisos from '@/lib/usePermisos';       // ← NUEVO
import SinPermiso from '@/components/SinPermiso';  // ← NUEVO

function formatHora(h) {
    if (!h) return '';
    try {
        const d = new Date(h);
        if (!isNaN(d.getTime())) {
            const hours = d.getUTCHours();
            const mins = String(d.getUTCMinutes()).padStart(2, '0');
            return `${hours > 12 ? hours - 12 : hours || 12}:${mins} ${hours >= 12 ? 'PM' : 'AM'}`;
        }
        return h;
    } catch { return h; }
}

function Estrellas({ promedio, total }) {
    if (!promedio) return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin calificaciones</span>;
    const n = parseFloat(promedio);
    return (
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}
            <span style={{ marginLeft: '4px', fontWeight: 600, color: '#f59e0b' }}>{promedio}</span>
            <span style={{ color: '#94a3b8' }}> ({total})</span>
        </span>
    );
}

export default function PasajerosPage() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([3, 4]);
    const { puedeLeer, puedeCrear, cargando: cargandoPermisos } = usePermisos(); // ← NUEVO
    const toastTimer = useRef(null);

    const [viajes, setViajes] = useState([]);
    const [visibleTrips, setVisibleTrips] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filter, setFilter] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTrip, setActiveTrip] = useState(null);
    const [paradaSeleccionada, setParadaSeleccionada] = useState('');
    const [reservando, setReservando] = useState(false);
    const [misReservas, setMisReservas] = useState([]);
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (listo) {
            cargarViajes();
            cargarMisReservas();
        }
    }, [listo]);

    function showToast(msg) {
        setToast(msg);
        setToastVisible(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastVisible(false), 3500);
    }

    async function cargarViajes() {
        setCargando(true);
        try {
            const res = await fetch('/api/pasajero/viajes');
            const data = await res.json();
            const lista = Array.isArray(data) ? data : [];
            setViajes(lista);
            setVisibleTrips(lista);
        } catch { console.error('Error cargando viajes'); }
        finally { setCargando(false); }
    }

    async function cargarMisReservas() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/reservas?userId=${userId}`);
            const data = await res.json();
            setMisReservas(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando reservas'); }
    }

    function yaReservado(viajeId) {
        return misReservas.some(r =>
            r.viaje?.id_vj === viajeId &&
            r.estado?.nombre_estado !== 'Cancelada'
        );
    }

    function aplicarFiltros(lista, fil, busq) {
        let resultado = [...lista];
        if (busq) {
            const q = busq.toLowerCase();
            resultado = resultado.filter(v =>
                v.origen_nombre?.toLowerCase().includes(q) ||
                v.destino_nombre?.toLowerCase().includes(q) ||
                v.universidad?.toLowerCase().includes(q) ||
                v.conductor?.nombre?.toLowerCase().includes(q)
            );
        }
        if (fil === 'manana') resultado = resultado.filter(v => {
            const h = new Date(v.hora_salida);
            return h.getUTCHours() < 12;
        });
        if (fil === 'tarde') resultado = resultado.filter(v => {
            const h = new Date(v.hora_salida);
            return h.getUTCHours() >= 12;
        });
        if (fil === 'cupos') resultado = resultado.filter(v => v.cupos_totales > 1);
        if (fil === 'economico') resultado = resultado.sort((a, b) => a.tarifa - b.tarifa);
        return resultado;
    }

    function handleFilter(fil) {
        setFilter(fil);
        setVisibleTrips(aplicarFiltros(viajes, fil, busqueda));
    }

    function handleBusqueda(e) {
        const q = e.target.value;
        setBusqueda(q);
        setVisibleTrips(aplicarFiltros(viajes, filter, q));
    }

    function openModal(viaje) {
        setActiveTrip(viaje);
        setParadaSeleccionada('');
        setModalOpen(true);
    }

    async function confirmarReserva() {
        if (!paradaSeleccionada) {
            showToast('⚠️ Selecciona una parada');
            return;
        }
        setReservando(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch('/api/pasajero/reservas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    viajeId:  activeTrip.id_vj,
                    paradaId: paradaSeleccionada,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setModalOpen(false);
                cargarMisReservas();
                showToast('✅ ¡Reserva solicitada! El conductor debe confirmarla.');
            } else {
                showToast(`❌ ${data.error}`);
            }
        } catch { showToast('❌ Error de conexión'); }
        finally { setReservando(false); }
    }

    // ← GUARDS en orden correcto
    if (!listo || cargandoPermisos) return null;

    // ← BLOQUEO si no puede leer
    if (!puedeLeer) return (
        <div style={{ background: '#eef0f7', minHeight: '100vh' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

    return (
        <div style={{ background: '#eef0f7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <main style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0', alignItems: 'start', minHeight: 'calc(100vh - 60px)' }}>

                    {/* Columna izquierda: Buscador */}
                    <div style={{ background: 'white', padding: '24px', borderRight: '1px solid #e2e8f0', position: 'sticky', top: '60px', minHeight: 'calc(100vh - 60px)' }}>
                        <h2 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="bi bi-geo-alt-fill" style={{ color: '#4f46e5' }}></i> Buscar Viaje
                        </h2>
                        <input type="text" value={busqueda} onChange={handleBusqueda}
                            placeholder="🔍 Busca por origen, destino o conductor..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', boxSizing: 'border-box', marginBottom: '16px' }}
                        />
                        <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Filtros</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                ['todos',     '🚗 Todos los viajes'],
                                ['manana',    '🌅 Mañana (antes de 12pm)'],
                                ['tarde',     '🌆 Tarde (12pm en adelante)'],
                                ['cupos',     '💺 Con cupos disponibles'],
                                ['economico', '💵 Más económico primero'],
                            ].map(([val, label]) => (
                                <button key={val} onClick={() => handleFilter(val)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                        textAlign: 'left', fontSize: '0.85rem', fontWeight: filter === val ? 600 : 400,
                                        background: filter === val ? '#e0e7ff' : '#f8fafc',
                                        color: filter === val ? '#4f46e5' : '#64748b',
                                    }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
                            {cargando ? 'Cargando...' : `${visibleTrips.length} viaje${visibleTrips.length !== 1 ? 's' : ''} disponible${visibleTrips.length !== 1 ? 's' : ''}`}
                        </div>
                    </div>

                    {/* Columna derecha: Cards */}
                    <div style={{ padding: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                                    🚗 Viajes Disponibles
                                    {busqueda && <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.85rem' }}> — "{busqueda}"</span>}
                                </h2>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: '99px' }}>
                                    {visibleTrips.length} viaje{visibleTrips.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div style={{ padding: '16px' }}>
                                {cargando ? (
                                    <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Cargando viajes...</p>
                                ) : visibleTrips.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px' }}>
                                        <div style={{ fontSize: '3rem' }}>🔍</div>
                                        <p style={{ color: '#64748b', marginTop: '12px' }}>No se encontraron viajes</p>
                                        {busqueda && (
                                            <button onClick={() => { setBusqueda(''); setVisibleTrips(viajes); }}
                                                style={{ marginTop: '8px', background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                                                Ver todos
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        {visibleTrips.map(v => {
                                            const reservado = yaReservado(v.id_vj);
                                            return (
                                                <div key={v.id_vj} style={{
                                                    borderRadius: '16px', padding: '20px',
                                                    border: `1px solid ${reservado ? '#86efac' : '#e2e8f0'}`,
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s'
                                                }}>
                                                    <div style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                                                            {v.origen_nombre || 'Origen'} → {v.destino_nombre}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                                            🎓 {v.universidad}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                        <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
                                                            🕐 {formatHora(v.hora_salida)}
                                                        </span>
                                                        <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
                                                            💵 ${Number(v.tarifa).toLocaleString('es-CO')} COP
                                                        </span>
                                                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 600 }}>
                                                            💺 {v.cupos_totales} cupos
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', padding: '10px', background: '#f8fafc', borderRadius: '10px' }}>
                                                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            {v.conductor?.foto
                                                                ? <img src={v.conductor.foto} alt={v.conductor.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <span style={{ fontWeight: 700, color: '#4f46e5' }}>{v.conductor?.nombre?.charAt(0)}</span>
                                                            }
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{v.conductor?.nombre}</div>
                                                            <Estrellas promedio={v.conductor?.promedio} total={v.conductor?.totalCal} />
                                                        </div>
                                                    </div>
                                                    {v.paradas?.length > 0 && (
                                                        <div style={{ marginBottom: '12px', fontSize: '0.78rem', color: '#64748b' }}>
                                                            📍 {v.paradas.length} parada{v.paradas.length !== 1 ? 's' : ''}:
                                                            {v.paradas.slice(0, 2).map(p => (
                                                                <span key={p.id_pds} style={{ marginLeft: '4px', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                                                                    {p.nombre}
                                                                </span>
                                                            ))}
                                                            {v.paradas.length > 2 && <span style={{ marginLeft: '4px' }}>+{v.paradas.length - 2} más</span>}
                                                        </div>
                                                    )}
                                                    {/* ← Botón reservar condicionado con puedeCrear */}
                                                    {puedeCrear ? (
                                                        <button onClick={() => !reservado && openModal(v)} disabled={reservado}
                                                            style={{
                                                                width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
                                                                cursor: reservado ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.85rem',
                                                                background: reservado ? '#dcfce7' : '#4f46e5',
                                                                color: reservado ? '#16a34a' : 'white',
                                                            }}>
                                                            {reservado ? '✅ Reserva Solicitada' : '🎫 Reservar Cupo'}
                                                        </button>
                                                    ) : (
                                                        <div style={{ width: '100%', padding: '10px', borderRadius: '10px', background: '#f1f5f9', textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                            🔒 Sin permiso para reservar
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal reservar - solo si puede crear */}
            {modalOpen && activeTrip && puedeCrear && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
                    onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '460px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 4px', color: '#1e293b' }}>Confirmar Reserva</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px' }}>
                            {activeTrip.origen_nombre} → {activeTrip.destino_nombre}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            <span style={{ background: '#f0f9ff', color: '#0369a1', padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                                🕐 {formatHora(activeTrip.hora_salida)}
                            </span>
                            <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                                💵 ${Number(activeTrip.tarifa).toLocaleString('es-CO')} COP
                            </span>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                                📍 Selecciona tu parada de recogida
                            </label>
                            {activeTrip.paradas?.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Este viaje no tiene paradas definidas</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activeTrip.paradas?.map(p => (
                                        <div key={p.id_pds}
                                            onClick={() => setParadaSeleccionada(String(p.id_pds))}
                                            style={{
                                                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                                border: `2px solid ${paradaSeleccionada === String(p.id_pds) ? '#4f46e5' : '#e2e8f0'}`,
                                                background: paradaSeleccionada === String(p.id_pds) ? '#eef2ff' : 'white',
                                                transition: 'all 0.15s'
                                            }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>
                                                {p.orden}. {p.nombre}
                                            </div>
                                            {p.costo_adicional > 0 && (
                                                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '2px' }}>
                                                    +${Number(p.costo_adicional).toLocaleString('es-CO')} COP adicional
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setModalOpen(false)}
                                style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                                Cancelar
                            </button>
                            <button onClick={confirmarReserva} disabled={reservando || !paradaSeleccionada}
                                style={{ flex: 2, padding: '12px', background: paradaSeleccionada ? '#4f46e5' : '#e2e8f0', color: paradaSeleccionada ? 'white' : '#94a3b8', border: 'none', borderRadius: '10px', cursor: paradaSeleccionada ? 'pointer' : 'default', fontWeight: 700 }}>
                                {reservando ? 'Reservando...' : '🎫 Confirmar Reserva'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`toast-fd ${toastVisible ? 'show' : ''}`}>{toast}</div>
        </div>
    );
}