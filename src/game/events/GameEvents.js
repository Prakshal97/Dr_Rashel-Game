/**
 * GameEvents – Singleton EventEmitter bridging Phaser ↔ React.
 * Phaser scenes emit events here; React components subscribe.
 */
class GameEventEmitter extends EventTarget {
  emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }))
  }

  on(eventName, callback) {
    this.addEventListener(eventName, callback)
    return () => this.removeEventListener(eventName, callback)
  }

  off(eventName, callback) {
    this.removeEventListener(eventName, callback)
  }
}

export const GameEvents = new GameEventEmitter()

// Event name constants
export const EVENTS = {
  SCORE_UPDATE:   'score-update',    // { score, highScore, isNewHigh }
  GAME_END:       'game-end',        // { score, highScore, isNewHigh }
  TIMER_UPDATE:   'timer-update',    // { timeLeft }
  DROPLET_TAP:    'droplet-tap',     // { x, y, points, type }
}
