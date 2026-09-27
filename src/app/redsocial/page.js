'use client';
import { useState } from 'react';
import Link from 'next/link';

const testimonios = [
    {
        id: 1,
        tipo: 'conductor',
        nombre: 'Carlos M.',
        universidad: 'Universidad de Antioquia',
        avatar: 'C',
        tiempo: 'hace 2 días',
        texto: 'Llevo 3 meses como conductor en FastDrive y ya he ayudado a más de 40 estudiantes a llegar a tiempo. Los aportes me ayudan a cubrir la gasolina y de paso hago amigos en cada ruta. 100% recomendado.',
        likes: 24,
        ruta: 'Aranjuez → UdeA',
        rating: 5
    },
    {
        id: 2,
        tipo: 'pasajero',
        nombre: 'Sara L.',
        universidad: 'Universidad Nacional',
        avatar: 'S',
        tiempo: 'hace 5 días',
        texto: 'Antes gastaba casi $15.000 en transporte cada día. Con FastDrive bajo a $3.500 y llego más rápido. El conductor siempre puntual y el chat para coordinar es súper fácil.',
        likes: 31,
        ruta: 'Laureles → UNAL',
        rating: 5
    },
    {
        id: 3,
        tipo: 'conductor',
        nombre: 'Luis R.',
        universidad: 'EAFIT',
        avatar: 'L',
        tiempo: 'hace 1 semana',
        texto: 'Al principio dudé en publicar mi ruta pero la plataforma es muy segura. Todos son estudiantes verificados. Ya tengo pasajeros fijos y el viaje se me hace más corto con buena compañía.',
        likes: 18,
        ruta: 'El Poblado → EAFIT',
        rating: 4
    },
    {
        id: 4,
        tipo: 'pasajero',
        nombre: 'Ana G.',
        universidad: 'UPB',
        avatar: 'A',
        tiempo: 'hace 3 días',
        texto: 'Me da mucha tranquilidad saber que el conductor es también estudiante. Compartimos horarios, entendemos las urgencias de los parciales. Es diferente a un taxi normal.',
        likes: 42,
        ruta: 'Robledo → UPB',
        rating: 5
    },
    {
        id: 5,
        tipo: 'conductor',
        nombre: 'Miguel T.',
        universidad: 'ITM',
        avatar: 'M',
        tiempo: 'hace 4 días',
        texto: 'Publiqué mi primera ruta el lunes y ya tenía 3 pasajeros el martes. La app es intuitiva y el proceso de verificación me generó confianza en los pasajeros desde el primer día.',
        likes: 15,
        ruta: 'Castilla → ITM',
        rating: 5
    },
    {
        id: 6,
        tipo: 'pasajero',
        nombre: 'Valentina O.',
        universidad: 'Universidad de Antioquia',
        avatar: 'V',
        tiempo: 'hace 6 días',
        texto: 'Gracias a FastDrive conocí a tres compañeras que van a la misma carrera. Ahora estudiamos juntas en el carro. Esto no es solo transporte, es comunidad.',
        likes: 56,
        ruta: 'Itagüí → UdeA',
        rating: 5
    },
];

const stats = [
    { numero: '1.200+', label: 'Usuarios registrados' },
    { numero: '340+',   label: 'Publicaciones' },
    { numero: '4.8',    label: 'Calificación promedio' },
    { numero: '8',     label: 'Universidades' },
];

export default function RedSocialPage() {
    const [filtro, setFiltro] = useState('todos');
    const [likeDados, setLikeDados] = useState({});

    const testimoniosFiltrados = filtro === 'todos'
        ? testimonios
        : testimonios.filter(t => t.tipo === filtro);

    function toggleLike(id) {
        setLikeDados(prev => ({ ...prev, [id]: !prev[id] }));
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f8', fontFamily: "'Nunito', sans-serif" }}>

            {/* ── Navbar simple ── */}
            <nav style={{
                background: '#1e1b4b', padding: '0 40px', height: '72px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100,
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '1.6rem', color: '#fff', letterSpacing: '2px'
                    }}>
                        FastDrive
                    </span>
                    <span style={{
                        fontSize: '0.72rem', fontWeight: 800,
                        background: 'rgba(90,94,245,0.3)',
                        border: '1px solid rgba(90,94,245,0.5)',
                        color: '#a5b4fc', padding: '3px 10px',
                        borderRadius: '99px', letterSpacing: '1px'
                    }}>
                        COMUNIDAD
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                    {[
                        { label: 'Inicio',      href: '/' },
                        { label: 'Nuestra Red social', href: '/redsocial' },   
                        { label: 'Contacto',    href: '/contactanos' },
                    ].map(item => (
                        <Link key={item.href} href={item.href} style={{
                            color: '#a5b4fc', textDecoration: 'none',
                            fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px'
                        }}>
                            {item.label}
                        </Link>
                    ))}
                </div>
                <Link href="/login" style={{
                    background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                    color: '#fff', textDecoration: 'none',
                    padding: '10px 22px', borderRadius: '10px',
                    fontWeight: 800, fontSize: '0.88rem',
                    boxShadow: '0 4px 14px rgba(59,63,232,0.35)'
                }}>
                    Únete →
                </Link>
            </nav>

            {/* ── Hero ── */}
            <section style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #2d2a6e 50%, #3b3fe8 100%)',
                padding: '80px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Círculos decorativos */}
                <div style={{
                    position: 'absolute', top: '-80px', left: '-80px',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-60px', right: '-60px',
                    width: '300px', height: '300px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)', pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#a5b4fc', padding: '6px 18px',
                        borderRadius: '99px', fontSize: '0.78rem',
                        fontWeight: 800, letterSpacing: '1px',
                        marginBottom: '28px'
                    }}>
                        🎓 RED DE ESTUDIANTES MEDELLÍN
                    </div>

                    <h1 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(3rem, 7vw, 5rem)',
                        color: '#fff', lineHeight: 1.05,
                        letterSpacing: '2px', margin: '0 0 20px'
                    }}>
                        MÁS QUE TRANSPORTE,<br />
                        <span style={{ color: '#818cf8' }}>UNA COMUNIDAD</span>
                    </h1>

                    <p style={{
                        color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem',
                        lineHeight: 1.7, margin: '0 0 36px', fontWeight: 600
                    }}>
                        Conductores y pasajeros estudiantes de Medellín compartiendo rutas,
                        experiencias y llegando juntos a la universidad.
                    </p>

                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/registro" style={{
                            background: '#fff', color: '#3b3fe8',
                            textDecoration: 'none', padding: '14px 32px',
                            borderRadius: '12px', fontWeight: 900,
                            fontSize: '0.95rem', letterSpacing: '0.5px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s'
                        }}>
                            🚗 Soy conductor
                        </Link>
                        <Link href="/registro" style={{
                            background: 'rgba(255,255,255,0.12)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            color: '#fff', textDecoration: 'none',
                            padding: '14px 32px', borderRadius: '12px',
                            fontWeight: 900, fontSize: '0.95rem',
                            letterSpacing: '0.5px'
                        }}>
                            🎒 Soy pasajero
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stats ── */}
            <section style={{
                background: '#fff',
                padding: '48px 40px',
                borderBottom: '1px solid #e2e4f0'
            }}>
                <div style={{
                    maxWidth: '900px', margin: '0 auto',
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '24px', textAlign: 'center'
                }}>
                    {stats.map((s, i) => (
                        <div key={i}>
                            <div style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: '3rem', color: '#3b3fe8',
                                letterSpacing: '1px', lineHeight: 1
                            }}>
                                {s.numero}
                            </div>
                            <div style={{
                                fontSize: '0.85rem', fontWeight: 700,
                                color: '#5a5e7a', marginTop: '6px',
                                textTransform: 'uppercase', letterSpacing: '1px'
                            }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Testimonios ── */}
            <section style={{ padding: '64px 40px', maxWidth: '1100px', margin: '0 auto' }}>

                {/* Título */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <p style={{
                        color: '#3b3fe8', fontWeight: 800, fontSize: '0.8rem',
                        letterSpacing: '3px', textTransform: 'uppercase', margin: '0 0 8px'
                    }}>
                        Lo que dice la comunidad
                    </p>
                    <h2 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                        color: '#0d0f1a', letterSpacing: '2px', margin: '0 0 24px'
                    }}>
                        EXPERIENCIAS REALES
                    </h2>

                    {/* Filtros */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {[
                            { key: 'todos',     label: '🌐 Todos' },
                            { key: 'conductor', label: '🚗 Conductores' },
                            { key: 'pasajero',  label: '🎒 Pasajeros' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFiltro(f.key)}
                                style={{
                                    padding: '9px 22px',
                                    borderRadius: '99px',
                                    border: filtro === f.key
                                        ? 'none'
                                        : '1.5px solid #e2e4f0',
                                    background: filtro === f.key
                                        ? 'linear-gradient(135deg, #3b3fe8, #5a5ef5)'
                                        : '#fff',
                                    color: filtro === f.key ? '#fff' : '#5a5e7a',
                                    fontWeight: 700, fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    boxShadow: filtro === f.key
                                        ? '0 4px 14px rgba(59,63,232,0.3)'
                                        : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                }}>
                    {testimoniosFiltrados.map(t => (
                        <div
                            key={t.id}
                            style={{
                                background: '#fff',
                                border: '1.5px solid #e2e4f0',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 4px 16px rgba(59,63,232,0.06)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,63,232,0.12)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,63,232,0.06)';
                            }}
                        >
                            {/* Badge tipo */}
                            <span style={{
                                position: 'absolute', top: '20px', right: '20px',
                                fontSize: '0.7rem', fontWeight: 800,
                                padding: '3px 10px', borderRadius: '99px',
                                letterSpacing: '1px', textTransform: 'uppercase',
                                background: t.tipo === 'conductor'
                                    ? 'rgba(59,63,232,0.1)' : 'rgba(34,197,94,0.1)',
                                color: t.tipo === 'conductor' ? '#3b3fe8' : '#16a34a',
                                border: `1px solid ${t.tipo === 'conductor' ? 'rgba(59,63,232,0.2)' : 'rgba(34,197,94,0.2)'}`
                            }}>
                                {t.tipo === 'conductor' ? '🚗 Conductor' : '🎒 Pasajero'}
                            </span>

                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: t.tipo === 'conductor'
                                        ? 'linear-gradient(135deg, #3b3fe8, #5a5ef5)'
                                        : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: "'Bebas Neue', sans-serif",
                                    fontSize: '1.3rem', color: '#fff', flexShrink: 0
                                }}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0d0f1a' }}>
                                        {t.nombre}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#5a5e7a', fontWeight: 600 }}>
                                        {t.universidad}
                                    </div>
                                </div>
                            </div>

                            {/* Estrellas */}
                            <div style={{ marginBottom: '12px' }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} style={{
                                        color: i < t.rating ? '#f59e0b' : '#e2e4f0',
                                        fontSize: '0.9rem'
                                    }}>★</span>
                                ))}
                            </div>

                            {/* Texto */}
                            <p style={{
                                color: '#374151', fontSize: '0.9rem',
                                lineHeight: 1.7, margin: '0 0 16px', fontWeight: 600
                            }}>
                                "{t.texto}"
                            </p>

                            {/* Footer */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingTop: '14px', borderTop: '1px solid #f0f2f8'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        fontSize: '0.75rem', fontWeight: 700,
                                        color: '#3b3fe8', background: 'rgba(59,63,232,0.08)',
                                        padding: '3px 10px', borderRadius: '99px'
                                    }}>
                                        📍 {t.ruta}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600 }}>
                                        {t.tiempo}
                                    </span>
                                    <button
                                        onClick={() => toggleLike(t.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            background: likeDados[t.id]
                                                ? 'rgba(239,68,68,0.1)' : 'transparent',
                                            border: `1px solid ${likeDados[t.id] ? 'rgba(239,68,68,0.3)' : '#e2e4f0'}`,
                                            color: likeDados[t.id] ? '#ef4444' : '#9ca3af',
                                            padding: '4px 10px', borderRadius: '99px',
                                            cursor: 'pointer', fontSize: '0.78rem',
                                            fontWeight: 700, transition: 'all 0.2s'
                                        }}
                                    >
                                        {likeDados[t.id] ? '❤️' : '🤍'} {t.likes + (likeDados[t.id] ? 1 : 0)}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA unirse ── */}
            <section style={{
                background: 'linear-gradient(135deg, #3b3fe8 0%, #5a5ef5 100%)',
                padding: '80px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-60px', right: '-60px',
                    width: '280px', height: '280px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-40px', left: '-40px',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)', pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
                        color: '#fff', letterSpacing: '2px',
                        margin: '0 0 16px', lineHeight: 1.05
                    }}>
                        ¿LISTO PARA UNIRTE<br />A LA COMUNIDAD?
                    </h2>
                    <p style={{
                        color: 'rgba(255,255,255,0.8)', fontSize: '1rem',
                        fontWeight: 600, margin: '0 0 36px', lineHeight: 1.6
                    }}>
                        Regístrate gratis, verifica tu universidad y empieza a compartir rutas con estudiantes como tú.
                    </p>
                    <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/registro" style={{
                            background: '#fff', color: '#3b3fe8',
                            textDecoration: 'none', padding: '16px 36px',
                            borderRadius: '12px', fontWeight: 900,
                            fontSize: '1rem', letterSpacing: '0.5px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            display: 'inline-block'
                        }}>
                            Crear cuenta gratis →
                        </Link>
                        <Link href="/redsocial" style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '2px solid rgba(255,255,255,0.4)',
                            color: '#fff', textDecoration: 'none',
                            padding: '16px 36px', borderRadius: '12px',
                            fontWeight: 800, fontSize: '1rem',
                            display: 'inline-block'
                        }}>
                            Ver más historias
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer style={{
                background: '#1e1b4b', padding: '32px 40px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.4rem', color: '#fff',
                    letterSpacing: '3px', marginBottom: '8px'
                }}>
                    FastDrive
                </div>
                <p style={{ color: '#6b7094', fontSize: '0.82rem', margin: 0 }}>
                    Conectando estudiantes de Medellín · 2025
                </p>
            </footer>
        </div>
    );
}