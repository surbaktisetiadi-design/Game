import * as THREE from 'three';
import { TextureFactory } from '../TextureFactory.js';

/**
 * Desain Museum EduVenture Klasik Realistis
 * Menggunakan pilar silinder marmer, pedimen segitiga klasik,
 * pintu kaca geser otomatis berbingkai logam, tangga ke lantai 2,
 * serta artefak patung pahatan realistis di dalam etalase kaca.
 */
export class MuseumModel {
  constructor(config) {
    this.config = config;
    this.leftDoor = null;
    this.rightDoor = null;
    this.doorOpenAmount = 0;
    this.rotatingArtifacts = [];
  }

  build() {
    const group = new THREE.Group();
    const { x, y, z } = this.config.position;
    group.position.set(x, y, z);

    const marbleTex = TextureFactory.createMarbleTexture(4);
    const marbleMat = new THREE.MeshStandardMaterial({
      map: marbleTex,
      roughness: 0.35,
      metalness: 0.06,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.48,
      metalness: 0.25,
    });
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.92,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.18,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfe7ff,
      roughness: 0.06,
      metalness: 0.1,
      transmission: 0.62,
      transparent: true,
      opacity: 0.55,
    });

    const W = 16;
    const D = 14;
    const wallH = 7.6;
    const wallT = 0.6;

    // Lantai dasar marmer & undakan teras depan
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 0.32, D + 2.6), marbleMat);
    groundFloor.position.set(0, 0.16, 0.8);
    groundFloor.receiveShadow = true;
    group.add(groundFloor);

    // Karpet merah megah dengan lis emas
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.04, 12.2), carpetMat);
    carpet.position.set(0, 0.34, 0.8);
    carpet.receiveShadow = true;
    group.add(carpet);

    for (const gx of [-1.72, 1.72]) {
      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 12.2), goldMat);
      goldTrim.position.set(gx, 0.34, 0.8);
      group.add(goldTrim);
    }

    // Dinding marmer
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(W, wallH, wallT), marbleMat);
    backWall.position.set(0, wallH / 2, -D / 2 + wallT / 2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, D), marbleMat);
    leftWall.position.set(-W / 2 + wallT / 2, wallH / 2, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallT, wallH, D), marbleMat);
    rightWall.position.set(W / 2 - wallT / 2, wallH / 2, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;

    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(6, wallH, wallT), marbleMat);
    frontLeft.position.set(-5, wallH / 2, D / 2 - wallT / 2);
    frontLeft.castShadow = true;

    const frontRight = new THREE.Mesh(new THREE.BoxGeometry(6, wallH, wallT), marbleMat);
    frontRight.position.set(5, wallH / 2, D / 2 - wallT / 2);
    frontRight.castShadow = true;

    const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.6, wallT), marbleMat);
    frontHeader.position.set(0, 5.8, D / 2 - wallT / 2);

    group.add(backWall, leftWall, rightWall, frontLeft, frontRight, frontHeader);

    // Pilar Klasik Silinder Marmer di Teras Depan (dengan alas & kapital)
    for (const px of [-6.6, -2.8, 2.8, 6.6]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, wallH - 0.8, 20), marbleMat);
      col.position.set(px, wallH / 2, D / 2 + 1.2);
      col.castShadow = true;
      col.receiveShadow = true;

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.45, 1.25), marbleMat);
      base.position.set(px, 0.52, D / 2 + 1.2);

      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 1.3), marbleMat);
      capital.position.set(px, wallH - 0.22, D / 2 + 1.2);

      group.add(col, base, capital);
    }

    // Pintu Kaca Geser Otomatis berbingkai logam
    const makeDoorLeaf = (sign) => {
      const leaf = new THREE.Group();
      const pane = new THREE.Mesh(new THREE.BoxGeometry(1.9, 3.7, 0.08), glassMat);
      const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.12, 0.14), trimMat);
      frameTop.position.y = 1.85;
      const frameBot = frameTop.clone();
      frameBot.position.y = -1.85;
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 10), goldMat);
      handle.position.set(sign * -0.75, 0, 0.1);
      leaf.add(pane, frameTop, frameBot, handle);
      return leaf;
    };

    this.leftDoor = makeDoorLeaf(-1);
    this.leftDoor.position.set(-0.98, 2.15, D / 2 - 0.3);
    this.rightDoor = makeDoorLeaf(1);
    this.rightDoor.position.set(0.98, 2.15, D / 2 - 0.3);
    group.add(this.leftDoor, this.rightDoor);

    // Etalase Artefak Lantai 1 (Patung Abstrak TorusKnot & Globe Emas)
    const leftPed = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 1.15, 20), trimMat);
    leftPed.position.set(-4.5, 0.88, 1.8);
    leftPed.castShadow = true;
    const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(0.36, 0.11, 64, 12), goldMat);
    sculpture.position.set(-4.5, 1.92, 1.8);
    sculpture.castShadow = true;
    const leftCase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 1.45, 24), glassMat);
    leftCase.position.set(-4.5, 2.05, 1.8);
    group.add(leftPed, sculpture, leftCase);
    this.rotatingArtifacts.push(sculpture);

    const rightPed = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.82, 1.15, 20), trimMat);
    rightPed.position.set(4.5, 0.88, 1.8);
    rightPed.castShadow = true;
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.45, 24, 24), goldMat);
    globe.position.set(4.5, 1.92, 1.8);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.04, 10, 32), trimMat);
    ring.position.set(4.5, 1.92, 1.8);
    ring.rotation.x = Math.PI / 3;
    const rightCase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 1.45, 24), glassMat);
    rightCase.position.set(4.5, 2.05, 1.8);
    group.add(rightPed, globe, ring, rightCase);
    this.rotatingArtifacts.push(ring);

    // Tangga menuju Lantai 2 (Walkable Floors)
    const walkableFloors = [];
    const steps = 10;
    const totalHeight = 3.8;
    const stepH = totalHeight / steps;
    const stepD = 0.55;
    const stairStartZ = 1.2;

    for (let i = 0; i < steps; i++) {
      const topY = 0.3 + (i + 1) * stepH;
      const sz = stairStartZ - i * stepD;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, topY, stepD), marbleMat);
      stepMesh.position.set(-5.4, topY / 2, sz);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      group.add(stepMesh);

      walkableFloors.push({
        minX: x - 6.6,
        maxX: x - 4.2,
        minZ: z + sz - stepD / 2,
        maxZ: z + sz + stepD / 2,
        topY,
      });
    }

    // Balkon / Mezzanine Lantai 2
    const floor2Y = 0.3 + totalHeight;
    const mezzanine = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.35, 5.2), marbleMat);
    mezzanine.position.set(0, floor2Y - 0.175, -4.1);
    mezzanine.castShadow = true;
    mezzanine.receiveShadow = true;
    group.add(mezzanine);

    // Pagar kaca balkon lantai 2 dengan railing logam
    const railGlass = new THREE.Mesh(new THREE.BoxGeometry(11.6, 1.0, 0.08), glassMat);
    railGlass.position.set(1.4, floor2Y + 0.5, -1.55);
    const railBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 11.7, 10), goldMat);
    railBar.rotation.z = Math.PI / 2;
    railBar.position.set(1.4, floor2Y + 1.02, -1.55);
    group.add(railGlass, railBar);

    // Artefak Utama Lantai 2: Piala Emas Klasik (LatheGeometry)
    const trophyBase = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 1.1, 24), trimMat);
    trophyBase.position.set(2.5, floor2Y + 0.55, -4.2);
    const chalicePts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.45, 0.0),
      new THREE.Vector2(0.18, 0.25),
      new THREE.Vector2(0.14, 0.72),
      new THREE.Vector2(0.58, 1.15),
      new THREE.Vector2(0.62, 1.55),
      new THREE.Vector2(0.52, 1.55),
      new THREE.Vector2(0.46, 1.15),
      new THREE.Vector2(0.0, 0.95),
    ];
    const trophyGold = new THREE.Mesh(new THREE.LatheGeometry(chalicePts, 28), goldMat);
    trophyGold.position.set(2.5, floor2Y + 1.12, -4.2);
    trophyGold.castShadow = true;
    group.add(trophyBase, trophyGold);
    this.rotatingArtifacts.push(trophyGold);

    // Lampu hangat interior museum
    const interiorLight = new THREE.PointLight(0xfff3d6, 18, 22);
    interiorLight.position.set(0, 6.2, -1.0);
    group.add(interiorLight);

    walkableFloors.push({
      minX: x - 7.4,
      maxX: x + 7.4,
      minZ: z - 6.7,
      maxZ: z - 1.5,
      topY: floor2Y,
    });

    // Atap & Pedimen Segitiga Klasik Museum (ExtrudeGeometry)
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 1.6, 0.65, D + 3.4), marbleMat);
    cornice.position.set(0, wallH + 0.32, 0.55);
    cornice.castShadow = true;
    group.add(cornice);

    const pedShape = new THREE.Shape();
    pedShape.moveTo(-(W + 1.4) / 2, 0);
    pedShape.lineTo((W + 1.4) / 2, 0);
    pedShape.lineTo(0, 2.7);
    pedShape.closePath();

    const pedimentGeo = new THREE.ExtrudeGeometry(pedShape, {
      depth: D + 3.2,
      bevelEnabled: false,
    });
    const pediment = new THREE.Mesh(pedimentGeo, trimMat);
    pediment.position.set(0, wallH + 0.65, -(D + 3.2) / 2 + 0.55);
    pediment.castShadow = true;
    group.add(pediment);

    const colliders = [
      { minX: x - 8, maxX: x + 8, minY: 0, maxY: wallH, minZ: z - 7, maxZ: z - 6.4 },
      { minX: x - 8, maxX: x - 7.4, minY: 0, maxY: wallH, minZ: z - 7, maxZ: z + 7 },
      { minX: x + 7.4, maxX: x + 8, minY: 0, maxY: wallH, minZ: z - 7, maxZ: z + 7 },
      { minX: x - 8, maxX: x - 2, minY: 0, maxY: wallH, minZ: z + 6.4, maxZ: z + 7 },
      { minX: x + 2, maxX: x + 8, minY: 0, maxY: wallH, minZ: z + 6.4, maxZ: z + 7 },
    ];

    const interactionZone = {
      x: x + 2.5,
      z: z - 3.5,
      radius: 4.5,
      label: `${this.config.name} (Artefak Emas)`,
      topic: this.config.quizTopic,
    };

    return { mesh: group, colliders, walkableFloors, interactionZone };
  }

  update(dt, playerPos) {
    if (this.leftDoor && this.rightDoor) {
      const { x, z } = this.config.position;
      const doorZ = z + 6.7;
      const dist = Math.hypot(playerPos.x - x, playerPos.z - doorZ);

      const targetOpen = dist < 5.5 ? 1.85 : 0;
      this.doorOpenAmount += (targetOpen - this.doorOpenAmount) * Math.min(1, dt * 6);

      this.leftDoor.position.x = -0.98 - this.doorOpenAmount;
      this.rightDoor.position.x = 0.98 + this.doorOpenAmount;
    }

    for (const art of this.rotatingArtifacts) {
      art.rotation.y += dt * 0.6;
    }
  }
}
