import { defineConfig } from 'vite';

// Configuración simple de Vite + JS vanilla — no hace falta ningún
// plugin de framework. index.html en la raíz del proyecto es el único
// punto de entrada (ver su etiqueta <script type="module" src="/src/main.js">).
//
// Cuando el tutor IA tenga un backend real (ver src/services/tutor-api.js
// y .env.example), se puede agregar aquí un proxy local de desarrollo,
// por ejemplo:
//   server: { proxy: { '/api': 'http://localhost:3001' } }
export default defineConfig({
  server: {
    port: 5173,
  },
});
