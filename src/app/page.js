'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


const textos = {
  conductor: 'En Fast Drive conectamos a estudiantes de Medellín para que el transporte no sea un obstáculo en tu carrera. Ofrece tus rutas, genera ingresos y ayuda a otros estudiantes a llegar a tiempo.',
  pasajero:  'En Fast Drive conectamos a estudiantes de Medellín para que el transporte no sea un obstáculo en tu carrera. Encuentra rutas seguras desde tu sector hasta las principales universidades.',
};

export default function HomePage() {
  const [tab, setTab] = useState('conductor');

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
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <div className="badge-pill">
              <i className="bi bi-car-front-fill"></i> LLEGA VOLANDO
            </div>
            <h1 className="hero-title">
              TU TRANSPORTE<br />
              <span>FÁCIL Y RÁPIDO,</span><br />
              CON FASTDRIVE!
            </h1>
            <div className="hero-tabs">
              <button
                className={`tab-btn ${tab === 'conductor' ? 'active' : ''}`}
                onClick={() => setTab('conductor')}>
                CONDUCTOR
              </button>
              <button
                className={`tab-btn ${tab === 'pasajero' ? 'active' : ''}`}
                onClick={() => setTab('pasajero')}>
                PASAJERO
              </button>
            </div>
            <p className="hero-desc">{textos[tab]}</p>
            <Link href="#" className="btn-primary-cta">
              VER MIS VIAJES <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div className="hero-right">
            <div className="hero-car">
              <Image src="/img/car.png" alt="Auto FastDrive" width={580} height={400} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="why-section">
        <div className="why-container">
          <h2 className="why-title reveal">¿POR QUÉ <span>FASTDRIVE</span>?</h2>
          <div className="features-grid">
            {[
              { href: '/seguridad',   icon: 'bi-shield-fill',     title: 'Seguridad',   desc: 'Viaja con conductores verificados y rutas conocidas.' },
              { href: '/puntualidad', icon: 'bi-clock-fill',      title: 'Puntualidad', desc: 'Horarios fijos que se ajustan a tu jornada universitaria.' },
              { href: '/comunidad',   icon: 'bi-people-fill',     title: 'Comunidad',   desc: 'Conecta con otros estudiantes de tu sector.' },
              { href: '/economia',    icon: 'bi-car-front-fill',  title: 'Economía',    desc: 'Comparte gastos y ahorra en tu transporte diario.' },
            ].map(f => (
              <Link key={f.href} href={f.href} className="feature-link reveal">
                <div className="feature-card">
                  <div className="feature-icon"><i className={`bi ${f.icon}`}></i></div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}