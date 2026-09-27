'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function UsuariosAdminPage() {
    const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
    const [tab, setTab] = useState('usuarios'); // 'usuarios' | 'universidades'

    // Solicitudes usuarios
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mensaje, setMensaje] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    // Solicitudes universidades
    const [solicitudesUni, setSolicitudesUni] = useState([]);
    const [cargandoUni, setCargandoUni] = useState(true);
    const [mensajeUni, setMensajeUni] = useState('');
    const [uniSeleccionada, setUniSeleccionada] = useState(null);

    useEffect(() => {
        cargarSolicitudes();
        cargarSolicitudesUni();
    }, []);

    async function cargarSolicitudes() {
        setCargando(true);
        try {
            const res = await fetch('/api/admin/solicitudes');
            const data = await res.json();
            setSolicitudes(Array.isArray(data) ? data : []);
        } catch (error) { console.error("Error:", error); }
        finally { setCargando(false); }
    }

    async function cargarSolicitudesUni() {
        setCargandoUni(true);
        try {
            const res = await fetch('/api/admin/solicitudes/universidades');
            const data = await res.json();
            setSolicitudesUni(Array.isArray(data) ? data : []);
        } catch (error) { console.error("Error:", error); }
        finally { setCargandoUni(false); }
    }

    async function procesarSolicitud(id, accion) {
        try {
            const res = await fetch(`/api/admin/solicitudes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion, mensaje })
            });
            if (res.ok) {
                setMensaje('');
                setUsuarioSeleccionado(null);
                cargarSolicitudes();
                alert(`Solicitud ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} con éxito.`);
            } else {
                alert("Error al procesar la solicitud.");
            }
        } catch { alert("Error de conexión."); }
    }

    async function procesarSolicitudUni(nitUni, idUser, accion) {
        try {
            const res = await fetch(`/api/admin/solicitudes/universidades`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nitUni, idUser, accion, mensaje: mensajeUni })
            });
            if (res.ok) {
                setMensajeUni('');
                setUniSeleccionada(null);
                cargarSolicitudesUni();
                alert(`Vinculación ${accion === 'aprobar' ? 'aprobada' : 'rechazada'} con éxito.`);
            } else {
                alert("Error al procesar la solicitud.");
            }
        } catch { alert("Error de conexión."); }
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

    const pendientesUsuarios = solicitudes.length;
    const pendientesUni = solicitudesUni.length;

    return (
        <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>

                {/* Pestañas */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                    <button onClick={() => setTab('usuarios')}
                        style={{
                            padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                            background: 'none', borderBottom: tab === 'usuarios' ? '2px solid #4f46e5' : 'none',
                            color: tab === 'usuarios' ? '#4f46e5' : '#64748b', marginBottom: '-2px'
                        }}>
                        👤 Usuarios
                        {pendientesUsuarios > 0 && (
                            <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', borderRadius: '99px', padding: '1px 7px', fontSize: '0.75rem' }}>
                                {pendientesUsuarios}
                            </span>
                        )}
                    </button>
                    <button onClick={() => setTab('universidades')}
                        style={{
                            padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                            background: 'none', borderBottom: tab === 'universidades' ? '2px solid #4f46e5' : 'none',
                            color: tab === 'universidades' ? '#4f46e5' : '#64748b', marginBottom: '-2px'
                        }}>
                        🎓 Universidades
                        {pendientesUni > 0 && (
                            <span style={{ marginLeft: '6px', background: '#ef4444', color: 'white', borderRadius: '99px', padding: '1px 7px', fontSize: '0.75rem' }}>
                                {pendientesUni}
                            </span>
                        )}
                    </button>
                </div>

                {/* Tab Usuarios */}
                {tab === 'usuarios' && (
                    <>
                        <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>
                            Solicitudes de Registro ({solicitudes.length})
                        </h2>
                        {cargando ? <p>Cargando...</p> : solicitudes.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No hay solicitudes pendientes.</p>
                        ) : solicitudes.map(u => (
                            <div key={u.id_user} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px' }}>{u.nombre}</h3>
                                        <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>Correo: {u.correo}</p>
                                        <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>Documento: {u.documento} | Celular: {u.celular}</p>
                                        <span style={{ display: 'inline-block', marginTop: '8px', padding: '2px 10px', borderRadius: '99px', background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 600 }}>
                                            {u.rol} — {u.perfil}
                                        </span>
                                        {u.foto_perf && (
                                            <div style={{ marginTop: '12px' }}>
                                                <img src={u.foto_perf} alt="Foto perfil"
                                                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                                            </div>
                                        )}
                                        {u.certificado && (
                                            <div style={{ marginTop: '8px' }}>
                                                <a href={u.certificado} target="_blank" rel="noopener noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                                                    📄 Ver Certificado
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                         {puedeActualizar && (
                                        <button onClick={() => procesarSolicitud(u.id_user, 'aprobar')}
                                            style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            ✅ Aprobar
                                        </button>
                                    )}
                                    {puedeEliminar && (
                                        <button onClick={() => setUsuarioSeleccionado(u.id_user)}
                                            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            ❌ Rechazar
                                        </button>
                                         )}
                                    </div>
                                </div>
                                {usuarioSeleccionado === u.id_user && (
                                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                        <label style={{ color: '#64748b', fontSize: '0.85rem' }}>Motivo del rechazo:</label>
                                        <textarea rows={3} value={mensaje} onChange={e => setMensaje(e.target.value)}
                                            placeholder="Ej: La licencia adjunta está vencida..."
                                            style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical' }} />
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button onClick={() => procesarSolicitud(u.id_user, 'rechazar')}
                                                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                                Confirmar Rechazo
                                            </button>
                                            <button onClick={() => { setUsuarioSeleccionado(null); setMensaje(''); }}
                                                style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* Tab Universidades */}
                {tab === 'universidades' && (
                    <>
                        <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>
                            Solicitudes de Vinculación Universitaria ({solicitudesUni.length})
                        </h2>
                        {cargandoUni ? <p>Cargando...</p> : solicitudesUni.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No hay solicitudes pendientes.</p>
                        ) : solicitudesUni.map(s => (
                            <div key={`${s.nit_uni}-${s.id_user}`} style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px' }}>{s.nombre_usuario}</h3>
                                        <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748b' }}>
                                            📧 Personal: {s.correo_personal}
                                        </p>
                                        <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748b' }}>
                                            🎓 Universidad: <strong>{s.nombre_uni}</strong>
                                        </p>
                                        <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748b' }}>
                                            📧 Institucional: {s.correo_institucional}
                                        </p>
                                        {s.foto_perf && (
                                            <div style={{ marginTop: '12px' }}>
                                                <img src={s.foto_perf} alt="Foto"
                                                    style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                                            </div>
                                        )}
                                        {s.certificado && (
                                            <div style={{ marginTop: '8px' }}>
                                                <a href={s.certificado} target="_blank" rel="noopener noreferrer"
                                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                                                    📄 Ver Certificado
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                        {puedeActualizar && (
                                        <button onClick={() => procesarSolicitudUni(s.nit_uni, s.id_user, 'aprobar')}
                                            style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            ✅ Aprobar
                                        </button>
                                    )}
                                    {puedeEliminar && (
                                        <button onClick={() => setUniSeleccionada(`${s.nit_uni}-${s.id_user}`)}
                                            style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                            ❌ Rechazar
                                        </button>
                                            )}
                                    </div>
                                </div>
                                {uniSeleccionada === `${s.nit_uni}-${s.id_user}` && (
                                    <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                        <label style={{ color: '#64748b', fontSize: '0.85rem' }}>Motivo del rechazo:</label>
                                        <textarea rows={3} value={mensajeUni} onChange={e => setMensajeUni(e.target.value)}
                                            placeholder="Ej: El certificado no corresponde a esta universidad..."
                                            style={{ width: '100%', marginTop: '8px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', resize: 'vertical' }} />
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                            <button onClick={() => procesarSolicitudUni(s.nit_uni, s.id_user, 'rechazar')}
                                                style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                                Confirmar Rechazo
                                            </button>
                                            <button onClick={() => { setUniSeleccionada(null); setMensajeUni(''); }}
                                                style={{ padding: '8px 16px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}