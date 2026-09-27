'use client';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PaginaAbajo({ titulo, descripcion, iconColor, iconShadow, iconSvg, cards }) {

  useEffect(() => {
    const elements = document.querySelectorAll('.card-abajo');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const index = Array.from(elements).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('visible'), index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="abajo-page">
      <Navbar />

      <section className="hero-abajo">
        <div className="shield-icon-abajo" style={{ background: iconColor, boxShadow: iconShadow }}>
          {iconSvg}
        </div>
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </section>

      <section className="cards-section-abajo">
        <div className="cards-grid-abajo">
          {cards.map((card, i) => (
            <div key={i} className="card-abajo">
              <div className="card-check-abajo" style={{ color: card.color }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <h3>{card.titulo}</h3>
                <p>{card.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}