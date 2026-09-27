'use client';
import AdminSidebar from '@/components/AdminSidebar';
import useAdminAuth from '@/lib/useAdminAuth';

export default function DashboardAdmin() {
    const { nombre, listo } = useAdminAuth();
    if (!listo) return null;

    return (
        <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '240px', flex: 1, padding: '40px', background: '#f8fafc' }}>
                <h1 style={{ fontSize: '1.6rem', margin: '0 0 30px' }}>¡Hola, {nombre}! 👋</h1>
                <p style={{ color: '#64748b' }}>Selecciona una opción del menú lateral para comenzar.</p>
            </main>
        </div>
    );
}