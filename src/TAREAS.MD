# 🚗 Plan de Acción: Módulo de Conductores

## FASE 1 — BASE DE DATOS ✅ *(ya tienes las tablas)*

Verifica que existan estos estados en Oracle:

```sql
-- Estados para RUTA_CONDUCTOR
SELECT * FROM ESTADO WHERE CATEGORIA = 'RUTA';

-- Estados para VIAJE  
SELECT * FROM ESTADO WHERE CATEGORIA = 'VIAJE';
Deben existir al menos:

ACTIVO e INACTIVO en la categoría RUTA

PUBLICADO, EN_CURSO, FINALIZADO en la categoría VIAJE

Nota: Si no existen, agrégalos desde el panel admin en la Gestión de Estados.


FASE 2 — BACKEND (APIs)
Necesitas crear estas 5 APIs:

GET /api/conductor/rutas — Lista las rutas plantilla del conductor.

POST /api/conductor/rutas — Crea una ruta plantilla.

PATCH /api/conductor/rutas/[id] — Activa/desactiva una ruta.

GET /api/conductor/rutas/[id]/paradas — Lista paradas de una ruta.

POST /api/conductor/rutas/[id]/paradas — Agrega paradas a una ruta.

La lógica clave es separar la ruta plantilla del viaje publicado:

Plaintext
RUTA_CONDUCTOR → Plantilla semanal (Casa → Universidad)
VIAJE          → Instancia diaria  (hoy a las 7am se publica)
Cuando el conductor hace clic en "Publicar", el sistema crea un registro en la tabla VIAJE con FECHA_VJ = hoy.

FASE 3 — GOOGLE MAPS
Necesitas una API Key de Google Maps. Ve a Google Cloud Console, activa Maps JavaScript API y Geocoding API, copia la key y agrégala en tu .env.local:

Fragmento de código
NEXT_PUBLIC_GOOGLE_MAPS_KEY=tu_key_aqui
El mapa lo usarás para:

Capturar latitud y longitud del origen y destino al crear la ruta.

Mostrar las paradas con marcadores.

Dibujar el trazado entre paradas.

FASE 4 — FRONTEND
La estructura de carpetas y componentes del panel conductor quedará así:

Plaintext
/dashboard/conductor
├── Tarjeta: Mis Rutas       → /app-conductor/rutas
├── Tarjeta: Mis Viajes      → (próximamente)
├── Tarjeta: Calificaciones  → (próximamente)
└── Tarjeta: Ganancias       → (próximamente)

/app-conductor/rutas
├── Lista de rutas plantilla
├── Botón crear nueva ruta
├── Por cada ruta:
│   ├── Botón Publicar/Despublicar
│   ├── Paradas configuradas
│   └── Mapa con trazado
🏗️ SUGERENCIAS ARQUITECTÓNICAS
Separación Ruta vs Viaje:
Plaintext
RUTA_CONDUCTOR (plantilla)     VIAJE (instancia diaria)
─────────────────────────      ────────────────────────
ID_RC                     →    ID_RC (FK)
HORA_SALIDA_RC                 FECHA_VJ (hoy)
NIT_UNI                        HORA_SALIDA_VJ
PUNTO_ORIGEN_* ID_VEH
PUNTO_DESTINO_* ID_ESTADO
ID_ESTADO (ACTIVO/INACTIVO)
Gestión de Estado en Frontend:
Si RUTA_CONDUCTOR.ID_ESTADO = ACTIVO → muestra "Publicada" en color verde.

Si RUTA_CONDUCTOR.ID_ESTADO = INACTIVO → muestra "No publicada" en color gris.

📋 ORDEN DE IMPLEMENTACIÓN
[ ] 1. Verificar estados en Oracle.

[ ] 2. Crear API GET /api/conductor/rutas.

[ ] 3. Crear API POST /api/conductor/rutas.

[ ] 4. Crear API PATCH /api/conductor/rutas/[id].

[ ] 5. Crear API de paradas.

[ ] 6. Obtener Google Maps API Key.

[ ] 7. Crear página /app-conductor/rutas con lista de rutas.

[ ] 8. Agregar formulario de crear ruta con mapa.

[ ] 9. Agregar gestión de paradas.

[ ] 10. Conectar botón "Publicar" para que inserte en la tabla VIAJE.