import * as THREE from 'three';
import { gameConfig } from '../config/gameConfig.js';

export class PlayerController {
  constructor(player, input) {
    this.player = player;
    this.input = input;
  }

  update(dt, cameraYaw) {
    const state = this.input.getMovementInput();

    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forward, -state.z);
    moveDir.addScaledVector(right, state.x);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
    }

    let speed = gameConfig.player.walkSpeed;
    if (state.crouch) {
      speed = gameConfig.player.crouchSpeed;
      this.player.isSprinting = false;
    } else if (state.sprint && moveDir.lengthSq() > 0) {
      speed = gameConfig.player.sprintSpeed;
      this.player.isSprinting = true;
    } else {
      this.player.isSprinting = false;
    }

    this.player.applyMovement(moveDir, speed, state.jump, state.crouch, dt);
  }
}
