import { useEffect, useRef } from 'react'
import './IdleScreen.css'

/**
 * IdleScreen – Attract mode shown between players.
 * Animated water particle background, brand identity, Start button.
 */
export default function IdleScreen({ onStart, settings }) {
  const canvasRef  = useRef(null)
  const animRef    = useRef(null)
  const logoSrc    = settings?.customLogo    || './assets/logo.png'
  const bgSrc      = settings?.customBackground || './assets/background.png'

  // ── Ambient particle canvas ───────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Particle pool
    const NUM = 40
    const particles = Array.from({ length: NUM }, () => createParticle(canvas))

    function createParticle(c) {
      return {
        x:    Math.random() * c.width,
        y:    Math.random() * c.height + c.height,
        r:    3 + Math.random() * 7,
        vy:   -(0.2 + Math.random() * 0.6),
        vx:   (Math.random() - 0.5) * 0.3,
        alpha: 0.08 + Math.random() * 0.22,
        color: Math.random() > 0.85
          ? `rgba(200,137,10,`
          : Math.random() > 0.5
            ? `rgba(74,184,216,`
            : `rgba(255,255,255,`,
      }
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx + Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.3
        p.y += p.vy
        if (p.y < -20) {
          Object.assign(p, createParticle(canvas))
          p.y = canvas.height + 20
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + p.alpha + ')'
        ctx.fill()
        // Draw a subtle stroke for bubble feel
        ctx.strokeStyle = p.color + (p.alpha * 0.5) + ')'
        ctx.lineWidth = 0.5
        ctx.stroke()
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    animRef.current = raf

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      className="idle-screen"
      style={{ backgroundImage: `url("${bgSrc}")` }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="idle-particles" />

      {/* Dark overlay */}
      <div className="idle-overlay" />

      {/* Content */}
      <div className="idle-content anim-fade-in">

        {/* Logo */}
        <div className="idle-logo-wrap anim-float">
          <img
            src={logoSrc}
            alt="DR-RASHEL"
            className="idle-logo"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Brand */}
        <div className="idle-brand anim-fade-in-up delay-200">
          <span className="text-upper text-muted body-sm">P R E M I U M · S K I N C A R E</span>
        </div>

        {/* Title */}
        <h1 className="idle-title heading-display heading-xl text-center anim-fade-in-up delay-300">
          <span className="title-normal">Hydration </span>
          <span className="title-italic">Challenge</span>
        </h1>

        <div className="divider-gold anim-fade-in delay-400" style={{ width: '200px', margin: '24px auto' }} />

        {/* Subtitle */}
        <p className="idle-subtitle body-lg text-center anim-fade-in-up delay-500">
          Catch as many hydration droplets as possible in{' '}
          <span className="text-highlight">30 seconds</span>
        </p>

        {/* Droplet hint icons */}
        <div className="idle-drops anim-fade-in delay-600">
          <div className="drop-hint drop-hint--normal anim-float">
            <span className="drop-hint-pts text-aqua">+10</span>
          </div>
          <div className="drop-hint drop-hint--golden anim-float delay-300">
            <span className="drop-hint-pts text-gold">+25</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          id="idle-start-btn"
          className="btn btn-primary btn-lg anim-scale-in delay-600 anim-pulse-glow"
          onClick={onStart}
        >
          TAP TO PLAY
        </button>

        {/* Footer hint */}
        <p className="idle-hint body-sm text-muted anim-fade-in delay-800">
          Touch the screen to begin your challenge
        </p>
      </div>

      {/* Corner water ripple decorations */}
      <div className="water-ripple water-ripple--tl" />
      <div className="water-ripple water-ripple--br" />
    </div>
  )
}
