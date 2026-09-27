'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';

export default function PerfilConductorPage() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const router = useRouter();
    const fotoRef = useRef(null);

    const [perfil, setPerfil] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState(null);

    const [form, setForm] = useState({
        nombre_user: '', primer_apellido: '', segundo_apellido: '',
        celular: '', nuevaContrasena: ''
    });

    useEffect(() => {
        if (listo) cargarPerfil();
    }, [listo]);

    async function cargarPerfil() {
        setCargando(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/perfil?userId=${userId}`);
            const data = await res.json();
            setPerfil(data);
            setFotoPreview(data.foto_perf || null);
            setForm({
                nombre_user:      data.nombre_user      || '',
                primer_apellido:  data.primer_apellido  || '',
                segundo_apellido: data.segundo_apellido || '',
                celular:          data.celular          || '',
                nuevaContrasena:  ''
            });
        } catch { console.error('Error cargando perfil'); }
        finally { setCargando(false); }
    }

    function handleFotoChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setFotoPerfil(file);
        setFotoPreview(URL.createObjectURL(file));
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function guardarCambios(e) {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const userId = localStorage.getItem('userId');
            let fotoBase64 = null;
            if (fotoPerfil) fotoBase64 = await fileToBase64(fotoPerfil);

            const res = await fetch(`/api/conductor/perfil?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, fotoPerfil: fotoBase64 })
            });
            const data = await res.json();
            if (res.ok) {
                setEditando(false);
                setFotoPerfil(null);
                cargarPerfil();
                setMsg('✅ Perfil actualizado correctamente');
                // Actualizar nombre en localStorage
                localStorage.setItem('userName', form.nombre_user);
            } else {
                setMsg(`❌ ${data.error}`);
            }
        } catch { setMsg('❌ Error de conexión'); }
        finally { setLoading(false); }
    }

    function formatFecha(fecha) {
        if (!fecha) return '—';
        const d = new Date(fecha);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (!listo) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <div style={{ padding: '40px', maxWidth: '650px', margin: '0 auto' }}>
                <button onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '16px', fontSize: '0.85rem' }}>
                    ← Volver
                </button>
                <h1 style={{ margin: '0 0 24px', color: '#1e293b' }}>Mi Perfil</h1>

                {msg && (
                    <div style={{
                        padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem',
                        background: msg.includes('✅') ? '#dcfce7' : '#fee2e2',
                        color: msg.includes('✅') ? '#16a34a' : '#dc2626'
                    }}>
                        {msg}
                    </div>
                )}

                {cargando ? <p>Cargando...</p> : !perfil ? (
                    <p style={{ color: '#64748b' }}>No se encontró el perfil.</p>
                ) : (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

                        {/* Foto y nombre */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ position: 'relative' }}>
                                <div onClick={() => editando && fotoRef.current?.click()}
                                    style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #e2e8f0', cursor: editando ? 'pointer' : 'default', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {fotoPreview
                                        ? <img src={fotoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <span style={{ fontSize: '2rem' }}>👤</span>
                                    }
                                </div>
                                {editando && (
                                    <button type="button" onClick={() => fotoRef.current?.click()}
                                        style={{ position: 'absolute', bottom: 0, right: 0, background: '#4f46e5', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.7rem' }}>
                                        ✏️
                                    </button>
                                )}
                                <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ margin: '0 0 4px', color: '#1e293b' }}>
                                    {perfil.nombre_user} {perfil.primer_apellido} {perfil.segundo_apellido}
                                </h2>

                                {/* Mostrar calificación solo para conductores */}
                                {calificacion && (
                                    <div style={{ marginTop: '4px' }}>
                                        <Estrellas promedio={calificacion.promedio} total={calificacion.total} />
                                    </div>
                                )}

                                
                                <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#4f46e5', padding: '2px 10px', borderRadius: '99px', fontWeight: 600 }}>
                                    {perfil.rol}
                                </span>
                            </div>
                            {!editando && (
                                <button onClick={() => setEditando(true)}
                                    style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                                    ✏️ Editar
                                </button>
                            )}
                        </div>

                        {/* Datos no editables */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: '🪪 Documento',       value: perfil.documento_identidad },
                                { label: '📧 Correo',          value: perfil.correo_personal_user },
                                { label: '🎂 Fecha Nacimiento', value: formatFecha(perfil.fecha_nacimiento_user) },
                                { label: '🏷️ Perfil',         value: perfil.perfil },
                            ].map(item => (
                                <div key={item.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>{item.label}</div>
                                    <div style={{ fontWeight: 600, color: '#64748b', fontSize: '0.9rem' }}>{item.value || '—'}</div>
                                </div>
                            ))}
                        </div>

                        {/* Vista o Edición */}
                        {!editando ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {[
                                    { label: '👤 Nombre',         value: perfil.nombre_user },
                                    { label: '👤 Primer Apellido', value: perfil.primer_apellido },
                                    { label: '👤 Segundo Apellido', value: perfil.segundo_apellido },
                                    { label: '📱 Celular',         value: perfil.celular },
                                ].map(item => (
                                    <div key={item.label} style={{ background: '#f0f9ff', borderRadius: '10px', padding: '12px', border: '1px solid #bae6fd' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>{item.label}</div>
                                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{item.value || '—'}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={guardarCambios}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    {[
                                        { label: 'Nombre',          key: 'nombre_user',      placeholder: 'Tu nombre' },
                                        { label: 'Primer Apellido', key: 'primer_apellido',  placeholder: 'Primer apellido' },
                                        { label: 'Segundo Apellido', key: 'segundo_apellido', placeholder: 'Segundo apellido' },
                                        { label: 'Celular',         key: 'celular',          placeholder: 'Ej: 300 123 4567' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                                                {field.label}
                                            </label>
                                            <input type="text" value={form[field.key]}
                                                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                                placeholder={field.placeholder}
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                        </div>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                                        Nueva Contraseña (dejar vacío para no cambiar)
                                    </label>
                                    <input type="password" value={form.nuevaContrasena}
                                        onChange={e => setForm({ ...form, nuevaContrasena: e.target.value })}
                                        placeholder="Nueva contraseña"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    <button type="button" onClick={() => { setEditando(false); setMsg(''); setFotoPreview(perfil.foto_perf); }}
                                        style={{ padding: '10px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={loading}
                                        style={{ padding: '10px 16px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}