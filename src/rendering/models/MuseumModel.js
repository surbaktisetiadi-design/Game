import * as THREE from 'three';

export class MuseumModel {
  constructor(config) {
    this.config = config;
    this.leftDoor = null;
    this.rightDoor = null;
    this.doorOpenAmount = 0;
  }

  build() {
    const group = new THREE.Group();
    const { x, y, z } = this.config.position;
    group.position.set(x, y, z);

    const marbleMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.45 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const carpetMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.85 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.75,
      roughness: 0.25,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });

    // Dimensi Museum: Lebar 16m (X: -8..+8), Kedalaman 14m (Z: -7..+7)
    const W = 16;
    const D = 14;
    const wallH = 7.6;
    const wallT = 0.6;

    // Lantai dasar marmer
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(W, 0.3, D), marbleMat);
    groundFloor.position.y = 0.15;
    groundFloor.receiveShadow = true;
    group.add(groundFloor);

    // Karpet merah megah di tengah lobi
    const carpet = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.05, 11.5), carpetMat);
    carpet.position.set(0, 0.32, 0.5);
    carpet.receiveShadow = true;
    group.add(carpet);

    // Dinding Belakang, Kiri, Kanan
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

    // Dinding Depan terbelah 2 (Pintu masuk terbuka di tengah lebar 4m: X -2..+2)
    const frontLeft = new THREE.Mesh(new THREE.BoxGeometry(6, wallH, wallT), marbleMat);
    frontLeft.position.set(-5, wallH / 2, D / 2 - wallT / 2);
    frontLeft.castShadow = true;

    const frontRight = new THREE.Mesh(new THREE.BoxGeometry(6, wallH, wallT), marbleMat);
    frontRight.position.set(5, wallH / 2, D / 2 - wallT / 2);
    frontRight.castShadow = true;

    const frontHeader = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.6, wallT), marbleMat);
    frontHeader.position.set(0, 5.8, D / 2 - wallT / 2);

    group.add(backWall, leftWall, rightWall, frontLeft, frontRight, frontHeader);

    // Pilar-pilar besar di teras depan museum
    for (const px of [-6.5, -2.6, 2.6, 6.5]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, wallH, 0.85), marbleMat);
      pillar.position.set(px, wallH / 2, D / 2 + 1.1);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // Pintu kaca otomatis (bergeser membuka saat pemain mendekat)
    this.leftDoor = new THREE.Mesh(new THREE.BoxGeometry(1.95, 3.8, 0.14), glassMat);
    this.leftDoor.position.set(-0.98, 2.0, D / 2 - 0.3);

    this.rightDoor = new THREE.Mesh(new THREE.BoxGeometry(1.95, 3.8, 0.14), glassMat);
    this.rightDoor.position.set(0.98, 2.0, D / 2 - 0.3);
    group.add(this.leftDoor, this.rightDoor);

    // Etalase Emas & Patung di Lantai 1
    for (const ex of [-4.5, 4.5]) {
      const pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.6), trimMat);
      pedestal.position.set(ex, 0.85, 1.5);
      pedestal.castShadow = true;

      const artifact = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.8), goldMat);
      artifact.position.set(ex, 1.85, 1.5);
      artifact.rotation.y = Math.PI / 4;

      const glassCase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), glassMat);
      glassCase.position.set(ex, 1.9, 1.5);

      group.add(pedestal, artifact, glassCase);
    }

    // Tangga menuju Lantai 2 (di sisi kiri belakang museum: X = -5.2, Z dari +1.5 naik ke -4.5)
    const walkableFloors = [];
    const steps = 10;
    const totalHeight = 3.8;
    const stepH = totalHeight / steps;
    const stepD = 0.55;
    const stairStartZ = 1.2;

    for (let i = 0; i < steps; i++) {
      const topY = 0.3 + (i + 1) * stepH;
      const sz = stairStartZ - i * stepD;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, topY, stepD), trimMat);
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

    // Balkon / Mezzanine Lantai 2 (Y = 4.1)
    const floor2Y = 0.3 + totalHeight;
    const mezzanine = new THREE.Mesh(new THREE.BoxGeometry(14.8, 0.35, 5.2), marbleMat);
    mezzanine.position.set(0, floor2Y - 0.175, -4.1);
    mezzanine.castShadow = true;
    mezzanine.receiveShadow = true;
    group.add(mezzanine);

    // Pagar kaca balkon lantai 2
    const railGlass = new THREE.Mesh(new THREE.BoxGeometry(11.6, 1.0, 0.12), glassMat);
    railGlass.position.set(1.4, floor2Y + 0.5, -1.55);
    group.add(railGlass);

    // Patung Emas Utama di Lantai 2
    const trophyBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 2.2), trimMat);
    trophyBase.position.set(2.5, floor2Y + 0.55, -4.2);
    const trophyGold = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.2), goldMat);
    trophyGold.position.set(2.5, floor2Y + 1.9, -4.2);
    group.add(trophyBase, trophyGold);

    walkableFloors.push({
      minX: x - 7.4,
      maxX: x + 7.4,
      minZ: z - 6.7,
      maxZ: z - 1.5,
      topY: floor2Y,
    });

    // Atap Museum
    const roof = new THREE.Mesh(new THREE.BoxGeometry(W + 1.4, 0.8, D + 2.4), trimMat);
    roof.position.set(0, wallH + 0.4, 0.4);
    roof.castShadow = true;
    group.add(roof);

    // Colliders khusus dinding museum (membiarkan pintu tengah terbuka)
    const colliders = [
      // Dinding belakang
      { minX: x - 8, maxX: x + 8, minY: 0, maxY: wallH, minZ: z - 7, maxZ: z - 6.4 },
      // Dinding kiri
      { minX: x - 8, maxX: x - 7.4, minY: 0, maxY: wallH, minZ: z - 7, maxZ: z + 7 },
      // Dinding kanan
      { minX: x + 7.4, maxX: x + 8, minY: 0, maxY: wallH, minZ: z - 7, maxZ: z + 7 },
      // Dinding depan kiri (X: -8..-2)
      { minX: x - 8, maxX: x - 2, minY: 0, maxY: wallH, minZ: z + 6.4, maxZ: z + 7 },
      // Dinding depan kanan (X: +2..+8)
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
    if (!this.leftDoor || !this.rightDoor) return;
    const { x, z } = this.config.position;
    const doorZ = z + 6.7;
    const dist = Math.hypot(playerPos.x - x, playerPos.z - doorZ);

    const targetOpen = dist < 5.5 ? 1.85 : 0;
    this.doorOpenAmount += (targetOpen - this.doorOpenAmount) * Math.min(1, dt * 6);

    this.leftDoor.position.x = -0.98 - this.doorOpenAmount;
    this.rightDoor.position.x = 0.98 + this.doorOpenAmount;
  }
}
