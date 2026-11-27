import * as THREE from 'three';
import { gameConfig } from '../config/gameConfig.js';
import { TextureFactory } from './TextureFactory.js';
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
    this._buildRocks();
    this._buildBuildings();

    return {
      colliders: this.colliders,
      walkableFloors: this.walkableFloors,
      interactionZones: this.interactionZones,
    };
  }

  _setupLights() {
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x3b5e2b, 0.9);
    hemiLight.position.set(0, 60, 0);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.5);
    sunLight.position.set(42, 65, 32);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    const d = 62;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);
  }

  _buildGroundAndPaths() {
    const size = gameConfig.world.groundSize;
    const pathW = gameConfig.world.pathWidth;

    const grassTex = TextureFactory.createGrassTexture(40);
    const grassMat = new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.92,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), grassMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Jalan setapak paving batu berbentuk plus (+) dengan pinggiran kanstin
    const pathTexNS = TextureFactory.createCobblePathTexture(3, 42);
    const pathTexEW = TextureFactory.createCobblePathTexture(42, 3);
    const pathMatNS = new THREE.MeshStandardMaterial({ map: pathTexNS, roughness: 0.85 });
    const pathMatEW = new THREE.MeshStandardMaterial({ map: pathTexEW, roughness: 0.85 });

    const pathNS = new THREE.Mesh(new THREE.BoxGeometry(pathW, 0.06, size * 0.85), pathMatNS);
    pathNS.position.y = 0.03;
    pathNS.receiveShadow = true;

    const pathEW = new THREE.Mesh(new THREE.BoxGeometry(size * 0.85, 0.06, pathW), pathMatEW);
    pathEW.position.y = 0.03;
    pathEW.receiveShadow = true;

    // Plaza bundar batu di sekitar air mancur tengah
    const plazaTex = TextureFactory.createCobblePathTexture(6, 6);
    const plazaMat = new THREE.MeshStandardMaterial({ map: plazaTex, roughness: 0.82 });
    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.5, 0.09, 36), plazaMat);
    plaza.position.y = 0.045;
    plaza.receiveShadow = true;

    this.scene.add(pathNS, pathEW, plaza);
  }

  _buildFountain() {
    const { x, z } = gameConfig.fountain.position;
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const marbleTex = TextureFactory.createMarbleTexture(2);
    const stoneMat = new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xe2e8f0,
      roughness: 0.55,
      metalness: 0.05,
    });
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.55,
      transparent: true,
      opacity: 0.82,
    });

    // Dinding kolam bundar realistis dengan bibir torus
    const basinOuter = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.85, 0.72, 32), stoneMat);
    basinOuter.position.y = 0.36;
    basinOuter.castShadow = true;
    basinOuter.receiveShadow = true;
    group.add(basinOuter);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.18, 12, 36), stoneMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.72;
    rim.castShadow = true;
    group.add(rim);

    // Permukaan air kolam
    const water = new THREE.Mesh(new THREE.CylinderGeometry(3.42, 3.42, 0.08, 32), waterMat);
    water.position.y = 0.64;
    group.add(water);

    // Tiang air mancur bertingkat (LatheGeometry halus)
    const lathePoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.95, 0.0),
      new THREE.Vector2(0.75, 0.35),
      new THREE.Vector2(0.45, 0.85),
      new THREE.Vector2(0.42, 1.45),
      new THREE.Vector2(1.45, 1.75),
      new THREE.Vector2(1.55, 1.95),
      new THREE.Vector2(0.35, 1.85),
      new THREE.Vector2(0.28, 2.55),
      new THREE.Vector2(0.75, 2.75),
      new THREE.Vector2(0.18, 3.15),
      new THREE.Vector2(0.0, 3.25),
    ];
    const pedestal = new THREE.Mesh(new THREE.LatheGeometry(lathePoints, 28), stoneMat);
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    group.add(pedestal);

    // Partikel tetesan air bulat realistis (SphereGeometry)
    const dropGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    for (let i = 0; i < 36; i++) {
      const drop = new THREE.Mesh(dropGeo, dropMat);
      const angle = (i / 36) * Math.PI * 2;
      drop.userData = {
        angle,
        phase: Math.random() * Math.PI * 2,
        speed: 2.2 + Math.random() * 1.3,
        tier: i % 2,
      };
      group.add(drop);
      this.fountainDrops.push(drop);
    }

    this.scene.add(group);

    this.colliders.push({
      type: 'cylinder',
      x,
      z,
      radius: 3.85,
      minY: 0,
      maxY: 1.2,
    });
  }

  _buildTrees() {
    const barkMat = new THREE.MeshStandardMaterial({
      map: TextureFactory.createBarkTexture(),
      roughness: 0.92,
    });
    const leafColors = [0x1e5e20, 0x267326, 0x2e8530, 0x194d1b];
    const leafMats = leafColors.map(
      (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.82 })
    );

    for (const t of gameConfig.trees) {
      const tree = new THREE.Group();
      tree.position.set(t.x, 0, t.z);
      tree.scale.setScalar(t.scale);

      // Batang pohon silinder meruncing dengan akar bawah melebar
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.46, 3.6, 12), barkMat);
      trunk.position.y = 1.8;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      // Cabang-cabang alami
      const branchAngles = [0.4, 2.5, 4.6];
      branchAngles.forEach((ang, idx) => {
        const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 1.8, 8), barkMat);
        branch.position.set(Math.cos(ang) * 0.55, 3.1 + idx * 0.25, Math.sin(ang) * 0.55);
        branch.rotation.z = -Math.cos(ang) * 0.65;
        branch.rotation.x = Math.sin(ang) * 0.65;
        branch.castShadow = true;
        tree.add(branch);
      });

      // Tajuk daun organik berlapis (Icosahedron ber-noise, bukan kotak)
      const foliageOffsets = [
        { x: 0, y: 4.5, z: 0, r: 1.85 },
        { x: 1.2, y: 3.9, z: 0.6, r: 1.35 },
        { x: -1.15, y: 4.0, z: 0.7, r: 1.4 },
        { x: 0.2, y: 3.85, z: -1.25, r: 1.35 },
        { x: -0.7, y: 4.9, z: -0.5, r: 1.25 },
        { x: 0.85, y: 5.0, z: -0.35, r: 1.15 },
      ];

      foliageOffsets.forEach((f, idx) => {
        const geo = new THREE.IcosahedronGeometry(f.r, 2);
        this._perturbGeometry(geo, 0.16, t.seed + idx * 7);
        const crown = new THREE.Mesh(geo, leafMats[idx % leafMats.length]);
        crown.position.set(f.x, f.y, f.z);
        crown.scale.y = 0.82;
        crown.castShadow = true;
        crown.receiveShadow = true;
        tree.add(crown);
      });

      this.scene.add(tree);

      this.colliders.push({
        type: 'cylinder',
        x: t.x,
        z: t.z,
        radius: 0.48 * t.scale,
        minY: 0,
        maxY: 3.8 * t.scale,
      });
    }
  }

  /**
   * Membuat objek batu alam realistis (bongkahan organik non-kotak + gugusan batu kecil)
   */
  _buildRocks() {
    const rockTex = TextureFactory.createRockTexture(2);
    const rockMat = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.88,
      metalness: 0.04,
      flatShading: false,
    });
    const darkRockMat = new THREE.MeshStandardMaterial({
      map: rockTex,
      color: 0x9ca3af,
      roughness: 0.94,
    });

    for (const r of gameConfig.rocks) {
      const rockGroup = new THREE.Group();
      rockGroup.position.set(r.x, 0, r.z);

      // Bongkahan batu utama (Dodecahedron detail tinggi dengan deformasi organik)
      const mainGeo = new THREE.DodecahedronGeometry(r.radius, 2);
      this._perturbGeometry(mainGeo, 0.26, r.seed * 13);
      const mainRock = new THREE.Mesh(mainGeo, rockMat);
      mainRock.scale.set(1.15, 0.72, 0.95);
      mainRock.position.y = r.radius * 0.42;
      mainRock.rotation.set(r.seed * 0.3, r.seed * 1.1, r.seed * 0.2);
      mainRock.castShadow = true;
      mainRock.receiveShadow = true;
      rockGroup.add(mainRock);

      // Gugusan batu pendamping & kerikil besar di sekitarnya agar alami
      if (r.cluster) {
        const subCount = 3;
        for (let i = 0; i < subCount; i++) {
          const ang = r.seed * 2.1 + i * 2.15;
          const dist = r.radius * (0.78 + i * 0.22);
          const subR = r.radius * (0.38 - i * 0.06);
          const subGeo = new THREE.IcosahedronGeometry(subR, 1);
          this._perturbGeometry(subGeo, 0.28, r.seed * 31 + i * 5);
          const subRock = new THREE.Mesh(subGeo, i % 2 === 0 ? darkRockMat : rockMat);
          subRock.scale.set(1.2, 0.65, 1.0);
          subRock.position.set(Math.cos(ang) * dist, subR * 0.38, Math.sin(ang) * dist);
          subRock.rotation.y = ang;
          subRock.castShadow = true;
          subRock.receiveShadow = true;
          rockGroup.add(subRock);
        }
      }

      this.scene.add(rockGroup);

      // Collider silinder untuk bongkahan batu utama
      this.colliders.push({
        type: 'cylinder',
        x: r.x,
        z: r.z,
        radius: r.radius * 0.95,
        minY: 0,
        maxY: r.radius * 0.95,
      });
    }
  }

  _perturbGeometry(geometry, intensity, seed) {
    const pos = geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n =
        Math.sin(v.x * 2.3 + seed) *
        Math.cos(v.y * 2.7 - seed * 0.7) *
        Math.sin(v.z * 2.1 + seed * 1.3);
      const scale = 1 + n * intensity;
      v.multiplyScalar(scale);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();
  }

  _buildBuildings() {
    const houseCfg = gameConfig.buildings.house;
    const houseModel = new HouseModel(houseCfg);
    const houseResult = houseModel.build();
    this.scene.add(houseResult.mesh);
    this.colliders.push(...houseResult.colliders);
    this.interactionZones.push(houseResult.interactionZone);

    const museumCfg = gameConfig.buildings.museum;
    this.museumModel = new MuseumModel(museumCfg);
    const museumResult = this.museumModel.build();
    this.scene.add(museumResult.mesh);
    this.colliders.push(...museumResult.colliders);
    this.walkableFloors.push(...museumResult.walkableFloors);
    this.interactionZones.push(museumResult.interactionZone);
  }

  update(dt, playerPos) {
    for (const drop of this.fountainDrops) {
      drop.userData.phase += dt * drop.userData.speed;
      const t = (drop.userData.phase % (Math.PI * 2)) / (Math.PI * 2);
      const isTop = drop.userData.tier === 0;
      const startY = isTop ? 3.2 : 1.95;
      const maxR = isTop ? 1.35 : 2.95;
      const r = 0.15 + t * maxR;
      const y = startY + Math.sin(t * Math.PI) * (isTop ? 0.95 : 0.75) - t * (startY - 0.65);
      drop.position.set(
        Math.cos(drop.userData.angle) * r,
        Math.max(0.68, y),
        Math.sin(drop.userData.angle) * r
      );
    }

    if (this.museumModel) {
      this.museumModel.update(dt, playerPos);
    }
  }
}
