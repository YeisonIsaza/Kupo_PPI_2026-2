'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../presentation/components/Navbar';
import Footer from '../presentation/components/Footer';

export default function HomePage(): React.JSX.Element | null {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="hero-kupo">
        <div className="hero-badge-kupo">
          LA NUEVA ERA DEL TRANSPORTE UNIVERSITARIO
        </div>
        <h1 className="hero-title-kupo">
          MUÉVETE INTELIGENTE.<br />
          <span>MUÉVETE KUPO.</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: '#5a5e7a', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6, fontWeight: 600 }}>
          Olvida el estrés de llegar tarde. Conecta con conductores y pasajeros de tu universidad, ahorra dinero y viaja seguro todos los días.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/registro" style={{
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            color: 'white',
            padding: '16px 40px',
            borderRadius: '50px',
            fontFamily: 'var(--font-nunito)',
            fontWeight: 800,
            fontSize: '1.1rem',
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(79, 70, 229, 0.3)',
            transition: 'transform 0.2s'
          }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
             onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Comenzar Ahora
          </Link>
          <Link href="/login" style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            color: '#4f46e5',
            border: '2px solid rgba(79, 70, 229, 0.2)',
            padding: '14px 40px',
            borderRadius: '50px',
            fontFamily: 'var(--font-nunito)',
            fontWeight: 800,
            fontSize: '1.1rem',
            textDecoration: 'none',
            transition: 'transform 0.2s, background 0.2s'
          }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = 'white'; }} 
             onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'; }}>
            Iniciar Sesión
          </Link>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section style={{ position: 'relative', zIndex: 10 }}>
        <div className="bento-grid">
          
          <Link href="/seguridad" className="bento-item bento-1 reveal">
            <h3>Seguridad Verificada</h3>
            <p>Conductores y pasajeros autenticados con su carnet universitario. Viaja tranquilo sabiendo con quién compartes el trayecto.</p>
            <i className="bi bi-shield-check bento-icon"></i>
          </Link>

          <Link href="/economia" className="bento-item bento-2 reveal" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' }}>
            <h3 style={{ color: 'white' }}>Economía</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>Ahorra dinero dividiendo los gastos de gasolina en cada viaje.</p>
            <i className="bi bi-wallet2 bento-icon" style={{ color: 'rgba(255,255,255,0.1)' }}></i>
          </Link>

          <Link href="/puntualidad" className="bento-item bento-3 reveal">
            <h3>Cero Retrasos</h3>
            <p>Sincroniza tus horarios de clase con las rutas disponibles y llega siempre a tiempo.</p>
            <i className="bi bi-clock-history bento-icon"></i>
          </Link>

          <Link href="/comunidad" className="bento-item bento-4 reveal">
            <h3>Tu Comunidad</h3>
            <p>Conoce estudiantes de tu misma zona, amplía tu red de contactos y haz que el viaje a la U sea mucho más divertido.</p>
            <i className="bi bi-people-fill bento-icon"></i>
          </Link>

        </div>
      </section>

      <Footer />
    </>
  );
}