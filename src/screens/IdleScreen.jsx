import { useEffect, useRef } from 'react'
import './IdleScreen.css'

export default function IdleScreen({ onStart, settings }) {
  const canvasRef = useRef(null)
  const logoSrc = settings?.customLogo || './assets/Purple-DR-logo-HR (1).png'

  // Canvas particle system for realistic water drops
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

    const drops = Array.from({ length: 20 }, () => createDrop(canvas))

    function createDrop(c) {
      return {
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: 8 + Math.random() * 12,
        vy: 0.2 + Math.random() * 0.4,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.005 + Math.random() * 0.01,
      }
    }

    function drawDrop(ctx, x, y, r) {
      ctx.save()

      // Subtle shadow
      ctx.beginPath()
      ctx.arc(x + r * 0.3, y + r * 0.3, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fill()

      // Glass body
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255,255,255,0.85)')
      grad.addColorStop(0.3, 'rgba(255,255,255,0.15)')
      grad.addColorStop(0.8, 'rgba(150,220,200,0.25)')
      grad.addColorStop(1, 'rgba(255,255,255,0.55)')
      ctx.fillStyle = grad
      ctx.fill()

      // Sharp highlight
      ctx.beginPath()
      ctx.arc(x - r * 0.4, y - r * 0.4, r * 0.15, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fill()

      ctx.restore()
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drops.forEach(d => {
        d.wobble += d.wobbleSpeed
        d.y += d.vy
        const x = d.x + Math.sin(d.wobble) * 1.5

        if (d.y - d.r > canvas.height) {
          d.y = -d.r
          d.x = Math.random() * canvas.width
        }
        drawDrop(ctx, x, d.y, d.r)
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
    <div className="idle-screen" onClick={onStart}>
      <div className="idle-grid-overlay" />
      <canvas ref={canvasRef} className="idle-particles" />

      {/* Purple Wave matching the reference image */}
      <div className="idle-wave-bottom">
        <svg viewBox="0 0 1440 450" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Subtle glowing swooshes on the sides */}
          <path d="M0,150 C300,500 1140,500 1440,150" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M0,120 C350,550 1090,550 1440,120" fill="none" stroke="rgba(220,180,255,0.5)" strokeWidth="2" />
          <path d="M0,90 C400,600 1040,600 1440,90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

          {/* Main Wave Body */}
          <path d="M0,200 C400,600 1040,600 1440,200 L1440,450 L0,450 Z" fill="#321682" />
          <path d="M0,230 C400,620 1040,620 1440,230 L1440,450 L0,450 Z" fill="#280f6e" />

          {/* Glowing Star Dots inside the wave */}
          <circle cx="200" cy="350" r="2.5" fill="#fff" opacity="0.8" />
          <circle cx="350" cy="400" r="1.5" fill="#fff" opacity="0.4" />
          <circle cx="1100" cy="360" r="3" fill="#fff" opacity="0.6" />
          <circle cx="1250" cy="280" r="2" fill="#fff" opacity="0.9" />
          <circle cx="800" cy="420" r="1.5" fill="#fff" opacity="0.5" />
        </svg>
      </div>

      <div className="idle-content">
        {/* Top Badge */}
        <div className="idle-badge">
          <span className="idle-badge-dot"></span>
          <span className="idle-badge-text">PREMIUM SKINCARE - EXHIBITION</span>
          <span className="idle-badge-dot"></span>
        </div>

        {/* Logo */}
        <img src={logoSrc} alt="DR.RASHEL BEAUTY ELIXIRS" className="idle-logo" />

        {/* Title */}
        <div className="idle-title-container">
          <span className="idle-title-hydration">Hydration</span>
          <span className="idle-title-challenge">Challenge</span>
        </div>

        {/* Divider */}
        <div className="idle-divider"></div>

        {/* Subtitle */}
        <p className="idle-subtitle">
          Catch as many hydration droplets as<br />
          possible in <span className="idle-subtitle-bold">30 seconds</span>
        </p>

        {/* Hint Cards */}
        <div className="idle-cards">
          <div className="idle-card idle-card--teal">
            <div className="card-drop-wrapper">
              <div className="card-drop card-drop--teal"></div>
            </div>
            <div className="card-text">
              <span className="card-pts">+10</span>
              <span className="card-label card-label--teal">WATER DROP</span>
            </div>
          </div>
          <div className="idle-card idle-card--purple">
            <div className="card-drop-wrapper">
              <div className="card-drop card-drop--purple"></div>
            </div>
            <div className="card-text">
              <span className="card-pts">+25</span>
              <span className="card-label card-label--purple">GOLD SERUM</span>
            </div>
          </div>
          <div className="idle-card idle-card--dark">
            <div className="card-drop-wrapper">
              <div className="card-drop card-drop--dark"></div>
            </div>
            <div className="card-text">
              <span className="card-pts card-pts--neg">-10</span>
              <span className="card-label card-label--dark">POLLUTION</span>
            </div>
          </div>
          <div className="idle-card idle-card--orange">
            <div className="card-drop-wrapper">
              <div className="card-drop card-drop--orange"></div>
            </div>
            <div className="card-text">
              <span className="card-pts card-pts--neg">-10</span>
              <span className="card-label card-label--orange">UV RAYS</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="idle-cta-btn">TAP TO PLAY</button>
      </div>
    </div>
  )
}
