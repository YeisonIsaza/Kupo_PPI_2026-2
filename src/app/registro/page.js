'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [userId, setUserId] = useState(null);
  const [idRolGuardado, setIdRolGuardado] = useState(null);

  // --- PASO 1: Datos personales ---
  const [rol, setRol] = useState('pasajero');
  const [nombre, setNombre] = useState('');
  const [primerApellido, setPrimerApellido] = useState('');
  const [segundoApellido, setSegundoApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [celular, setCelular] = useState('');
  const [fechaNac, setFechaNac] = useState('');
  const [emailInst, setEmailInst] = useState('');
  const [emailPers, setEmailPers] = useState('');
  const [pass, setPass] = useState('');
  const [nitUni, setNitUni] = useState(' 890.980.040-8');

  // --- PASO 2: Foto y certificado ---
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [certificado, setCertificado] = useState(null);
  const [certNombre, setCertNombre] = useState('');
  const fotoRef = useRef(null);
  const certRef = useRef(null);

  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  function selectRol(r) {
    setRol(r);
    setMsg({ tipo: '', texto: '' });
  }

  // Convertir archivo a base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleFotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMsg({ tipo: 'error', texto: 'La foto debe ser una imagen.' });
      return;
    }
    setFotoPerfil(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function handleCertChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      setMsg({ tipo: 'error', texto: 'El certificado debe ser JPG, PNG o PDF.' });
      return;
    }
    setCertificado(file);
    setCertNombre(file.name);
  }

  // PASO 1: Registrar datos personales
  async function doRegistro() {
    let idRol;
    if (rol === 'conductor') idRol = 2;
    else if (rol === 'pasajero') idRol = 3;
    else idRol = 4;

    const email = rol === 'conductor' ? emailPers : emailInst;

    if (!nombre || !primerApellido || !documento || !celular || !fechaNac || !email || !pass) {
      setMsg({ tipo: 'error', texto: 'Por favor completa todos los campos obligatorios.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          primerApellido,
          segundoApellido,
          documento,
          celular,
          fechaNac,
          email,
          password: pass,
          idRol,
          nitUni
        })
      });

      const data = await res.json();

      if (res.ok) {
        setUserId(data.userId);
        setIdRolGuardado(idRol);

        // Conductor va directo a vehículo
        if (idRol === 2) {
          router.push(`/registro/Vehiculo?userId=${data.userId}`);
          return;
        }

        // Pasajero y mixto van al paso 2
        setPaso(2);
        setMsg({ tipo: '', texto: '' });
      } else {
        setMsg({ tipo: 'error', texto: data.error || "Error en el registro" });
      }
    } catch (error) {
      setMsg({ tipo: 'error', texto: 'Error de conexión con el servidor' });
    } finally {
      setLoading(false);
    }
  }

  // PASO 2: Subir foto y certificado
  async function doDocumentos(e) {
    e.preventDefault();

    if (!certificado) {
      setMsg({ tipo: 'error', texto: 'El certificado de estudio es obligatorio.' });
      return;
    }

    setLoading(true);
    setMsg({ tipo: '', texto: '' });

    try {
      // Convertir archivos a base64
      const certBase64 = await fileToBase64(certificado);
      const fotoBase64 = fotoPerfil ? await fileToBase64(fotoPerfil) : null;

      const res = await fetch('/api/registro/documentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          certificado: certBase64,
          fotoPerfil:  fotoBase64,
          certNombre:  certificado.name
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Mixto va al paso de vehículo
        if (idRolGuardado === 4) {
          router.push(`/registro/Vehiculo?userId=${userId}`);
        } else {
          setMsg({ tipo: 'exito', texto: '¡Registro completado! Tu solicitud está pendiente de aprobación.' });
          setTimeout(() => router.push('/login'), 2500);
        }
      } else {
        setMsg({ tipo: 'error', texto: data.error || "Error al subir documentos" });
      }
    } catch (error) {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="registro-page">
      <div className="fd-card">
        <div className="fd-side">
          <div className="fd-icon-wrap">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
              <circle cx="7.5" cy="14.5" r="1.5" fill="currentColor"/>
              <circle cx="16.5" cy="14.5" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div className="fd-logo">FastDrive</div>
          <div className="fd-tagline">Tu enlace universitario seguro</div>

          {/* Indicador de pasos */}
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { n: 1, label: 'Datos personales' },
              { n: 2, label: 'Documentos', show: rol !== 'conductor' },
              { n: 3, label: 'Vehículo', show: rol === 'conductor' || rol === 'mixto' },
            ].filter(s => s.show !== false).map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: paso >= s.n ? '#4f46e5' : 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0
                }}>{s.n}</div>
                <span style={{ color: paso >= s.n ? 'white' : 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="fd-main">

          {/* ===== PASO 1: DATOS PERSONALES ===== */}
          {paso === 1 && (
            <>
              <div className="fd-title">Crear cuenta</div>
              {msg.texto && <div className={`fd-msg ${msg.tipo}`}>{msg.texto}</div>}

              <div className="fd-row">
                <div className="fd-field">
                  <label className="fd-label">Nombre</label>
                  <input className="fd-input" type="text" value={nombre} onChange={e => setNombre(e.target.value)} />
                </div>
                <div className="fd-field">
                  <label className="fd-label">Primer Apellido</label>
                  <input className="fd-input" type="text" value={primerApellido} onChange={e => setPrimerApellido(e.target.value)} />
                </div>
                <div className="fd-field">
                  <label className="fd-label">Segundo Apellido</label>
                  <input className="fd-input" type="text" value={segundoApellido} onChange={e => setSegundoApellido(e.target.value)} />
                </div>
              </div>

              <div className="fd-row">
                <div className="fd-field">
                  <label className="fd-label">Documento</label>
                  <input className="fd-input" type="text" value={documento} onChange={e => setDocumento(e.target.value)} />
                </div>
                <div className="fd-field">
                  <label className="fd-label">Celular</label>
                  <input className="fd-input" type="text" value={celular} onChange={e => setCelular(e.target.value)} />
                </div>
              </div>

              <div className="fd-field">
                <label className="fd-label">Fecha de Nacimiento</label>
                <input className="fd-input" type="date" value={fechaNac} onChange={e => setFechaNac(e.target.value)} />
              </div>

              {(rol === 'pasajero' || rol === 'mixto') && (
                <div className="fd-field">
                  <label className="fd-label">Universidad</label>
                  <select className="fd-input" value={nitUni} onChange={e => setNitUni(e.target.value)}>
                    <option value=" 890.980.136-6">Politécnico Jaime Isaza Cadavid</option>
                    <option value="800.036.781-1">Fundación Universitaria María Cano</option>
                    <option value=" 890.980.040-8">Universidad de Antioquia</option>
                    <option value="899.999.034-1">SENA</option>
                    <option value="890980040-5">Universidad Nacional de Colombia</option>
                    <option value="890.905.419-6">Tecnológico de Antioquia</option>
                    <option value="890.980.153-1">Pascual Bravo</option>
                    <option value="800.116.217-2">UNIMINUTO</option>
                  </select>
                </div>
              )}

              <div className="fd-field">
                <div className="fd-label">Quiero ser</div>
                <div className="fd-role-wrap">
                  <div className={`fd-role ${rol === 'pasajero' ? 'selected' : ''}`} onClick={() => selectRol('pasajero')}>Pasajero</div>
                  <div className={`fd-role ${rol === 'conductor' ? 'selected' : ''}`} onClick={() => selectRol('conductor')}>Conductor</div>
                  <div className={`fd-role ${rol === 'mixto' ? 'selected' : ''}`} onClick={() => selectRol('mixto')}>Mixto</div>
                </div>
              </div>

              <div className="fd-field">
                <label className="fd-label">Correo {rol === 'conductor' ? 'Personal' : 'Institucional'}</label>
                <input className="fd-input" type="email"
                  placeholder={rol === 'conductor' ? 'ejemplo@gmail.com' : `ejemplo@${
                    nitUni === ' 890.980.040-8' ? 'udea.edu.co' :
                    nitUni === ' 890.980.136-6' ? 'elpoli.edu.co' :
                    nitUni === '800.036.781-1'  ? 'fumc.edu.co' :
                    nitUni === '899.999.034-1'  ? 'soy.sena.edu.co' :
                    nitUni === '890980040-5'    ? 'unal.edu.co' :
                    nitUni === '890.905.419-6'  ? 'tdea.edu.co' :
                    nitUni === '890.980.153-1'  ? 'pascualbravo.edu.co' :
                    'uniminuto.edu.co'
                  }`}
                  value={rol === 'conductor' ? emailPers : emailInst}
                  onChange={e => rol === 'conductor' ? setEmailPers(e.target.value) : setEmailInst(e.target.value)}
                />
              </div>

              <div className="fd-field">
                <label className="fd-label">Contraseña</label>
                <input className="fd-input" type="password" value={pass} onChange={e => setPass(e.target.value)} />
              </div>

              <button className="fd-btn" onClick={doRegistro} disabled={loading}>
                {loading ? 'Registrando...' : 'Siguiente Paso'}
              </button>

              <div className="fd-hint">
                ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
              </div>
            </>
          )}

          {/* ===== PASO 2: FOTO Y CERTIFICADO ===== */}
          {paso === 2 && (
            <>
              <div className="fd-title">Documentos de Verificación</div>
              <p className="fd-hint">Sube tu foto de perfil y certificado de matrícula para validar tu cuenta.</p>

              {msg.texto && <div className={`fd-msg ${msg.tipo}`}>{msg.texto}</div>}

              <form onSubmit={doDocumentos}>

                {/* Foto de perfil */}
                <div className="fd-field" style={{ marginBottom: '20px' }}>
                  <label className="fd-label">Foto de Perfil (opcional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <div onClick={() => fotoRef.current?.click()} style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      border: '2px dashed #cbd5e1', cursor: 'pointer',
                      overflow: 'hidden', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', background: '#f8fafc', flexShrink: 0
                    }}>
                      {fotoPreview
                        ? <img src={fotoPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: '2rem' }}>📷</span>
                      }
                    </div>
                    <div>
                      <button type="button" onClick={() => fotoRef.current?.click()}
                        style={{ background: '#e0e7ff', color: '#4f46e5', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {fotoPreview ? 'Cambiar foto' : 'Subir foto'}
                      </button>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0' }}>JPG o PNG, máx 2MB</p>
                    </div>
                  </div>
                  <input ref={fotoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFotoChange} />
                </div>

                {/* Certificado de matrícula */}
                <div className="fd-field" style={{ marginBottom: '20px' }}>
                  <label className="fd-label">Certificado de Matrícula <span style={{ color: '#ef4444' }}>*</span></label>
                  <div onClick={() => certRef.current?.click()} style={{
                    border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '24px',
                    textAlign: 'center', cursor: 'pointer', background: certNombre ? '#f0fdf4' : '#f8fafc',
                    marginTop: '8px', transition: 'all 0.2s'
                  }}>
                    {certNombre ? (
                      <>
                        <div style={{ fontSize: '2rem' }}>✅</div>
                        <p style={{ color: '#16a34a', fontWeight: 600, margin: '8px 0 4px', fontSize: '0.9rem' }}>{certNombre}</p>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Clic para cambiar</p>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '2rem' }}>📄</div>
                        <p style={{ color: '#64748b', fontWeight: 600, margin: '8px 0 4px', fontSize: '0.9rem' }}>
                          Arrastra o haz clic para subir
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>JPG, PNG o PDF — máx 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={certRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleCertChange} />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={() => setPaso(1)}
                    style={{ flex: 1, padding: '12px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    ← Atrás
                  </button>
                  <button type="submit" className="fd-btn" disabled={loading} style={{ flex: 2 }}>
                    {loading ? 'Subiendo...' : idRolGuardado === 4 ? 'Siguiente: Vehículo →' : 'Finalizar Registro'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}