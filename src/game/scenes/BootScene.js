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
    [[0.15, 0.3, 200, 0x4ab8d8, 0.08], [0.82, 0.6, 240, 0x9de0f0, 0.06]].forEach(([rx, ry, r, c, a]) => {
      const g = this.add.graphics()
      g.fillStyle(c, a)
      g.fillCircle(rx * W, ry * H, r)
    })

    this.add.text(W / 2, H * 0.40, 'DR-RASHEL', {
      fontFamily: 'Cormorant Garamond, Georgia, serif',
      fontSize:   Math.min(W * 0.09, 80) + 'px',
      color:      '#0d4a5c',
      fontStyle:  'italic',
    }).setOrigin(0.5)

    this.add.text(W / 2, H * 0.50, 'HYDRATION CHALLENGE', {
      fontFamily: 'Inter, sans-serif',
      fontSize:   Math.min(W * 0.022, 18) + 'px',
      color:      '#1a7090',
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
    this._genDropTexture('gold-drop',  true)
    this.scene.start('GameplayScene')
  }

  // ── Canvas texture generator ──────────────────────────────────

  _genDropTexture(key, isGolden) {
    if (this.textures.exists(key)) return

    const W = 240, H = 300
    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Geometry
    const cx   = W / 2        // 120
    const tipY = 24            // pointed top
    const midY = H * 0.54     // ~162  widest
    const botY = H * 0.88     // ~264  round bottom
    const rx   = W * 0.40     // ~96   half-width

    const path = () => {
      ctx.beginPath()
      ctx.moveTo(cx, tipY)
      ctx.bezierCurveTo(
        cx + rx * 1.10, tipY + (midY - tipY) * 0.42,
        cx + rx,        midY,
        cx,             botY
      )
      ctx.bezierCurveTo(
        cx - rx,        midY,
        cx - rx * 1.10, tipY + (midY - tipY) * 0.42,
        cx,             tipY
      )
      ctx.closePath()
    }

    // ① Outer glow (shadow trick)
    ctx.save()
    ctx.shadowColor = isGolden ? 'rgba(210,148,8,0.65)' : 'rgba(26,155,210,0.55)'
    ctx.shadowBlur  = 26
    path()
    ctx.fillStyle = isGolden ? 'rgba(210,148,8,0.01)' : 'rgba(26,155,210,0.01)'
    ctx.fill()
    ctx.restore()

    // ② Main body gradient
    path()
    const grad = ctx.createLinearGradient(cx - rx * 0.5, tipY, cx + rx * 0.35, botY)
    if (isGolden) {
      grad.addColorStop(0,    'rgba(255,252,205,0.97)')
      grad.addColorStop(0.20, 'rgba(252,202,55,0.96)')
      grad.addColorStop(0.55, 'rgba(218,148,12,0.94)')
      grad.addColorStop(0.85, 'rgba(188,108,5,0.92)')
      grad.addColorStop(1,    'rgba(162,78,0,0.88)')
    } else {
      grad.addColorStop(0,    'rgba(220,248,255,0.96)')
      grad.addColorStop(0.18, 'rgba(152,222,252,0.93)')
      grad.addColorStop(0.45, 'rgba(55,165,235,0.90)')
      grad.addColorStop(0.75, 'rgba(15,105,200,0.88)')
      grad.addColorStop(1,    'rgba(5,62,158,0.84)')
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
    glGrad.addColorStop(0,   'rgba(255,255,255,0.32)')
    glGrad.addColorStop(0.55,'rgba(255,255,255,0.10)')
    glGrad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = glGrad
    ctx.fillRect(0, 0, W, H)

    // Small bright specular spot
    const sx = cx - rx * 0.21
    const sy = tipY + (botY - tipY) * 0.19
    const specGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, rx * 0.27)
    specGrad.addColorStop(0,   'rgba(255,255,255,0.96)')
    specGrad.addColorStop(0.6, 'rgba(255,255,255,0.45)')
    specGrad.addColorStop(1,   'rgba(255,255,255,0)')
    ctx.fillStyle = specGrad
    ctx.fillRect(0, 0, W, H)

    // Tiny bright dot (hotspot)
    ctx.beginPath()
    ctx.ellipse(sx - 5, sy - 4, rx * 0.095, rx * 0.065, -0.42, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.98)'
    ctx.fill()

    // Bottom inner reflection
    const bx = cx
    const by = botY - (botY - midY) * 0.24
    const botGrad = ctx.createRadialGradient(bx, by, 0, bx, by, rx * 0.40)
    botGrad.addColorStop(0, isGolden ? 'rgba(255,222,115,0.24)' : 'rgba(182,232,255,0.24)')
    botGrad.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = botGrad
    ctx.fillRect(0, 0, W, H)

    ctx.restore()

    // ④ Subtle border outline
    path()
    ctx.strokeStyle = isGolden ? 'rgba(172,104,4,0.30)' : 'rgba(8,82,176,0.22)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    this.textures.addCanvas(key, canvas)
  }
}
