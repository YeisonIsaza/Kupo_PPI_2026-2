'use client';
import { useState } from 'react';
import UserNavbar from '@/components/UserNavbar';
import useAuth from '@/lib/useAuth';

const LABELS = ['Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];
const MAX_CHARS = 400;

export default function ContactanosPage() {
  const { nombre, idRol, listo, cerrarSesion } = useAuth([2, 3, 4]);
  const [nombreForm, setNombreForm] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [borderError, setBorderError] = useState(false);

  function handleMensaje(e) {
    if (e.target.value.length <= MAX_CHARS) setMensaje(e.target.value);
  }

  function getCharClass() {
    const len = mensaje.length;
    if (len >= MAX_CHARS) return 'char-count at-limit';
    if (len >= MAX_CHARS * 0.8) return 'char-count near-limit';
    return 'char-count';
  }

  function submitForm() {
    if (!mensaje.trim()) {
      setBorderError(true);
      setTimeout(() => setBorderError(false), 1500);
      return;
    }
    setSubmitted(true);
  }

  function resetForm() {
    setNombreForm('');
    setCorreo('');
    setMensaje('');
    setRating(0);
    setHovered(0);
    setSubmitted(false);
  }

  const displayRating = hovered || rating;

  if (!listo) return null;

  return (
    <div style={{ background: '#f0f2f8', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UserNavbar nombre={nombre} idRol={idRol} onCerrarSesion={cerrarSesion} />

      <section className="contact-section">
        <div className="contact-wrapper">
          <div className="contact-header">
            <h1>CONTÁCTANOS</h1>
            <p>¿Tienes preguntas o sugerencias? Escríbenos.</p>
          </div>

          <div className="contact-grid">
            <div className="col-left">
              <div className="info-list">
                <div className="info-item">
                  <div className="info-icon"><i className="bi bi-geo-alt-fill"></i></div>
                  <div><strong>Ubicación</strong><span>Medellín, Colombia</span></div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><i className="bi bi-envelope-fill"></i></div>
                  <div><strong>Email</strong><span>contacto@fastdrive.co</span></div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><i className="bi bi-telephone-fill"></i></div>
                  <div><strong>Teléfono</strong><span>+57 300 123 4567</span></div>
                </div>
              </div>

              <div className="rating-box">
                <p className="rating-title"><i className="bi bi-star-fill"></i> Califica tu experiencia</p>
                <div className="stars">
                  {[1,2,3,4,5].map(val => (
                    <i key={val}
                      className={`bi bi-star-fill star ${val <= displayRating ? (hovered ? 'hovered' : 'active') : ''}`}
                      onMouseEnter={() => setHovered(val)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(val)}>
                    </i>
                  ))}
                </div>
                <p className={`stars-label ${rating > 0 ? 'rated' : ''}`}>
                  {rating > 0 ? `${rating} ★ — ${LABELS[rating - 1]}` : 'Selecciona una calificación'}
                </p>
              </div>
            </div>

            <div className="col-right">
              {!submitted ? (
                <div className="form-step">
                  <div className="form-field">
                    <input type="text" placeholder="Tu nombre"
                      value={nombreForm} onChange={e => setNombreForm(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <input type="email" placeholder="Tu correo"
                      value={correo} onChange={e => setCorreo(e.target.value)} />
                  </div>
                  <div className="form-field">
                    <textarea placeholder="Tu mensaje..." rows={5}
                      value={mensaje} onChange={handleMensaje}
                      style={borderError ? { borderColor: '#e05555' } : {}} />
                    <span className={getCharClass()}>{mensaje.length} / {MAX_CHARS}</span>
                  </div>
                  <button className="btn-enviar" onClick={submitForm}>
                    ENVIAR MENSAJE <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              ) : (
                <div className="form-step">
                  <div className="success-box">
                    <div className="success-circle">
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h3>¡Mensaje enviado!</h3>
                    <p>Gracias por escribirnos.</p>
                    <div className="success-stars">
                      {[1,2,3,4,5].map(i => (
                        <i key={i} className="bi bi-star-fill"
                          style={{ color: i <= rating ? '#f5c518' : '#d8daea' }}></i>
                      ))}
                    </div>
                    <button className="btn-enviar" onClick={resetForm} style={{ marginTop: '8px' }}>
                      <i className="bi bi-arrow-counterclockwise"></i> Enviar otro mensaje
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}