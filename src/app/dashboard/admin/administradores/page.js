'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso'; // ← NUEVO

export default function AdministradoresAdminPage() {
    // ← QUITADA la línea duplicada, solo una desestructuración
    const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
    const [lista, setLista] = useState([]);
    const [estadosCuenta, setEstadosCuenta] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState({
        nombre: '', primer_apellido: '', segundo_apellido: '',
        documento: '', celular: '', fecha_nacimiento: '',
        correo: '', password: '', id_estado: '',
        codigo_perfil: '1' // ← NUEVO
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    async function cargarDatos() {
        setCargando(true);
        try {
            const [admins, estados] = await Promise.all([
                fetch('/api/admin/administradores').then(r => r.json()),
                fetch('/api/admin/estados').then(r => r.json()),
            ]);
            setLista(Array.isArray(admins) ? admins : []);
            setEstadosCuenta(Array.isArray(estados)
                ? estados.filter(e => e.categoria === 'CUENTA')
                : []);
        } catch (error) { console.error(error); }
        finally { setCargando(false); }
    }

    async function guardar(e) {
        e.preventDefault();
        const url = editandoId
            ? `/api/admin/administradores/${editandoId}`
            : '/api/admin/administradores';
        const method = editandoId ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) { setModalAbierto(false); cargarDatos(); }
            else { const err = await res.json(); alert(err.error || 'Error al guardar'); }
        } catch { alert('Error de conexión'); }
    }

    async function eliminar(id) {
        if (!confirm('¿Eliminar este administrador?')) return;
        try {
            const res = await fetch(`/api/admin/administradores/${id}`, { method: 'DELETE' });
            if (res.ok) cargarDatos();
            else alert('No se puede eliminar.');
        } catch { alert('Error al eliminar'); }
    }

    // ← GUARD: esperar a que cargue
    if (!listo) return null;

    // ← BLOQUEO: si no puede leer mostrar SinPermiso
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
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ color: '#1e293b', margin: 0 }}>Administradores</h2>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Gestión de usuarios con rol administrador</p>
                    </div>
                    {/* ← Solo muestra botón crear si tiene permiso */}
                    {puedeCrear && (
                        <button onClick={() => {
                            setEditandoId(null);
                            setForm({ nombre: '', primer_apellido: '', segundo_apellido: '', 
                                    documento: '', celular: '', fecha_nacimiento: '', 
                                    correo: '', password: '', id_estado: '',
                                    codigo_perfil: '1' 
                                });
                            setModalAbierto(true);
                        }}
                            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Nuevo Administrador
                        </button>
                    )}
                </div>

                {cargando ? <p>Cargando administradores...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 16px' }}>ID</th>
                                    <th style={{ padding: '12px 16px' }}>Nombre</th>
                                    <th style={{ padding: '12px 16px' }}>Documento</th>
                                    <th style={{ padding: '12px 16px' }}>Correo</th>
                                    <th style={{ padding: '12px 16px' }}>Estado</th>
                                    {/* ← Solo muestra columna acciones si tiene algún permiso */}
                                    {(puedeActualizar || puedeEliminar) && (
                                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map(item => (
                                    <tr key={item.id_user} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.id_user}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.nombre} {item.primer_apellido}</td>
                                        <td style={{ padding: '12px 16px' }}>{item.documento}</td>
                                        <td style={{ padding: '12px 16px', color: '#4f46e5' }}>{item.correo}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                background: item.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                color: item.estado === 'ACTIVO' ? '#16a34a' : '#dc2626',
                                                padding: '2px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600
                                            }}>
                                                {item.estado}
                                            </span>
                                        </td>
                                        {(puedeActualizar || puedeEliminar) && (
                                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                
                                                {puedeActualizar && (
                                                    <button onClick={() => {
                                                        setEditandoId(item.id_user);
                                                        setForm({ nombre: item.nombre, primer_apellido: item.primer_apellido, segundo_apellido: '', documento: item.documento, celular: item.celular, fecha_nacimiento: '', correo: item.correo, password: '', id_estado: '' });
                                                        setModalAbierto(true);
                                                    }}
                                                        style={{ background: '#e0e7ff', border: 'none', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>
                                                        ✏️ Editar
                                                    </button>
                                                )}
                                            
                                                {puedeEliminar && (
                                                    <button onClick={() => eliminar(item.id_user)}
                                                        style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                                        🗑️ Eliminar
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ← Modal solo si puede crear o actualizar */}
                {modalAbierto && (puedeCrear || puedeActualizar) && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h3 style={{ margin: '0 0 20px' }}>{editandoId ? 'Editar Administrador' : 'Nuevo Administrador'}</h3>
                            <form onSubmit={guardar}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Nombre</label>
                                        <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Primer Apellido</label>
                                        <input type="text" value={form.primer_apellido} onChange={e => setForm({ ...form, primer_apellido: e.target.value })} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Segundo Apellido</label>
                                        <input type="text" value={form.segundo_apellido} onChange={e => setForm({ ...form, segundo_apellido: e.target.value })}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Documento</label>
                                        <input type="text" value={form.documento} onChange={e => setForm({ ...form, documento: e.target.value })}
                                            required={!editandoId} disabled={!!editandoId}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', opacity: editandoId ? 0.6 : 1 }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Celular</label>
                                        <input type="text" value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} required
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                    </div>
                                    {!editandoId && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Fecha Nacimiento</label>
                                            <input type="date" value={form.fecha_nacimiento} onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Correo</label>
                                    <input type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })}
                                        required={!editandoId} disabled={!!editandoId}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', opacity: editandoId ? 0.6 : 1 }} />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Estado de Cuenta</label>
                                    <select value={form.id_estado || ''} onChange={e => setForm({ ...form, id_estado: e.target.value })} required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <option value="">Selecciona un estado</option>
                                        {estadosCuenta.map(e => (
                                            <option key={e.id_estado} value={e.id_estado}>{e.nombre_estado}</option>
                                        ))}
                                    </select>

                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Tipo de Administrador
                                    </label>
                                    <select value={form.codigo_perfil} onChange={e => setForm({ ...form, codigo_perfil: e.target.value })} required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <option value="1">Administrador General</option>
                                        <option value="21">Administrador Secundario</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                                        {editandoId ? 'Nueva Contraseña (vacío = no cambiar)' : 'Contraseña'}
                                    </label>
                                    <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                        required={!editandoId}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" onClick={() => setModalAbierto(false)}
                                        style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit"
                                        style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        {editandoId ? 'Actualizar' : 'Crear'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}