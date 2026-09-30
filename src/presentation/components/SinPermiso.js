import { useRouter } from 'next/navigation';

export default function SinPermiso() {
    const router = useRouter();
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ color: '#1e293b', margin: '0 0 8px' }}>Acceso restringido</h2>
            <p style={{ color: '#64748b', margin: '0 0 24px', maxWidth: '400px' }}>
                No tienes permisos para ver esta sección. Contacta al administrador principal.
            </p>
            <button onClick={() => router.push('/dashboard/admin')}
                style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                ← Volver al inicio
            </button>
        </div>
    );
}