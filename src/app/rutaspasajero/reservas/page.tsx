'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/presentation/components/UserNavbar';
import useAuth from '@/core/hooks/useAuth';
import usePermisos from '@/core/hooks/usePermisos';
import SinPermiso from '@/presentation/components/SinPermiso';
import '@/app/premium.css';

function MisReservasContent() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([3, 4]); // 3=Estudiante, 4=Pasajero
    const { puedeLeer, puedeEliminar, cargando: cargandoPermisos } = usePermisos();
    const router = useRouter();

    const [reservas, setReservas] = useState<any[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [toast, setToast] = useState<string>('');
    const [toastVisible, setToastVisible] = useState<boolean>(false);
    const [loadingCancel, setLoadingCancel] = useState<number | null>(null);

    useEffect(() => {
        if (listo) cargarReservas();
    }, [listo]);

    function showToast(msg: string) {
        setToast(msg);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    }

    async function cargarReservas() {
        setCargando(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/reservas?userId=${userId}`);
            const data = await res.json();
            setReservas(Array.isArray(data) ? data : []);
        } catch { 
            console.error('Error cargando reservas'); 
        } finally { 
            setCargando(false); 
        }
    }

    async function cancelarReserva(reservaId: number) {
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva?')) return;
        
        setLoadingCancel(reservaId);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch('/api/pasajero/reservas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservaId, userId })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('✅ Reserva cancelada exitosamente');
                cargarReservas();
            } else {
                showToast(`❌ ${data.error}`);
            }
        } catch {
            showToast('❌ Error de conexión al cancelar');
        } finally {
            setLoadingCancel(null);
        }
    }

    function formatFecha(fecha: string) {
        if (!fecha) return 'Fecha no disponible';
        return new Date(fecha).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    function formatHora(hora: string) {
        if (!hora) return '--:--';
        if (hora.includes('T')) {
            return new Date(hora).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        }
        return hora.substring(0, 5);
    }

    function getEstadoBadge(estado: string) {
        switch (estado) {
            case 'Aceptada':
                return { bg: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', text: 'Aceptada', icon: '✅' };
            case 'Solicitada':
                return { bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706', text: 'Pendiente', icon: '⏳' };
            case 'Rechazada':
                return { bg: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', text: 'Rechazada', icon: '❌' };
            case 'Cancelada':
                return { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', text: 'Cancelada', icon: '🚫' };
            default:
                return { bg: 'rgba(59, 63, 232, 0.1)', color: '#3b3fe8', text: estado, icon: '📌' };
        }
    }

    if (!listo || cargandoPermisos) return null;

    if (!puedeLeer) return (
        <div style={{ minHeight: '100vh', background: '#f0f2f8' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)', fontFamily: "var(--font-nunito), sans-serif" }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            
            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
                <button onClick={() => router.back()}
                    style={{ 
                        background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)', 
                        backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '99px',
                        cursor: 'pointer', color: '#5a5e7a', marginBottom: '24px', fontSize: '0.85rem',
                        fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <i className="bi bi-arrow-left"></i> Volver al Dashboard
                </button>
                
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ margin: '0 0 10px', fontSize: '2.5rem', fontWeight: 900, color: '#0d0f1a', letterSpacing: '-0.5px' }}>
                        Mis Reservas
                    </h1>
                    <p style={{ color: '#5a5e7a', fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
                        Consulta el estado de tus reservas y el historial de tus viajes.
                    </p>
                </header>

                {cargando ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(59,63,232,0.2)', borderTopColor: '#3b3fe8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : reservas.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px', opacity: 0.8 }}>📭</div>
                        <h3 style={{ fontSize: '1.4rem', color: '#0d0f1a', margin: '0 0 8px', fontWeight: 800 }}>No tienes reservas aún</h3>
                        <p style={{ color: '#5a5e7a', margin: '0 0 24px' }}>Explora las rutas disponibles y reserva tu primer viaje.</p>
                        <button 
                            onClick={() => router.push('/rutaspasajero')}
                            className="btn-primary"
                        >
                            Buscar Viajes <i className="bi bi-search" style={{ marginLeft: '6px' }}></i>
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {reservas.map(r => {
                            const badge = getEstadoBadge(r.estado?.nombre_estado || '');
                            const viaje = r.viaje;
                            const conductor = viaje?.rutaConductor?.conductor?.usuario;
                            const hora = viaje?.hora_salida_vj || viaje?.rutaConductor?.hora_salida_rc;
                            const esCancelable = ['Solicitada', 'Aceptada'].includes(r.estado?.nombre_estado) && puedeEliminar;

                            return (
                                <div key={r.id_res} className="glass-panel hover-scale" style={{ 
                                    padding: '24px', borderRadius: '20px', display: 'flex', 
                                    flexDirection: 'column', gap: '20px',
                                    borderLeft: `6px solid ${badge.color}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ 
                                                width: '56px', height: '56px', borderRadius: '16px', 
                                                background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.6rem', color: '#3b3fe8', flexShrink: 0
                                            }}>
                                                🚗
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0d0f1a', marginBottom: '4px' }}>
                                                    {viaje?.origen_vj || viaje?.rutaConductor?.origen_rc} 
                                                    <i className="bi bi-arrow-right" style={{ margin: '0 8px', color: '#9ca3af' }}></i> 
                                                    {viaje?.destino_vj || viaje?.rutaConductor?.destino_rc}
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: '#5a5e7a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span><i className="bi bi-calendar-event"></i> {formatFecha(viaje?.fecha_vj)}</span>
                                                    <span><i className="bi bi-clock"></i> {formatHora(hora)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ 
                                            background: badge.bg, color: badge.color, 
                                            padding: '8px 16px', borderRadius: '99px',
                                            fontSize: '0.85rem', fontWeight: 800,
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                            {badge.icon} {badge.text}
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.5)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b3fe8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                                                {conductor?.nombre_user?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conductor</div>
                                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d0f1a' }}>
                                                    {conductor ? `${conductor.nombre_user} ${conductor.primer_apellido}` : 'Sin asignar'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Parada Solicitada</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0d0f1a' }}>
                                                {r.parada?.nombre_pds || 'No especificada'}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aporte</div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#16a34a' }}>
                                                ${Number(r.aporte_res || 0).toLocaleString('es-CO')} COP
                                            </div>
                                        </div>

                                        {esCancelable && (
                                            <button 
                                                onClick={() => cancelarReserva(r.id_res)}
                                                disabled={loadingCancel === r.id_res}
                                                style={{
                                                    background: 'white', color: '#dc2626', border: '1.5px solid #fee2e2',
                                                    padding: '10px 20px', borderRadius: '12px', fontWeight: 700,
                                                    cursor: loadingCancel === r.id_res ? 'wait' : 'pointer',
                                                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
                                                    opacity: loadingCancel === r.id_res ? 0.7 : 1,
                                                    transition: 'all 0.2s', marginLeft: 'auto'
                                                }}
                                                onMouseEnter={e => {
                                                    if (loadingCancel !== r.id_res) {
                                                        e.currentTarget.style.background = '#fee2e2';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (loadingCancel !== r.id_res) {
                                                        e.currentTarget.style.background = 'white';
                                                    }
                                                }}
                                            >
                                                {loadingCancel === r.id_res ? (
                                                    <><i className="bi bi-hourglass-split"></i> Cancelando...</>
                                                ) : (
                                                    <><i className="bi bi-x-circle"></i> Cancelar Reserva</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <div className={`toast ${toastVisible ? 'show' : ''}`}>
                <span>{toast}</span>
            </div>
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default function MisReservasPage(): React.JSX.Element | null {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(59,63,232,0.2)', borderTopColor: '#3b3fe8', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /></div>}>
            <MisReservasContent />
        </Suspense>
    );
}
