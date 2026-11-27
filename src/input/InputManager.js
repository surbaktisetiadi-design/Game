export class InputManager {
  constructor(canvas, eventBus) {
    this.canvas = canvas;
    this.eventBus = eventBus;

    this.keys = new Set();
    this.moveAxis = { x: 0, y: 0 };
    this.lookDelta = { x: 0, y: 0 };

    this.jumpPressed = false;
    this.sprintPressed = false;
    this.crouchToggle = false;

    this._bindKeyboard();
    this._bindMouse();
    this._bindTouch();
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);

      if (e.code === 'Space') {
        this.jumpPressed = true;
      }
      if (e.code === 'KeyC') {
        this.crouchToggle = !this.crouchToggle;
      }
      if (e.code === 'KeyE') {
        this.eventBus?.emit('interact');
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  _bindMouse() {
    this.canvas.addEventListener('click', () => {
      if (document.pointerLockElement !== this.canvas && this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === this.canvas) {
        this.lookDelta.x += e.movementX;
        this.lookDelta.y += e.movementY;
      }
    });
  }

  _bindTouch() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickStick = document.getElementById('joystick-stick');
    let joyTouchId = null;
    const maxRadius = 42;

    if (joystickZone && joystickStick) {
      joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        joyTouchId = touch.identifier;
        this._updateJoystick(touch, joystickZone, joystickStick, maxRadius);
      });

      joystickZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
          if (touch.identifier === joyTouchId) {
            this._updateJoystick(touch, joystickZone, joystickStick, maxRadius);
          }
        }
      });

      const resetJoy = (e) => {
        for (const touch of e.changedTouches) {
          if (touch.identifier === joyTouchId) {
            joyTouchId = null;
            this.moveAxis.x = 0;
            this.moveAxis.y = 0;
            joystickStick.style.transform = 'translate(0px, 0px)';
          }
        }
      };
      joystickZone.addEventListener('touchend', resetJoy);
      joystickZone.addEventListener('touchcancel', resetJoy);
    }

    const lookZone = document.getElementById('touch-look-zone');
    let lookTouchId = null;
    let lastLookX = 0;
    let lastLookY = 0;

    if (lookZone) {
      lookZone.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        lookTouchId = touch.identifier;
        lastLookX = touch.clientX;
        lastLookY = touch.clientY;
      });

      lookZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (const touch of e.changedTouches) {
          if (touch.identifier === lookTouchId) {
            const dx = touch.clientX - lastLookX;
            const dy = touch.clientY - lastLookY;
            lastLookX = touch.clientX;
            lastLookY = touch.clientY;
            this.lookDelta.x += dx * 2.2;
            this.lookDelta.y += dy * 2.2;
          }
        }
      });

      const endLook = (e) => {
        for (const touch of e.changedTouches) {
          if (touch.identifier === lookTouchId) {
            lookTouchId = null;
          }
        }
      };
      lookZone.addEventListener('touchend', endLook);
      lookZone.addEventListener('touchcancel', endLook);
    }

    const btnJump = document.getElementById('btn-jump');
    const btnSprint = document.getElementById('btn-sprint');
    const btnCrouch = document.getElementById('btn-crouch');

    if (btnJump) {
      btnJump.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.jumpPressed = true;
      });
    }

    if (btnSprint) {
      btnSprint.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.sprintPressed = true;
        btnSprint.classList.add('active');
      });
      btnSprint.addEventListener('touchend', () => {
        this.sprintPressed = false;
        btnSprint.classList.remove('active');
      });
    }

    if (btnCrouch) {
      btnCrouch.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.crouchToggle = !this.crouchToggle;
        btnCrouch.classList.toggle('active', this.crouchToggle);
      });
    }
  }

  _updateJoystick(touch, zone, stick, maxRadius) {
    const rect = zone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    stick.style.transform = `translate(${dx}px, ${dy}px)`;
    this.moveAxis.x = dx / maxRadius;
    this.moveAxis.y = dy / maxRadius;
  }

  getMovementInput() {
    let x = this.moveAxis.x;
    let z = this.moveAxis.y;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) z -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) z += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;

    const len = Math.hypot(x, z);
    if (len > 1) {
      x /= len;
      z /= len;
    }

    return {
      x,
      z,
      sprint: this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || this.sprintPressed,
      jump: this.jumpPressed,
      crouch: this.crouchToggle,
    };
  }

  endFrame() {
    this.lookDelta.x = 0;
    this.lookDelta.y = 0;
    this.jumpPressed = false;
  }
}
