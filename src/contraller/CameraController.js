import * as THREE from 'three';
import { gameConfig } from '../config/gameConfig.js';

export class CameraController {
  constructor(camera, targetPlayer, input) {
    this.camera = camera;
    this.target = targetPlayer;
    this.input = input;

    this.yaw = 0;
    this.pitch = 0.18;
    this.currentPos = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();
    this.initialized = false;
  }

  update(dt) {
    const sensitivity = 0.0028;
    this.yaw -= this.input.lookDelta.x * sensitivity;
    this.pitch += this.input.lookDelta.y * sensitivity;

    this.pitch = THREE.MathUtils.clamp(
      this.pitch,
      gameConfig.camera.minPitch,
      gameConfig.camera.maxPitch
    );

    const cfg = gameConfig.camera;
    const headHeight = this.target.isCrouching ? cfg.heightOffset * 0.72 : cfg.heightOffset;

    const rightVec = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const pivot = new THREE.Vector3(
      this.target.position.x,
      this.target.position.y + headHeight,
      this.target.position.z
    ).addScaledVector(rightVec, cfg.shoulderOffset);

    const horizontalDist = cfg.distance * Math.cos(this.pitch);
    const verticalDist = cfg.distance * Math.sin(this.pitch);

    const desiredPos = new THREE.Vector3(
      pivot.x + Math.sin(this.yaw) * horizontalDist,
      pivot.y + verticalDist,
      pivot.z + Math.cos(this.yaw) * horizontalDist
    );

    if (desiredPos.y < 0.45) {
      desiredPos.y = 0.45;
    }

    const lookTarget = new THREE.Vector3(
      pivot.x - Math.sin(this.yaw) * 6,
      pivot.y - Math.sin(this.pitch) * 3,
      pivot.z - Math.cos(this.yaw) * 6
    );

    if (!this.initialized) {
      this.currentPos.copy(desiredPos);
      this.currentLookAt.copy(lookTarget);
      this.initialized = true;
    } else {
      const alpha = Math.min(1, dt * cfg.smoothFactor);
      this.currentPos.lerp(desiredPos, alpha);
      this.currentLookAt.lerp(lookTarget, alpha);
    }

    this.camera.position.copy(this.currentPos);
    this.camera.lookAt(this.currentLookAt);
  }
}
