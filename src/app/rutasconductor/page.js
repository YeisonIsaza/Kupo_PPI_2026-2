'use client';
import { useState, useRef, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';
import MapaPicker from '@/components/MapaPicker';
import './conductores.css';
import { useRouter } from 'next/navigation';
import usePermisos from '@/lib/usePermisos';
import SinPermiso from '@/components/SinPermiso';


function formatHora(h) {
    if (!h) return '';
    const [hh, mm] = h.toString().split(':');
    const hour = parseInt(hh);
    return `${hour > 12 ? hour - 12 : hour || 12}:${mm} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function ConductoresPage() {
  const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
  const { puedeLeer, puedeCrear, puedeEliminar, cargando } = usePermisos();
  //console.log('puedeLeer:', puedeLeer, 'puedeCrear:', puedeCrear, 'cargandoPermisos:', cargando); 
  const router = useRouter();

  const [trips, setTrips] = useState([]);
  const [universidades, setUniversidades] = useState([]);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);
  const [nitUni, setNitUni] = useState('');
  const [hora, setHora] = useState('');
  const [aporte, setAporte] = useState('');
  const [cupos, setCupos] = useState('4');
  const [origenLat, setOrigenLat] = useState(null);
  const [origenLng, setOrigenLng] = useState(null);
  const [destinoLat, setDestinoLat] = useState(null);
  const [destinoLng, setDestinoLng] = useState(null);
  const [origenNombre, setOrigenNombre] = useState('');
  const [destinoNombre, setDestinoNombre] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  

  useEffect(() => {
    if (listo) {
        Promise.all([cargarRutas(), cargarUniversidades()]);
    }
}, [listo]);

  async function cargarUniversidades() {
    try {
      const res = await fetch('/api/admin/universidades');
      const data = await res.json();
      setUniversidades(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  }

  async function cargarRutas() {
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch(`/api/conductor/rutas?userId=${userId}`);
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  }

  function showToast(msg) {
    setToast(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 3000);
  }

  function resetForm() {
    setNitUni('');
    setHora('');
    setAporte('');
    setCupos('4');
    setOrigenLat(null);
    setOrigenLng(null);
    setDestinoLat(null);
    setDestinoLng(null);
    setOrigenNombre('');
    setDestinoNombre('');
    setDiaSemana('');
  }

  async function publicarViaje() {
    if (!origenLat || !destinoLat) {
      showToast(' Marca el origen y destino en el mapa');
      return;
    }
    if (!nitUni) {
      showToast('Al menos uno de los puntos debe ser una universidad');
      return;
    }
    if (!hora || !aporte) {
      showToast(' Completa hora y aporte');
      return;
    }
    try {
      const userId = localStorage.getItem('userId');
      const tarifaNum = Number(aporte.replace(/[^0-9]/g, ''));
      const res = await fetch('/api/conductor/rutas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, horaSalida: hora, tarifa: tarifaNum,
          nitUni, origenLat, origenLng, destinoLat, destinoLng,
          origenNombre, destinoNombre,
          diasSemana: diaSemana,
        })
      });
      const data = await res.json();
      if (res.ok) { resetForm(); cargarRutas(); showToast('✅ Ruta guardada en Oracle'); }
      else showToast(` ${data.error}`);
    } catch { showToast(' Error de conexión'); }
  }

  async function eliminarViaje(id) {
    try {
      const res = await fetch(`/api/conductor/rutas/${id}`, { method: 'DELETE' });
      if (res.ok) { cargarRutas(); showToast('🗑️ Ruta eliminada'); }
      else showToast(' Error al eliminar');
    } catch { showToast(' Error de conexión'); }
  }

  async function toggleRuta(id, estadoActual) {
      const accion = estadoActual === 'Activa' ? 'desactivar' : 'activar';
      try {
          const res = await fetch(`/api/conductor/rutas/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accion })
          });
          const data = await res.json();
          if (res.ok) {
              cargarRutas();
              // Si activó, redirigir al viaje
              if (accion === 'activar' && data.viajeId) {
                  router.push(`/rutasconductor/viaje?viajeId=${data.viajeId}`);
              }
          }
          else showToast(' Error al actualizar estado');
      } catch { showToast(' Error de conexión'); }
  }

  function handleAporteBlur() {
    const v = aporte.replace(/[^0-9]/g, '');
    if (v) setAporte('$' + parseInt(v).toLocaleString('es-CO') + ' COP');
  }

   if (!listo || cargando) return null;

    // Si no puede leer → mostrar bloqueo
    if (!puedeLeer) return (
        <div>
            <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
            <SinPermiso />
        </div>
    );

  return (
    <div className="conductores-page">
      <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />
      <main className="conductores-main">
        <div className="panel-grid">

          {/* ← Columna izquierda: Formulario */}
          <div className="card" id="formCard">
            <h2 className="card-title">Agregar Viaje</h2>

            <MapaPicker
              universidades={universidades}
              onOrigenChange={({ lat, lng, direccion, nitUni: nit }) => {
                setOrigenLat(lat);
                setOrigenLng(lng);
                setOrigenNombre(direccion);
                if (nit) setNitUni(nit);
              }}
              onDestinoChange={({ lat, lng, direccion, nitUni: nit }) => {
                setDestinoLat(lat);
                setDestinoLng(lng);
                setDestinoNombre(direccion);
                if (nit) setNitUni(nit);
              }}
            />

            <div className="form-group">
              <label>Día de la semana:</label>
              <select value={diaSemana} onChange={e => setDiaSemana(e.target.value)}>
                <option value="">Selecciona un día</option>
                {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hora de Salida:</label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Aporte por Persona:</label>
              <input type="text" value={aporte} placeholder="Ej: $3.000 COP"
                onChange={e => setAporte(e.target.value)}
                onBlur={handleAporteBlur} />
            </div>
            <div className="form-group">
              <label>Cupos Disponibles:</label>
              <select value={cupos} onChange={e => setCupos(e.target.value)}>
                {[1,2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n} cupo{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            {/* Condicionar si puede crear viajes */}
            {puedeCrear && (
            <button className="btn-primary btn-publish" onClick={publicarViaje}>
              ✓ Publicar Viaje
            </button>
            )}
          </div>


          {/* ← Columna derecha: Mis Viajes */}
          <div className="card trips-card">
            <h2 className="card-title">
              Mis Viajes <span className="trips-count">({trips.length})</span>
            </h2>
            {trips.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🚘</span>
                <span className="empty-text">No tienes viajes publicados. ¡Crea uno!</span>
              </div>
            ) : (
              <div className="trip-list">
                {trips.map(t => (
                  <div key={t.id_rc} className="trip-item">
                    <div>
                      {t.dias_semana && (
                        <span style={{
                          display: 'inline-block', marginBottom: '6px',
                          padding: '2px 10px', borderRadius: '20px',
                          fontSize: '0.75rem', fontWeight: 700,
                          background: '#e0e7ff', color: '#4f46e5'
                        }}>
                          📅 {t.dias_semana}
                        </span>
                      )}
                      <div className="trip-route">
                        {t.origen_nombre || `Ruta ${t.id_rc}`}
                        <span className="trip-arrow">→</span>
                        {t.destino_nombre || t.universidad?.nombre_uni}
                      </div>
                      <div className="trip-meta">
                        <span className="trip-badge">🕐 {formatHora(t.hora_salida_rc)}</span>
                        <span className="trip-badge">💵 ${Number(t.tarifa_rc).toLocaleString('es-CO')} COP</span>
                        <span className="trip-badge" style={{
                          background: t.estado?.nombre_estado === 'Activa' ? '#dcfce7' : '#f1f5f9',
                          color: t.estado?.nombre_estado === 'Activa' ? '#16a34a' : '#94a3b8'
                        }}>
                          {t.estado?.nombre_estado === 'Activa' ? '● Activa' : '○ Inactiva'}
                        </span>
                      </div>
                    </div>
                    <div className="trip-actions">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                          <button
                              onClick={() => router.push(`/rutasconductor/paradas?rutaId=${t.id_rc}`)}
                              style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                              📍 Agregar Paradas
                          </button>
                          <button
                              onClick={() => toggleRuta(t.id_rc, t.estado?.nombre_estado)}
                              style={{
                                  background: t.estado?.nombre_estado === 'Activa' ? '#fee2e2' : '#dcfce7',
                                  color: t.estado?.nombre_estado === 'Activa' ? '#dc2626' : '#16a34a',
                                  border: 'none', padding: '6px 12px', borderRadius: '8px',
                                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                              }}>
                              {t.estado?.nombre_estado === 'Activa' ? '⏸ Desactivar' : '▶ Activar Viaje'}
                          </button>
                          {/* Condicionar si puede eliminar viajes */}
                          {puedeEliminar && (
                          <button
                              onClick={() => eliminarViaje(t.id_rc)}
                              style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                              🗑️ Eliminar Viaje
                          </button>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <span>{toast}</span>
      </div>
    </div>
  




  );
}