'use client';
import { useRouter, usePathname } from 'next/navigation';

const menuItems = [
    { id: 'inicio',          label: 'Inicio',         url: '/dashboard/admin'                },
    { id: 'roles',           label: 'Roles',           url: '/dashboard/admin/roles'          }, 
    { id: 'estados',         label: 'Estados',         url: '/dashboard/admin/estados'        }, 
    { id: 'perfiles',        label: 'Perfiles',        url: '/dashboard/admin/perfiles'       },
    { id: 'menus',           label: 'Menús',           url: '/dashboard/admin/menus'          }, 
    { id: 'universidades',   label: 'Universidades',   url: '/dashboard/admin/universidades'  }, 
    { id: 'permisos',        label: 'Permisos Menú',  url: '/dashboard/admin/permisos'       },
    { id: 'usuarios',        label: 'Solicitudes',     url: '/dashboard/admin/usuarios'    },
    { id: 'administradores', label: 'Administradores', url: '/dashboard/admin/administradores'},
    //validar si no da solicitudes,poner la de usuarios
];


export default function AdminSidebar() {
    const router   = useRouter();
    const pathname = usePathname();

    return (
        <aside suppressHydrationWarning style={{
            width: '240px', background: '#2e2b5c', padding: '30px 20px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            position: 'fixed', height: '100vh', zIndex: 100
        }}>
            <div style={{ marginBottom: '30px', textAlign: 'center', color: 'white' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>FastDrive</h2>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 0', opacity: 0.7 }}>Panel Administrador</p>
            </div>

            {menuItems.map(item => (
                <button
                    key={item.id}
                    suppressHydrationWarning
                    onClick={() => router.push(item.url)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '8px', border: 'none',
                        cursor: 'pointer',
                        background: pathname === item.url ? '#4f46e5' : 'transparent',
                        color: 'white', textAlign: 'left', fontSize: '0.9rem'
                    }}>
                    {item.label}
                </button>
            ))}

            <button
                onClick={() => { localStorage.clear(); router.push('/login'); }}
                style={{
                    marginTop: 'auto', padding: '10px', background: 'transparent',
                    color: '#f87171', border: 'none', cursor: 'pointer'
                }}>
                Cerrar sesión
            </button>
        </aside>
    );
}