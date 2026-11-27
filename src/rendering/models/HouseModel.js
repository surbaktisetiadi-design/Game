import * as THREE from 'three';
import { TextureFactory } from '../TextureFactory.js';

/**
 * Desain Rumah Tropis 2 Lantai Realistis (Gedung Matematika)
 * Dilengkapi atap limasan bertingkat bertekstur genteng, kolom batu andesit,
 * kusen jendela & pintu kayu jati, balkon kaca berpagar baja, pergola carport,
 * lampu teras hangat, dan pot tanaman hias.
 */
export class HouseModel {
  constructor(config) {
    this.config = config;
  }

  build() {
    const group = new THREE.Group();
    const { x, y, z } = this.config.position;
    group.position.set(x, y, z);

    const stuccoMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.createStuccoTexture(4),
      roughness: 0.78,
    });
    const andesiteMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.createAndesiteTexture(3, 2),
      roughness: 0.88,
    });
    const woodMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.createWoodTexture(2, 2),
      roughness: 0.55,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.createRoofTileTexture(7, 4),
      roughness: 0.68,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.75,
      roughness: 0.25,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xbfe7ff,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.55,
      transparent: true,
      opacity: 0.65,
    });
    const warmLampMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 1.4,
    });

    // 1. Pondasi & Teras Undakan Batu Andesit
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.55, 9.8), andesiteMat);
    foundation.position.set(0, 0.275, 0.2);
    foundation.receiveShadow = true;
    foundation.castShadow = true;
    group.add(foundation);

    const frontStep = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.26, 1.1), andesiteMat);
    frontStep.position.set(0, 0.13, 5.45);
    frontStep.receiveShadow = true;
    group.add(frontStep);

    // 2. Dinding Lantai 1 (Plester krem hangat)
    const floor1 = new THREE.Mesh(new THREE.BoxGeometry(10.4, 3.3, 8.4), stuccoMat);
    floor1.position.set(0, 2.2, 0);
    floor1.castShadow = true;
    floor1.receiveShadow = true;
    group.add(floor1);

    // Aksen dinding batu andesit di sisi depan
    const stoneAccent = new THREE.Mesh(new THREE.BoxGeometry(3.1, 3.3, 0.22), andesiteMat);
    stoneAccent.position.set(-3.3, 2.2, 4.22);
    stoneAccent.castShadow = true;
    group.add(stoneAccent);

    // Pilar teras silinder dengan alas & kepala kotak
    for (const px of [-4.7, -1.75, 1.75, 4.7]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 3.25, 16), andesiteMat);
      col.position.set(px, 2.2, 4.75);
      col.castShadow = true;
      group.add(col);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.25, 0.62), andesiteMat);
      base.position.set(px, 0.68, 4.75);
      group.add(base);
    }

    // 3. Pintu Utama Kayu Jati Ganda dengan Kusen & Gagang Kuningan
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.85, 2.55, 0.24), woodMat);
    doorFrame.position.set(0, 1.82, 4.18);
    group.add(doorFrame);

    const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(1.58, 2.38, 0.28), woodMat);
    doorPanel.position.set(0, 1.78, 4.22);
    group.add(doorPanel);

    const handleMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
    const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.35, 10), handleMat);
    handleL.position.set(-0.14, 1.65, 4.39);
    const handleR = handleL.clone();
    handleR.position.x = 0.14;
    group.add(handleL, handleR);

    // Lampu teras hangat di kiri-kanan pintu
    for (const lx of [-1.25, 1.25]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), warmLampMat);
      lamp.position.set(lx, 2.65, 4.35);
      group.add(lamp);
    }

    // 4. Jendela Kaca Berkusen Kayu (Lantai 1 & Lantai 2)
    const addWindow = (wx, wy, wz, w, h) => {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.22, h + 0.22, 0.2), woodMat);
      frame.position.set(wx, wy, wz);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.24), glassMat);
      pane.position.set(wx, wy, wz);
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.08, h, 0.26), woodMat);
      mullion.position.set(wx, wy, wz);
      const sill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.34, 0.1, 0.36), andesiteMat);
      sill.position.set(wx, wy - h / 2 - 0.12, wz + 0.08);
      group.add(frame, pane, mullion, sill);
    };
    addWindow(-3.3, 2.15, 4.26, 1.65, 1.45);
    addWindow(3.3, 2.15, 4.22, 1.65, 1.45);
    addWindow(-2.6, 5.55, 3.82, 1.75, 1.4);
    addWindow(2.6, 5.55, 3.82, 1.75, 1.4);
    addWindow(0, 5.45, 3.82, 1.5, 2.1); // Pintu kaca balkon

    // 5. Kanopi Carport Pergola Kayu Modern (Sisi Kiri)
    const carportBeam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.22, 6.4), metalMat);
    carportBeam.position.set(-7.3, 3.25, 0.5);
    carportBeam.castShadow = true;
    group.add(carportBeam);

    // Kisi-kisi kayu pergola & atap kaca carport
    for (let rz = -2.4; rz <= 3.4; rz += 0.65) {
      const rafter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.12), woodMat);
      rafter.position.set(-7.3, 3.32, rz);
      rafter.castShadow = true;
      group.add(rafter);
    }
    const carportGlass = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.05, 6.2), glassMat);
    carportGlass.position.set(-7.3, 3.42, 0.5);
    group.add(carportGlass);

    for (const cz of [-2.2, 3.2]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.25, 12), metalMat);
      post.position.set(-9.2, 1.625, cz);
      post.castShadow = true;
      group.add(post);
    }

    // 6. Plat Lantai 2 & Balkon Kaca dengan Railing Stainless + Kayu
    const slab2 = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.34, 10.6), stuccoMat);
    slab2.position.set(0, 3.98, 0.65);
    slab2.castShadow = true;
    slab2.receiveShadow = true;
    group.add(slab2);

    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.1, 7.8), stuccoMat);
    floor2.position.set(0, 5.65, -0.1);
    floor2.castShadow = true;
    floor2.receiveShadow = true;
    group.add(floor2);

    const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.0, 0.08), glassMat);
    balconyGlass.position.set(0, 4.65, 5.75);
    const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 10.9, 10), woodMat);
    handrail.rotation.z = Math.PI / 2;
    handrail.position.set(0, 5.18, 5.75);
    group.add(balconyGlass, handrail);

    for (const bx of [-5.3, -2.65, 0, 2.65, 5.3]) {
      const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 8), metalMat);
      stanchion.position.set(bx, 4.66, 5.75);
      group.add(stanchion);
    }

    // 7. Atap Limasan Tropis Realistis (Piramida 4 Sisi Miring + Lisplang Kayu)
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(11.8, 0.28, 10.4), woodMat);
    fascia.position.set(0, 7.22, 0.15);
    fascia.castShadow = true;
    group.add(fascia);

    // Atap limasan menggunakan ConeGeometry 4 sisi berotasi 45 derajat
    const hipRoof = new THREE.Mesh(new THREE.ConeGeometry(8.9, 2.9, 4), roofMat);
    hipRoof.position.set(0, 8.75, 0.15);
    hipRoof.rotation.y = Math.PI / 4;
    hipRoof.scale.set(1.06, 1, 0.94);
    hipRoof.castShadow = true;
    hipRoof.receiveShadow = true;
    group.add(hipRoof);

    // Bubungan atap atas
    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.6, 8), roofMat);
    ridge.rotation.z = Math.PI / 2;
    ridge.position.set(0, 10.12, 0.15);
    group.add(ridge);

    // 8. Pot Tanaman Hias Organik di Teras Depan
    const potMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.75 });
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    for (const px of [-2.4, 2.4]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.45, 14), potMat);
      pot.position.set(px, 0.78, 4.75);
      pot.castShadow = true;
      const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), plantMat);
      bush.position.set(px, 1.18, 4.75);
      bush.castShadow = true;
      group.add(pot, bush);
    }

    const colliders = [
      {
        minX: x - 5.8,
        maxX: x + 5.8,
        minY: 0,
        maxY: 9.0,
        minZ: z - 4.8,
        maxZ: z + 5.0,
      },
    ];

    const interactionZone = {
      x,
      z: z + 6.8,
      radius: 4.5,
      label: this.config.name,
      topic: this.config.quizTopic,
    };

    return { mesh: group, colliders, interactionZone };
  }
}
