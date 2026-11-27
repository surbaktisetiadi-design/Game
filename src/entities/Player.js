import * as THREE from 'three';

export class Player {
  constructor(id, name, spawnPos = { x: 0, y: 0, z: 0 }) {
    this.id = id;
    this.name = name;
    this.position = new THREE.Vector3(spawnPos.x, spawnPos.y, spawnPos.z);
    this.rotationY = 0;

    this.isMoving = false;
    this.isSprinting = false;
    this.isCrouching = false;
    this.walkCycle = 0;

    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    this._buildTeacherModel();
    this._startBlinkLoop();
  }

  _buildTeacherModel() {
    // Skala total Pak Guru ~ 2.5 unit (1 unit = 1 meter)
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf1c27d, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 }); // Kemeja biru guru
    const tieMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });   // Dasi merah
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 }); // Celana bahan gelap
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
    const glassesMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.5, roughness: 0.2 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });

    this.bodyRoot = new THREE.Group();
    this.mesh.add(this.bodyRoot);

    // Kaki Kiri & Kanan (tinggi 0.95)
    const legGeo = new THREE.BoxGeometry(0.26, 0.95, 0.28);
    this.leftLegPivot = new THREE.Group();
    this.leftLegPivot.position.set(-0.18, 0.95, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.y = -0.475;
    leftLeg.castShadow = true;
    this.leftLegPivot.add(leftLeg);

    this.rightLegPivot = new THREE.Group();
    this.rightLegPivot.position.set(0.18, 0.95, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.y = -0.475;
    rightLeg.castShadow = true;
    this.rightLegPivot.add(rightLeg);

    this.bodyRoot.add(this.leftLegPivot, this.rightLegPivot);

    // Badan / Torso (tinggi 0.95 -> posisi y 0.95 s.d 1.90)
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.95, 0.38);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.425;
    torso.castShadow = true;
    this.bodyRoot.add(torso);

    // Dasi Pak Guru
    const tieGeo = new THREE.BoxGeometry(0.1, 0.55, 0.05);
    const tie = new THREE.Mesh(tieGeo, tieMat);
    tie.position.set(0, 1.52, 0.2);
    this.bodyRoot.add(tie);

    // Tangan Kiri & Kanan
    const armGeo = new THREE.BoxGeometry(0.22, 0.85, 0.22);
    this.leftArmPivot = new THREE.Group();
    this.leftArmPivot.position.set(-0.5, 1.82, 0);
    const leftArm = new THREE.Mesh(armGeo, shirtMat);
    leftArm.position.y = -0.38;
    leftArm.castShadow = true;
    this.leftArmPivot.add(leftArm);

    this.rightArmPivot = new THREE.Group();
    this.rightArmPivot.position.set(0.5, 1.82, 0);
    const rightArm = new THREE.Mesh(armGeo, shirtMat);
    rightArm.position.y = -0.38;
    rightArm.castShadow = true;
    this.rightArmPivot.add(rightArm);

    this.bodyRoot.add(this.leftArmPivot, this.rightArmPivot);

    // Kepala (posisi y 1.90 s.d 2.50)
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 2.2, 0);

    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.54, 0.54), skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Rambut
    const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.58), hairMat);
    hairTop.position.y = 0.28;
    this.headGroup.add(hairTop);

    // Mata (untuk animasi kedipan)
    const eyeGeo = new THREE.BoxGeometry(0.08, 0.08, 0.04);
    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-0.13, 0.04, 0.27);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(0.13, 0.04, 0.27);

    // Kacamata Pak Guru
    const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.03), glassesMat);
    frameL.position.set(-0.13, 0.04, 0.285);
    const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.03), glassesMat);
    frameR.position.set(0.13, 0.04, 0.285);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.03), glassesMat);
    bridge.position.set(0, 0.05, 0.285);

    this.headGroup.add(this.leftEye, this.rightEye, frameL, frameR, bridge);
    this.bodyRoot.add(this.headGroup);
  }

  _startBlinkLoop() {
    const blink = () => {
      if (this.leftEye && this.rightEye) {
        this.leftEye.scale.y = 0.1;
        this.rightEye.scale.y = 0.1;
        setTimeout(() => {
          if (this.leftEye && this.rightEye) {
            this.leftEye.scale.y = 1;
            this.rightEye.scale.y = 1;
          }
        }, 140);
      }
      const nextBlink = 2200 + Math.random() * 3000;
      this._blinkTimer = setTimeout(blink, nextBlink);
    };
    this._blinkTimer = setTimeout(blink, 2000);
  }

  updateAnimation(dt) {
    // Efek jongkok (mengecilkan tinggi visual)
    const targetScaleY = this.isCrouching ? 0.68 : 1.0;
    this.bodyRoot.scale.y += (targetScaleY - this.bodyRoot.scale.y) * Math.min(1, dt * 14);

    if (this.isMoving) {
      const freq = this.isSprinting ? 14 : 9;
      const amp = this.isSprinting ? 0.85 : 0.55;
      this.walkCycle += dt * freq;

      const swing = Math.sin(this.walkCycle) * amp;
      this.leftLegPivot.rotation.x = swing;
      this.rightLegPivot.rotation.x = -swing;
      this.leftArmPivot.rotation.x = -swing * 0.85;
      this.rightArmPivot.rotation.x = swing * 0.85;
    } else {
      this.walkCycle = 0;
      this.leftLegPivot.rotation.x *= 0.8;
      this.rightLegPivot.rotation.x *= 0.8;
      this.leftArmPivot.rotation.x *= 0.8;
      this.rightArmPivot.rotation.x *= 0.8;
    }

    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;
  }
}
