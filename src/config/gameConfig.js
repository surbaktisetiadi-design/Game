export const gameConfig = {
  world: {
    groundSize: 220,
    pathWidth: 6,
    fogColor: 0x87ceeb,
    fogNear: 45,
    fogFar: 165,
  },
  player: {
    height: 2.5,
    radius: 0.45,
    walkSpeed: 7.0,
    sprintSpeed: 12.5,
    crouchSpeed: 3.5,
    jumpForce: 9.5,
    gravity: 24.0,
    spawnPosition: { x: 0, y: 0, z: 18 },
  },
  camera: {
    fov: 60,
    near: 0.1,
    far: 300,
    distance: 5.5,
    heightOffset: 2.1,
    shoulderOffset: 0.85,
    minPitch: -0.45,
    maxPitch: 0.85,
    smoothFactor: 12,
  },
  buildings: {
    house: {
      name: 'Rumah Tropis (Gedung Matematika)',
      position: { x: -24, y: 0, z: -18 },
      rotationY: Math.PI / 6,
      quizTopic: 'Matematika',
    },
    museum: {
      name: 'Museum EduVenture',
      position: { x: 24, y: 0, z: -20 },
      rotationY: -Math.PI / 8,
      quizTopic: 'Sejarah & Sains',
    },
  },
  fountain: {
    position: { x: 0, y: 0, z: 0 },
  },
  trees: [
    { x: -12, z: 12, scale: 1.0 },
    { x: 12, z: 12, scale: 1.1 },
    { x: -14, z: -6, scale: 0.95 },
    { x: 14, z: -6, scale: 1.05 },
    { x: -34, z: 6, scale: 1.2 },
    { x: 34, z: 8, scale: 1.15 },
    { x: -28, z: -34, scale: 1.1 },
    { x: 28, z: -36, scale: 1.2 },
    { x: -8, z: -32, scale: 1.0 },
    { x: 8, z: -34, scale: 0.9 },
    { x: -22, z: 26, scale: 1.15 },
    { x: 22, z: 26, scale: 1.05 },
  ],
  quizzes: {
    Matematika: [
      {
        q: 'Sebuah balok pada Rumah Tropis memiliki panjang 6 m, lebar 4 m, dan tinggi 3 m. Berapakah volumenya?',
        options: ['72 m³', '54 m³', '24 m³', '13 m³'],
        answer: 0,
      },
      {
        q: 'Jika Pak Guru berjalan sejauh 12 meter ke utara lalu 5 meter ke timur, berapakah jarak terpendek dari titik awal?',
        options: ['17 meter', '13 meter', '15 meter', '10 meter'],
        answer: 1,
      },
    ],
    'Sejarah & Sains': [
      {
        q: 'Di Museum EduVenture terdapat artefak emas di lantai 2. Gaya apakah yang menarik benda jatuh ke bawah?',
        options: ['Gaya Gesek', 'Gaya Magnet', 'Gaya Gravitasi', 'Gaya Pegas'],
        answer: 2,
      },
      {
        q: 'Batu andesit yang digunakan pada arsitektur bangunan tradisional termasuk jenis batuan apa?',
        options: ['Batuan Sedimen', 'Batuan Beku', 'Batuan Metamorf', 'Batuan Kapur'],
        answer: 1,
      },
    ],
  },
};
