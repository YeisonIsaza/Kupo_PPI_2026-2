'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function PerfilesAdminPage() {
    const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
    const [lista, setLista] = useState([]);
    const [roles, setRoles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editandoId, setEditandoId] = useState(null);
    const [form, setForm] = useState({ nombre_perfil: '', id_rol: '' });

    useEffect(() => { cargarDatos(); }, []);

    async function cargarDatos() {
        setCargando(true);
        try {
            const [p, r] = await Promise.all([
                fetch('/api/admin/perfiles').then(res => res.json()),
                fetch('/api/admin/roles').then(res => res.json()),
            ]);
            setLista(Array.isArray(p) ? p : []);
            setRoles(Array.isArray(r) ? r : []);
        } catch (error) { console.error(error); }
        finally { setCargando(false); }
    }

    async function guardar(e) {
        e.preventDefault();
        const url = editandoId ? `/api/admin/perfiles/${editandoId}` : '/api/admin/perfiles';
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
        if (!confirm('¿Eliminar este perfil?')) return;
        try {
            const res = await fetch(`/api/admin/perfiles/${id}`, { method: 'DELETE' });
            if (res.ok) cargarDatos();
            else alert('No se puede eliminar: está siendo usado por usuarios.');
        } catch { alert('Error al eliminar'); }
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
                <h1 style={{ fontSize: '1.4rem', margin: '0 0 24px', color: '#1e293b' }}>¡Hola, {nombre}! 👋</h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ color: '#1e293b', margin: 0 }}>Perfiles</h2>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>Subcategorías de roles del sistema</p>
                    </div>
                    {puedeCrear && (
                        <button onClick={() => { setEditandoId(null); setForm({ nombre_perfil: '', id_rol: '' }); setModalAbierto(true); }}
                            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Nuevo Perfil
                        </button>
                    )}
                </div>

                {cargando ? <p>Cargando perfiles...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 16px' }}>ID</th>
                                    <th style={{ padding: '12px 16px' }}>Nombre del Perfil</th>
                                    <th style={{ padding: '12px 16px' }}>Rol</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map(item => (
                                    <tr key={item.codigo_perfil} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px' }}>{item.codigo_perfil}</td>
                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.nombre_perfil}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 600 }}>
                                                {item.rol?.nombre_rol || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                {puedeActualizar && (
                                            <button onClick={() => { setEditandoId(item.codigo_perfil); setForm({ nombre_perfil: item.nombre_perfil, id_rol: item.rol?.id_rol || '' }); setModalAbierto(true); }}
                                                style={{ background: '#e0e7ff', border: 'none', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>
                                                ✏️ Editar
                                            </button>
                                                )}
                                                {puedeEliminar && (     
                                            <button onClick={() => eliminar(item.codigo_perfil)}
                                                style={{ background: '#fee2e2', border: 'none', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                                🗑️ Eliminar
                                            </button>
                                            )}      
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {modalAbierto && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '400px' }}>
                            <h3 style={{ margin: '0 0 20px' }}>{editandoId ? 'Editar Perfil' : 'Nuevo Perfil'}</h3>
                            <form onSubmit={guardar}>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Nombre del Perfil</label>
                                    <input type="text" value={form.nombre_perfil} onChange={e => setForm({ ...form, nombre_perfil: e.target.value })} required
                                        placeholder="Ej: Estudiante Poli"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Rol</label>
                                    <select value={form.id_rol} onChange={e => setForm({ ...form, id_rol: e.target.value })} required
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <option value="">Selecciona un rol</option>
                                        {roles.map(r => (
                                            <option key={r.id_rol} value={r.id_rol}>{r.nombre_rol}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" onClick={() => setModalAbierto(false)}
                                        style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit"
                                        style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        {editandoId ? 'Actualizar' : 'Guardar'}
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