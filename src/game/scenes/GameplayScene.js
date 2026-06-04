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
    bgGfx.fillGradientStyle(0x040d18, 0x071422, 0x050f1c, 0x040a14, 1)
    bgGfx.fillRect(0, 0, W, H)
    bgGfx.setDepth(0)

    // ── Background bokeh orbs ────────────────────────────────
    this._createBgOrbs(W, H)

    // ── Rising ambient bubbles ───────────────────────────────
    this._createAmbientBubbles(W, H)

    // ── Brand watermark (bottom) ─────────────────────────────
    this.add.text(W / 2, H - 22, 'DR-RASHEL  ·  HYDRATION CHALLENGE', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   '13px',
      color:      '#00d4ff',
    }).setOrigin(0.5).setAlpha(0.22).setDepth(5).setLetterSpacing(5)

    // ── High score challenge banner ──────────────────────────
    if (this.cfg.highScore > 0) {
      const bannerTxt = `🏆  BEAT THE BEST:  ${this.cfg.highScore} pts`
      this.challengeBanner = this.add.text(W / 2, H - 50, bannerTxt, {
        fontFamily: 'Inter, sans-serif',
        fontSize:   '15px',
        color:      '#f0c040',
        fontStyle:  '600',
      }).setOrigin(0.5).setAlpha(0.60).setDepth(5)
    }

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

    // Fade in from light aqua
    this.cameras.main.fadeIn(400, 184, 235, 248)
  }

  // ── Background helpers ────────────────────────────────────────

  _createBgOrbs(W, H) {
    const orbs = [
      { rx: 0.12, ry: 0.22, r: 160, col: 0x004466, a: 0.35, dur: 12000 },
      { rx: 0.82, ry: 0.40, r: 220, col: 0x003355, a: 0.28, dur: 16000 },
      { rx: 0.40, ry: 0.75, r: 180, col: 0x002244, a: 0.32, dur: 11000 },
      { rx: 0.68, ry: 0.15, r: 130, col: 0x005577, a: 0.25, dur: 14000 },
      { rx: 0.55, ry: 0.88, r: 240, col: 0x003366, a: 0.20, dur: 19000 },
      { rx: 0.25, ry: 0.60, r: 100, col: 0x665500, a: 0.15, dur: 13000 },
    ]
    orbs.forEach((o, i) => {
      const c = this.add.circle(o.rx * W, o.ry * H, o.r, o.col, o.a).setDepth(1)
      this.tweens.add({
        targets:  c,
        x:        o.rx * W + Phaser.Math.Between(-70, 70),
        y:        o.ry * H + Phaser.Math.Between(-50, 50),
        scaleX:   1.18, scaleY: 1.18,
        alpha:    o.a * 0.65,
        duration: o.dur,
        delay:    i * 700,
        yoyo:     true,
        repeat:   -1,
        ease:     'Sine.easeInOut',
      })
    })
  }

  _createAmbientBubbles(W, H) {
    for (let i = 0; i < 28; i++) {
      const x     = Phaser.Math.Between(0, W)
      const y     = Phaser.Math.Between(0, H)
      const r     = Phaser.Math.Between(3, 10)
      const col   = Phaser.Math.RND.pick([0x0099cc, 0x00ccff, 0x336699, 0x004466, 0xffcc00])
      const alpha = Phaser.Math.FloatBetween(0.04, 0.18)
      const bub   = this.add.circle(x, y, r, col, alpha).setDepth(2)
      bub.setStrokeStyle(0.5, col, alpha * 0.4)

      this.tweens.add({
        targets:  bub,
        y:        y - Phaser.Math.Between(300, H),
        x:        x + Phaser.Math.Between(-80, 80),
        alpha:    0,
        duration: Phaser.Math.Between(7000, 18000),
        ease:     'Sine.easeInOut',
        delay:    Phaser.Math.Between(0, 10000),
        repeat:   -1,
        onRepeat: () => {
          bub.setPosition(Phaser.Math.Between(0, W), H + 20)
          bub.setAlpha(Phaser.Math.FloatBetween(0.06, 0.22))
        },
      })
    }
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
    const drop    = this.add.image(x, -120, texKey).setDepth(3)

    // Large, touchscreen-friendly sizes: 140-180px normal, 165-205px golden
    const dispW = isGold
      ? Phaser.Math.Between(165, 205)
      : Phaser.Math.Between(140, 182)
    const dispH = Math.round(dispW * 1.27)   // matches canvas aspect 240:305
    drop.setDisplaySize(dispW, dispH)

    drop.dropType  = isGold ? DROPLET_TYPES.GOLDEN : DROPLET_TYPES.NORMAL
    drop.points    = isGold ? this.cfg.pointsGolden : this.cfg.pointsNormal
    drop.speedY    = Phaser.Math.FloatBetween(this.cfg.speedMin, this.cfg.speedMax)
    drop.driftX    = Phaser.Math.FloatBetween(-25, 25)
    drop.startX    = x
    drop.startTime = this.time.now

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
      const radius = drop.displayWidth * 0.55
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
    const mainColor  = isGold ? 0xd4a017 : 0x00aadd
    const glowColor  = isGold ? 0xf8e060 : 0x40d8f8
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

    // Flash dark, then fade
    this.cameras.main.flash(350, 0, 180, 220, true)
    this.time.delayedCall(750, () => {
      this.cameras.main.fadeOut(550, 4, 13, 24)
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
