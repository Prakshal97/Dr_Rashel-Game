import { useEffect, useRef } from 'react'
import './IdleScreen.css'

const MARQUEE_TEXT = 'NOURISH · HYDRATE · GLOW · REPAIR · RESTORE · BRIGHTEN · REVIVE · PROTECT · '

/**
 * IdleScreen – Elegant mint + purple attract mode (matches Dr. Rashel reference).
 * Features animated water droplet particles, purple wave SVG, glass drop cards.
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

    const NUM = 48
    const particles = Array.from({ length: NUM }, () => createParticle(canvas))

    function createParticle(c) {
      const isPurple = Math.random() > 0.78
      const isTeal   = !isPurple && Math.random() > 0.35
      return {
        x: Math.random() * c.width,
        y: Math.random() * c.height + c.height,
        r: 3 + Math.random() * 7,
        vy: -(0.35 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * 0.35,
        alpha: 0.12 + Math.random() * 0.32,
        color: isPurple ? [98, 68, 192]   // Indigo purple
          : isTeal  ? [19, 138, 106]      // Teal/Mint
            : [180, 235, 210],            // Light Mint
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.018,
      }
    }

    function drawTeardrop(ctx, x, y, r, alpha, color) {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.beginPath()
      ctx.arc(x, y - r * 0.4, r, 0, Math.PI)
      ctx.bezierCurveTo(x - r, y - r * 0.4 + r, x, y + r * 1.6, x, y + r * 1.6)
      ctx.bezierCurveTo(x, y + r * 1.6, x + r, y - r * 0.4 + r, x + r, y - r * 0.4)
      ctx.closePath()
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.6, 0, x, y, r * 1.5)
      grad.addColorStop(0, `rgba(255,255,255,0.92)`)
      grad.addColorStop(0.38, `rgba(${color[0]},${color[1]},${color[2]},0.75)`)
      grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0.08)`)
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
      {/* Subtle ambient orbs */}
      <div className="idle-orb idle-orb--1" />
      <div className="idle-orb idle-orb--2" />
      <div className="idle-orb idle-orb--3" />
      <div className="idle-orb idle-orb--4" />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="idle-particles" />

      {/* Subtle grid overlay */}
      <div className="idle-grid-overlay" />

      {/* Purple wave at the bottom — matches reference image */}
      <div className="idle-wave-bottom">
        <svg viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,80 C120,20 260,140 400,80 C540,20 680,120 800,60 L800,220 L0,220 Z"
            fill="rgba(74,47,160,0.85)"
          />
          <path
            d="M0,110 C150,50 300,160 450,90 C600,25 720,140 800,90 L800,220 L0,220 Z"
            fill="rgba(58,34,140,0.92)"
          />
          <path
            d="M0,140 C200,80 350,180 500,120 C650,60 750,160 800,120 L800,220 L0,220 Z"
            fill="rgba(44,24,117,0.97)"
          />
          {/* Stars in purple section */}
          <circle cx="60" cy="180" r="1.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="140" cy="195" r="1" fill="rgba(255,255,255,0.4)" />
          <circle cx="220" cy="175" r="2" fill="rgba(255,255,255,0.35)" />
          <circle cx="680" cy="185" r="1.5" fill="rgba(255,255,255,0.5)" />
          <circle cx="750" cy="200" r="1" fill="rgba(255,255,255,0.4)" />
          <circle cx="420" cy="200" r="2" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>

      {/* Content */}
      <div className="idle-content">

        {/* Top badge */}
        <div className="idle-badge anim-fade-in-down">
          <span className="idle-badge-dot" />
          <span className="text-upper body-sm" style={{ letterSpacing: '0.28em', color: 'var(--color-gold)' }}>
            Premium Skincare · Exhibition
          </span>
          <span className="idle-badge-dot" />
        </div>

        {/* Logo */}
        <div className="idle-logo-wrap anim-scale-in delay-100">
          <div className="idle-logo-halo" />
          <img
            src={logoSrc}
            alt="DR-RASHEL"
            className="idle-logo"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Title — "Hydration" normal, "Challenge" italic teal */}
        <h1 className="idle-title heading-display text-center anim-fade-in-up delay-200">
          <span className="title-normal">Hydration</span>
          <span className="title-italic">Challenge</span>
        </h1>

        <div className="divider-gold anim-fade-in delay-300" style={{ width: '200px', margin: '0 auto' }} />

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
              <span className="drop-card-pts">+10</span>
              <span className="drop-card-label">Water Drop</span>
            </div>
          </div>
          <div className="drop-card drop-card--golden anim-float delay-300">
            <div className="drop-card-drop drop-card-drop--gold" />
            <div className="drop-card-info">
              <span className="drop-card-pts" style={{ color: 'var(--color-gold)' }}>+25</span>
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
