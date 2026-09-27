'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PerfilVehiculoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  // --- Vehículo ---
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modeloNombre, setModeloNombre] = useState('');
  const [anno, setAnno] = useState('2024');
  const [color, setColor] = useState('');
  const [soat, setSoat] = useState('');
  const [cupos, setCupos] = useState('4');

  // --- Licencia (nuevos) ---
  const [numeroLicencia, setNumeroLicencia] = useState('');
  const [fechaVencLicencia, setFechaVencLicencia] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  async function handlePerfilSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ tipo: '', texto: '' });

    // Validar que la licencia no esté vencida
    if (new Date(fechaVencLicencia) <= new Date()) {
      setMsg({ tipo: 'error', texto: 'La licencia está vencida. Debe tener una licencia vigente.' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          placa: placa.toUpperCase(),
          marca,
          modeloNombre,
          anno,
          color,
          soat,
          cupos,
          numeroLicencia,       // 🆕
          fechaVencLicencia,    // 🆕
        })
      });

      if (res.ok) {
        setMsg({ tipo: 'exito', texto: '¡Registro completado! Tu solicitud está pendiente de aprobación.' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        const err = await res.json();
        setMsg({ tipo: 'error', texto: err.error || "No se pudo registrar el vehículo" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMsg({ tipo: 'error', texto: 'Error de conexión con el servidor' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registro-page">
      <div className="fd-card">
        <div className="fd-main" style={{ width: '100%' }}>
          <div className="fd-title">Registro del Conductor</div>
          <p className="fd-hint">Completa los datos de tu vehículo y licencia para empezar a compartir rutas.</p>

          {msg.texto && (
            <div className={`fd-msg ${msg.tipo}`}>{msg.texto}</div>
          )}

          <form onSubmit={handlePerfilSubmit} className="fd-form-perfil">

            {/* --- SECCIÓN LICENCIA --- */}
            <div className="fd-section-title" style={{ 
              color: '#4f46e5', fontWeight: 700, 
              marginBottom: '8px', marginTop: '8px' 
            }}>
              🪪 Datos de Licencia
            </div>

            <div className="fd-row">
              <div className="fd-field">
                <label className="fd-label">Número de Licencia</label>
                <input className="fd-input" placeholder="Ej: 123456789" required
                  value={numeroLicencia} onChange={e => setNumeroLicencia(e.target.value)} />
              </div>
              <div className="fd-field">
                <label className="fd-label">Fecha Vencimiento Licencia</label>
                <input className="fd-input" type="date" required
                  min={new Date().toISOString().split('T')[0]}
                  value={fechaVencLicencia} onChange={e => setFechaVencLicencia(e.target.value)} />
              </div>
            </div>

            {/* --- SECCIÓN VEHÍCULO --- */}
            <div className="fd-section-title" style={{ 
              color: '#4f46e5', fontWeight: 700, 
              marginBottom: '8px', marginTop: '16px' 
            }}>
              🚗 Datos del Vehículo
            </div>

            <div className="fd-row">
              <div className="fd-field">
                <label className="fd-label">Placa</label>
                <input className="fd-input" placeholder="Ej: JZM123" required
                  value={placa} onChange={e => setPlaca(e.target.value)} />
              </div>
              <div className="fd-field">
                <label className="fd-label">Marca</label>
                <input className="fd-input" placeholder="Ej: Renault" required
                  value={marca} onChange={e => setMarca(e.target.value)} />
              </div>
            </div>

            <div className="fd-row">
              <div className="fd-field">
                <label className="fd-label">Modelo (Línea)</label>
                <input className="fd-input" placeholder="Ej: Sandero" required
                  value={modeloNombre} onChange={e => setModeloNombre(e.target.value)} />
              </div>
              <div className="fd-field">
                <label className="fd-label">Año (2000 - 2030)</label>
                <input className="fd-input" type="number" min="2000" max="2030" required
                  value={anno} onChange={e => setAnno(e.target.value)} />
              </div>
            </div>

            <div className="fd-row">
              <div className="fd-field">
                <label className="fd-label">Color</label>
                <input className="fd-input" placeholder="Ej: Gris" required
                  value={color} onChange={e => setColor(e.target.value)} />
              </div>
              <div className="fd-field">
                <label className="fd-label">Cupos Disponibles</label>
                <select className="fd-input" value={cupos} 
                  onChange={e => setCupos(e.target.value)}>
                  <option value="4">4 puestos</option>
                  <option value="6">6 puestos</option>
                </select>
              </div>
            </div>

            <div className="fd-field">
              <label className="fd-label">Número de SOAT</label>
              <input className="fd-input" placeholder="Ingrese el código del SOAT" required
                value={soat} onChange={e => setSoat(e.target.value)} />
            </div>

            <button type="submit" className="fd-btn" disabled={loading}>
              {loading ? 'Guardando en Oracle...' : 'Finalizar Registro'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PerfilVehiculoForm />
    </Suspense>
  );
}