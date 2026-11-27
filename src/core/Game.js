import * as THREE from 'three';
import { gameConfig } from '../config/gameConfig.js';
import { EventBus } from './EventBus.js';
import { ServiceLocator } from './ServiceLocator.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from '../input/InputManager.js';
import { Renderer } from '../rendering/Renderer.js';
import { SceneFactory } from '../rendering/SceneFactory.js';
import { LocalPlayer } from '../entities/LocalPlayer.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { PlayerController } from '../controllers/PlayerController.js';
import { CameraController } from '../controllers/CameraController.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.eventBus = new EventBus();
    this.services = new ServiceLocator();

    // 1. Setup Renderer & Scene
    this.renderer = new Renderer(canvas);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(gameConfig.world.fogColor);
    this.scene.fog = new THREE.Fog(
      gameConfig.world.fogColor,
      gameConfig.world.fogNear,
      gameConfig.world.fogFar
    );

    // 2. Setup Input
    this.input = new InputManager(canvas, this.eventBus);

    // 3. Bangun Dunia (Tanah, Pohon, Air Mancur, Gedung)
    this.sceneFactory = new SceneFactory(this.scene);
    this.worldData = this.sceneFactory.buildWorld();

    // 4. Buat Pemain Utama ("Pak Guru")
    this.localPlayer = new LocalPlayer(
      'local-teacher',
      'Pak Guru',
      gameConfig.player.spawnPosition,
      this.worldData
    );
    this.playerManager = new PlayerManager(this.scene);
    this.playerManager.addPlayer(this.localPlayer, true);

    // 5. Setup Controller Pemain & Kamera TPS
    this.playerController = new PlayerController(this.localPlayer, this.input);
    this.cameraController = new CameraController(
      this.renderer.camera,
      this.localPlayer,
      this.input
    );

    // Registrasi ke ServiceLocator
    this.services.register('eventBus', this.eventBus);
    this.services.register('input', this.input);
    this.services.register('renderer', this.renderer);
    this.services.register('playerManager', this.playerManager);

    // Setup Sistem Interaksi Kuis (Langkah 4 Roadmap)
    this.score = 0;
    this.activeZone = null;
    this._setupQuizSystem();

    // 6. Game Loop
    this.gameLoop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
  }

  start() {
    this.gameLoop.start();
  }

  update(dt) {
    // Update input kamera
    this.cameraController.update(dt);

    // Update kontrol & fisika pemain
    const yaw = this.cameraController.yaw;
    this.playerController.update(dt, yaw);
    this.playerManager.update(dt);

    // Animasi partikel air mancur & pintu otomatis museum
    this.sceneFactory.update(dt, this.localPlayer.position);

    // Cek zona interaksi kuis & lokasi saat ini
    this._checkZones();

    // Reset delta mouse/touch setiap akhir frame
    this.input.endFrame();
  }

  render() {
    this.renderer.render(this.scene);
  }

  _checkZones() {
    const pos = this.localPlayer.position;
    const locEl = document.getElementById('location-box');
    const promptEl = document.getElementById('interact-prompt');
    const btnInteract = document.getElementById('btn-interact');

    let foundZone = null;
    for (const zone of this.worldData.interactionZones) {
      const dx = pos.x - zone.x;
      const dz = pos.z - zone.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= zone.radius) {
        foundZone = zone;
        break;
      }
    }

    this.activeZone = foundZone;
    if (foundZone) {
      locEl.textContent = `📍 Dekat ${foundZone.label}`;
      promptEl.textContent = `Tekan [E] atau Ketuk untuk Kuis ${foundZone.topic}`;
      promptEl.classList.remove('hidden');
      btnInteract.classList.remove('hidden');
    } else {
      locEl.textContent = pos.y > 2.2 ? '📍 Lantai 2 Museum' : '📍 Area Terbuka EduVenture';
      promptEl.classList.add('hidden');
      btnInteract.classList.add('hidden');
    }
  }

  _setupQuizSystem() {
    const modal = document.getElementById('quiz-modal');
    const titleEl = document.getElementById('quiz-title');
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    const closeBtn = document.getElementById('close-quiz');
    const promptEl = document.getElementById('interact-prompt');
    const btnInteract = document.getElementById('btn-interact');

    const openQuiz = () => {
      if (!this.activeZone) return;
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
      const topic = this.activeZone.topic;
      const list = gameConfig.quizzes[topic] || [];
      if (!list.length) return;

      const item = list[Math.floor(Math.random() * list.length)];
      titleEl.textContent = `Kuis ${topic}`;
      questionEl.textContent = item.q;
      feedbackEl.textContent = '';
      optionsEl.innerHTML = '';

      item.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
        btn.onclick = () => {
          if (idx === item.answer) {
            feedbackEl.style.color = '#16a34a';
            feedbackEl.textContent = '✅ Benar sekali! +100 Poin Edukasi!';
            this.score += 100;
            document.getElementById('score-val').textContent = String(this.score);
          } else {
            feedbackEl.style.color = '#dc2626';
            feedbackEl.textContent = `❌ Kurang tepat. Jawaban yang benar: ${item.options[item.answer]}`;
          }
          Array.from(optionsEl.children).forEach((b) => (b.disabled = true));
        };
        optionsEl.appendChild(btn);
      });

      modal.classList.remove('hidden');
    };

    this.eventBus.on('interact', openQuiz);
    promptEl.addEventListener('click', openQuiz);
    btnInteract.addEventListener('click', openQuiz);
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
  }
}
