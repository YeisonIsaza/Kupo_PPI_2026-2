'use client';
import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  id: string;
  label: string;
  url: string;
}

const menuItems: MenuItem[] = [
    { id: 'inicio',          label: 'Inicio',          url: '/dashboard/admin'                },
    { id: 'roles',           label: 'Roles',            url: '/dashboard/admin/roles'          },
    { id: 'estados',         label: 'Estados',          url: '/dashboard/admin/estados'        },
    { id: 'perfiles',        label: 'Perfiles',         url: '/dashboard/admin/perfiles'       },
    { id: 'menus',           label: 'Menús',            url: '/dashboard/admin/menus'          },
    { id: 'universidades',   label: 'Universidades',    url: '/dashboard/admin/universidades'  },
    { id: 'permisos',        label: 'Permisos Menú',   url: '/dashboard/admin/permisos'       },
    { id: 'usuarios',        label: 'Solicitudes',      url: '/dashboard/admin/usuarios'       },
    { id: 'administradores', label: 'Administradores',  url: '/dashboard/admin/administradores'},
];

export default function AdminSidebar(): React.JSX.Element | null {
    const router   = useRouter();
    const pathname = usePathname();

    return (
        <aside suppressHydrationWarning style={{
            width: '260px',
            background: 'rgba(13, 15, 26, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '40px 20px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            position: 'fixed', height: '100vh', zIndex: 100
        }}>
            <div style={{ marginBottom: '40px', textAlign: 'center', color: 'white' }}>
                <h2 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-bebas)', letterSpacing: '2px' }}>Kupo</h2>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 0', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Panel Administrador</p>
            </div>

            {menuItems.map(item => (
                <button
                    key={item.id}
                    suppressHydrationWarning
                    onClick={() => router.push(item.url)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '12px 16px', borderRadius: '12px', border: 'none',
                        cursor: 'pointer',
                        background: pathname === item.url ? 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(79,70,229,0.05) 100%)' : 'transparent',
                        color: pathname === item.url ? 'white' : '#9ca3af',
                        fontWeight: pathname === item.url ? 800 : 600,
                        textAlign: 'left', fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        borderLeft: pathname === item.url ? '3px solid #4f46e5' : '3px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                        if (pathname !== item.url) {
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (pathname !== item.url) {
                            e.currentTarget.style.color = '#9ca3af';
                            e.currentTarget.style.background = 'transparent';
                        }
                    }}
                    >
                    {item.label}
                </button>
            ))}

            <button
                onClick={() => { localStorage.clear(); router.push('/login'); }}
                style={{
                    marginTop: 'auto', padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer',
                    borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }}
                >
                Cerrar sesión
            </button>
        </aside>
    );
}
