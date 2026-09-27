'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardMixto() {
    const router = useRouter();
    const [nombre, setNombre] = useState('');
    const [listo, setListo] = useState(false);

    useEffect(() => {
        const userId   = localStorage.getItem('userId');
        const userRol  = parseInt(localStorage.getItem('userRol'));
        const userName = localStorage.getItem('userName');

        if (!userId) { router.push('/login'); return; }
        if (userRol !== 4) { router.push('/login'); return; }

        const modoGuardado = localStorage.getItem('modoMixto');
        if (modoGuardado === 'conductor') { router.replace('/dashboard/conductor'); return; }
        if (modoGuardado === 'pasajero')  { router.replace('/dashboard/pasajero');  return; }

        setNombre(userName || 'Usuario');
        setListo(true);
    }, []);

    function elegirModo(modo) {
        localStorage.setItem('modoMixto', modo);
        router.push(modo === 'conductor' ? '/dashboard/conductor' : '/dashboard/pasajero');
    }

    function cerrarSesion() {
        localStorage.clear();
        router.push('/login');
    }

    if (!listo) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #1e1b4b 0%, #2d2a6e 40%, #1e1b4b 100%)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Nunito', sans-serif",
            padding: '40px 24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Círculos decorativos de fondo */}
            <div style={{
                position: 'absolute', top: '-100px', left: '-100px',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,63,232,0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-80px', right: '-80px',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* ── Logo ── */}
            <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
                <img
                    src="/img/FastDrive.png"
                    alt="FastDrive"
                    style={{ height: '52px', marginBottom: '16px', display: 'block', margin: '0 auto 16px' }}
                />
                <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.4rem', color: '#fff',
                    letterSpacing: '4px', marginBottom: '10px'
                }}>
                    FASTDRIVE
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#a5b4fc', padding: '5px 16px',
                    borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700
                }}>
                    👋 Hola, <strong style={{ color: '#fff' }}>{nombre}</strong>
                </div>
            </div>

            {/* ── Título ── */}
            <div style={{ textAlign: 'center', marginBottom: '48px', position: 'relative', zIndex: 1 }}>
                <h2 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    color: '#fff', letterSpacing: '2px',
                    margin: '0 0 10px', lineHeight: 1.05
                }}>
                    ¿CÓMO QUIERES USAR<br />
                    <span style={{ color: '#818cf8' }}>FASTDRIVE HOY?</span>
                </h2>
                <p style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.92rem', fontWeight: 600, margin: 0
                }}>
                    Selecciona tu modo para esta sesión
                </p>
            </div>

            {/* ── Cards de modo ── */}
            <div style={{
                display: 'flex', gap: '24px', flexWrap: 'wrap',
                justifyContent: 'center', position: 'relative', zIndex: 1
            }}>

                {/* Card Conductor */}
                <div
                    onClick={() => elegirModo('conductor')}
                    style={{
                        width: '280px', padding: '36px 28px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(30,27,75,0.9) 0%, rgba(59,63,232,0.3) 100%)',
                        border: '1.5px solid rgba(90,94,245,0.5)',
                        cursor: 'pointer', textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(59,63,232,0.25)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 48px rgba(59,63,232,0.4)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(59,63,232,0.25)';
                    }}
                >
                    {/* Glow decorativo */}
                    <div style={{
                        position: 'absolute', top: '-40px', right: '-40px',
                        width: '150px', height: '150px', borderRadius: '50%',
                        background: 'rgba(90,94,245,0.15)', pointerEvents: 'none'
                    }} />

                    <div style={{ fontSize: '3.8rem', marginBottom: '18px' }}>🚗</div>

                    <h3 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        color: '#fff', margin: '0 0 10px',
                        fontSize: '1.6rem', letterSpacing: '1px'
                    }}>
                        MODO CONDUCTOR
                    </h3>
                    <p style={{
                        color: 'rgba(165,180,252,0.85)',
                        margin: '0 0 24px', fontSize: '0.88rem',
                        lineHeight: 1.6, fontWeight: 600
                    }}>
                        Publica rutas, gestiona paradas y lleva estudiantes a su destino
                    </p>

                    <div style={{
                        background: 'linear-gradient(135deg, #3b3fe8, #5a5ef5)',
                        color: '#fff', padding: '12px 24px',
                        borderRadius: '99px', fontSize: '0.88rem',
                        fontWeight: 800, display: 'inline-block',
                        boxShadow: '0 4px 16px rgba(59,63,232,0.4)',
                        letterSpacing: '0.5px'
                    }}>
                        Entrar como Conductor →
                    </div>
                </div>

                {/* Divisor central */}
                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                    <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 800
                    }}>
                        O
                    </div>
                    <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                {/* Card Pasajero */}
                <div
                    onClick={() => elegirModo('pasajero')}
                    style={{
                        width: '280px', padding: '36px 28px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, rgba(5,46,22,0.9) 0%, rgba(34,197,94,0.2) 100%)',
                        border: '1.5px solid rgba(34,197,94,0.4)',
                        cursor: 'pointer', textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(34,197,94,0.2)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 48px rgba(34,197,94,0.3)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.2)';
                    }}
                >
                    {/* Glow decorativo */}
                    <div style={{
                        position: 'absolute', top: '-40px', right: '-40px',
                        width: '150px', height: '150px', borderRadius: '50%',
                        background: 'rgba(34,197,94,0.1)', pointerEvents: 'none'
                    }} />

                    <div style={{ fontSize: '3.8rem', marginBottom: '18px' }}>🎓</div>

                    <h3 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        color: '#fff', margin: '0 0 10px',
                        fontSize: '1.6rem', letterSpacing: '1px'
                    }}>
                        MODO PASAJERO
                    </h3>
                    <p style={{
                        color: 'rgba(134,239,172,0.85)',
                        margin: '0 0 24px', fontSize: '0.88rem',
                        lineHeight: 1.6, fontWeight: 600
                    }}>
                        Busca viajes disponibles, reserva cupos y llega a tiempo a clase
                    </p>

                    <div style={{
                        background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                        color: '#fff', padding: '12px 24px',
                        borderRadius: '99px', fontSize: '0.88rem',
                        fontWeight: 800, display: 'inline-block',
                        boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                        letterSpacing: '0.5px'
                    }}>
                        Entrar como Pasajero →
                    </div>
                </div>
            </div>

            {/* ── Cerrar sesión ── */}
            <button
                onClick={cerrarSesion}
                style={{
                    marginTop: '48px', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'rgba(255,255,255,0.4)', padding: '9px 22px',
                    borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 600,
                    transition: 'all 0.2s', position: 'relative', zIndex: 1
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)';
                    e.currentTarget.style.color = '#f87171';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                }}
            >
                Cerrar sesión
            </button>
        </div>
    );
}