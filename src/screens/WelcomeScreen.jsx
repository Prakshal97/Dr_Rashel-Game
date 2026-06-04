import { useEffect, useRef } from 'react'
import './WelcomeScreen.css'

export default function WelcomeScreen({ onBegin }) {
  const canvasRef = useRef(null)

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
      ctx.arc(x + r*0.3, y + r*0.3, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fill()

      // Glass body
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      const grad = ctx.createRadialGradient(x - r*0.2, y - r*0.2, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255,255,255,0.85)')
      grad.addColorStop(0.3, 'rgba(255,255,255,0.15)')
      grad.addColorStop(0.8, 'rgba(150,220,200,0.25)')
      grad.addColorStop(1, 'rgba(255,255,255,0.55)')
      ctx.fillStyle = grad
      ctx.fill()
      
      // Sharp highlight
      ctx.beginPath()
      ctx.arc(x - r*0.4, y - r*0.4, r*0.15, 0, Math.PI * 2)
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
    <div className="welcome-screen">
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

      <div className="welcome-content">
        <div className="idle-badge" style={{ marginBottom: '20px', zIndex: 1 }}>
          <span className="idle-badge-dot"></span>
          <span className="idle-badge-text">PREMIUM SKINCARE - EXHIBITION</span>
          <span className="idle-badge-dot"></span>
        </div>

        <div className="welcome-speech-bubble">
          <p>
            Welcome to the <strong>Dr. Rashel Hydration Challenge!</strong>
          </p>
          <p style={{ marginTop: '8px' }}>
            Test your reflexes, build your glow, and discover the power of hydration.
          </p>
        </div>

        <div className="welcome-character-wrap">
          <div className="checkerboard-bg">
            <div className="glow-effect"></div>
          </div>
          <img src="./assets/character.png" alt="Character" className="character-img" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>

        <button className="idle-cta-btn welcome-cta-btn" onClick={onBegin}>TAP TO BEGIN</button>
      </div>
    </div>
  )
}
