/*
 * main.js — Punto de entrada de Vite
 * =====================================
 * Referenciado desde el <script type="module" src="/src/main.js"> de
 * index.html. Deliberadamente pequeño: importa la hoja de estilos y
 * delega en app.js. Mantenlo así — la lógica de arranque pertenece a
 * app.js para que sea fácil de encontrar.
 */

import './styles/main.css';
import { initApp } from './app.js';

initApp();
