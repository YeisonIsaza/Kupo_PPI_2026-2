'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserNavbar({ nombre, idRol, onCerrarSesion }) {
    const router = useRouter();

    const menuConductor = [
        { label: 'Inicio',       href: '/dashboard/conductor' },
        { label: 'Mis Rutas',    href: '/rutasconductor' },
        { label: 'Contactanos',  href: '/contactanos' },
    ];

    const menuPasajero = [
        { label: 'Inicio',       href: '/dashboard/pasajero' },
        { label: 'Buscar Viaje', href: '/rutaspasajero' },
        { label: 'Contactanos',  href: '/contactanos' },
    ];

    const menuMixto = [
        { label: 'Inicio',       href: '/dashboard/mixto' },
        { label: 'Mis Rutas',    href: '/rutasconductor' },
        { label: 'Buscar Viaje', href: '/rutaspasajero' },
        { label: 'Contactanos',  href: '/contactanos' },
    ];

    const menu = idRol === 2 ? menuConductor
               : idRol === 4 ? menuMixto
               : menuPasajero;

    return (
        <nav style={{
            background: '#1e1b4b',
            padding: '0 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',           // ← antes 60px
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
        }}>

            {/* ── Logo ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <img
                    src="/img/FastDrive.png"
                    style={{ height: '42px', width: 'auto' }}  // ← antes 32px
                />
                <span style={{
                    color: '#fff',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.6rem',               // ← antes 1.1rem
                    letterSpacing: '2px'
                }}>
                    FastDrive
                </span>
            </div>

            {/* ── Links ── */}
            <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                {menu.map(item => (
                    <Link key={item.href} href={item.href} style={{
                        color: '#a5b4fc',
                        textDecoration: 'none',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = '#a5b4fc'}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* ── Acciones ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{
                    color: '#e2e8f0',
                    fontSize: '0.88rem',
                    fontWeight: 600
                }}>
                   {/* 👋 {nombre}*/}
                </span>

                {idRol === 4 && (
                    <button
                        onClick={() => {
                            localStorage.removeItem('modoMixto');
                            window.location.href = '/dashboard/mixto';
                        }}
                        style={{
                            background: '#fef3c7',
                            color: '#92400e',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            fontWeight: 700
                        }}
                    >
                        🔄 Cambiar modo
                    </button>
                )}

                <button
                    onClick={onCerrarSesion}
                    style={{
                        background: 'transparent',
                        border: '1.5px solid #f87171',
                        color: '#f87171',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        transition: 'background 0.2s, color 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#f87171';
                        e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#f87171';
                    }}
                >
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}