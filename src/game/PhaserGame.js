import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene.js'
import { GameplayScene } from './scenes/GameplayScene.js'

/**
 * Creates and returns a configured Phaser Game instance.
 * @param {string} parentId - DOM element ID to mount the canvas
 * @param {object} settings - game settings from admin config
 */
export function createPhaserGame(parentId, settings) {
  // Inject settings for scenes to read
  window.__gameSettings = settings

  const config = {
    type:   Phaser.AUTO,
    parent: parentId,
    width:  window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#b4eaf6',
    transparent: false,
    scale: {
      mode:       Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width:      window.innerWidth,
      height:     window.innerHeight,
    },
    input: {
      activePointers: 5,  // up to 5 simultaneous touches
    },
    fps: {
      target:         60,
      forceSetTimeOut: false,
    },
    scene: [BootScene, GameplayScene],
  }

  return new Phaser.Game(config)
}
