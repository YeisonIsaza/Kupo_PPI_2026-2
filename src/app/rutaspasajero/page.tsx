'use client';
import { useState, useRef, useEffect } from 'react';
import UserNavbar from '@/presentation/components/UserNavbar';
import useAuth from '@/core/hooks/useAuth';
import usePermisos from '@/core/hooks/usePermisos';       // ← NUEVO
import SinPermiso from '@/presentation/components/SinPermiso';  // ← NUEVO

function getHourNumber(h: any): number | null {
    if (!h) return null;
    try {
        if (typeof h === 'string') {
            if (h.includes('T')) {
                const d = new Date(h);
                if (!isNaN(d.getTime())) return d.getUTCHours();
            }
            const timePart = h.includes(' ') ? h.split(' ')[1] : h;
            if (timePart.includes(':')) {
                const hour = parseInt(timePart.split(':')[0], 10);
                if (!isNaN(hour)) return hour;
            }
        }
        const d = new Date(h);
        if (!isNaN(d.getTime())) return d.getHours();
    } catch { return null; }
    return null;
}

function formatHora(h: any) {
    if (!h) return '--:--';
    try {
        if (typeof h === 'string') {
            if (h.includes('T')) {
                const d = new Date(h);
                if (!isNaN(d.getTime())) {
                    const hours = d.getUTCHours();
                    const mins = String(d.getUTCMinutes()).padStart(2, '0');
                    return `${hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)}:${mins} ${hours >= 12 ? 'PM' : 'AM'}`;
                }
            }
            const timePart = h.includes(' ') ? h.split(' ')[1] : h;
            if (timePart.includes(':')) {
                const parts = timePart.split(':');
                const hour = parseInt(parts[0], 10);
                const mins = String(parts[1] || '00').slice(0, 2).padStart(2, '0');
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                return `${displayHour}:${mins} ${ampm}`;
            }
        }
        const d = new Date(h);
        if (!isNaN(d.getTime())) {
            const hours = d.getHours();
            const mins = String(d.getMinutes()).padStart(2, '0');
            return `${hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)}:${mins} ${hours >= 12 ? 'PM' : 'AM'}`;
        }
        return h;
    } catch { return h; }
}

function Estrellas({ promedio, total }: any) {
    if (!promedio) return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin calificaciones</span>;
    const n = parseFloat(promedio);
    return (
        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ color: '#f59e0b' }}>{'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}</span>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>{promedio}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({total})</span>
        </span>
    );
}

export default function PasajerosPage(): React.JSX.Element | null {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([3, 4]);
    const { puedeLeer, puedeCrear, cargando: cargandoPermisos } = usePermisos(); // ← NUEVO
    const toastTimer = useRef<any>(null);

    const [viajes, setViajes] = useState<any[]>([]);
    const [visibleTrips, setVisibleTrips] = useState<any[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [filter, setFilter] = useState('todos');
    const [busqueda, setBusqueda] = useState<string>('');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [activeTrip, setActiveTrip] = useState<any>(null);
    const [paradaSeleccionada, setParadaSeleccionada] = useState<string>('');
    const [reservando, setReservando] = useState<boolean>(false);
    const [misReservas, setMisReservas] = useState<any[]>([]);
    const [toast, setToast] = useState<string>('');
    const [toastVisible, setToastVisible] = useState<boolean>(false);
    const [ella, setElla] = useState<{ genero: string | null; modo_ella: boolean; puede_activar: boolean }>({
        genero: null, modo_ella: false, puede_activar: false
    });
    const [cambiandoElla, setCambiandoElla] = useState<boolean>(false);
    const [ellaListo, setEllaListo] = useState<boolean>(false);

    useEffect(() => {
        if (listo) {
            cargarModoElla();
            cargarViajes();
            cargarMisReservas();
        }
    }, [listo]);

    function showToast(msg: any) {
        setToast(msg);
        setToastVisible(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastVisible(false), 3500);
    }

    async function cargarViajes() {
        setCargando(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/viajes?userId=${userId}`);
            const data = await res.json();
            const lista = Array.isArray(data) ? data : [];
            setViajes(lista);
            setVisibleTrips(aplicarFiltros(lista, filter, busqueda));
        } catch { console.error('Error cargando viajes'); }
        finally { setCargando(false); }
    }

    async function cargarModoElla() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/modo-ella?userId=${userId}`);
            const data = await res.json();
            if (res.ok) setElla(data);
        } catch { console.error('Error cargando Modo Ella'); }
        finally { setEllaListo(true); }
    }

    async function actualizarElla(payload: { activar?: boolean; genero?: string }) {
        setCambiandoElla(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch('/api/pasajero/modo-ella', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...payload })
            });
            const data = await res.json();
            if (res.ok) {
                setElla(data);
                if (payload.activar !== undefined) {
                    showToast(payload.activar ? '💜 Modo Ella activado: solo viajes con conductoras y pasajeras' : 'Modo Ella desactivado');
                    await cargarViajes();
                }
            } else {
                showToast(`❌ ${data.error}`);
            }
        } catch { showToast('❌ Error de conexión'); }
        finally { setCambiandoElla(false); }
    }

    async function cargarMisReservas() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/reservas?userId=${userId}`);
            const data = await res.json();
            setMisReservas(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando reservas'); }
    }

    function yaReservado(viajeId: any) {
        return misReservas.some(r =>
            r.viaje?.id_vj === viajeId &&
            r.estado?.nombre_estado !== 'Cancelada'
        );
    }

    function aplicarFiltros(lista: any, fil: any, busq: any) {
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
            const hour = getHourNumber(v.hora_salida);
            return hour !== null && hour < 12;
        });
        if (fil === 'tarde') resultado = resultado.filter(v => {
            const hour = getHourNumber(v.hora_salida);
            return hour !== null && hour >= 12;
        });
        if (fil === 'cupos') resultado = resultado.filter(v => Number(v.cupos_totales) > 0);
        if (fil === 'economico') resultado = resultado.sort((a, b) => Number(a.tarifa) - Number(b.tarifa));
        return resultado;
    }

    function handleFilter(fil: any) {
        setFilter(fil);
        setVisibleTrips(aplicarFiltros(viajes, fil, busqueda));
    }

    function handleBusqueda(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        const q = e.target.value;
        setBusqueda(q);
        setVisibleTrips(aplicarFiltros(viajes, filter, q));
    }

    function openModal(viaje: any) {
        setActiveTrip(viaje);
        setParadaSeleccionada('');
        setModalOpen(true);
    }

    async function confirmarReserva() {
        if (activeTrip.paradas?.length > 0 && !paradaSeleccionada) {
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
                cargarViajes(); // el viaje pudo quedar bloqueado como "solo mujeres"
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'radial-gradient(circle at top right, #f8faff 0%, #eef2f8 50%, #e6ebf5 100%)', fontFamily: 'var(--font-nunito), sans-serif' }}>
            {/* Navbar a ancho completo 100% de la pantalla */}
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <main style={{ flex: 1, width: '100%', maxWidth: '1380px', margin: '0 auto', padding: '32px 24px 64px', boxSizing: 'border-box' }}>
                
                {/* Header superior */}
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', padding: '6px 14px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                            <i className="bi bi-compass"></i> Red de Carpooling Universitario
                        </div>
                        <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: '3.6rem', color: '#0d0f1a', margin: 0, lineHeight: 1, letterSpacing: '1px' }}>
                            BUSCAR <span style={{ color: '#4f46e5' }}>VIAJES</span>
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '8px 0 0', fontWeight: 600 }}>
                            Conéctate con conductores universitarios, ahorra dinero y viaja con total tranquilidad.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.08)',
                            padding: '10px 20px',
                            borderRadius: '16px',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            color: '#1e293b',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                            {cargando ? 'Buscando...' : `${visibleTrips.length} viaje${visibleTrips.length !== 1 ? 's' : ''} disponible${visibleTrips.length !== 1 ? 's' : ''}`}
                        </span>
                    </div>
                </div>

                {/* Grid principal: Filtros sticky + Lista de viajes */}
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px', alignItems: 'start' }}>

                    {/* Columna izquierda: Filtros y buscador */}
                    <div className="glass-panel" style={{
                        padding: '28px',
                        borderRadius: '24px',
                        position: 'sticky',
                        top: '90px',
                        boxShadow: '0 12px 36px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(255,255,255,0.9)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}>
                                <i className="bi bi-search"></i>
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0d0f1a' }}>Filtros de Viaje</h3>
                        </div>

                        {/* Input de búsqueda */}
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={handleBusqueda}
                                placeholder="Origen, destino o U..."
                                style={{
                                    width: '100%',
                                    padding: '14px 40px 14px 16px',
                                    borderRadius: '14px',
                                    border: '1.5px solid #e2e8f0',
                                    background: '#ffffff',
                                    fontSize: '0.92rem',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-nunito)'
                                }}
                                onFocus={e => e.currentTarget.style.borderColor = '#4f46e5'}
                                onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                            />
                            {busqueda ? (
                                <button
                                    onClick={() => { setBusqueda(''); setVisibleTrips(aplicarFiltros(viajes, filter, '')); }}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                                >✕</button>
                            ) : (
                                <i className="bi bi-geo-alt" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                            )}
                        </div>

                        {/* Modo Ella */}
                        <div style={{
                            marginBottom: '22px',
                            padding: '16px',
                            borderRadius: '16px',
                            background: ella.modo_ella ? 'linear-gradient(135deg, #fdf2f8, #f5f3ff)' : '#f8fafc',
                            border: `1.5px solid ${ella.modo_ella ? '#c026d3' : '#e2e8f0'}`,
                            boxShadow: ella.modo_ella ? '0 8px 20px rgba(192, 38, 211, 0.15)' : 'none',
                            transition: 'all 0.25s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: ella.modo_ella ? '#9333ea' : '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span>💜</span> Modo Ella
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px', fontWeight: 600 }}>
                                        Solo conductoras y pasajeras mujeres
                                    </div>
                                </div>
                                {ella.puede_activar && (
                                    <button
                                        id="toggle-modo-ella"
                                        role="switch"
                                        aria-checked={ella.modo_ella}
                                        disabled={cambiandoElla}
                                        onClick={() => actualizarElla({ activar: !ella.modo_ella })}
                                        style={{
                                            width: '46px', height: '26px', borderRadius: '99px', border: 'none',
                                            cursor: cambiandoElla ? 'wait' : 'pointer', position: 'relative', flexShrink: 0,
                                            background: ella.modo_ella ? 'linear-gradient(135deg, #a855f7, #ec4899)' : '#cbd5e1',
                                            transition: 'background 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                                        }}>
                                        <span style={{
                                            position: 'absolute', top: '3px', left: ella.modo_ella ? '23px' : '3px',
                                            width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                                            transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
                                        }} />
                                    </button>
                                )}
                            </div>

                            {ellaListo && !ella.genero && (
                                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                                        Indica tu género para activar esta función:
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button disabled={cambiandoElla} onClick={() => actualizarElla({ genero: 'female' })}
                                            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #e9d5ff', background: '#faf5ff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#a21caf' }}>
                                            Femenino
                                        </button>
                                        <button disabled={cambiandoElla} onClick={() => actualizarElla({ genero: 'male' })}
                                            style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                                            Masculino
                                        </button>
                                    </div>
                                </div>
                            )}
                            {ella.genero === 'male' && (
                                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                    Función reservada para mujeres verificadas.
                                </div>
                            )}
                        </div>

                        {/* Opciones de Filtro */}
                        <div style={{ marginBottom: '10px', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                            Horarios & Preferencias
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                ['todos',     '🚗 Todos los viajes'],
                                ['manana',    '🌅 Mañana (antes de 12:00 PM)'],
                                ['tarde',     '🌆 Tarde (12:00 PM en adelante)'],
                                ['cupos',     '💺 Con cupos disponibles'],
                                ['economico', '💵 Más económico primero'],
                            ].map(([val, label]) => {
                                const activo = filter === val;
                                return (
                                    <button key={val} onClick={() => handleFilter(val)}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: activo ? 'none' : '1px solid rgba(0,0,0,0.06)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontSize: '0.88rem',
                                            fontWeight: activo ? 800 : 600,
                                            background: activo ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#ffffff',
                                            color: activo ? '#ffffff' : '#475569',
                                            boxShadow: activo ? '0 6px 18px rgba(79, 70, 229, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={e => {
                                            if (!activo) e.currentTarget.style.background = '#f8fafc';
                                        }}
                                        onMouseLeave={e => {
                                            if (!activo) e.currentTarget.style.background = '#ffffff';
                                        }}
                                    >
                                        <span>{label}</span>
                                        {activo && <i className="bi bi-check2" style={{ fontSize: '1rem' }}></i>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Columna derecha: Listado de viajes */}
                    <div>
                        {cargando ? (
                            <div className="glass-panel" style={{ padding: '60px 20px', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '14px', animation: 'spin 1.5s linear infinite' }}>⏳</div>
                                <h3 style={{ margin: 0, color: '#1e293b', fontWeight: 800 }}>Cargando viajes disponibles...</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>Consultando las rutas activas de tu comunidad</p>
                            </div>
                        ) : visibleTrips.length === 0 ? (
                            <div className="glass-panel" style={{ padding: '70px 24px', borderRadius: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔍</div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0d0f1a', margin: '0 0 8px' }}>No encontramos viajes</h3>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '420px', margin: '0 auto 24px' }}>
                                    No hay viajes que coincidan con tus criterios de búsqueda o filtro seleccionado en este momento.
                                </p>
                                {(busqueda || filter !== 'todos') && (
                                    <button
                                        onClick={() => { setBusqueda(''); setFilter('todos'); setVisibleTrips(viajes); }}
                                        style={{
                                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '12px 24px',
                                            borderRadius: '50px',
                                            fontWeight: 800,
                                            fontSize: '0.9rem',
                                            cursor: 'pointer',
                                            boxShadow: '0 6px 18px rgba(79, 70, 229, 0.3)'
                                        }}
                                    >
                                        Restablecer filtros
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
                                {visibleTrips.map(v => {
                                    const reservado = yaReservado(v.id_vj);
                                    const sinCupos = Number(v.cupos_totales) <= 0;

                                    return (
                                        <div
                                            key={v.id_vj}
                                            className="glass-panel"
                                            style={{
                                                borderRadius: '24px',
                                                padding: '24px',
                                                border: reservado ? '1.5px solid #86efac' : '1px solid rgba(255,255,255,0.9)',
                                                background: reservado ? 'rgba(240, 253, 244, 0.85)' : 'rgba(255, 255, 255, 0.82)',
                                                transition: 'all 0.25s ease',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-4px)';
                                                e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.08)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.04)';
                                            }}
                                        >
                                            {/* Cabecera de la tarjeta: Ruta y Universidad */}
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                                                    <span style={{
                                                        background: '#eef2ff',
                                                        color: '#4f46e5',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.78rem',
                                                        fontWeight: 800,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        <i className="bi bi-mortarboard-fill"></i> {v.universidad || 'Campus Universitario'}
                                                    </span>

                                                    {v.solo_mujeres && (
                                                        <span style={{
                                                            background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)',
                                                            color: '#a21caf',
                                                            border: '1px solid #f0abfc',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 800,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            💜 Modo Ella
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Trayecto Origen → Destino */}
                                                <div style={{ marginBottom: '18px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
                                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4f46e5', border: '2px solid #c7d2fe' }}></div>
                                                            <div style={{ width: '2px', height: '24px', background: '#cbd5e1', margin: '3px 0' }}></div>
                                                            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#10b981' }}></div>
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontWeight: 800, color: '#0d0f1a', fontSize: '1rem', lineHeight: 1.3 }}>
                                                                {v.origen_nombre || 'Punto de Partida'}
                                                            </div>
                                                            <div style={{ height: '14px' }}></div>
                                                            <div style={{ fontWeight: 800, color: '#0d0f1a', fontSize: '1rem', lineHeight: 1.3 }}>
                                                                {v.destino_nombre || 'Destino'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Badges de Detalles: Hora, Tarifa, Cupos */}
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                                                    <span style={{
                                                        background: 'rgba(240, 249, 255, 0.9)',
                                                        color: '#0369a1',
                                                        border: '1px solid #bae6fd',
                                                        padding: '6px 12px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        🕐 {formatHora(v.hora_salida)}
                                                    </span>

                                                    <span style={{
                                                        background: 'rgba(240, 253, 244, 0.9)',
                                                        color: '#15803d',
                                                        border: '1px solid #bbf7d0',
                                                        padding: '6px 12px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        💵 ${Number(v.tarifa || 0).toLocaleString('es-CO')} COP
                                                    </span>

                                                    <span style={{
                                                        background: sinCupos ? '#fee2e2' : 'rgba(254, 243, 199, 0.8)',
                                                        color: sinCupos ? '#b91c1c' : '#92400e',
                                                        border: `1px solid ${sinCupos ? '#fca5a5' : '#fde68a'}`,
                                                        padding: '6px 12px',
                                                        borderRadius: '10px',
                                                        fontSize: '0.82rem',
                                                        fontWeight: 800,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}>
                                                        💺 {v.cupos_totales} {Number(v.cupos_totales) === 1 ? 'cupo' : 'cupos'}
                                                    </span>
                                                </div>

                                                {/* Conductor Card */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '12px 14px',
                                                    background: 'rgba(248, 250, 252, 0.8)',
                                                    borderRadius: '14px',
                                                    marginBottom: '16px',
                                                    border: '1px solid rgba(0,0,0,0.04)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '40px', height: '40px', borderRadius: '50%',
                                                            overflow: 'hidden', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)', flexShrink: 0
                                                        }}>
                                                            {v.conductor?.foto
                                                                ? <img src={v.conductor.foto} alt={v.conductor.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '1rem' }}>{v.conductor?.nombre?.charAt(0) || 'C'}</span>
                                                            }
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0d0f1a' }}>
                                                                {v.conductor?.nombre || 'Conductor asignado'}
                                                            </div>
                                                            <Estrellas promedio={v.conductor?.promedio} total={v.conductor?.totalCal} />
                                                        </div>
                                                    </div>

                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>
                                                        <i className="bi bi-shield-check" style={{ color: '#10b981', marginRight: '4px' }}></i>Verificado
                                                    </span>
                                                </div>

                                                {/* Vista previa de paradas si existen */}
                                                {v.paradas?.length > 0 && (
                                                    <div style={{ marginBottom: '18px', fontSize: '0.78rem', color: '#64748b' }}>
                                                        <span style={{ fontWeight: 700, color: '#475569' }}>📍 Paradas ({v.paradas.length}):</span>{' '}
                                                        {v.paradas.slice(0, 2).map((p: any) => (
                                                            <span key={p.id_pds} style={{
                                                                display: 'inline-block',
                                                                background: '#f1f5f9',
                                                                padding: '2px 8px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                color: '#334155',
                                                                margin: '2px 4px 2px 0'
                                                            }}>
                                                                {p.nombre}
                                                            </span>
                                                        ))}
                                                        {v.paradas.length > 2 && (
                                                            <span style={{ fontWeight: 700, color: '#6366f1' }}>+{v.paradas.length - 2} más</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Botón de Reservar */}
                                            <div>
                                                {reservado ? (
                                                    <div style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        textAlign: 'center',
                                                        fontWeight: 800,
                                                        fontSize: '0.88rem',
                                                        background: '#dcfce7',
                                                        color: '#15803d',
                                                        border: '1px solid #86efac',
                                                        boxSizing: 'border-box'
                                                    }}>
                                                        ✅ Reserva Solicitada
                                                    </div>
                                                ) : sinCupos ? (
                                                    <div style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        textAlign: 'center',
                                                        fontWeight: 800,
                                                        fontSize: '0.88rem',
                                                        background: '#f1f5f9',
                                                        color: '#94a3b8',
                                                        boxSizing: 'border-box'
                                                    }}>
                                                        Sin cupos disponibles
                                                    </div>
                                                ) : puedeCrear ? (
                                                    <button
                                                        onClick={() => openModal(v)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '13px',
                                                            borderRadius: '14px',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontWeight: 800,
                                                            fontSize: '0.92rem',
                                                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                                                            color: '#ffffff',
                                                            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px'
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                            e.currentTarget.style.boxShadow = '0 10px 24px rgba(79, 70, 229, 0.4)';
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.3)';
                                                        }}
                                                    >
                                                        <span>🎫 Reservar Cupo</span>
                                                        <i className="bi bi-arrow-right"></i>
                                                    </button>
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '12px',
                                                        background: '#f1f5f9',
                                                        textAlign: 'center',
                                                        fontSize: '0.85rem',
                                                        color: '#94a3b8',
                                                        fontWeight: 700
                                                    }}>
                                                        🔒 Sin permiso para reservar
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de Reserva con efecto de vidrio */}
            {modalOpen && activeTrip && puedeCrear && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(13, 15, 26, 0.65)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '20px',
                    boxSizing: 'border-box'
                }}
                onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
                    <div className="glass-panel" style={{
                        background: '#ffffff',
                        padding: '32px',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '480px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <h3 style={{ margin: 0, color: '#0d0f1a', fontSize: '1.4rem', fontWeight: 900 }}>Confirmar Reserva</h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >✕</button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 18px', fontWeight: 600 }}>
                            {activeTrip.origen_nombre} ➔ {activeTrip.destino_nombre}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
                            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}>
                                🕐 {formatHora(activeTrip.hora_salida)}
                            </span>
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800 }}>
                                💵 ${Number(activeTrip.tarifa).toLocaleString('es-CO')} COP
                            </span>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 800, fontSize: '0.9rem', color: '#1e293b' }}>
                                📍 Selecciona tu punto de recogida:
                            </label>

                            {(!activeTrip.paradas || activeTrip.paradas.length === 0) ? (
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.88rem', textAlign: 'center' }}>
                                    Este viaje no tiene paradas intermedias configuradas. La recogida será en el origen pactado.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {activeTrip.paradas.map((p: any) => {
                                        const seleccionado = paradaSeleccionada === String(p.id_pds);
                                        return (
                                            <div
                                                key={p.id_pds}
                                                onClick={() => setParadaSeleccionada(String(p.id_pds))}
                                                style={{
                                                    padding: '14px 16px',
                                                    borderRadius: '14px',
                                                    cursor: 'pointer',
                                                    border: `2px solid ${seleccionado ? '#4f46e5' : '#e2e8f0'}`,
                                                    background: seleccionado ? '#f5f3ff' : '#ffffff',
                                                    transition: 'all 0.15s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: seleccionado ? '#4f46e5' : '#1e293b' }}>
                                                        {p.orden}. {p.nombre}
                                                    </div>
                                                    {p.costo_adicional > 0 && (
                                                        <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                                                            +${Number(p.costo_adicional).toLocaleString('es-CO')} COP adicional
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    border: `2px solid ${seleccionado ? '#4f46e5' : '#cbd5e1'}`,
                                                    background: seleccionado ? '#4f46e5' : 'transparent',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {seleccionado && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    color: '#475569'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarReserva}
                                disabled={reservando || (activeTrip.paradas && activeTrip.paradas.length > 0 && !paradaSeleccionada)}
                                style={{
                                    flex: 2,
                                    padding: '14px',
                                    background: (!activeTrip.paradas || activeTrip.paradas.length === 0 || paradaSeleccionada) ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : '#e2e8f0',
                                    color: (!activeTrip.paradas || activeTrip.paradas.length === 0 || paradaSeleccionada) ? '#ffffff' : '#94a3b8',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: (!activeTrip.paradas || activeTrip.paradas.length === 0 || paradaSeleccionada) ? 'pointer' : 'default',
                                    fontWeight: 800,
                                    boxShadow: (!activeTrip.paradas || activeTrip.paradas.length === 0 || paradaSeleccionada) ? '0 6px 20px rgba(79, 70, 229, 0.3)' : 'none'
                                }}
                            >
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