import "reflect-metadata";
import { Bebas_Neue, Nunito } from 'next/font/google';
import './globals.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Script from 'next/script';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

export const metadata = {
  title: 'FastDrive',
  description: 'Transporte estudiantil universitario en Medellín',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${bebasNeue.variable} ${nunito.variable}`}>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}