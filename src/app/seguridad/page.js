import PaginaAbajo from '@/components/PaginaAbajo';

const iconSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

const cards = [
  { titulo: 'Conductores verificados', descripcion: 'Cada conductor pasa por un proceso de verificación de identidad y antecedentes antes de unirse a la plataforma.', color: '#2ecc8a' },
  { titulo: 'Rutas conocidas', descripcion: 'Solo operamos rutas establecidas entre sectores residenciales y universidades, garantizando trayectos seguros.', color: '#2ecc8a' },
  { titulo: 'Seguimiento en tiempo real', descripcion: 'Comparte tu ubicación en tiempo real con tus contactos de confianza durante cada viaje.', color: '#2ecc8a' },
  { titulo: 'Calificaciones y reseñas', descripcion: 'Sistema de calificación transparente para que siempre viajes con los mejores conductores.', color: '#2ecc8a' },
];

export default function SeguridadPage() {
  return (
    <PaginaAbajo
      titulo="Seguridad"
      descripcion="Tu tranquilidad es nuestra prioridad. Cada viaje está respaldado por múltiples capas de protección."
      iconColor="linear-gradient(135deg, #2ecc8a 0%, #27b57a 100%)"
      iconShadow="0 8px 32px rgba(46,204,138,0.3)"
      iconSvg={iconSvg}
      cards={cards}
    />
  );
}