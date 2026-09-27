'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import usePermisos from '@/lib/usePermisos';
import SinPermiso from '@/components/SinPermiso';

export default function VehiculoPage() {
    const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
    const { puedeLeer, puedeActualizar, cargando: cargandoPermisos } = usePermisos();
    const router = useRouter();
    const fotoVehRef = useRef(null);

    const [vehiculo, setVehiculo] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [editando, setEditando] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [fotoVehPreview, setFotoVehPreview] = useState(null);
    const [fotoVehFile, setFotoVehFile] = useState(null);
    const [form, setForm] = useState({
        marca_veh: '', modelo_veh: '', color_veh: '',
        anno_creacion_veh: '', numero_soat_veh: '', total_cupos_veh: ''
    });

    useEffect(() => {
        if (listo) cargarVehiculo();
    }, [listo]);

    async function cargarVehiculo() {
        setCargando(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await fetch(`/api/conductor/vehiculo?userId=${userId}`);
            const data = await res.json();
            setVehiculo(data);
            if (data) {
                setFotoVehPreview(data.foto_veh || null);
                setForm({
                    marca_veh:         data.marca_veh         || '',
                    modelo_veh:        data.modelo_veh        || '',
                    color_veh:         data.color_veh         || '',
                    anno_creacion_veh: data.anno_creacion_veh || '',
                    numero_soat_veh:   data.numero_soat_veh   || '',
                    total_cupos_veh:   data.total_cupos_veh   || ''
                });
            }
        } catch { console.error('Error cargando vehículo'); }
        finally { setCargando(false); }
    }

    function handleFotoVehChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setFotoVehFile(file);
        setFotoVehPreview(URL.createObjectURL(file));
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
        e?.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            const userId = localStorage.getItem('userId');
            let fotoBase64 = null;
            if (fotoVehFile) fotoBase64 = await fileToBase64(fotoVehFile);
            const res = await fetch(`/api/conductor/vehiculo?userId=${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    anno_creacion_veh: Number(form.anno_creacion_veh),
                    total_cupos_veh:   Number(form.total_cupos_veh),
                    fotoVeh: fotoBase64
                })
            });
            const data = await res.json();
            if (res.ok) {
                setEditando(false);
                setFotoVehFile(null);
                cargarVehiculo();
                setMsg('✅ Vehículo actualizado correctamente');
            } else {
                setMsg(`❌ ${data.error}`);
            }
        } catch { setMsg('❌ Error de conexión'); }
        finally { setLoading(false); }
    }

    if (!listo || cargandoPermisos) return null;

    if (!puedeLeer) return (
        <div style={{ minHeight: '100vh', background: '#f0f2f8' }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Nunito', sans-serif" }}>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '36px 24px' }}>

                {/* ── Volver ── */}
                <button onClick={() => router.back()} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#5a5e7a', marginBottom: '20px',
                    fontSize: '0.85rem', fontWeight: 900,
                    display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    ← Volver
                </button>

                {/* ── Título ── */}
                <div style={{ marginBottom: '28px' }}>
                    <p style={{
                        color: '#3b3fe8', fontWeight: 700, fontSize: '0.8rem',
                        letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 4px'
                    }}>
                        Panel de control
                    </p>
                    <h1 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '2.8rem', letterSpacing: '3px',
                        color: '#0d0f1a', margin: 0
                    }}>
                        MI VEHÍCULO
                    </h1>
                </div>

                {/* ── Mensaje ── */}
                {msg && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px',
                        marginBottom: '20px', fontSize: '0.85rem', fontWeight: 700,
                        background: msg.includes('✅') ? '#dcfce7' : '#fee2e2',
                        color: msg.includes('✅') ? '#16a34a' : '#dc2626',
                        border: `1px solid ${msg.includes('✅') ? '#86efac' : '#fca5a5'}`
                    }}>
                        {msg}
                    </div>
                )}

                {cargando ? (
                    <p style={{ color: '#5a5e7a', textAlign: 'center', padding: '60px 0' }}>Cargando...</p>
                ) : !vehiculo ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 40px',
                        background: '#fff',
                        border: '1.5px solid #e2e4f0',
                        borderRadius: '24px',
                        boxShadow: '0 4px 24px rgba(59,63,232,0.06)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}></div>
                        <p style={{ color: '#5a5e7a', fontSize: '1rem', fontWeight: 600 }}>
                            No tienes vehículo registrado
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* ════════════════════════════════════
                            SECCIÓN SUPERIOR — Información
                        ════════════════════════════════════ */}
                        <div style={{
                            background: '#fff',
                            border: '1.5px solid #e2e4f0',
                            borderRadius: '24px 24px 0 0',
                            padding: '32px',
                            boxShadow: '0 4px 24px rgba(59,63,232,0.06)'
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', marginBottom: '28px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '52px', height: '52px', borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '1.6rem',
                                        boxShadow: '0 4px 16px rgba(59,63,232,0.25)'
                                    }}>
                                        🚗
                                    </div>
                                    <div>
                                        <h2 style={{
                                            margin: 0, color: '#0d0f1a',
                                            fontSize: '1.5rem', fontWeight: 900
                                        }}>
                                            {vehiculo.marca_veh} {vehiculo.modelo_veh}
                                        </h2>
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 700,
                                            background: '#dcfce7', color: '#16a34a',
                                            border: '1px solid #86efac',
                                            padding: '2px 10px', borderRadius: '99px'
                                        }}>
                                            {vehiculo.estado?.nombre_estado || 'Activo'}
                                        </span>
                                    </div>
                                </div>

                                {!editando && puedeActualizar && (
                                    <button onClick={() => setEditando(true)} style={{
                                        background: 'rgba(59,63,232,0.08)',
                                        border: '1.5px solid rgba(59,63,232,0.2)',
                                        color: '#3b3fe8', padding: '10px 20px',
                                        borderRadius: '10px', cursor: 'pointer',
                                        fontWeight: 700, fontSize: '1.1rem',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = 'rgba(59,63,232,0.15)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = 'rgba(59,63,232,0.08)';
                                    }}>
                                        Editar
                                    </button>
                                )}
                            </div>

                            {/* ── Vista de datos ── */}
                            {!editando ? (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '14px'
                                }}>
                                    {[
                                        { label: 'PLACA',   value: vehiculo.placa_veh,                    /*icon: '🪪'*/ },
                                        { label: 'COLOR',   value: vehiculo.color_veh,                    /*icon: '🎨' */},
                                        { label: 'AÑO',     value: vehiculo.anno_creacion_veh,            /*icon: '📅' */},
                                        { label: 'CUPOS',   value: `${vehiculo.total_cupos_veh} cupos`,   /*icon: '💺' */},
                                        { label: 'SOAT',    value: vehiculo.numero_soat_veh,              /*icon: '🛡️' */},
                                        { label: 'MODELO',  value: vehiculo.modelo_veh,                   /*icon: '🏷️'*/  },
                                    ].map(item => (
                                        <div key={item.label} style={{
                                            background: '#f5f6fb',
                                            border: '1.5px solid #e2e4f0',
                                            borderRadius: '14px',
                                            padding: '18px 16px',
                                            transition: 'border-color 0.2s, box-shadow 0.2s'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#3b3fe8';
                                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,63,232,0.1)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#e2e4f0';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}>
                                            <div style={{
                                                fontSize: '1rem', fontWeight: 800,
                                                color: '#3b3fe8', letterSpacing: '2px',
                                                marginBottom: '8px'
                                            }}>
                                                {item.icon} {item.label}
                                            </div>
                                            <div style={{
                                                fontSize: '1.15rem', fontWeight: 900,
                                                color: '#0d0f1a'
                                            }}>
                                                {item.value || '—'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                puedeActualizar ? (
                                    <form onSubmit={guardarCambios}>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(2, 1fr)',
                                            gap: '14px', marginBottom: '20px'
                                        }}>
                                            {[
                                                { label: 'Marca',  key: 'marca_veh',         type: 'text',   placeholder: 'Ej: Renault' },
                                                { label: 'Modelo', key: 'modelo_veh',        type: 'text',   placeholder: 'Ej: Sandero' },
                                                { label: 'Color',  key: 'color_veh',         type: 'text',   placeholder: 'Ej: Gris' },
                                                { label: 'Año',    key: 'anno_creacion_veh', type: 'number', placeholder: 'Ej: 2020' },
                                                { label: 'SOAT',   key: 'numero_soat_veh',   type: 'text',   placeholder: 'Número SOAT' },
                                                { label: 'Cupos',  key: 'total_cupos_veh',   type: 'number', placeholder: 'Ej: 4' },
                                            ].map(field => (
                                                <div key={field.key}>
                                                    <label style={{
                                                        display: 'block', marginBottom: '6px',
                                                        fontSize: '0.72rem', fontWeight: 800,
                                                        color: '#3b3fe8', letterSpacing: '1.5px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        value={form[field.key]}
                                                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                                        placeholder={field.placeholder}
                                                        style={{
                                                            width: '100%', padding: '11px 14px',
                                                            borderRadius: '10px',
                                                            border: '1.5px solid #e2e4f0',
                                                            background: '#fff',
                                                            color: '#0d0f1a',
                                                            fontFamily: "'Nunito', sans-serif",
                                                            fontSize: '0.9rem', fontWeight: 600,
                                                            outline: 'none', boxSizing: 'border-box'
                                                        }}
                                                        onFocus={e => e.target.style.borderColor = '#3b3fe8'}
                                                        onBlur={e => e.target.style.borderColor = '#e2e4f0'}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button type="button"
                                                onClick={() => { setEditando(false); setMsg(''); }}
                                                style={{
                                                    padding: '11px 20px',
                                                    background: '#f0f2f8',
                                                    border: '1.5px solid #e2e4f0',
                                                    color: '#5a5e7a', borderRadius: '10px',
                                                    cursor: 'pointer', fontWeight: 700
                                                }}>
                                                Cancelar
                                            </button>
                                            <button type="submit" disabled={loading} style={{
                                                padding: '11px 24px',
                                                background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                                                color: '#fff', border: 'none',
                                                borderRadius: '10px', cursor: 'pointer',
                                                fontWeight: 800,
                                                boxShadow: '0 4px 16px rgba(59,63,232,0.3)',
                                                opacity: loading ? 0.7 : 1
                                            }}>
                                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                        No tienes permiso para editar el vehículo.
                                    </p>
                                )
                            )}
                        </div>

                        {/* ════════════════════════════════════
                            SECCIÓN INFERIOR — Foto del vehículo
                        ════════════════════════════════════ */}
                        <div style={{
                            background: 'linear-gradient(135deg, #3b3fe8 0%, #5a5ef5 100%)',
                            border: '1.5px solid #3b3fe8',
                            borderTop: 'none',
                            borderRadius: '0 0 24px 24px',
                            padding: '36px 32px',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '260px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {/* Círculos decorativos */}
                            <div style={{
                                position: 'absolute', top: '-60px', right: '-60px',
                                width: '250px', height: '250px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.06)',
                                pointerEvents: 'none'
                            }} />
                            <div style={{
                                position: 'absolute', bottom: '-40px', left: '-40px',
                                width: '180px', height: '180px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.04)',
                                pointerEvents: 'none'
                            }} />

                            {/* Label */}
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.75rem', fontWeight: 800,
                                letterSpacing: '3px', textTransform: 'uppercase',
                                marginBottom: '16px', position: 'relative', zIndex: 1
                            }}>
                                Foto del vehículo
                            </p>

                            {/* Foto */}
                            {fotoVehPreview ? (
                                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                    <img
                                        src={fotoVehPreview}
                                        alt="Foto del vehículo"
                                        style={{
                                            maxWidth: '460px', width: '100%',
                                            maxHeight: '180px', objectFit: 'contain',
                                            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
                                            borderRadius: '12px'
                                        }}
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    position: 'relative', zIndex: 1,
                                    textAlign: 'center', padding: '20px'
                                }}>
                                    <div style={{ fontSize: '5rem', marginBottom: '8px', opacity: 0.4 }}>🚗</div>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 600 }}>
                                        Sin foto del vehículo
                                    </p>
                                </div>
                            )}

                            {/* Botones foto */}
                            {puedeActualizar && (
                                <div style={{ position: 'relative', zIndex: 1, marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <input
                                        ref={fotoVehRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleFotoVehChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fotoVehRef.current?.click()}
                                        style={{
                                            background: 'rgba(255,255,255,0.15)',
                                            border: '1.5px solid rgba(255,255,255,0.4)',
                                            color: '#fff', padding: '9px 20px',
                                            borderRadius: '99px', cursor: 'pointer',
                                            fontWeight: 700, fontSize: '0.82rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                                    >
                                        {fotoVehPreview ? '📷 Cambiar foto' : '📷 Subir foto'}
                                    </button>

                                    {fotoVehFile && (
                                        <button
                                            type="button"
                                            onClick={guardarCambios}
                                            disabled={loading}
                                            style={{
                                                background: '#fff',
                                                border: 'none', color: '#3b3fe8',
                                                padding: '9px 20px', borderRadius: '99px',
                                                cursor: 'pointer', fontWeight: 800,
                                                fontSize: '0.82rem',
                                                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                                            }}
                                        >
                                            {loading ? 'Guardando...' : '💾 Guardar foto'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}