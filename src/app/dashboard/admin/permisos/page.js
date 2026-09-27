'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';
import SinPermiso from '@/components/SinPermiso';

export default function PermisosAdminPage() {
    const { nombre, listo, acceso, puedeCrear, puedeActualizar, puedeEliminar } = useAdminAuth();
    const [permisos, setPermisos] = useState([]);
    const [menus, setMenus] = useState([]);
    const [perfiles, setPerfiles] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState({
        codigo_menu: '', codigo_perfil: '',
        puede_crear: 'N', puede_leer: 'S',
        puede_actualizar: 'N', puede_eliminar: 'N'
    });

    useEffect(() => { cargarTodo(); }, []);

    async function cargarTodo() {
        setCargando(true);
        try {
            const [p, m, pf] = await Promise.all([
                fetch('/api/admin/menu-permisos').then(r => r.json()),
                fetch('/api/admin/menus').then(r => r.json()),
                fetch('/api/admin/perfiles').then(r => r.json()),
            ]);
            setPermisos(Array.isArray(p) ? p : []);
            setMenus(Array.isArray(m) ? m : []);
            setPerfiles(Array.isArray(pf) ? pf : []);
        } catch (error) { console.error(error); }
        finally { setCargando(false); }
    }

    async function guardar(e) {
        e.preventDefault();
        const url = editando
            ? `/api/admin/menu-permisos/${editando.codigo_menu}/${editando.codigo_perfil}`
            : '/api/admin/menu-permisos';
        const method = editando ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) { setModalAbierto(false); cargarTodo(); }
            else { const err = await res.json(); alert(err.error || 'Error al guardar'); }
        } catch { alert('Error de conexión'); }
    }

    async function eliminar(codigoMenu, codigoPerfil) {
        if (!confirm('¿Eliminar este permiso?')) return;
        try {
            const res = await fetch(`/api/admin/menu-permisos/${codigoMenu}/${codigoPerfil}`, { method: 'DELETE' });
            if (res.ok) cargarTodo();
            else alert('Error al eliminar');
        } catch { alert('Error de conexión'); }
    }

    const badge = (val) => (
        <span style={{
            padding: '2px 10px', borderRadius: '99px', fontWeight: 700, fontSize: '0.75rem',
            background: val === 'S' ? '#dcfce7' : '#fee2e2',
            color: val === 'S' ? '#16a34a' : '#dc2626'
        }}>
            {val === 'S' ? 'Sí' : 'No'}
        </span>
    );

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
                        <h2 style={{ color: '#1e293b', margin: 0 }}>Permisos de Menú</h2>
                        <p style={{ color: '#64748b', margin: '4px 0 0' }}>S = Sí puede, N = No puede</p>
                    </div>
                    {puedeCrear && (
                        <button onClick={() => { setEditando(null); setForm({ codigo_menu: '', codigo_perfil: '', puede_crear: 'N', puede_leer: 'S', puede_actualizar: 'N', puede_eliminar: 'N' }); setModalAbierto(true); }}
                            style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Nuevo Permiso
                        </button>
                    )}
                </div>

                {cargando ? <p>Cargando permisos...</p> : (
                    <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '12px 16px' }}>Menú</th>
                                    <th style={{ padding: '12px 16px' }}>Perfil</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Crear</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Leer</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actualizar</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Eliminar</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permisos.map(p => (
                                    <tr key={`${p.codigo_menu}-${p.codigo_perfil}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>{p.menu?.nombre_menu || p.codigo_menu}</td>
                                        <td style={{ padding: '12px 16px' }}>{p.perfil?.nombre_perfil || p.codigo_perfil}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{badge(p.puede_crear)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{badge(p.puede_leer)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{badge(p.puede_actualizar)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{badge(p.puede_eliminar)}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            {puedeActualizar && (
                                                <button onClick={() => { setEditando(p); setForm({ codigo_menu: p.codigo_menu, codigo_perfil: p.codigo_perfil, puede_crear: p.puede_crear, puede_leer: p.puede_leer, puede_actualizar: p.puede_actualizar, puede_eliminar: p.puede_eliminar }); setModalAbierto(true); }}
                                                    style={{ background: '#e0e7ff', border: 'none', color: '#4f46e5', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>
                                                    ✏️ Editar
                                                </button>
                                            )}
                                            {puedeEliminar && (
                                                <button onClick={() => eliminar(p.codigo_menu, p.codigo_perfil)}
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
                        <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '480px' }}>
                            <h3 style={{ margin: '0 0 20px' }}>{editando ? 'Editar Permiso' : 'Nuevo Permiso'}</h3>
                            <form onSubmit={guardar}>
                                {!editando && (
                                    <>
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Menú</label>
                                            <select value={form.codigo_menu} onChange={e => setForm({ ...form, codigo_menu: e.target.value })} required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <option value="">Selecciona un menú</option>
                                                {menus.map(m => <option key={m.codigo_menu} value={m.codigo_menu}>{m.nombre_menu}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Perfil</label>
                                            <select value={form.codigo_perfil} onChange={e => setForm({ ...form, codigo_perfil: e.target.value })} required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <option value="">Selecciona un perfil</option>
                                                {perfiles.map(p => <option key={p.codigo_perfil} value={p.codigo_perfil}>{p.nombre_perfil}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>Permisos</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {['puede_crear', 'puede_leer', 'puede_actualizar', 'puede_eliminar'].map(campo => (
                                            <div key={campo} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}>
                                                    {campo.replace('puede_', '')}
                                                </span>
                                                <select value={form[campo]} onChange={e => setForm({ ...form, [campo]: e.target.value })}
                                                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontWeight: 700 }}>
                                                    <option value="S">S</option>
                                                    <option value="N">N</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" onClick={() => setModalAbierto(false)}
                                        style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit"
                                        style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        {editando ? 'Actualizar' : 'Guardar'}
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