import PaginaAbajo from '@/components/PaginaAbajo';

const iconSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const cards = [
  { titulo: 'Conecta con tu sector', descripcion: 'Encuentra compañeros de viaje que viven cerca de ti y van a la misma universidad.', color: '#7c5cbf' },
  { titulo: 'Grupos de WhatsApp', descripcion: 'Únete a grupos organizados por ruta para coordinar horarios y compartir novedades.', color: '#7c5cbf' },
  { titulo: 'Eventos y networking', descripcion: 'Participa en encuentros de la comunidad FastDrive y amplía tu red de contactos universitarios.', color: '#7c5cbf' },
  { titulo: 'Apoyo entre estudiantes', descripcion: 'Comparte tips, materiales y experiencias con otros estudiantes de tu ruta.', color: '#7c5cbf' },
];

export default function ComunidadPage() {
  return (
    <PaginaAbajo
      titulo="Comunidad"
      descripcion="Más que un transporte, somos una red de estudiantes que se apoyan mutuamente."
      iconColor="linear-gradient(135deg, #7c5cbf 0%, #9b59b6 100%)"
      iconShadow="0 8px 32px rgba(124,92,191,0.35)"
      iconSvg={iconSvg}
      cards={cards}
    />
  );
}