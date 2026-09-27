import PaginaAbajo from '@/components/PaginaAbajo';

const iconSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="40" height="40">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
  </svg>
);

const cards = [
  { titulo: 'Costos compartidos', descripcion: 'Divide el costo del viaje entre varios pasajeros y paga solo una fracción de lo que gastarías solo.', color: '#f0a500' },
  { titulo: 'Tarifas transparentes', descripcion: 'Sin cobros ocultos ni tarifas dinámicas. Sabes exactamente cuánto pagarás antes de reservar.', color: '#f0a500' },
  { titulo: 'Más barato que apps de taxi', descripcion: 'Nuestras tarifas son hasta un 60% más económicas que las aplicaciones de transporte tradicionales.', color: '#f0a500' },
  { titulo: 'Ahorro mensual real', descripcion: 'Con planes semanales y mensuales, puedes ahorrar significativamente en tu presupuesto de transporte.', color: '#f0a500' },
];

export default function EconomiaPage() {
  return (
    <PaginaAbajo
      titulo="Economía"
      descripcion="Transporte universitario accesible. Comparte gastos y ahorra sin sacrificar comodidad."
      iconColor="linear-gradient(135deg, #f0a500 0%, #e08c00 100%)"
      iconShadow="0 8px 32px rgba(240,165,0,0.35)"
      iconSvg={iconSvg}
      cards={cards}
    />
  );
}