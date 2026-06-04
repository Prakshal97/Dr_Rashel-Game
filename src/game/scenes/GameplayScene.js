import Phaser from 'phaser'
import { GameEvents, EVENTS } from '../events/GameEvents.js'

const DROPLET_TYPES = { NORMAL: 'normal', GOLDEN: 'golden' }

/**
 * GameplayScene – Full premium gameplay.
 * Canvas-generated droplets (no black bg), combo system,
 * background orbs, DR-RASHEL branding, enhanced splash FX.
 */
export class GameplayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameplayScene' })
  }

  // ── Lifecycle ─────────────────────────────────────────────────

  create() {
    const cfg = window.__gameSettings || {}
    this.cfg = {
      gameDuration:   cfg.gameDuration      ?? 30,
      speedMin:       cfg.dropletSpeed?.min  ?? 150,
      speedMax:       cfg.dropletSpeed?.max  ?? 360,
      spawnFrequency: cfg.spawnFrequency     ?? 600,
      pointsNormal:   cfg.pointsNormal       ?? 10,
      pointsGolden:   cfg.pointsGolden       ?? 25,
      goldenFreq:     cfg.goldenFrequency    ?? 0.15,
      soundEnabled:   cfg.soundEnabled       ?? true,
      highScore:      cfg.highScore          ?? 0,
    }

    this.score     = 0
    this.highScore = this.cfg.highScore
    this.timeLeft  = this.cfg.gameDuration
    this.isRunning = true

    // Combo tracking
    this.combo         = 0
    this.lastHitTime   = 0
    this.comboResetEvt = null

    const W = this.scale.width
    const H = this.scale.height

    // ── Background gradient ──────────────────────────────────
    const bgGfx = this.add.graphics()
    bgGfx.fillGradientStyle(0xcbebe1, 0xcbebe1, 0xb3dfce, 0xb3dfce, 1)
    bgGfx.fillRect(0, 0, W, H)
    bgGfx.setDepth(0)

    // ── Background overlapping circles (depth 1) ────────────
    this._createBgCircles(W, H)

    // ── Droplet group ────────────────────────────────────────
    this.droplets = this.add.group()

    // ── Audio ────────────────────────────────────────────────
    this.initAudio()

    // ── Input ────────────────────────────────────────────────
    this.input.on('pointerdown', this.onPointerDown, this)
    this.input.addPointer(4)

    // ── Spawn timer ──────────────────────────────────────────
    this.spawnTimer = this.time.addEvent({
      delay:         this.cfg.spawnFrequency,
      callback:      this.spawnDroplet,
      callbackScope: this,
      loop:          true,
    })

    // Initial burst – 6 droplets spread over 0.6 s
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 130 + 80, this.spawnDroplet, [], this)
    }

    // ── Countdown ────────────────────────────────────────────
    this.countdownTimer = this.time.addEvent({
      delay:         1000,
      callback:      this.onTick,
      callbackScope: this,
      loop:          true,
    })

    // Initial HUD emit
    GameEvents.emit(EVENTS.TIMER_UPDATE, { timeLeft: this.timeLeft })
    GameEvents.emit(EVENTS.SCORE_UPDATE, { score: 0, highScore: this.highScore, isNewHigh: false })

    // Fade in from mint green
    this.cameras.main.fadeIn(400, 203, 235, 225)
  }

  // ── Background helpers ────────────────────────────────────────

  _createBgCircles(W, H) {
    // Large overlapping translucent circles — exactly like the reference screenshot
    const circles = [
      { x: W * -0.08, y: H * 0.42, r: W * 0.58 },   // left-center big
      { x: W * 1.10,  y: H * 0.35, r: W * 0.68 },   // right-center big
      { x: W * 0.28,  y: H * 0.75, r: W * 0.50 },   // bottom-left
      { x: W * 0.82,  y: H * 0.72, r: W * 0.38 },   // bottom-right
      { x: W * 0.50,  y: H * 0.26, r: W * 0.28 },   // top-mid-left
    ]
    circles.forEach((c, i) => {
      const g = this.add.graphics().setDepth(1)
      g.lineStyle(1.5, 0xffffff, 0.50)
      g.strokeCircle(c.x, c.y, c.r)
      g.fillStyle(0xffffff, 0.05)
      g.fillCircle(c.x, c.y, c.r)
      // Very subtle slow pulse
      this.tweens.add({
        targets:  g,
        alpha:    { from: 0.85, to: 1 },
        duration: 5000 + i * 800,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
      })
    })
  }

  // ── Timer tick ────────────────────────────────────────────────

  onTick() {
    if (!this.isRunning) return
    this.timeLeft = Math.max(0, this.timeLeft - 1)
    GameEvents.emit(EVENTS.TIMER_UPDATE, { timeLeft: this.timeLeft })

    // Speed up spawning in last 10 s (urgency)
    if (this.timeLeft === 10 && this.spawnTimer) {
      this.spawnTimer.delay = Math.max(350, this.cfg.spawnFrequency * 0.6)
    }

    if (this.timeLeft <= 0) this.endGame()
  }

  // ── Droplet spawning ──────────────────────────────────────────

  spawnDroplet() {
    if (!this.isRunning) return
    // Soft cap: don't overload screen
    if (this.droplets.getLength() >= 18) return

    const W       = this.scale.width
    const isGold  = Math.random() < this.cfg.goldenFreq
    const texture = isGold ? 'gold-drop' : 'water-drop'

    // Make sure canvas texture exists (fallback to white square if BootScene missed)
    const texKey  = this.textures.exists(texture) ? texture : '__DEFAULT'

    const margin  = 100
    const x       = Phaser.Math.Between(margin, W - margin)

    const drop = this.add.container(x, -120).setDepth(3)
    const img  = this.add.image(0, 0, texKey)

    // Smaller sizes: 95-125px normal, 115-145px golden
    const dispW = isGold
      ? Phaser.Math.Between(115, 145)
      : Phaser.Math.Between(95, 125)
    const dispH = Math.round(dispW * 1.27)
    img.setDisplaySize(dispW, dispH)

    // Two-line label: "1%" on top, "Ceramide" below
    // Teal drop = dark purple text; Purple drop = white text
    const textColor1 = isGold ? '#ffffff' : '#321682'   // "1%"
    const textColor2 = isGold ? '#ffffff' : '#321682'   // "Ceramide"
    const strokeCol  = isGold ? 'rgba(50,22,130,0.6)' : 'rgba(255,255,255,0.5)'

    // Centre of the drop body (midY of the teardrop)
    const dropCY = dispH * 0.38

    const pctText = this.add.text(0, dropCY - dispH * 0.08, '1%', {
      fontFamily:      'Inter, sans-serif',
      fontSize:        Math.round(dispW * 0.22) + 'px',
      color:           textColor1,
      fontStyle:       'bold',
      stroke:          strokeCol,
      strokeThickness: 1.5,
      resolution:      2,
    }).setOrigin(0.5)

    const cerText = this.add.text(0, dropCY + dispH * 0.10, 'Ceramide', {
      fontFamily:      'Inter, sans-serif',
      fontSize:        Math.round(dispW * 0.13) + 'px',
      color:           textColor2,
      fontStyle:       '600',
      stroke:          strokeCol,
      strokeThickness: 1,
      resolution:      2,
    }).setOrigin(0.5)

    drop.add([img, pctText, cerText])

    drop.dropType  = isGold ? DROPLET_TYPES.GOLDEN : DROPLET_TYPES.NORMAL
    drop.points    = isGold ? this.cfg.pointsGolden : this.cfg.pointsNormal
    drop.speedY    = Phaser.Math.FloatBetween(this.cfg.speedMin, this.cfg.speedMax)
    drop.driftX    = Phaser.Math.FloatBetween(-25, 25)
    drop.startX    = x
    drop.startTime = this.time.now
    drop.hitRadius = dispW * 0.55

    // Golden pulse glow
    if (isGold) {
      this.tweens.add({
        targets:  drop,
        alpha:    { from: 0.75, to: 1 },
        duration: 700,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
      })
    }

    // Fade in
    drop.setAlpha(0)
    this.tweens.add({ targets: drop, alpha: 1, duration: 250 })
    this.droplets.add(drop)

    // Fall tween with gentle sinusoidal drift
    const fallDur = (this.scale.height + 250) / drop.speedY * 1000
    this.tweens.add({
      targets:  drop,
      y:        this.scale.height + 140,
      duration: fallDur,
      ease:     'Linear',
      onUpdate: (_, target) => {
        const t = (this.time.now - target.startTime) / 1000
        target.x = target.startX + Math.sin(t * 1.2) * target.driftX
      },
      onComplete: (_, targets) => { targets[0].destroy() },
    })
  }

  update() {
    if (!this.isRunning) return
    this.droplets.getChildren().forEach(d => {
      if (d.y > this.scale.height + 150) d.destroy()
    })
  }

  // ── Input ─────────────────────────────────────────────────────

  onPointerDown(pointer) {
    if (!this.isRunning) return
    const children = [...this.droplets.getChildren()]
    for (const drop of children) {
      const dist   = Phaser.Math.Distance.Between(pointer.x, pointer.y, drop.x, drop.y)
      const radius = drop.hitRadius
      if (dist < radius) {
        this.onDropletTapped(drop, pointer.x, pointer.y)
        break
      }
    }
  }

  onDropletTapped(drop, tapX, tapY) {
    const { points, dropType } = drop
    const isGold = dropType === DROPLET_TYPES.GOLDEN

    // Remove droplet
    this.tweens.killTweensOf(drop)
    drop.destroy()

    // ── Combo logic ────────────────────────────────────────
    const now = this.time.now
    if (now - this.lastHitTime < 1600) {
      this.combo = Math.min(this.combo + 1, 10)
    } else {
      this.combo = 1
    }
    this.lastHitTime = now

    // Reset combo after inactivity
    if (this.comboResetEvt) this.comboResetEvt.destroy()
    this.comboResetEvt = this.time.delayedCall(1600, () => { this.combo = 0 })

    // Bonus points for combo (flat bonus, not multiplier – clearer for visitors)
    let bonusPoints = 0
    if (this.combo >= 5)      bonusPoints = 15
    else if (this.combo >= 3) bonusPoints = 8
    else if (this.combo >= 2) bonusPoints = 4

    const totalPoints = points + bonusPoints

    // ── Score ──────────────────────────────────────────────
    this.score += totalPoints
    const wasHigh = this.score > this.highScore
    if (wasHigh) this.highScore = this.score

    GameEvents.emit(EVENTS.SCORE_UPDATE, {
      score:     this.score,
      highScore: this.highScore,
      isNewHigh: wasHigh,
    })

    // ── Visuals ────────────────────────────────────────────
    this.playSplash(tapX, tapY, isGold)
    this.showScorePopup(tapX, tapY, totalPoints, isGold, bonusPoints > 0)
    if (this.combo >= 2) this.showComboText(this.combo)

    this.playTapSound(isGold)

    GameEvents.emit(EVENTS.DROPLET_TAP, { x: tapX, y: tapY, points: totalPoints, type: dropType })
  }

  // ── Splash effect ─────────────────────────────────────────────

  playSplash(x, y, isGold) {
    const mainColor  = isGold ? 0x321682 : 0x168b6a
    const glowColor  = isGold ? 0xb28bf7 : 0x7be8ce
    const count      = isGold ? 16 : 12

    // Glow burst (expand + fade)
    const burst = this.add.circle(x, y, 18, glowColor, 0.75).setDepth(10)
    this.tweens.add({
      targets: burst, scaleX: 7, scaleY: 7, alpha: 0,
      duration: 380, ease: 'Quad.easeOut',
      onComplete: () => burst.destroy(),
    })

    // Water particles
    for (let i = 0; i < count; i++) {
      const angle  = (i / count) * Math.PI * 2 + Math.random() * 0.35
      const speed  = Phaser.Math.Between(90, 180)
      const size   = Phaser.Math.Between(5, 12)
      const p      = this.add.circle(x, y, size, mainColor, 0.88).setDepth(10)
      this.tweens.add({
        targets:  p,
        x:        x + Math.cos(angle) * speed,
        y:        y + Math.sin(angle) * speed,
        alpha:    0,
        scaleX:   0.15, scaleY: 0.15,
        duration: Phaser.Math.Between(320, 560),
        ease:     'Quad.easeOut',
        onComplete: () => p.destroy(),
      })
    }

    // Primary ripple ring
    const r1 = this.add.circle(x, y, 10, 0, 0).setStrokeStyle(2.5, mainColor, 0.72).setDepth(9)
    this.tweens.add({
      targets: r1, scaleX: 7, scaleY: 7, alpha: 0,
      duration: 480, ease: 'Quad.easeOut',
      onComplete: () => r1.destroy(),
    })

    // Secondary wider ripple
    const r2 = this.add.circle(x, y, 10, 0, 0).setStrokeStyle(1.5, mainColor, 0.38).setDepth(9)
    this.tweens.add({
      targets: r2, scaleX: 11, scaleY: 11, alpha: 0,
      duration: 640, ease: 'Quad.easeOut', delay: 80,
      onComplete: () => r2.destroy(),
    })
  }

  // ── Score popup ───────────────────────────────────────────────

  showScorePopup(x, y, points, isGold, isCombo) {
    const label = (points > 0 ? '+' : '') + points
    const color = isGold ? '#f0c040' : '#e8f4ff'
    const size  = isGold ? '42px' : isCombo ? '36px' : '30px'

    const text = this.add.text(x, y - 24, label, {
      fontFamily:      'Inter, sans-serif',
      fontSize:        size,
      color,
      fontStyle:       'bold',
      stroke:          '#ffffff',
      strokeThickness: isGold ? 5 : 4,
    }).setOrigin(0.5).setDepth(20)

    this.tweens.add({
      targets:  text,
      y:        y - 110,
      alpha:    0,
      scaleX:   isGold ? 1.4 : 1.15,
      scaleY:   isGold ? 1.4 : 1.15,
      duration: 950,
      ease:     'Quad.easeOut',
      onComplete: () => text.destroy(),
    })
  }

  // ── Combo text ────────────────────────────────────────────────

  showComboText(combo) {
    const W = this.scale.width
    const labels = ['', '', 'COMBO ×2', 'COMBO ×3  🔥', 'COMBO ×4  ⚡', 'COMBO ×5  🌟']
    const label  = combo < labels.length ? labels[combo] : `COMBO ×${combo}  🌟`
    const isBig  = combo >= 4

    // Flash existing combo text out first
    if (this._comboText && this._comboText.active) {
      this.tweens.killTweensOf(this._comboText)
      this._comboText.destroy()
    }

    const tx = W / 2
    const ty = this.scale.height * 0.36
    const t  = this.add.text(tx, ty, label, {
      fontFamily:      'Inter, sans-serif',
      fontSize:        isBig ? '56px' : '44px',
      color:           isBig ? '#f0c040' : '#e8f4ff',
      fontStyle:       'bold',
      stroke:          '#040d18',
      strokeThickness: isBig ? 7 : 5,
    }).setOrigin(0.5).setDepth(50).setAlpha(0).setScale(0.7)

    this._comboText = t

    this.tweens.add({
      targets:  t,
      alpha:    1,
      scaleX:   isBig ? 1.12 : 1.05,
      scaleY:   isBig ? 1.12 : 1.05,
      duration: 180,
      ease:     'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets:  t,
          alpha:    0,
          y:        ty - 55,
          duration: 480,
          ease:     'Quad.easeIn',
          delay:    320,
          onComplete: () => t.active && t.destroy(),
        })
      },
    })
  }

  // ── Audio ─────────────────────────────────────────────────────

  initAudio() {
    if (typeof AudioContext !== 'undefined') this.audioCtx = new AudioContext()
  }

  playTapSound(isGold) {
    if (!this.cfg.soundEnabled || !this.audioCtx) return
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
      const osc = this.audioCtx.createOscillator()
      const gain = this.audioCtx.createGain()
      osc.connect(gain); gain.connect(this.audioCtx.destination)
      if (isGold) {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1320, this.audioCtx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.18, this.audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35)
        osc.start(); osc.stop(this.audioCtx.currentTime + 0.35)
      } else {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(520, this.audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.22)
        osc.start(); osc.stop(this.audioCtx.currentTime + 0.22)
      }
    } catch { /* silent fail */ }
  }

  playSuccessSound() {
    if (!this.cfg.soundEnabled || !this.audioCtx) return
    try {
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume()
      ;[523, 659, 784, 1047].forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator()
        const gain = this.audioCtx.createGain()
        osc.connect(gain); gain.connect(this.audioCtx.destination)
        const t = this.audioCtx.currentTime + i * 0.12
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)
        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.start(t); osc.stop(t + 0.4)
      })
    } catch { /* silent fail */ }
  }

  // ── Game end ──────────────────────────────────────────────────

  endGame() {
    if (!this.isRunning) return
    this.isRunning = false

    this.spawnTimer?.destroy()
    this.countdownTimer?.destroy()
    this.comboResetEvt?.destroy()
    this.droplets.clear(true, true)

    this.playSuccessSound()

    // Flash light mint, then fade
    this.cameras.main.flash(350, 203, 235, 225, true)
    this.time.delayedCall(750, () => {
      this.cameras.main.fadeOut(550, 203, 235, 225)
      this.time.delayedCall(560, () => {
        GameEvents.emit(EVENTS.GAME_END, {
          score:     this.score,
          highScore: this.highScore,
          isNewHigh: this.score >= (window.__gameSettings?.highScore ?? 0) && this.score > 0,
        })
      })
    })
  }

  // ── Cleanup ────────────────────────────────────────────────────

  shutdown() {
    this.input.off('pointerdown', this.onPointerDown, this)
    this.spawnTimer?.destroy()
    this.countdownTimer?.destroy()
    this.comboResetEvt?.destroy()
    this.droplets?.clear(true, true)
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {})
      this.audioCtx = null
    }
  }
}
