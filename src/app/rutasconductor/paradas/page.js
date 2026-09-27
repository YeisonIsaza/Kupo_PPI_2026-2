'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import usePermisos from '@/lib/usePermisos';       // ← NUEVO
import SinPermiso from '@/components/SinPermiso';  // ← NUEVO

function ParadasContent() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const { puedeLeer, puedeCrear, puedeEliminar, cargando: cargandoPermisos } = usePermisos(); // ← NUEVO
    const searchParams = useSearchParams();
    const router = useRouter();
    const idRuta = searchParams.get('rutaId');

    const [paradas, setParadas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);
    const [nombre_parada, setNombreParada] = useState('');
    const [orden, setOrden] = useState('');
    const [horaEstimada, setHoraEstimada] = useState('');
    const [esUniversidad, setEsUniversidad] = useState(false);
    const [costoAdicional, setCostoAdicional] = useState('0');
    const [nitUniParada, setNitUniParada] = useState('');
    const [universidades, setUniversidades] = useState([]);

    useEffect(() => {
        if (listo) {
            cargarParadas();
            cargarUniversidades();
        }
    }, [listo, idRuta]);

    function showToast(msg) {
        setToast(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    }

    async function cargarParadas() {
        setCargando(true);
        try {
            const res = await fetch(`/api/conductor/rutas/${idRuta}/paradas`);
            const data = await res.json();
            setParadas(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando paradas'); }
        finally { setCargando(false); }
    }

    async function cargarUniversidades() {
        try {
            const res = await fetch('/api/admin/universidades');
            const data = await res.json();
            setUniversidades(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando universidades'); }
    }

    async function agregarParada(e) {
        e.preventDefault();
        if (!nombre_parada || !orden) {
            showToast('⚠️ Nombre y orden son obligatorios');
            return;
        }
        try {
            const res = await fetch(`/api/conductor/rutas/${idRuta}/paradas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre:         nombre_parada,
                    orden:          Number(orden),
                    horaEstimada,
                    esUniversidad,
                    nitUni:         nitUniParada,
                    costoAdicional: Number(costoAdicional) || 0,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setModalAbierto(false);
                resetForm();
                cargarParadas();
                showToast('✅ Parada agregada');
            } else {
                showToast(`❌ ${data.error}`);
            }
        } catch { showToast('❌ Error de conexión'); }
    }

    async function eliminarParada(id) {
        if (!confirm('¿Eliminar esta parada?')) return;
        try {
            const res = await fetch(`/api/conductor/rutas/${idRuta}/paradas/${id}`, { method: 'DELETE' });
            if (res.ok) { cargarParadas(); }
            else showToast('❌ Error al eliminar');
        } catch { showToast('❌ Error de conexión'); }
    }

    function resetForm() {
        setNombreParada('');
        setOrden('');
        setHoraEstimada('');
        setEsUniversidad(false);
        setCostoAdicional('0');
        setNitUniParada('');
    }

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

    // ← GUARDS en orden correcto
    if (!listo || cargandoPermisos) return null;

    // ← BLOQUEO si no puede leer
    if (!puedeLeer) return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <button onClick={() => router.back()}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '8px', fontSize: '0.85rem' }}>
                            ← Volver
                        </button>
                        <h1 style={{ margin: 0, color: '#1e293b' }}>Paradas de la Ruta</h1>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>
                            Define los puntos de recogida para esta ruta
                        </p>
                    </div>
                    {/* ← Solo muestra botón Nueva Parada si puede crear */}
                    {puedeCrear && (
                        <button onClick={() => setModalAbierto(true)}
                            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                            + Nueva Parada
                        </button>
                    )}
                </div>

                {cargando ? <p>Cargando paradas...</p> : paradas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '3rem' }}>📍</div>
                        <p style={{ color: '#64748b', marginTop: '12px' }}>No hay paradas definidas. ¡Agrega la primera!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {paradas.sort((a, b) => a.orden_pds - b.orden_pds).map(p => (
                            <div key={p.id_pds} style={{
                                background: 'white', borderRadius: '12px', padding: '16px 20px',
                                border: '1px solid #e2e8f0', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: '#4f46e5', color: 'white', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '1rem', flexShrink: 0
                                    }}>
                                        {p.orden_pds}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>
                                            {p.punto_recogida_pds}
                                            {p.es_universidad_pds === 'SI' && (
                                                <span style={{ marginLeft: '8px', fontSize: '0.75rem', background: '#e0e7ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '99px' }}>
                                                    🎓 Universidad
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                            {p.hora_estimada_pds && (
                                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    🕐 {formatHora(p.hora_estimada_pds)}
                                                </span>
                                            )}
                                            {p.costo_adicional_pds > 0 && (
                                                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                                                    💵 +${Number(p.costo_adicional_pds).toLocaleString('es-CO')} COP adicional
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* ← Solo muestra botón eliminar si puede eliminar */}
                                {puedeEliminar && (
                                    <button onClick={() => eliminarParada(p.id_pds)}
                                        style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' }}>
                                        🗑️ Eliminar
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal - solo se abre si puede crear */}
            {modalAbierto && puedeCrear && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ margin: '0 0 20px', color: '#1e293b' }}>Nueva Parada</h3>
                        <form onSubmit={agregarParada}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Nombre / Dirección de la parada *
                                </label>
                                <input type="text" value={nombre_parada}
                                    onChange={e => setNombreParada(e.target.value)} required
                                    placeholder="Ej: Parque Berrío, Calle 50 con Av. El Palo"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Orden de recogida *
                                    </label>
                                    <input type="number" value={orden} min="1"
                                        onChange={e => setOrden(e.target.value)} required
                                        placeholder="Ej: 1"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Hora estimada
                                    </label>
                                    <input type="time" value={horaEstimada}
                                        onChange={e => setHoraEstimada(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Costo adicional (COP)
                                </label>
                                <input type="number" value={costoAdicional} min="0"
                                    onChange={e => setCostoAdicional(e.target.value)}
                                    placeholder="0 = sin costo adicional"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0' }}>
                                    Costo extra si el estudiante quiere ser llevado hasta este punto
                                </p>
                            </div>
                            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input type="checkbox" id="esUni" checked={esUniversidad}
                                    onChange={e => { setEsUniversidad(e.target.checked); setNitUniParada(''); }}
                                    style={{ width: '16px', height: '16px' }} />
                                <label htmlFor="esUni" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                    🎓 Esta parada es una universidad
                                </label>
                            </div>
                            {esUniversidad && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Selecciona la universidad
                                    </label>
                                    <select value={nitUniParada} onChange={e => setNitUniParada(e.target.value)}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <option value="">-- Selecciona --</option>
                                        {universidades.map(u => (
                                            <option key={u.nit_uni} value={u.nit_uni}>{u.nombre_uni}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => { setModalAbierto(false); resetForm(); }}
                                    style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit"
                                    style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Agregar Parada
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={`toast ${toastVisible ? 'show' : ''}`}>
                <span>{toast}</span>
            </div>
        </div>
    );
}

export default function ParadasPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ParadasContent />
        </Suspense>
    );
}