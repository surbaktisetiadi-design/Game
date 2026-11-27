export class PlayerManager {
  constructor(scene) {
    this.scene = scene;
    this.players = new Map();
    this.localPlayer = null;
  }

  addPlayer(player, isLocal = false) {
    this.players.set(player.id, player);
    this.scene.add(player.mesh);
    if (isLocal) {
      this.localPlayer = player;
    }
  }

  removePlayer(id) {
    const player = this.players.get(id);
    if (player) {
      this.scene.remove(player.mesh);
      this.players.delete(id);
    }
  }

  update(dt) {
    for (const player of this.players.values()) {
      player.updateAnimation(dt);
    }
  }
}
