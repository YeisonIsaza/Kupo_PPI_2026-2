'use client';
import { useState, useRef, useEffect } from 'react';
import UserNavbar from '@/presentation/components/UserNavbar';
import useAuth from '@/core/hooks/useAuth';
import dynamic from 'next/dynamic';
import './conductores.css';

const MapaPicker = dynamic(() => import('@/presentation/components/MapaPicker'), { ssr: false });
import { useRouter } from 'next/navigation';
import usePermisos from '@/core/hooks/usePermisos';
import SinPermiso from '@/presentation/components/SinPermiso';


function formatHora(h: any) {
    if (!h) return '';
    const [hh, mm] = h.toString().split(':');
    const hour = parseInt(hh);
    return `${hour > 12 ? hour - 12 : hour || 12}:${mm} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function ConductoresPage(): React.JSX.Element | null {
  const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 4]);
  const { puedeLeer, puedeCrear, puedeEliminar, cargando } = usePermisos();
  //console.log('puedeLeer:', puedeLeer, 'puedeCrear:', puedeCrear, 'cargandoPermisos:', cargando); 
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [universidades, setUniversidades] = useState<any[]>([]);
  const [toast, setToast] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const toastTimer = useRef<any>(null);
  const [nitUni, setNitUni] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [aporte, setAporte] = useState<string>('');
  const [cupos, setCupos] = useState('4');
  const [origenLat, setOrigenLat] = useState<any>(null);
  const [origenLng, setOrigenLng] = useState<any>(null);
  const [destinoLat, setDestinoLat] = useState<any>(null);
  const [destinoLng, setDestinoLng] = useState<any>(null);
  const [origenNombre, setOrigenNombre] = useState<string>('');
  const [destinoNombre, setDestinoNombre] = useState<string>('');
  const [diaSemana, setDiaSemana] = useState<string>('');
  const [paradas, setParadas] = useState<any[]>([]);
  const [mapaKey, setMapaKey] = useState<number>(0);
  
  const [ella, setElla] = useState<{ genero: string | null; modo_ella: boolean; puede_activar: boolean }>({
      genero: null, modo_ella: false, puede_activar: false
  });
  const [cambiandoElla, setCambiandoElla] = useState<boolean>(false);
  const [ellaListo, setEllaListo] = useState<boolean>(false);

  useEffect(() => {
    if (listo) {
        Promise.all([cargarRutas(), cargarUniversidades(), cargarElla()]);
    }
  }, [listo]);

  async function cargarElla() {
      try {
          const userId = localStorage.getItem('userId');
          if (!userId) return;
          const res = await fetch(`/api/pasajero/modo-ella?userId=${userId}`);
          const data = await res.json();
          if (res.ok) setElla(data);
      } catch (error) { console.error('Error cargando Modo Ella:', error); }
      finally { setEllaListo(true); }
  }

  async function actualizarElla(payload: { activar?: boolean; genero?: string }) {
      setCambiandoElla(true);
      try {
          const userId = localStorage.getItem('userId');
          const res = await fetch('/api/pasajero/modo-ella', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, ...payload })
          });
          const data = await res.json();
          if (res.ok) {
              setElla(data);
              if (payload.activar !== undefined) {
                  showToast(payload.activar ? '💜 Modo Ella activado: tus viajes solo serán para mujeres' : 'Modo Ella desactivado');
                  await cargarRutas(); // Refrescar si es necesario
              }
          } else {
              showToast(`❌ ${data.error}`);
          }
      } catch { showToast('❌ Error de conexión'); }
      finally { setCambiandoElla(false); }
  }

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
      const res = await fetch(`/api/conductor/rutas?userId=${userId}&t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      setTrips(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); }
  }

  function showToast(msg: any) {
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
    setParadas([]);
    setMapaKey(prev => prev + 1);
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
          paradas: paradas
        })
      });
      const data = await res.json();
      if (res.ok) { resetForm(); cargarRutas(); showToast('✅ Ruta guardada en Oracle'); }
      else showToast(` ${data.error}`);
    } catch { showToast(' Error de conexión'); }
  }

  async function eliminarViaje(id: number | string) {
    try {
      const res = await fetch(`/api/conductor/rutas/${id}`, { method: 'DELETE' });
      if (res.ok) { cargarRutas(); showToast('🗑️ Ruta eliminada'); }
      else showToast(' Error al eliminar');
    } catch { showToast(' Error de conexión'); }
  }

  async function toggleRuta(id: any, estadoActual: any) {
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
      <main className="conductores-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* NEW SOUL: The "Booking/Creation" Header Card */}
        <div className="glass-panel" style={{ borderRadius: '24px', padding: '30px', marginBottom: '50px' }}>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.8rem', marginBottom: '24px', color: '#0d0f1a', letterSpacing: '1px' }}>
            Planifica tu <span style={{ color: '#4f46e5' }}>Próxima Ruta</span>
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
              <MapaPicker
                key={mapaKey}
                universidades={universidades}
                onOrigenChange={({ lat, lng, direccion, nitUni: nit }) => {
                  setOrigenLat(lat); setOrigenLng(lng); setOrigenNombre(direccion || ''); if (nit) setNitUni(nit);
                }}
                onDestinoChange={({ lat, lng, direccion, nitUni: nit }) => {
                  setDestinoLat(lat); setDestinoLng(lng); setDestinoNombre(direccion || ''); if (nit) setNitUni(nit);
                }}
                onParadasChange={setParadas}
              />
            </div>

            {/* Horizontal Booking Bar */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(255,255,255,0.6)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.8)' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>Día</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontFamily: 'var(--font-nunito)', outline: 'none' }} value={diaSemana} onChange={e => setDiaSemana(e.target.value)}>
                  <option value="">Selecciona un día</option>
                  {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '120px', margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>Hora Salida</label>
                <input type="time" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontFamily: 'var(--font-nunito)', outline: 'none' }} value={hora} onChange={e => setHora(e.target.value)} />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '140px', margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>Aporte</label>
                <input type="text" placeholder="Ej: $3.000 COP" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontFamily: 'var(--font-nunito)', outline: 'none' }} value={aporte} onChange={e => setAporte(e.target.value)} onBlur={handleAporteBlur} />
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: '120px', margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>Cupos</label>
                <select style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontFamily: 'var(--font-nunito)', outline: 'none' }} value={cupos} onChange={e => setCupos(e.target.value)}>
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n} cupo{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              {puedeCrear && (
                <button onClick={publicarViaje} style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white', padding: '14px 32px', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.2s', boxShadow: '0 8px 20px rgba(79,70,229,0.3)' }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                  <i className="bi bi-send-fill" style={{ marginRight: '8px' }}></i> PUBLICAR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trips Grid instead of List */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2.4rem', color: '#0d0f1a', margin: 0 }}>Mis Viajes Publicados</h2>
            <span style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: 800, padding: '4px 12px', borderRadius: '50px', fontSize: '1rem' }}>{trips.length}</span>
          </div>

          {/* Módulo Modo Ella - Conductor */}
          <div style={{
              padding: '16px 20px',
              borderRadius: '16px',
              background: ella.modo_ella ? 'linear-gradient(135deg, #fdf2f8, #f5f3ff)' : '#f8fafc',
              border: `1.5px solid ${ella.modo_ella ? '#c026d3' : '#e2e8f0'}`,
              boxShadow: ella.modo_ella ? '0 8px 20px rgba(192, 38, 211, 0.15)' : 'none',
              transition: 'all 0.25s',
              minWidth: '300px'
          }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                  <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: ella.modo_ella ? '#9333ea' : '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>💜</span> Modo Ella (Seguridad)
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px', fontWeight: 600 }}>
                          Tus viajes serán exclusivos para mujeres
                      </div>
                  </div>
                  {ella.puede_activar && (
                      <button
                          role="switch"
                          aria-checked={ella.modo_ella}
                          disabled={cambiandoElla}
                          onClick={() => actualizarElla({ activar: !ella.modo_ella })}
                          style={{
                              width: '46px', height: '26px', borderRadius: '99px', border: 'none',
                              cursor: cambiandoElla ? 'wait' : 'pointer', position: 'relative', flexShrink: 0,
                              background: ella.modo_ella ? 'linear-gradient(135deg, #a855f7, #ec4899)' : '#cbd5e1',
                              transition: 'background 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                          }}>
                          <span style={{
                              position: 'absolute', top: '3px', left: ella.modo_ella ? '23px' : '3px',
                              width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                              transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
                          }} />
                      </button>
                  )}
              </div>
              {ellaListo && !ella.genero && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: 600 }}>
                          Indica tu género para activar esta función:
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                          <button disabled={cambiandoElla} onClick={() => actualizarElla({ genero: 'female' })}
                              style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #e9d5ff', background: '#faf5ff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#a21caf' }}>
                              Femenino
                          </button>
                          <button disabled={cambiandoElla} onClick={() => actualizarElla({ genero: 'male' })}
                              style={{ flex: 1, padding: '7px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                              Masculino
                          </button>
                      </div>
                  </div>
              )}
              {ella.genero === 'male' && (
                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Función reservada para conductoras mujeres.
                  </div>
              )}
          </div>
        </div>
        
        {trips.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '24px' }}>
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>🚘</span>
            <span style={{ color: '#5a5e7a', fontSize: '1.1rem', fontWeight: 600 }}>No tienes viajes publicados aún. ¡Crea el primero arriba!</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {trips.map(t => (
              <div key={t.id_rc} className="glass-panel" style={{ borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                
                {/* Header card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {t.dias_semana && (
                    <span style={{ background: '#fef2f2', color: '#ef4444', fontWeight: 800, padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      📅 {t.dias_semana}
                    </span>
                  )}
                  <span style={{ background: t.estado?.nombre_estado === 'Activa' ? '#dcfce7' : '#f1f5f9', color: t.estado?.nombre_estado === 'Activa' ? '#16a34a' : '#94a3b8', fontWeight: 800, padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {t.estado?.nombre_estado === 'Activa' ? '● ACTIVA' : '○ INACTIVA'}
                  </span>
                </div>

                {/* Route points */}
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.4rem', lineHeight: 1.2, color: '#0d0f1a' }}>
                  <div style={{ color: '#4f46e5', fontSize: '0.9rem', fontFamily: 'var(--font-nunito)', fontWeight: 800, letterSpacing: '1px' }}>ORIGEN</div>
                  {t.origen_nombre || `Ruta ${t.id_rc}`}
                  <div style={{ margin: '8px 0', borderLeft: '2px dashed rgba(79,70,229,0.3)', height: '20px', marginLeft: '6px' }}></div>
                  <div style={{ color: '#ec4899', fontSize: '0.9rem', fontFamily: 'var(--font-nunito)', fontWeight: 800, letterSpacing: '1px' }}>DESTINO</div>
                  {t.destino_nombre || t.universidad?.nombre_uni}
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ background: 'rgba(0,0,0,0.04)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#0d0f1a' }}><i className="bi bi-clock-fill text-primary"></i> {formatHora(t.hora_salida_rc)}</span>
                  <span style={{ background: 'rgba(0,0,0,0.04)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#0d0f1a' }}><i className="bi bi-cash-stack text-success"></i> ${Number(t.tarifa_rc).toLocaleString('es-CO')}</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '16px' }}>
                  <button onClick={() => router.push(`/rutasconductor/paradas?rutaId=${t.id_rc}`)} style={{ background: 'rgba(79,70,229,0.1)', color: '#4f46e5', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(79,70,229,0.15)'} onMouseLeave={e => e.currentTarget.style.background='rgba(79,70,229,0.1)'}>
                    📍 PARADAS
                  </button>
                  <button onClick={() => toggleRuta(t.id_rc, t.estado?.nombre_estado)} style={{ background: t.estado?.nombre_estado === 'Activa' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: t.estado?.nombre_estado === 'Activa' ? '#dc2626' : '#16a34a', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 800, transition: 'background 0.2s' }}>
                    {t.estado?.nombre_estado === 'Activa' ? '⏸ PAUSAR' : '▶ ACTIVAR'}
                  </button>
                  
                  {puedeEliminar && (
                    <button onClick={() => eliminarViaje(t.id_rc)} style={{ gridColumn: 'span 2', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(0,0,0,0.1)', padding: '8px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, transition: 'color 0.2s, border-color 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; }} onMouseLeave={e => { e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.borderColor='rgba(0,0,0,0.1)'; }}>
                      🗑️ Eliminar Viaje
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
      <div className={`toast ${toastVisible ? 'show' : ''}`}>
        <span>{toast}</span>
      </div>
    </div>
  




  );
}