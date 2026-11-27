import * as THREE from 'three';
import { gameConfig } from '../config/gameConfig.js';
import { HouseModel } from './models/HouseModel.js';
import { MuseumModel } from './models/MuseumModel.js';

export class SceneFactory {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.walkableFloors = [];
    this.interactionZones = [];
    this.fountainDrops = [];
    this.museumModel = null;
  }

  buildWorld() {
    this._setupLights();
    this._buildGroundAndPaths();
    this._buildFountain();
    this._buildTrees();
    this._buildBuildings();

    return {
      colliders: this.colliders,
      walkableFloors: this.walkableFloors,
      interactionZones: this.interactionZones,
    };
  }

  _setupLights() {
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x3f6212, 0.85);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.35);
    dirLight.position.set(35, 55, 28);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 140;
    const d = 55;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);
  }

  _buildGroundAndPaths() {
    const size = gameConfig.world.groundSize;
    const pathW = gameConfig.world.pathWidth;

    // Lapangan rumput hijau luas
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x4d7c0f,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(new THREE.BoxGeometry(size, 0.4, size), grassMat);
    ground.position.y = -0.2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Jalan setapak berbentuk plus (+)
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      roughness: 0.85,
    });
    const pathNS = new THREE.Mesh(new THREE.BoxGeometry(pathW, 0.06, size * 0.85), pathMat);
    pathNS.position.y = 0.03;
    pathNS.receiveShadow = true;

    const pathEW = new THREE.Mesh(new THREE.BoxGeometry(size * 0.85, 0.06, pathW), pathMat);
    pathEW.position.y = 0.03;
    pathEW.receiveShadow = true;

    this.scene.add(pathNS, pathEW);
  }

  _buildFountain() {
    const { x, z } = gameConfig.fountain.position;
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.2,
    });

    // Kolam oktagonal/kotak berundak
    const outerRim = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.7, 6.4), stoneMat);
    outerRim.position.y = 0.35;
    outerRim.castShadow = true;
    outerRim.receiveShadow = true;
    group.add(outerRim);

    const water = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.1, 5.6), waterMat);
    water.position.y = 0.68;
    group.add(water);

    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 1.1), stoneMat);
    pillar.position.y = 1.1;
    pillar.castShadow = true;
    group.add(pillar);

    // Partikel air mancur memancar (Langkah 6 Roadmap)
    const dropGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    for (let i = 0; i < 24; i++) {
      const drop = new THREE.Mesh(dropGeo, waterMat);
      const angle = (i / 24) * Math.PI * 2;
      drop.userData = {
        angle,
        phase: Math.random() * Math.PI * 2,
        speed: 2.5 + Math.random() * 1.5,
      };
      group.add(drop);
      this.fountainDrops.push(drop);
    }

    this.scene.add(group);

    // Collider kolam air mancur
    this.colliders.push({
      minX: x - 3.2,
      maxX: x + 3.2,
      minY: 0,
      maxY: 1.0,
      minZ: z - 3.2,
      maxZ: z + 3.2,
    });
  }

  _buildTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });

    for (const t of gameConfig.trees) {
      const tree = new THREE.Group();
      tree.position.set(t.x, 0, t.z);
      tree.scale.setScalar(t.scale);

      const trunk = new THREE.Mesh(new THREE.BoxGeometry(0.65, 3.2, 0.65), trunkMat);
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      tree.add(trunk);

      const crown1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 3.2), leafMat1);
      crown1.position.y = 3.8;
      crown1.castShadow = true;
      tree.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.6, 2.1), leafMat2);
      crown2.position.y = 5.3;
      crown2.castShadow = true;
      tree.add(crown2);

      this.scene.add(tree);

      this.colliders.push({
        minX: t.x - 0.4 * t.scale,
        maxX: t.x + 0.4 * t.scale,
        minY: 0,
        maxY: 3.5 * t.scale,
        minZ: t.z - 0.4 * t.scale,
        maxZ: t.z + 0.4 * t.scale,
      });
    }
  }

  _buildBuildings() {
    // 1. Rumah Tropis (Gedung Matematika) - tabrakan solid
    const houseCfg = gameConfig.buildings.house;
    const houseModel = new HouseModel(houseCfg);
    const houseResult = houseModel.build();
    this.scene.add(houseResult.mesh);
    this.colliders.push(...houseResult.colliders);
    this.interactionZones.push(houseResult.interactionZone);

    // 2. Museum EduVenture - interior bisa dijelajahi & tangga bisa dinaiki ke lantai 2
    const museumCfg = gameConfig.buildings.museum;
    this.museumModel = new MuseumModel(museumCfg);
    const museumResult = this.museumModel.build();
    this.scene.add(museumResult.mesh);
    this.colliders.push(...museumResult.colliders);
    this.walkableFloors.push(...museumResult.walkableFloors);
    this.interactionZones.push(museumResult.interactionZone);
  }

  update(dt, playerPos) {
    // Animasi partikel air mancur
    for (const drop of this.fountainDrops) {
      drop.userData.phase += dt * drop.userData.speed;
      const t = (drop.userData.phase % (Math.PI * 2)) / (Math.PI * 2);
      const r = 0.3 + t * 2.1;
      const y = 2.2 + Math.sin(t * Math.PI) * 1.4 - t * 1.5;
      drop.position.set(
        Math.cos(drop.userData.angle) * r,
        Math.max(0.72, y),
        Math.sin(drop.userData.angle) * r
      );
    }

    // Animasi pintu kaca otomatis museum saat pemain mendekat
    if (this.museumModel) {
      this.museumModel.update(dt, playerPos);
    }
  }
}
