'use client';
import AdminSidebar from '@/presentation/components/AdminSidebar';
import useAdminAuth from '@/core/hooks/useAdminAuth';

export default function DashboardAdmin(): React.JSX.Element | null {
    const { nombre, listo } = useAdminAuth();
    if (!listo) return null;

    return (
        <div suppressHydrationWarning style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--font-nunito), sans-serif', background: '#0d0f1a' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '40px 60px', position: 'relative', zIndex: 1 }}>
                {/* Background Decorativo */}
                <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: -1, pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <p style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Panel de Control
                        </p>
                        <h1 style={{ fontSize: '2.4rem', margin: '0', color: 'white', fontWeight: 900 }}>¡Hola, {nombre}! 👋</h1>
                    </div>
                </div>

                {/* Grid estilo Bento para Admin */}
                <div className="bento-grid" style={{ padding: 0 }}>
                    <div className="bento-item bento-1" style={{ gridColumn: 'span 8', background: 'linear-gradient(135deg, rgba(79,70,229,0.1) 0%, rgba(13,15,26,0.6) 100%)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <i className="bento-icon">⚙️</i>
                        <h3 style={{ fontSize: '1.8rem', color: 'white', margin: '0 0 10px' }}>Gestión Integral</h3>
                        <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.6 }}>
                            Administra usuarios, roles, universidades y solicitudes desde el panel lateral. Mantén el ecosistema de Kupo funcionando de manera óptima.
                        </p>
                    </div>

                    <div className="bento-item bento-2" style={{ gridColumn: 'span 4', background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)', border: 'none', color: 'white' }}>
                        <i className="bento-icon" style={{ color: 'white' }}>📈</i>
                        <h3 style={{ fontSize: '1.8rem', color: 'white', margin: '0 0 10px' }}>Estadísticas</h3>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', lineHeight: 1.6 }}>
                            Próximamente métricas y reportes del sistema.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}