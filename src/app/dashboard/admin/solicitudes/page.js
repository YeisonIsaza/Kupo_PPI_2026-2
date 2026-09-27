'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function SolicitudesAdminPage() {
    const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    useEffect(() => { cargarSolicitudes(); }, []);

    async function cargarSolicitudes() {
        setCargando(true);
        try {
            const res = await fetch('/api/admin/solicitudes');
            if (res.ok) {
                const data = await res.json();
                setSolicitudes(data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCargando(false);
        }
    }

    async function procesarSolicitud(id, accion) {
        try {
            const res = await fetch(`/api/admin/solicitudes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion, mensaje })
            });
            if (res.ok) {
                alert(`Usuario ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente.`);
                setMensaje('');
                setUsuarioSeleccionado(null);
                cargarSolicitudes();
            } else {
                const err = await res.json();
                alert(err.error || "Error al procesar");
            }
        } catch (error) {
            alert("Error de conexión");
        }
    }

    if (!listo) return null;
    if (!acceso) return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
        <AdminSidebar />
        <main style={{ marginLeft: '240px', flex: 1, background: '#f8fafc' }}>
            <SinPermiso />
        </main>
    </div>
);

    return (
        <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 8px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#1e293b', margin: 0 }}>
                        Solicitudes Pendientes ({solicitudes.length})
                    </h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0' }}>Valida la documentación de los nuevos integrantes</p>
                </div>

                {cargando ? (
                    <p style={{ color: '#64748b' }}>Cargando solicitudes...</p>
                ) : solicitudes.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <p style={{ fontSize: '1.2rem', margin: 0 }}>🎉 ¡Al día!</p>
                        <p style={{ marginTop: '4px', fontSize: '0.9rem' }}>No hay solicitudes pendientes.</p>
                    </div>
                ) : (
                    solicitudes.map(u => (
                        <div key={u.id_user} style={{
                            background: 'white', borderRadius: '12px', padding: '20px',
                            marginBottom: '16px', border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', color: '#1e293b' }}>{u.nombre}</h3>
                                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>
                                        <strong>Correo:</strong> {u.correo}
                                    </p>
                                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '0.85rem' }}>
                                        <strong>Documento:</strong> {u.documento} &nbsp;|&nbsp;
                                        <strong>Celular:</strong> {u.celular}
                                    </p>
                                    <span style={{
                                        display: 'inline-block', marginTop: '8px',
                                        padding: '4px 12px', borderRadius: '99px',
                                        background: '#e0e7ff', color: '#4338ca',
                                        fontSize: '0.75rem', fontWeight: 600
                                    }}>
                                        {u.rol} — {u.perfil}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                    {puedeActualizar && (
                                        <button
                                            onClick={() => procesarSolicitud(u.id_user, 'aprobar')}
                                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                            ✅ Aprobar
                                        </button>
                                    )}
                                    {puedeEliminar && (
                                        <button
                                            onClick={() => setUsuarioSeleccionado(u.id_user)}
                                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                            ❌ Rechazar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {usuarioSeleccionado === u.id_user && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                    <label style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        Motivo del rechazo:
                                    </label>
                                    <textarea rows={3} value={mensaje} onChange={e => setMensaje(e.target.value)}
                                        placeholder="Ej: La foto del documento no es legible..."
                                        style={{ width: '98%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical' }} />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => procesarSolicitud(u.id_user, 'rechazar')}
                                            disabled={!mensaje.trim()}
                                            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600, opacity: mensaje.trim() ? 1 : 0.5 }}>
                                            Confirmar Rechazo
                                        </button>
                                        <button
                                            onClick={() => { setUsuarioSeleccionado(null); setMensaje(''); }}
                                            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#64748b' }}>
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </main>
        </div>
    );
}