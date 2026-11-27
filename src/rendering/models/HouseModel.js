import * as THREE from 'three';

export class HouseModel {
  constructor(config) {
    this.config = config;
  }

  build() {
    const group = new THREE.Group();
    const { x, y, z } = this.config.position;
    group.position.set(x, y, z);

    // Material prosedural (Kayu, Batu Andesit, Genteng, Kaca)
    const wallCreamMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.75 });
    const andesiteMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
    const roofTileMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.3,
    });

    // Pondasi batu andesit
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.5, 9.4), andesiteMat);
    foundation.position.y = 0.25;
    foundation.receiveShadow = true;
    foundation.castShadow = true;
    group.add(foundation);

    // Lantai 1 (Tinggi 3.2m)
    const floor1 = new THREE.Mesh(new THREE.BoxGeometry(10.5, 3.2, 8.5), wallCreamMat);
    floor1.position.y = 2.1;
    floor1.castShadow = true;
    floor1.receiveShadow = true;
    group.add(floor1);

    // Aksesoris pilar batu andesit depan
    for (const px of [-4.8, -1.8, 1.8, 4.8]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), andesiteMat);
      pillar.position.set(px, 2.1, 4.35);
      pillar.castShadow = true;
      group.add(pillar);
    }

    // Pintu kayu utama & jendela lantai 1
    const frontDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.3, 0.18), woodMat);
    frontDoor.position.set(0, 1.65, 4.3);
    group.add(frontDoor);

    for (const wx of [-3.3, 3.3]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 0.16), glassMat);
      win.position.set(wx, 2.1, 4.3);
      group.add(win);
    }

    // Kanopi Carport samping
    const carportRoof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 6.2), woodMat);
    carportRoof.position.set(-7.2, 3.1, 0.5);
    carportRoof.castShadow = true;
    group.add(carportRoof);

    for (const cz of [-2.2, 3.2]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.1, 0.3), andesiteMat);
      post.position.set(-9.0, 1.55, cz);
      post.castShadow = true;
      group.add(post);
    }

    // Plat Lantai 2 & Balkon Kaca
    const slab2 = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.35, 10.2), woodMat);
    slab2.position.set(0, 3.85, 0.6);
    slab2.castShadow = true;
    group.add(slab2);

    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(9.6, 3.0, 8.0), wallCreamMat);
    floor2.position.set(0, 5.5, -0.2);
    floor2.castShadow = true;
    group.add(floor2);

    // Pagar Balkon Kaca Lantai 2
    const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(10.6, 1.0, 0.12), glassMat);
    balconyGlass.position.set(0, 4.5, 5.5);
    const balconyRail = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.12, 0.2), woodMat);
    balconyRail.position.set(0, 5.05, 5.5);
    group.add(balconyGlass, balconyRail);

    // Atap Limasan Tropis Bertingkat
    const roofLower = new THREE.Mesh(new THREE.BoxGeometry(12.2, 1.1, 11.2), roofTileMat);
    roofLower.position.set(0, 7.5, 0.2);
    roofLower.castShadow = true;

    const roofUpper = new THREE.Mesh(new THREE.BoxGeometry(8.6, 1.2, 7.6), roofTileMat);
    roofUpper.position.set(0, 8.6, 0.2);
    roofUpper.castShadow = true;
    group.add(roofLower, roofUpper);

    // Collider solid untuk Rumah Tropis (belum bisa dimasuki sesuai dokumentasi)
    const colliders = [
      {
        minX: x - 5.7,
        maxX: x + 5.7,
        minY: 0,
        maxY: 8.5,
        minZ: z - 4.7,
        maxZ: z + 4.7,
      },
    ];

    const interactionZone = {
      x,
      z: z + 6.5,
      radius: 4.5,
      label: this.config.name,
      topic: this.config.quizTopic,
    };

    return { mesh: group, colliders, interactionZone };
  }
}
