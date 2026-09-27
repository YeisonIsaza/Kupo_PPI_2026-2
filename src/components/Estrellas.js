export default function Estrellas({ promedio, total, size = '1rem' }) {
    if (!promedio) return (
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin calificaciones</span>
    );
    const n = parseFloat(promedio);
    const llenas = Math.floor(n);
    const media  = n - llenas >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            {'★'.repeat(llenas).split('').map((s, i) => (
                <span key={`l${i}`} style={{ color: '#f59e0b', fontSize: size }}>{s}</span>
            ))}
            {media === 1 && <span style={{ color: '#f59e0b', fontSize: size }}>½</span>}
            {'☆'.repeat(vacias).split('').map((s, i) => (
                <span key={`v${i}`} style={{ color: '#e2e8f0', fontSize: size }}>{s}</span>
            ))}
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>
                {promedio} <span style={{ color: '#94a3b8' }}>({total})</span>
            </span>
        </span>
    );
}