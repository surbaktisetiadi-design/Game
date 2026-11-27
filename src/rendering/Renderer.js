import * as THREE from 'three';
import { gameConfig } from '../config/gameConfig.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;

    this.webgl = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.setSize(window.innerWidth, window.innerHeight);
    this.webgl.shadowMap.enabled = true;
    this.webgl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.webgl.toneMapping = THREE.ACESFilmicToneMapping;
    this.webgl.toneMappingExposure = 1.05;

    this.camera = new THREE.PerspectiveCamera(
      gameConfig.camera.fov,
      window.innerWidth / window.innerHeight,
      gameConfig.camera.near,
      gameConfig.camera.far
    );

    window.addEventListener('resize', () => this._onResize());
  }

  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.webgl.setSize(window.innerWidth, window.innerHeight);
  }

  render(scene) {
    this.webgl.render(scene, this.camera);
  }
}
