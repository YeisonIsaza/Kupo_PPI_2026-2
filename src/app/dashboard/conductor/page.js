'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import Estrellas from '@/components/Estrellas';

export default function DashboardConductor() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const router = useRouter();
    const fotoRef = useRef(null);
    const [calificacion, setCalificacion] = useState(null);
    const [ultimoViajeFinalizado, setUltimoViajeFinalizado] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [fotoPreview, setFotoPreview] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [form, setForm] = useState({
        nombre_user: '', primer_apellido: '', segundo_apellido: '',
        celular: '', nuevaContrasena: ''
    });

    useEffect(() => {
        if (listo) { cargarPerfil(); cargarCalificacion(); cargarUltimoViaje(); }
    }, [listo]);

    async function cargarCalificacion() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/pasajero/calificaciones?userId=${userId}&tipo=conductor`);
            const data = await res.json();
            setCalificacion(data);
        } catch { console.error('Error cargando calificación'); }
    }

    async function cargarUltimoViaje() {
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/viaje?userId=${userId}&estado=Finalizado`);
            const data = await res.json();
            setUltimoViajeFinalizado(data);
        } catch { console.error('Error cargando último viaje'); }
    }

    async function cargarPerfil() {
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
                setMsg('✅ Perfil actualizado');
                localStorage.setItem('userName', form.nombre_user);
            } else {
                setMsg(`${data.error}`);
            }
        } catch { setMsg('Error de conexión'); }
        finally { setLoading(false); }
    }

    function formatFecha(fecha) {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    if (!listo) return null;

    const tarjetas = [
        {
            id: 'rutas',
            titulo: 'Mis Rutas',
            descripcion: 'Crea y gestiona tus rutas semanales',
            icono: '🗺️',
            ruta: '/rutasconductor'
        },
        {
            id: 'viaje',
            titulo: 'Viaje Activo',
            descripcion: 'Ver y gestionar tu viaje en curso',
            icono: '🚗',
            ruta: '/rutasconductor/viaje'
        },
        {
            id: 'vehiculo',
            titulo: 'Mi Vehículo',
            descripcion: 'Ver información de tu vehículo registrado',
            icono: '🚙',
            ruta: '/rutasconductor/vehiculo'
        },
        {
            id: 'calificaciones',
            titulo: 'Calificaciones',
            descripcion: ultimoViajeFinalizado
                ? 'Tienes un viaje pendiente de calificar'
                : 'Sin viajes pendientes de calificar',
            icono: '⭐⭐⭐⭐⭐',
            ruta: ultimoViajeFinalizado
                ? `/rutasconductor/calificaciones?viajeId=${ultimoViajeFinalizado.id_vj}`
                : '#'
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Nunito', sans-serif" }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <div style={{ maxWidth: '960px', margin: '0 auto', padding: '36px 24px' }}>

                {/* ── Header con saludo + botón de perfil grande ── */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <p style={{ color: '#5a5e7a', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Bienvenido de vuelta
                        </p>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0d0f1a', margin: 0 }}>
                            ¡Hola, {nombre}! 👋
                        </h1>
                    </div>

                    {/* Botón de perfil grande */}
                    <button
                        onClick={() => setPerfilAbierto(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            background: 'white',
                            border: '2px solid #e2e4f0',
                            borderRadius: '16px',
                            padding: '12px 20px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 16px rgba(59,63,232,0.08)',
                            transition: 'all 0.2s',
                            minWidth: '220px'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#3b3fe8';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,63,232,0.15)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = '#e2e4f0';
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,63,232,0.08)';
                        }}
                    >
                        {/* Foto de perfil grande */}
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            border: '3px solid #e2e4f0'
                        }}>
                            {fotoPreview
                                ? <img src={fotoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '1.6rem' }}>👤</span>
                            }
                        </div>

                        {/* Nombre + estrellas */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d0f1a' }}>
                                {perfil ? `${perfil.nombre_user} ${perfil.primer_apellido}` : nombre}
                            </span>
                            {calificacion?.promedio
                                ? <Estrellas promedio={calificacion.promedio} total={calificacion.total} size="0.8rem" />
                                : <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sin calificaciones aún</span>
                            }
                            <span style={{
                                fontSize: '0.7rem',
                                background: 'rgba(59,63,232,0.1)',
                                color: '#3b3fe8',
                                padding: '2px 8px',
                                borderRadius: '99px',
                                fontWeight: 700
                            }}>
                                Ver perfil →
                            </span>
                        </div>
                    </button>
                </div>

                {/* ── Grid de tarjetas ── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                }}>
                    {tarjetas.map((t, i) => (
                        <div
                            key={t.id}
                            onClick={() => t.ruta !== '#' && router.push(t.ruta)}
                            style={{
                                background: t.ruta !== '#'
                                    ? 'linear-gradient(135deg, #3b3fe8 0%, #5a5ef5 100%)'
                                    : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                                borderRadius: '20px',
                                padding: '32px 28px',
                                cursor: t.ruta !== '#' ? 'pointer' : 'default',
                                color: '#fff',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: t.ruta !== '#'
                                    ? '0 8px 32px rgba(59,63,232,0.25)'
                                    : '0 4px 16px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: t.ruta === '#' ? 0.7 : 1,
                                animationDelay: `${i * 0.08}s`
                            }}
                            onMouseEnter={e => {
                                if (t.ruta !== '#') {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(59,63,232,0.35)';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = t.ruta !== '#'
                                    ? '0 8px 32px rgba(59,63,232,0.25)'
                                    : '0 4px 16px rgba(0,0,0,0.1)';
                            }}
                        >
                            {/* Círculo decorativo de fondo */}
                            <div style={{
                                position: 'absolute',
                                top: '-30px',
                                right: '-30px',
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                pointerEvents: 'none'
                            }} />

                            <div style={{ fontSize: '2.4rem', marginBottom: '14px' }}>{t.icono}</div>
                            <h2 style={{
                                margin: '0 0 8px',
                                fontSize: '1.25rem',
                                fontWeight: 900,
                                color: '#fff',
                                letterSpacing: '0.5px'
                            }}>
                                {t.titulo}
                            </h2>
                            <p style={{
                                margin: '0 0 20px',
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '0.88rem',
                                lineHeight: 1.5,
                                fontWeight: 600
                            }}>
                                {t.descripcion}
                            </p>

                            {t.ruta !== '#' ? (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '1.5px solid rgba(255,255,255,0.4)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '0.82rem',
                                    padding: '8px 18px',
                                    borderRadius: '99px',
                                    letterSpacing: '0.5px'
                                }}>
                                    Ir ahora →
                                </div>
                            ) : (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1.5px solid rgba(255,255,255,0.2)',
                                    color: 'rgba(255,255,255,0.6)',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    padding: '8px 18px',
                                    borderRadius: '99px'
                                }}>
                                    Sin pendientes
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Overlay del panel de perfil ── */}
            {perfilAbierto && (
                <div
                    onClick={() => setPerfilAbierto(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0,
                        width: '100%', height: '100%',
                        background: 'rgba(13,15,26,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 200
                    }}
                />
            )}

            {/* ── Panel deslizante de perfil ── */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: perfilAbierto ? 0 : '-440px',
                width: '420px',
                height: '100vh',
                background: 'white',
                boxShadow: '-8px 0 40px rgba(13,15,26,0.15)',
                zIndex: 300,
                transition: 'right 0.3s ease',
                overflowY: 'auto',
                padding: '28px'
            }}>
                {/* Header del panel */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 900, color: '#0d0f1a' }}>Mi Perfil</h2>
                    <button
                        onClick={() => setPerfilAbierto(false)}
                        style={{
                            background: '#f0f2f8',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            color: '#5a5e7a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Mensaje de estado */}
                {msg && (
                    <div style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: msg.includes('✅') ? '#dcfce7' : '#fee2e2',
                        color: msg.includes('✅') ? '#16a34a' : '#dc2626',
                        border: `1px solid ${msg.includes('✅') ? '#86efac' : '#fca5a5'}`
                    }}>
                        {msg}
                    </div>
                )}

                {/* Foto + nombre + estrellas */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: '24px',
                    paddingBottom: '20px',
                    borderBottom: '1.5px solid #f0f2f8'
                }}>
                    <div style={{ position: 'relative', marginBottom: '14px' }}>
                        <div
                            onClick={() => editando && fotoRef.current?.click()}
                            style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid #3b3fe8',
                                cursor: editando ? 'pointer' : 'default',
                                background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {fotoPreview
                                ? <img src={fotoPreview} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '3rem' }}>👤</span>
                            }
                        </div>
                        {editando && (
                            <button
                                type="button"
                                onClick={() => fotoRef.current?.click()}
                                style={{
                                    position: 'absolute', bottom: 2, right: 2,
                                    background: '#3b3fe8', color: 'white',
                                    border: '2px solid white', borderRadius: '50%',
                                    width: '28px', height: '28px',
                                    cursor: 'pointer', fontSize: '0.75rem',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                ✏️
                            </button>
                        )}
                        <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
                    </div>

                    <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 900, color: '#0d0f1a', textAlign: 'center' }}>
                        {perfil ? `${perfil.nombre_user} ${perfil.primer_apellido}` : nombre}
                    </h3>

                    {calificacion && (
                        <div style={{ marginBottom: '8px' }}>
                            <Estrellas promedio={calificacion.promedio} total={calificacion.total} />
                        </div>
                    )}

                    {perfil && (
                        <span style={{
                            fontSize: '0.75rem',
                            background: 'rgba(59,63,232,0.1)',
                            color: '#3b3fe8',
                            padding: '4px 14px',
                            borderRadius: '99px',
                            fontWeight: 800,
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                        }}>
                            {perfil.rol}
                        </span>
                    )}
                </div>

                {/* Datos fijos */}
                {perfil && (
                    <div style={{ marginBottom: '20px' }}>
                        {[
                            { label: '🪪 Documento',   value: perfil.documento_identidad },
                            { label: '📧 Correo',      value: perfil.correo_personal_user },
                            { label: '🎂 Nacimiento',  value: formatFecha(perfil.fecha_nacimiento_user) },
                        ].map(item => (
                            <div key={item.label} style={{
                                display: 'flex', justifyContent: 'space-between',
                                padding: '10px 0', borderBottom: '1px solid #f0f2f8'
                            }}>
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>{item.label}</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5a5e7a' }}>{item.value || '—'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Datos editables o formulario */}
                {!editando ? (
                    <>
                        {perfil && (
                            <div style={{ marginBottom: '20px' }}>
                                {[
                                    { label: '👤 Nombre',           value: perfil.nombre_user },
                                    { label: '👤 Primer Apellido',  value: perfil.primer_apellido },
                                    { label: '👤 Segundo Apellido', value: perfil.segundo_apellido },
                                    { label: '📱 Celular',          value: perfil.celular },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        padding: '10px 0', borderBottom: '1px solid #f0f2f8'
                                    }}>
                                        <span style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>{item.label}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0d0f1a' }}>{item.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setEditando(true)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 16px rgba(59,63,232,0.3)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,63,232,0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,63,232,0.3)';
                            }}
                        >
                            ✏️ Editar Perfil
                        </button>
                    </>
                ) : (
                    <form onSubmit={guardarCambios}>
                        {[
                            { label: 'Nombre',           key: 'nombre_user',      placeholder: 'Tu nombre' },
                            { label: 'Primer Apellido',  key: 'primer_apellido',  placeholder: 'Primer apellido' },
                            { label: 'Segundo Apellido', key: 'segundo_apellido', placeholder: 'Segundo apellido' },
                            { label: 'Celular',          key: 'celular',          placeholder: 'Ej: 300 123 4567' },
                        ].map(field => (
                            <div key={field.key} style={{ marginBottom: '12px' }}>
                                <label style={{
                                    display: 'block', marginBottom: '4px',
                                    fontSize: '0.75rem', fontWeight: 700,
                                    color: '#5a5e7a', textTransform: 'uppercase', letterSpacing: '0.5px'
                                }}>
                                    {field.label}
                                </label>
                                <input
                                    type="text"
                                    value={form[field.key]}
                                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                    placeholder={field.placeholder}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e4f0',
                                        fontFamily: "'Nunito', sans-serif",
                                        fontSize: '0.9rem', fontWeight: 600,
                                        outline: 'none', boxSizing: 'border-box',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#3b3fe8'}
                                    onBlur={e => e.target.style.borderColor = '#e2e4f0'}
                                />
                            </div>
                        ))}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block', marginBottom: '4px',
                                fontSize: '0.75rem', fontWeight: 700,
                                color: '#5a5e7a', textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={form.nuevaContrasena}
                                onChange={e => setForm({ ...form, nuevaContrasena: e.target.value })}
                                placeholder="Dejar vacío para no cambiar"
                                style={{
                                    width: '100%', padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #e2e4f0',
                                    fontFamily: "'Nunito', sans-serif",
                                    fontSize: '0.9rem', fontWeight: 600,
                                    outline: 'none', boxSizing: 'border-box'
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b3fe8'}
                                onBlur={e => e.target.style.borderColor = '#e2e4f0'}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                onClick={() => { setEditando(false); setMsg(''); setFotoPreview(perfil?.foto_perf); }}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: '#f0f2f8', color: '#5a5e7a',
                                    border: '1.5px solid #e2e4f0',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: 700, fontSize: '0.88rem'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1, padding: '12px',
                                    background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                                    color: 'white', border: 'none',
                                    borderRadius: '10px', cursor: 'pointer',
                                    fontWeight: 800, fontSize: '0.88rem',
                                    boxShadow: '0 4px 14px rgba(59,63,232,0.3)',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}