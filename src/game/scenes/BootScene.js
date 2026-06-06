import Phaser from 'phaser'

/**
 * BootScene – Generates premium canvas textures for droplets
 * (no external images = no black rectangles), then starts GameplayScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    const { width: W, height: H } = this.scale

    // ── Branded loading screen ────────────────────────────────
    const bg = this.add.graphics()
    bg.fillGradientStyle(0xb8ecf7, 0xb8ecf7, 0xd8f5fb, 0xd4f5f0, 1)
    bg.fillRect(0, 0, W, H);

    // Soft background orbs
    [[0.15, 0.3, 200, 0x168065, 0.08], [0.82, 0.6, 240, 0x4b2a8e, 0.06]].forEach(([rx, ry, r, c, a]) => {
      const g = this.add.graphics()
      g.fillStyle(c, a)
      g.fillCircle(rx * W, ry * H, r)
    })

    this.add.text(W / 2, H * 0.40, 'DR.RASHEL', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize: Math.min(W * 0.09, 80) + 'px',
      color: '#351c6a',
      fontStyle: 'italic',
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.50, 'HYDRATION CHALLENGE', {
      fontFamily: 'Inter, sans-serif',
      fontSize: Math.min(W * 0.022, 18) + 'px',
      color: '#168065',
    }).setOrigin(0.5).setLetterSpacing(7)

    const barW = W * 0.45
    const barY = H * 0.63
    const barX = (W - barW) / 2
    this.add.rectangle(barX + barW / 2, barY, barW, 3, 0xb0d8e8).setOrigin(0.5)
    const fill = this.add.rectangle(barX, barY, 0, 3, 0x1a9abd).setOrigin(0, 0.5)
    this.load.on('progress', v => { fill.width = barW * v })
  }

  create() {
    this._genDropTexture('water-drop', false)
    this._genDropTexture('gold-drop', true)
    this._genPollutionTexture('pollution-drop')
    this._genUVTexture('uv-drop')
    this.scene.start('GameplayScene')
  }

  // ── Canvas texture generator ──────────────────────────────────

  _genDropTexture(key, isGolden) {
    if (this.textures.exists(key)) return

    const W = 240, H = 300
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Geometry — Perfect Sphere
    const cx     = W / 2          // horizontal centre
    const cy     = H / 2          // vertical centre
    const rx     = W * 0.43       // radius
    const tipY   = cy - rx        // top of sphere
    const botY   = cy + rx        // bottom of sphere
    const bulgeY = cy             // widest point (middle)

    const path = () => {
      ctx.beginPath()
      ctx.arc(cx, cy, rx, 0, Math.PI * 2)
      ctx.closePath()
    }

    // ① Outer glow (shadow trick)
    ctx.save()
    ctx.shadowColor = isGolden ? 'rgba(101,59,192,0.55)' : 'rgba(22,128,101,0.55)'
    ctx.shadowBlur = 26
    path()
    ctx.fillStyle = isGolden ? 'rgba(101,59,192,0.01)' : 'rgba(22,128,101,0.01)'
    ctx.fill()
    ctx.restore()

    // ② Main body gradient
    path()
    const grad = ctx.createLinearGradient(cx - rx * 0.5, tipY, cx + rx * 0.35, botY)
    if (isGolden) { // Purple Sphere
      grad.addColorStop(0, 'rgba(180,150,240,0.97)')
      grad.addColorStop(0.20, 'rgba(130,88,220,0.96)')
      grad.addColorStop(0.55, 'rgba(101,59,192,0.94)')
      grad.addColorStop(0.85, 'rgba(75,42,142,0.92)')
      grad.addColorStop(1, 'rgba(43,21,90,0.88)')
    } else { // Mint/Emerald Water Drop
      grad.addColorStop(0, 'rgba(160,240,210,0.96)')
      grad.addColorStop(0.18, 'rgba(90,210,165,0.93)')
      grad.addColorStop(0.45, 'rgba(26,152,120,0.90)')
      grad.addColorStop(0.75, 'rgba(16,105,80,0.88)')
      grad.addColorStop(1, 'rgba(8,60,45,0.84)')
    }
    ctx.fillStyle = grad
    ctx.fill()

    // ③ Glass overlay & highlights (clipped inside shape)
    path()
    ctx.save()
    ctx.clip()

    // Large diffuse glass highlight (top-left quadrant)
    const glx = cx - rx * 0.32
    const gly = tipY + (botY - tipY) * 0.16
    const glGrad = ctx.createRadialGradient(glx, gly, 0, glx, gly, rx * 0.82)
    glGrad.addColorStop(0, 'rgba(255,255,255,0.32)')
    glGrad.addColorStop(0.55, 'rgba(255,255,255,0.10)')
    glGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glGrad
    ctx.fillRect(0, 0, W, H)

    // Small bright specular spot
    const sx = cx - rx * 0.21
    const sy = tipY + (botY - tipY) * 0.19
    const specGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx * 0.27)
    specGrad.addColorStop(0, 'rgba(255,255,255,0.96)')
    specGrad.addColorStop(0.6, 'rgba(255,255,255,0.45)')
    specGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = specGrad
    ctx.fillRect(0, 0, W, H)

    // Tiny bright dot (hotspot)
    ctx.beginPath()
    ctx.ellipse(sx - 5, sy - 4, rx * 0.095, rx * 0.065, -0.42, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.98)'
    ctx.fill()

    // Bottom inner reflection
    const bx = cx
    const by = botY - (botY - bulgeY) * 0.24
    const botGrad = ctx.createRadialGradient(bx, by, 0, bx, by, rx * 0.40)
    botGrad.addColorStop(0, isGolden ? 'rgba(180,150,240,0.24)' : 'rgba(160,240,210,0.24)')
    botGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, 0, W, H)

    ctx.restore()

    // ④ Subtle border outline
    path()
    ctx.strokeStyle = isGolden ? 'rgba(101,59,192,0.30)' : 'rgba(26,152,120,0.22)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    this.textures.addCanvas(key, canvas)
  }

  _genPollutionTexture(key) {
    if (this.textures.exists(key)) return
    const W = 240, H = 300
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    const cx = W / 2, cy = H / 2, r = 90
    const path = () => {
      ctx.beginPath()
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * Math.PI * 2
        // Make it jagged/blobby
        const rOff = r + Math.sin(i * 4) * 12 + Math.cos(i * 7) * 8
        const px = cx + Math.cos(angle) * rOff
        const py = cy + Math.sin(angle) * rOff
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    // Outer glow
    ctx.save()
    ctx.shadowColor = 'rgba(95, 255, 75, 0.6)'
    ctx.shadowBlur = 25
    path()
    ctx.fillStyle = 'rgba(20,20,20,0.01)'
    ctx.fill()
    ctx.restore()

    // Main gradient (dark grey/black to toxic green edge)
    path()
    const grad = ctx.createRadialGradient(cx - 20, cy - 20, 10, cx, cy, r + 20)
    grad.addColorStop(0, '#555555')
    grad.addColorStop(0.4, '#1b261b')
    grad.addColorStop(0.8, '#0b140b')
    grad.addColorStop(1, '#3a7d25')
    ctx.fillStyle = grad
    ctx.fill()

    // Acid green outline
    path()
    ctx.strokeStyle = '#5fba45'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // toxic spots
    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.arc(cx - 35 + i * 10, cy - 40 + (i % 2) * 30, 4 + (i % 3) * 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(110, 255, 80, 0.25)'
      ctx.fill()
    }

    this.textures.addCanvas(key, canvas)
  }

  _genUVTexture(key) {
    if (this.textures.exists(key)) return
    const W = 240, H = 300
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')

    const cx = W / 2, cy = H / 2, r1 = 95, r2 = 75
    const spikes = 14
    const path = () => {
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i / (spikes * 2)) * Math.PI * 2
        const r = (i % 2 === 0) ? r1 : r2
        const px = cx + Math.cos(angle) * r
        const py = cy + Math.sin(angle) * r
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    // Outer glow
    ctx.save()
    ctx.shadowColor = 'rgba(255, 60, 0, 0.7)'
    ctx.shadowBlur = 30
    path()
    ctx.fillStyle = 'rgba(255,255,255,0.01)'
    ctx.fill()
    ctx.restore()

    // Main gradient (yellow to intense orange/red)
    path()
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r1)
    grad.addColorStop(0, '#fffbe6')
    grad.addColorStop(0.3, '#ffeb3b')
    grad.addColorStop(0.7, '#ff5722')
    grad.addColorStop(1, '#c2185b')
    ctx.fillStyle = grad
    ctx.fill()

    // Core brightness
    ctx.beginPath()
    ctx.arc(cx, cy, 45, 0, Math.PI * 2)
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45)
    coreGrad.addColorStop(0, 'rgba(255,255,255,0.9)')
    coreGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = coreGrad
    ctx.fill()

    this.textures.addCanvas(key, canvas)
  }
}
