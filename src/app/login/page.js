'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Importación para redirección
import Navbar from '../../components/Navbar';

export default function LoginPage() {
  // --- REFERENCIAS PARA ANIMACIONES Y DOM ---
  const wrapperRef    = useRef(null);
  const conductorRef  = useRef(null);
  const estudianteRef = useRef(null);
  const dividerRef    = useRef(null);
  const badgeRef      = useRef(null);

  const targetPctRef  = useRef(50);
  const currentPctRef = useRef(50);
  const rafRef        = useRef(null);
  const isLockedRef   = useRef(false);

  // --- ESTADOS DE LA INTERFAZ Y DATOS ---
  const router = useRouter();
  const [badgeIcon, setBadgeIcon] = useState('bi-arrow-left-right');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- LÓGICA DE AUTENTICACIÓN (NUEVA) ---
  async function handleLogin() {
    if (!email || !password) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Guardamos persistencia básica
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRol', data.idRol);
        localStorage.setItem('userNombreRol', data.nombreRol);
        localStorage.setItem('userName', data.nombre);
        localStorage.setItem('esPrincipal', data.userId === 1 ? 'true' : 'false');

        // Redirección inteligente basada en los roles de Oracle
        // Conductor = 2, Pasajero = 3, Mixto = 4
      if (data.nombreRol === 'ADMINISTRADOR') {
              router.push('/dashboard/admin');
          } else if (data.idRol === 2) {
              router.push('/dashboard/conductor');
          } else if (data.idRol === 4) {
              router.push('/dashboard/mixto');
          } else {
              router.push('/dashboard/pasajero');
          }
      } else {
        alert(data.error || "Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Ocurrió un error al conectar con el servidor.");
    }
  }

  // --- LÓGICA VISUAL Y ANIMACIONES (TU CÓDIGO ORIGINAL) ---
  function lerp(a, b, t) { return a + (b - a) * t; }

  function applyDivider(pct) {
    pct = Math.max(20, Math.min(80, pct));
    const right = 100 - pct;
    if (conductorRef.current)  conductorRef.current.style.width  = pct + '%';
    if (estudianteRef.current) {
      estudianteRef.current.style.left  = pct + '%';
      estudianteRef.current.style.width = right + '%';
    }
    if (dividerRef.current) dividerRef.current.style.left = pct + '%';
  }

  function animate() {
    currentPctRef.current = lerp(currentPctRef.current, targetPctRef.current, 0.08);
    applyDivider(currentPctRef.current);
    const diff = currentPctRef.current - 50;
    if (conductorRef.current)  conductorRef.current.style.transform  = `perspective(1200px) rotateY(${diff * 0.04}deg)`;
    if (estudianteRef.current) estudianteRef.current.style.transform = `perspective(1200px) rotateY(${-diff * 0.04}deg)`;
    rafRef.current = requestAnimationFrame(animate);
  }

  function setActive(role) {
    isLockedRef.current = true;
    const w = wrapperRef.current;
    w.classList.remove('show-conductor', 'show-estudiante');
    if (role === 'conductor') {
      w.classList.add('show-conductor');
      targetPctRef.current = 65;
      conductorRef.current.querySelector('.panel-content').style.opacity  = '1';
      estudianteRef.current.querySelector('.panel-content').style.opacity = '0.15';
    } else {
      w.classList.add('show-estudiante');
      targetPctRef.current = 35;
      conductorRef.current.querySelector('.panel-content').style.opacity  = '0.15';
      estudianteRef.current.querySelector('.panel-content').style.opacity = '1';
    }
  }

  function unlock() {
    isLockedRef.current = false;
    const w = wrapperRef.current;
    w.classList.remove('show-conductor', 'show-estudiante');
    targetPctRef.current = 50;
    conductorRef.current.querySelector('.panel-content').style.opacity  = '1';
    estudianteRef.current.querySelector('.panel-content').style.opacity = '1';
  }

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);

    const conductor  = conductorRef.current;
    const estudiante = estudianteRef.current;
    const wrapper    = wrapperRef.current;

    [conductor, estudiante].forEach(panel => {
      const glow = document.createElement('div');
      glow.className = 'panel-glow';
      panel.appendChild(glow);
      panel.addEventListener('mousemove', e => {
        const rect = panel.getBoundingClientRect();
        glow.style.left    = (e.clientX - rect.left) + 'px';
        glow.style.top     = (e.clientY - rect.top)  + 'px';
        glow.style.opacity = '1';
      });
      panel.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    });

    const onClickConductor  = () => setActive('conductor');
    const onClickEstudiante = () => setActive('estudiante');
    conductor.addEventListener('click',  onClickConductor);
    estudiante.addEventListener('click', onClickEstudiante);

    let touchStartX = 0;
    wrapper.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrapper.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) setActive(dx < 0 ? 'estudiante' : 'conductor');
    }, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      conductor.removeEventListener('click',  onClickConductor);
      estudiante.removeEventListener('click', onClickEstudiante);
    };
  }, []);

  return (
    <div className="login-page">
      <Navbar />

      <div className="slider-wrapper" ref={wrapperRef}>
        <div className="divider" ref={dividerRef}>
          <div className="divider-badge" ref={badgeRef} onClick={e => { e.stopPropagation(); unlock(); }}>
            <i className={`bi ${badgeIcon}`}></i>
          </div>
        </div>

        {/* PANEL CONDUCTOR */}
        <div className="panel panel-conductor" ref={conductorRef}>
          <i className="bi bi-car-front-fill panel-icon-bg"></i>
          <div className="panel-click-zone zone-right" onClick={() => setActive('conductor')}>
            <i className="bi bi-chevron-left zone-arrow"></i>
          </div>
          <div className="panel-content">
            <div className="role-badge"><i className="bi bi-steering2"></i> Conductor</div>
            <div className="panel-label"><i className="bi bi-car-front-fill"></i> ACCESO</div>
            <h2 className="panel-title">CONDUCTOR<br />FASTDRIVE</h2>
            <p className="panel-subtitle">Maneja tu agenda y gestiona tus rutas</p>

            <div className="form-group">
              <i className="bi bi-envelope-fill"></i>
              <input
                type="email"
                className="form-control-custom"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <i className="bi bi-lock-fill"></i>
              <input
                type="password"
                className="form-control-custom"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <a href="#" style={{ fontSize: '0.78rem', color: '#5a5ef5', fontWeight: 700, textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button className="btn-submit" onClick={handleLogin}>
              <i className="bi bi-speedometer2"></i> INICIAR SESIÓN
            </button>

            <div className="divider-text">o continúa con</div>
            <button className="btn-submit btn-google">
              <i className="bi bi-google" style={{ color: '#ea4335' }}></i>
              <span style={{ color: '#ccd0e8', fontSize: '0.85rem' }}>Google</span>
            </button>
            <div className="form-footer">
              ¿No tienes cuenta? <Link href="/registro">Regístrate como conductor</Link>
            </div>
          </div>
        </div>

        {/* PANEL ESTUDIANTE */}
        <div className="panel panel-estudiante" ref={estudianteRef}>
          <i className="bi bi-mortarboard-fill panel-icon-bg"></i>
          <div className="panel-click-zone zone-left" onClick={() => setActive('estudiante')}>
            <i className="bi bi-chevron-right zone-arrow"></i>
          </div>
          <div className="panel-content">
            <div className="role-badge"><i className="bi bi-mortarboard-fill"></i> Estudiante</div>
            <div className="panel-label"><i className="bi bi-backpack-fill"></i> ACCESO</div>
            <h2 className="panel-title">ESTUDIANTE<br />FASTDRIVE</h2>
            <p className="panel-subtitle">Reserva tus viajes y llega a tiempo a clase</p>

            <div className="form-group">
              <i className="bi bi-envelope-fill"></i>
              <input
                type="email"
                className="form-control-custom"
                placeholder="Correo universitario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <i className="bi bi-lock-fill"></i>
              <input
                type="password"
                className="form-control-custom"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <a href="#" style={{ fontSize: '0.78rem', color: '#2ecc8a', fontWeight: 700, textDecoration: 'none' }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button className="btn-submit" onClick={handleLogin}>
              <i className="bi bi-rocket-takeoff-fill"></i> INICIAR SESIÓN
            </button>

            <div className="divider-text">o continúa con</div>
            <button className="btn-submit btn-google">
              <i className="bi bi-google" style={{ color: '#ea4335' }}></i>
              <span style={{ color: '#ccd0e8', fontSize: '0.85rem' }}>Google</span>
            </button>
            <div className="form-footer">
              ¿No tienes cuenta? <Link href="/registro">Regístrate como estudiante</Link>
            </div>
          </div>
        </div>

        <div className="switch-hint">
          <i className="bi bi-arrow-left"></i> desliza para cambiar <i className="bi bi-arrow-right"></i>
        </div>
      </div>
    </div>
  );
}