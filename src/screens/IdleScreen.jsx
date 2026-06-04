import { useEffect, useRef, useState } from 'react'
import './IdleScreen.css'

const MARQUEE_TEXT = 'NOURISH · HYDRATE · GLOW · REPAIR · RESTORE · BRIGHTEN · REVIVE · PROTECT · '

/**
 * IdleScreen – Cinematic attract mode for Dr. Rashel brand.
 * Dark luxury aesthetic, animated orbs, teardrop particles,
 * product marquee, logo glow, and auto-attract countdown.
 */
export default function IdleScreen({ onStart, settings }) {
  const canvasRef = useRef(null)
  const logoSrc = settings?.customLogo || './assets/logo.png'
  const bgSrc = settings?.customBackground || null

  const handleStart = () => {
    onStart()
  }

  // ── Teardrop particle canvas ─────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const NUM = 55
    const particles = Array.from({ length: NUM }, () => createParticle(canvas))

    function createParticle(c) {
      const isGold = Math.random() > 0.88
      const isTeal = !isGold && Math.random() > 0.4
      return {
        x: Math.random() * c.width,
        y: Math.random() * c.height + c.height,
        r: 2 + Math.random() * 6,
        vy: -(0.3 + Math.random() * 0.8),
        vx: (Math.random() - 0.5) * 0.4,
        alpha: 0.1 + Math.random() * 0.35,
        color: isGold ? [240, 192, 64]
          : isTeal ? [0, 200, 240]
            : [180, 220, 255],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
      }
    }

    function drawTeardrop(ctx, x, y, r, alpha, color) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      // Teardrop path: circle top + pointed bottom
      ctx.arc(x, y - r * 0.4, r, 0, Math.PI)
      ctx.bezierCurveTo(x - r, y - r * 0.4 + r, x, y + r * 1.6, x, y + r * 1.6)
      ctx.bezierCurveTo(x, y + r * 1.6, x + r, y - r * 0.4 + r, x + r, y - r * 0.4)
      ctx.closePath()
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.6, 0, x, y, r * 1.5)
      grad.addColorStop(0, `rgba(255,255,255,0.9)`)
      grad.addColorStop(0.4, `rgba(${color[0]},${color[1]},${color[2]},0.8)`)
      grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0.1)`)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.restore()
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.wobble += p.wobbleSpeed
        p.x += p.vx + Math.sin(p.wobble) * 0.4
        p.y += p.vy
        if (p.y < -30) {
          Object.assign(p, createParticle(canvas))
          p.y = canvas.height + 30
        }
        drawTeardrop(ctx, p.x, p.y, p.r, p.alpha, p.color)
      })
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      className="idle-screen"
      style={bgSrc ? { backgroundImage: `url("${bgSrc}")` } : undefined}
      onClick={handleStart}
    >
      {/* Animated mesh gradient orbs */}
      <div className="idle-orb idle-orb--1" />
      <div className="idle-orb idle-orb--2" />
      <div className="idle-orb idle-orb--3" />
      <div className="idle-orb idle-orb--4" />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="idle-particles" />

      {/* Subtle grid overlay */}
      <div className="idle-grid-overlay" />

      {/* Content */}
      <div className="idle-content">

        {/* Top badge */}
        <div className="idle-badge anim-fade-in-down">
          <span className="idle-badge-dot" />
          <span className="text-upper body-sm" style={{ letterSpacing: '0.3em', color: 'var(--color-gold)' }}>
            Premium Skincare · Exhibition
          </span>
          <span className="idle-badge-dot" />
        </div>

        {/* Logo with glow */}
        <div className="idle-logo-wrap anim-scale-in delay-100">
          <div className="idle-logo-halo" />
          <img
            src={logoSrc}
            alt="DR-RASHEL"
            className="idle-logo"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Title */}
        <h1 className="idle-title heading-display heading-xl text-center anim-fade-in-up delay-200">
          <span className="title-normal">Hydration </span>
          <span className="title-italic text-shimmer">Challenge</span>
        </h1>

        <div className="divider-gold anim-fade-in delay-300" style={{ width: '220px', margin: '4px auto' }} />

        {/* Tagline */}
        <p className="idle-subtitle body-lg text-center anim-fade-in-up delay-400">
          Catch as many hydration droplets as possible in{' '}
          <span className="text-highlight">30 seconds</span>
        </p>

        {/* Drop hint cards */}
        <div className="idle-drops anim-fade-in delay-500">
          <div className="drop-card drop-card--normal anim-float">
            <div className="drop-card-drop" />
            <div className="drop-card-info">
              <span className="drop-card-pts text-aqua">+10</span>
              <span className="drop-card-label">Water Drop</span>
            </div>
          </div>
          <div className="drop-card-divider" />
          <div className="drop-card drop-card--golden anim-float delay-300">
            <div className="drop-card-drop drop-card-drop--gold" />
            <div className="drop-card-info">
              <span className="drop-card-pts text-gold">+25</span>
              <span className="drop-card-label">Gold Serum</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          id="idle-start-btn"
          className="btn btn-primary btn-lg idle-cta anim-scale-in delay-600 anim-pulse-glow"
          onClick={handleStart}
        >
          <span className="idle-cta-icon"></span>
          TAP TO PLAY
        </button>



      </div>

      {/* Product tagline marquee — bottom strip */}
      <div className="idle-marquee-strip anim-fade-in delay-1000">
        <div className="marquee-outer">
          <div className="marquee-inner">
            {[0, 1].map(i => (
              <span key={i} className="idle-marquee-text">
                {MARQUEE_TEXT}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Corner water ripple decorations */}
      <div className="water-ripple water-ripple--tl" />
      <div className="water-ripple water-ripple--br" />
    </div>
  )
}
