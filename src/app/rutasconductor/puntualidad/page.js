import PaginaAbajo from '../../@/components/PaginaAbajo';

const iconSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

const cards = [
  { titulo: 'Horarios fijos', descripcion: 'Rutas con horarios establecidos que se ajustan a los bloques de clase de las principales universidades.', color: '#3bbfef' },
  { titulo: 'Notificaciones en tiempo real', descripcion: 'Recibe alertas cuando tu conductor está en camino y cuando está por llegar a tu punto de recogida.', color: '#3bbfef' },
  { titulo: 'Planificación anticipada', descripcion: 'Reserva tus viajes con anticipación para asegurar tu cupo y planificar tu semana sin estrés.', color: '#3bbfef' },
  { titulo: 'Rutas optimizadas', descripcion: 'Nuestras rutas están diseñadas para minimizar el tiempo de viaje, evitando zonas de alto tráfico.', color: '#3bbfef' },
];

export default function PuntualidadPage() {
  return (
    <PaginaAbajo
      titulo="Puntualidad"
      descripcion="Sabemos que cada minuto cuenta. Nuestros horarios están diseñados para que nunca llegues tarde a clase."
      iconColor="linear-gradient(135deg, #3bbfef 0%, #1a9fd4 100%)"
      iconShadow="0 8px 32px rgba(59,191,239,0.3)"
      iconSvg={iconSvg}
      cards={cards}
    />
  );
}