import * as THREE from 'three';
import { Player } from './Player.js';
import { gameConfig } from '../config/gameConfig.js';

export class LocalPlayer extends Player {
  constructor(id, name, spawnPos, worldData) {
    super(id, name, spawnPos);
    this.worldData = worldData;

    this.velocity = new THREE.Vector3();
    this.isGrounded = false;
    this.radius = gameConfig.player.radius;
  }

  applyMovement(moveDir, speed, jump, crouch, dt) {
    this.isCrouching = crouch;
    this.isMoving = moveDir.lengthSq() > 0.001;

    // Gerak horizontal
    this.velocity.x = moveDir.x * speed;
    this.velocity.z = moveDir.z * speed;

    if (this.isMoving) {
      const targetYaw = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetYaw - this.rotationY;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.rotationY += diff * Math.min(1, dt * 14);
    }

    // Lompat
    if (jump && this.isGrounded) {
      this.velocity.y = gameConfig.player.jumpForce;
      this.isGrounded = false;
    }

    // Gravitasi
    this.velocity.y -= gameConfig.player.gravity * dt;

    // Integrasi posisi X & Z dengan pengecekan tabrakan dinding
    const nextX = this.position.x + this.velocity.x * dt;
    if (!this._checkWallCollision(nextX, this.position.y, this.position.z)) {
      this.position.x = nextX;
    }

    const nextZ = this.position.z + this.velocity.z * dt;
    if (!this._checkWallCollision(this.position.x, this.position.y, nextZ)) {
      this.position.z = nextZ;
    }

    // Batas dunia terbuka
    const halfBound = gameConfig.world.groundSize * 0.48;
    this.position.x = THREE.MathUtils.clamp(this.position.x, -halfBound, halfBound);
    this.position.z = THREE.MathUtils.clamp(this.position.z, -halfBound, halfBound);

    // Integrasi vertikal + Walkable Floors (Tangga & Lantai 2 Museum)
    this.position.y += this.velocity.y * dt;
    const floorY = this._getWalkableFloorY(this.position.x, this.position.y, this.position.z);

    if (this.position.y <= floorY) {
      this.position.y = floorY;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
  }

  _checkWallCollision(x, y, z) {
    const playerBottom = y + 0.45; // Toleransi tinggi anak tangga agar tidak tersangkut
    const playerTop = y + (this.isCrouching ? 1.6 : 2.35);

    for (const box of this.worldData.colliders) {
      // Cek overlap vertikal
      if (playerTop <= box.minY || playerBottom >= box.maxY) continue;

      // Cek overlap lingkaran (player) vs AABB (dinding)
      const closestX = THREE.MathUtils.clamp(x, box.minX, box.maxX);
      const closestZ = THREE.MathUtils.clamp(z, box.minZ, box.maxZ);
      const dx = x - closestX;
      const dz = z - closestZ;

      if (dx * dx + dz * dz < this.radius * this.radius) {
        return true;
      }
    }
    return false;
  }

  _getWalkableFloorY(x, currentY, z) {
    let highestFloor = 0; // Tanah dasar

    for (const floor of this.worldData.walkableFloors) {
      if (
        x >= floor.minX - this.radius * 0.5 &&
        x <= floor.maxX + this.radius * 0.5 &&
        z >= floor.minZ - this.radius * 0.5 &&
        z <= floor.maxZ + this.radius * 0.5
      ) {
        // Karakter bisa naik tangga secara halus jika perbedaan tinggi <= 0.65 unit
        if (floor.topY <= currentY + 0.65 && floor.topY > highestFloor) {
          highestFloor = floor.topY;
        }
      }
    }

    return highestFloor;
  }
}
