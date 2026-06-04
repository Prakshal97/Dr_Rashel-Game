import { useEffect, useRef, useState } from 'react'
import './GameOverScreen.css'

const MESSAGES = [
  {
    min: 0, max: 100,
    title: 'Good Try!',
    sub: 'Keep hydrating and try again.',
    product: "Boost your skin's hydration with",
    productName: 'Dr. Rashel Vitamin C Serum',
  },
  {
    min: 101, max: 250,
    title: 'Well Done!',
    sub: 'You\'re getting the hang of it.',
    product: 'Level up your glow with',
    productName: 'Dr. Rashel Hyaluronic Acid Serum',
  },
  {
    min: 251, max: 500,
    title: 'Great Performance!',
    sub: 'You have excellent reflexes.',
    product: 'You deserve the best — try',
    productName: 'Dr. Rashel Collagen Face Cream',
  },
  {
    min: 501, max: Infinity,
    title: 'Hydration Champion!',
    sub: 'An extraordinary result!',
    product: 'Champions choose',
    productName: 'Dr. Rashel Gold Collagen Mask',
  },
]

function getPerformanceMessage(score) {
  return MESSAGES.find(m => score >= m.min && score <= m.max) || MESSAGES[MESSAGES.length - 1]
}

// ── Confetti piece component ──────────────────────────────────
function ConfettiSystem({ active }) {
  const pieces = useRef([])

  if (active && pieces.current.length === 0) {
    const colors = ['#f0c040', '#40d8f8', '#ff7eb3', '#7ed8f8', '#f8d860', '#00d4ff', '#ffe066']
    pieces.current = Array.from({ length: 72 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${2.5 + Math.random() * 2}s`,
      size: `${8 + Math.random() * 10}px`,
      rotate: `${Math.random() * 360}deg`,
      shape: Math.random() > 0.5 ? 'circle' : 'square',
    }))
  }

  if (!active) return null
  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.current.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

// ── Animated score counter ────────────────────────────────────
function AnimatedScore({ target, isNewHigh }) {
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

  return (
    <div className={`go-score-number ${isNewHigh && target > 0 ? 'text-gold anim-pulse-gold' : ''}`} style={isNewHigh && target > 0 ? {} : { color: 'var(--color-teal-mid)' }}>
      {display}
    </div>
  )
}

export default function GameOverScreen({ result, onPlayAgain, onShowLeaderboard, onIdle }) {
  const { score = 0, highScore = 0, isNewHigh = false } = result || {}
  const perf = getPerformanceMessage(score)

  return (
    <div className="gameover-screen">
      {/* Confetti — only on new high */}
      <ConfettiSystem active={isNewHigh && score > 0} />

      {/* Ambient glow orbs */}
      <div className="go-orb go-orb--aqua" />
      <div className="go-orb go-orb--gold" />

      {/* Scrollable content wrapper */}
      <div className="gameover-content">

        {/* Logo + header */}
        <div className="go-header anim-fade-in-down">
          <span className="text-upper body-sm" style={{ letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
            DR-RASHEL · HYDRATION CHALLENGE
          </span>
          <h1 className="heading-display heading-xl text-center go-title">
            Time&apos;s Up
          </h1>
        </div>

        {/* New High Score Banner */}
        {isNewHigh && score > 0 && (
          <div className="go-new-high glass-card glass-card--gold anim-scale-in delay-100">
            <span className="go-new-high-stars">★ ★ ★</span>
            <span className="text-upper body-sm text-gold" style={{ letterSpacing: '0.25em', fontWeight: 700 }}>
              New High Score!
            </span>
            <span className="go-new-high-stars">★ ★ ★</span>
          </div>
        )}

        {/* Score card with count-up animation */}
        <div className="go-score-card glass-card anim-scale-in delay-200">
          <span className="text-upper body-sm" style={{ letterSpacing: '0.2em', color: 'var(--color-text-muted)' }}>
            Your Score
          </span>
          <AnimatedScore target={score} isNewHigh={isNewHigh} />
          <span className="body-sm" style={{ color: 'var(--color-text-muted)' }}>hydration points</span>
        </div>

        {/* Performance message */}
        <div className="go-perf anim-fade-in-up delay-300">
          <span className="go-perf-emoji">{perf.productEmoji}</span>
          <h2 className="heading-display heading-md text-gold" style={{ marginTop: '4px' }}>
            {perf.title}
          </h2>
          <p className="body-md" style={{ color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            {perf.sub}
          </p>
        </div>



        {/* High score display */}
        <div className="go-highscore-row anim-fade-in delay-500">
          <span className="body-sm text-upper" style={{ letterSpacing: '0.15em', color: 'var(--color-text-muted)' }}>
            Best &nbsp;·&nbsp;
          </span>
          <span className={`body-lg ${isNewHigh ? 'text-gold' : ''}`} style={{ fontWeight: 600, color: isNewHigh ? undefined : 'var(--color-teal-mid)' }}>
            {highScore} pts
          </span>
        </div>

        <div className="divider-gold anim-fade-in delay-500" style={{ width: '180px', margin: '0 auto' }} />

        {/* Action buttons */}
        <div className="go-actions anim-fade-in-up delay-600">
          <button
            id="go-play-again-btn"
            className="btn btn-primary btn-lg"
            onClick={onPlayAgain}
          >
            Play Again
          </button>
          <button
            id="go-leaderboard-btn"
            className="btn btn-ghost"
            onClick={onShowLeaderboard}
          >
            Leaderboard
          </button>
          <button
            id="go-home-btn"
            className="btn btn-ghost"
            onClick={onIdle}
          >
            Exit to Home
          </button>
        </div>

      </div>
    </div>
  )
}
