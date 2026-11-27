import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const game = new Game(canvas);
  game.start();

  const loadingScreen = document.getElementById('loading-screen');
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => loadingScreen.classList.add('hidden'), 500);
  }, 800);
});
