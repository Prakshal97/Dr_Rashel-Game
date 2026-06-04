import { useEffect, useRef, useState } from 'react'
import './GameOverScreen.css'

function AnimatedScore({ target }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (target === 0) { setDisplay(0); return }
    let start = null
    const duration = 1200
    const raf = requestAnimationFrame(function step(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(ease * target))
      if (progress < 1) requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(raf)
  }, [target])

  return <>{display}</>
}

export default function GameOverScreen({ result, onPlayAgain, onShowLeaderboard, onIdle }) {
  const { score = 0, highScore = 0 } = result || {}
  
  // Re-use particle logic for glass/water droplets
  const canvasRef = useRef(null)
  
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
      
      // Shadow
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
      
      // Highlight
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

  // Messages based on score
  let title = "Good Try!"
  let sub = "Keep hydrating and try again."
  if (score > 100) { title = "Well Done!"; sub = "You're getting the hang of it." }
  if (score > 250) { title = "Great Performance!"; sub = "You have excellent reflexes." }
  if (score > 500) { title = "Hydration Champion!"; sub = "An extraordinary result!" }

  return (
    <div className="gameover-screen">
      <div className="go-grid-overlay" />
      <canvas ref={canvasRef} className="go-particles" />

      {/* Wave Background */}
      <div className="go-wave-bottom">
        <svg viewBox="0 0 1440 450" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Subtle glowing swooshes */}
          <path d="M0,150 C300,500 1140,500 1440,150" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M0,120 C350,550 1090,550 1440,120" fill="none" stroke="rgba(220,180,255,0.5)" strokeWidth="2" />
          <path d="M0,90 C400,600 1040,600 1440,90" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          
          {/* Main Wave */}
          <path d="M0,200 C400,600 1040,600 1440,200 L1440,450 L0,450 Z" fill="#321682" />
          <path d="M0,230 C400,620 1040,620 1440,230 L1440,450 L0,450 Z" fill="#280f6e" />
          
          {/* Stars */}
          <circle cx="200" cy="350" r="2.5" fill="#fff" opacity="0.8" />
          <circle cx="350" cy="400" r="1.5" fill="#fff" opacity="0.4" />
          <circle cx="1100" cy="360" r="3" fill="#fff" opacity="0.6" />
          <circle cx="1250" cy="280" r="2" fill="#fff" opacity="0.9" />
          <circle cx="800" cy="420" r="1.5" fill="#fff" opacity="0.5" />
        </svg>
      </div>

      <div className="go-content">
        <div className="go-header-text">DR.RASHEL · HYDRATION CHALLENGE</div>
        <h1 className="go-title">Time&apos;s Up</h1>

        {/* Score Card */}
        <div className="go-card-wrapper">
          <div className="go-score-card">
            <span className="go-card-label">YOUR SCORE</span>
            <div className="go-score-value">
              <AnimatedScore target={score} />
            </div>
            <span className="go-card-sub">hydration points</span>
          </div>
        </div>

        <h2 className="go-message-title">{title}</h2>
        <p className="go-message-sub">{sub}</p>

        <div className="go-best-score">
          BEST · <span className="go-best-score-value">{highScore} pts</span>
        </div>

        <div className="go-buttons">
          <button className="go-btn go-btn-primary" onClick={onPlayAgain}>PLAY AGAIN</button>
          <button className="go-btn go-btn-secondary" onClick={onShowLeaderboard}>LEADERBOARD</button>
          <button className="go-btn go-btn-secondary" onClick={onIdle}>EXIT TO HOME</button>
        </div>
      </div>
    </div>
  )
}
