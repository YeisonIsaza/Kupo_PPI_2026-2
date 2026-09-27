'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import usePermisos from '@/lib/usePermisos';       // ← NUEVO
import SinPermiso from '@/components/SinPermiso';  // ← NUEVO

function CalificacionesContent() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const { puedeLeer, puedeCrear, cargando: cargandoPermisos } = usePermisos(); // ← NUEVO
    const searchParams = useSearchParams();
    const router = useRouter();
    const viajeId = searchParams.get('viajeId');

    const [pasajeros, setPasajeros] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pasajeroSeleccionado, setPasajeroSeleccionado] = useState(null);
    const [puntuacion, setPuntuacion] = useState(0);
    const [comentario, setComentario] = useState('');
    const [hover, setHover] = useState(0);
    const [toast, setToast] = useState('');
    const [toastVisible, setToastVisible] = useState(false);

    useEffect(() => {
        if (listo && viajeId) cargarPasajeros();
    }, [listo, viajeId]);

    function showToast(msg) {
        setToast(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    }

    async function cargarPasajeros() {
        setCargando(true);
        try {
            const res = await fetch(`/api/conductor/calificaciones?viajeId=${viajeId}`);
            const data = await res.json();
            setPasajeros(Array.isArray(data) ? data : []);
        } catch { console.error('Error cargando pasajeros'); }
        finally { setCargando(false); }
    }

    function abrirModal(pasajero) {
        setPasajeroSeleccionado(pasajero);
        setPuntuacion(0);
        setComentario('');
        setHover(0);
        setModalAbierto(true);
    }

    async function enviarCalificacion(e) {
        e.preventDefault();
        if (puntuacion === 0) {
            showToast('⚠️ Selecciona una puntuación');
            return;
        }
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch('/api/conductor/calificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    viajeId,
                    userId,
                    receptorId:  pasajeroSeleccionado.id_user,
                    puntuacion,
                    comentario,
                })
            });
            const data = await res.json();
            if (res.ok) {
                setModalAbierto(false);
                cargarPasajeros();
                showToast('✅ Calificación guardada');
            } else {
                showToast(`❌ ${data.error}`);
            }
        } catch { showToast('❌ Error de conexión'); }
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
            <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
                <button onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '16px', fontSize: '0.85rem' }}>
                    ← Volver
                </button>
                <h1 style={{ margin: '0 0 8px', color: '#1e293b' }}>Calificar Pasajeros</h1>
                <p style={{ color: '#64748b', margin: '0 0 24px' }}>Califica a los estudiantes que viajaron contigo</p>

                {cargando ? <p>Cargando...</p> : pasajeros.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '3rem' }}>👥</div>
                        <p style={{ color: '#64748b', marginTop: '12px' }}>No hay pasajeros en este viaje</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pasajeros.map(p => (
                            <div key={p.id_res} style={{
                                background: 'white', borderRadius: '12px', padding: '16px 20px',
                                border: `1px solid ${p.calificado ? '#86efac' : '#e2e8f0'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {p.foto_perf
                                            ? <img src={p.foto_perf} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <span style={{ fontSize: '1.5rem' }}>👤</span>
                                        }
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.nombre}</div>
                                        {p.parada && (
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                                                📍 {p.parada}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {p.calificado ? (
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                                        ✅ Calificado
                                    </span>
                                ) : (
                                    // ← Solo muestra botón calificar si puede crear
                                    puedeCrear && (
                                        <button onClick={() => abrirModal(p)}
                                            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                            ⭐ Calificar
                                        </button>
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal - solo si puede crear */}
            {modalAbierto && pasajeroSeleccionado && puedeCrear && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '420px' }}>
                        <h3 style={{ margin: '0 0 4px', color: '#1e293b' }}>Calificar a {pasajeroSeleccionado.nombre}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px' }}>¿Cómo fue tu experiencia con este pasajero?</p>
                        <form onSubmit={enviarCalificacion}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                                {[1,2,3,4,5].map(star => (
                                    <span key={star}
                                        onClick={() => setPuntuacion(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        style={{ fontSize: '2.5rem', cursor: 'pointer', color: star <= (hover || puntuacion) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s' }}>
                                        ★
                                    </span>
                                ))}
                            </div>
                            {puntuacion > 0 && (
                                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px' }}>
                                    {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][puntuacion]}
                                </p>
                            )}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Comentario (opcional)
                                </label>
                                <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                                    rows={3} placeholder="¿Algo que destacar?"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical', fontFamily: 'sans-serif', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setModalAbierto(false)}
                                    style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit"
                                    style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                    Enviar Calificación
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

export default function CalificacionesPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <CalificacionesContent />
        </Suspense>
    );
}