import * as THREE from 'three';

/**
 * Menghasilkan tekstur prosedural berbasis HTML5 Canvas untuk tampilan
 * realistis (rumput, paving, batu alam, kayu jati, genteng, marmer, plester)
 * tanpa memerlukan aset eksternal.
 */
export class TextureFactory {
  static _makeCanvas(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }

  static _toTexture(canvas, repeatX = 1, repeatY = 1) {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  static createGrassTexture(repeat = 38) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3f6e20';
    ctx.fillRect(0, 0, 256, 256);

    // Variasi tanah & helaian rumput alami
    for (let i = 0; i < 4500; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const shade = Math.floor(Math.random() * 4);
      ctx.fillStyle = ['#4d8226', '#335d18', '#5c9430', '#698a38'][shade];
      ctx.fillRect(x, y, 2, 5 + Math.random() * 4);
    }
    return this._toTexture(canvas, repeat, repeat);
  }

  static createCobblePathTexture(repeatX = 3, repeatY = 45) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#6b6760'; // Nat semen antar paving
    ctx.fillRect(0, 0, 256, 256);

    const rows = 8;
    const cols = 4;
    const h = 256 / rows;
    const w = 256 / cols;

    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (w / 2);
      for (let c = -1; c <= cols; c++) {
        const shade = 185 + Math.floor(Math.random() * 35);
        ctx.fillStyle = `rgb(${shade}, ${shade - 5}, ${shade - 12})`;
        ctx.fillRect(c * w + offset + 2, r * h + 2, w - 4, h - 4);
      }
    }
    return this._toTexture(canvas, repeatX, repeatY);
  }

  static createRockTexture(repeat = 2) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#6c7075';
    ctx.fillRect(0, 0, 256, 256);

    // Bercak mineral granit & sedikit lumut alami
    for (let i = 0; i < 3200; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 1 + Math.random() * 5;
      const v = 75 + Math.floor(Math.random() * 80);
      ctx.fillStyle = Math.random() < 0.08
        ? 'rgba(72, 102, 54, 0.35)'
        : `rgba(${v}, ${v - 2}, ${v - 5}, 0.45)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Retakan tipis batu
    ctx.strokeStyle = 'rgba(30, 32, 35, 0.35)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      let sx = Math.random() * 256;
      let sy = Math.random() * 256;
      ctx.moveTo(sx, sy);
      for (let s = 0; s < 4; s++) {
        sx += (Math.random() - 0.5) * 40;
        sy += (Math.random() - 0.5) * 40;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    return this._toTexture(canvas, repeat, repeat);
  }

  static createAndesiteTexture(repeatX = 2, repeatY = 2) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3f3d3b';
    ctx.fillRect(0, 0, 256, 256);

    const rows = 8;
    const h = 256 / rows;
    for (let r = 0; r < rows; r++) {
      const shift = (r % 2) * 32;
      for (let c = -1; c < 5; c++) {
        const v = 68 + Math.floor(Math.random() * 26);
        ctx.fillStyle = `rgb(${v}, ${v - 2}, ${v - 4})`;
        ctx.fillRect(c * 64 + shift + 1, r * h + 1, 62, h - 2);
      }
    }
    return this._toTexture(canvas, repeatX, repeatY);
  }

  static createWoodTexture(repeatX = 2, repeatY = 2) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#7c451c';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 120; i++) {
      const y = (i / 120) * 256;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(65, 32, 10, 0.35)' : 'rgba(155, 92, 42, 0.25)';
      ctx.lineWidth = 1.5 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y + (Math.random() - 0.5) * 8, 170, y + (Math.random() - 0.5) * 8, 256, y);
      ctx.stroke();
    }
    return this._toTexture(canvas, repeatX, repeatY);
  }

  static createRoofTileTexture(repeatX = 6, repeatY = 4) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#8b3119';
    ctx.fillRect(0, 0, 256, 256);

    const rows = 8;
    const cols = 8;
    const rh = 256 / rows;
    const cw = 256 / cols;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const grad = ctx.createLinearGradient(c * cw, r * rh, (c + 1) * cw, r * rh);
        grad.addColorStop(0, '#722410');
        grad.addColorStop(0.5, '#b64926');
        grad.addColorStop(1, '#661f0d');
        ctx.fillStyle = grad;
        ctx.fillRect(c * cw, r * rh, cw, rh - 2);
      }
      ctx.fillStyle = 'rgba(20, 8, 4, 0.45)';
      ctx.fillRect(0, (r + 1) * rh - 3, 256, 3);
    }
    return this._toTexture(canvas, repeatX, repeatY);
  }

  static createStuccoTexture(repeat = 4) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f6ecd9';
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const v = 225 + Math.floor(Math.random() * 25);
      ctx.fillStyle = `rgba(${v}, ${v - 10}, ${v - 26}, 0.35)`;
      ctx.fillRect(x, y, 2, 2);
    }
    return this._toTexture(canvas, repeat, repeat);
  }

  static createMarbleTexture(repeat = 3) {
    const canvas = this._makeCanvas(256);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
    for (let i = 0; i < 18; i++) {
      ctx.lineWidth = 0.8 + Math.random() * 2.2;
      ctx.beginPath();
      let x = Math.random() * 256;
      let y = 0;
      ctx.moveTo(x, y);
      while (y < 256) {
        y += 24;
        x += (Math.random() - 0.5) * 32;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    return this._toTexture(canvas, repeat, repeat);
  }

  static createBarkTexture() {
    const canvas = this._makeCanvas(128);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#4e3524';
    ctx.fillRect(0, 0, 128, 128);

    for (let i = 0; i < 90; i++) {
      const x = Math.random() * 128;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(35, 22, 12, 0.5)' : 'rgba(102, 72, 48, 0.35)';
      ctx.fillRect(x, 0, 2 + Math.random() * 3, 128);
    }
    return this._toTexture(canvas, 2, 3);
  }
}
