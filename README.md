# MiCrédito

Calculadora educativa para tarjetas de EE. UU. y Puerto Rico. Vite, TypeScript en el dominio, JavaScript modular y PWA; sin cuentas ni servidor de datos.

## Desarrollo

Node 24: `npm ci`, `npm test`, `npm run build`, `npm run dev`.

Los importes se calculan en centavos enteros. La compra se clasifica por registro respecto al próximo corte; el día del corte es ambiguo. La pantalla pide cuatro datos: límite, saldo actual, próximo corte y próximo vencimiento. Muestra el importe del 30% del límite y el pago para alcanzar 30%, 9% o cero. El pendiente del estado anterior no se infiere del saldo actual; se explica que debe confirmarse con el banco. La simulación de compras queda como explicación desplegable.

## Arquitectura

- `src/features/calculator.ts`: lógica pura, tipada y probada.
- `src/features/app-shell.js`: estructura accesible.
- `src/main.js`: interacción y presentación.
- `src/services/cards.js`: perfiles locales por tarjeta, con saldos separados en sesión; migración desde la sesión anterior.
- `src/components/card-picker.js`: selección, nombre, alta y borrado de tarjetas; ejemplo aislado.
- `src/styles/app.css`: diseño adaptable y áreas seguras.
- `scripts/offline.mjs`: precaché coherente y versionado a partir del build.

GitHub Actions prueba y compila; Pages publica únicamente `dist/`. No se publican tests ni fuentes en el artefacto de Pages, aunque este repositorio público sí contiene las fuentes. No se transmiten entradas de la calculadora. Sin analítica. Nombre, límite y fechas se conservan localmente al cerrar y reabrir. El saldo se conserva solo en la pestaña, separado por tarjeta. El usuario puede borrar una tarjeta o todas con confirmación. Los ejemplos nunca sobrescriben las tarjetas. No hay sincronización entre dispositivos; borrar datos del navegador o salir del modo privado puede eliminar los perfiles. Las fechas exactas guardadas no se avanzan automáticamente; se avisa si ya pasaron.

## Límites

Las proyecciones suponen pagos aplicados antes del corte y ausencia de otros movimientos. No se predicen intereses, puntaje, fecha exacta de reporte ni capacidad de gasto. El vencimiento corresponde al estado ya emitido; el corte ingresado corresponde al ciclo abierto. Confirmar las fechas exactas cada ciclo.

## Fuentes

- CFPB: https://www.consumerfinance.gov/ask-cfpb/what-is-a-grace-period-for-a-credit-card-en-47/
- Chase: https://www.chase.com/personal/credit-cards/education/basics/what-is-a-closing-date-on-a-credit-card.html
- FICO: https://www.myfico.com/credit-education/blog/accounts-credit-utilization-ratio
