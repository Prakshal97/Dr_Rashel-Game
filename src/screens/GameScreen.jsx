import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from '../game/PhaserGame.js'
import { GameEvents, EVENTS } from '../game/events/GameEvents.js'
import './GameScreen.css'

/**
 * GameScreen – Hosts the Phaser canvas with dark luxury HUD overlay.
 * Features: Circular timer ring, Dr. Rashel logo badge, combo tracker.
 */
export default function GameScreen({ settings, highScore: initialHighScore, onGameEnd }) {
  const containerRef  = useRef(null)
  const gameRef       = useRef(null)

  const [score,     setScore]     = useState(0)
  const [timeLeft,  setTimeLeft]  = useState(settings.gameDuration)
  const [highScore, setHighScore] = useState(initialHighScore)
  const [isNewHigh, setIsNewHigh] = useState(false)
  const [lastPop,   setLastPop]   = useState(null)  // { id, text, x, y, gold }

  // ── Launch Phaser ─────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const game = createPhaserGame('phaser-container', {
      ...settings,
      highScore: initialHighScore,
    })
    gameRef.current = game

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Subscribe to Phaser events ────────────────────────────────
  useEffect(() => {
    const unsubScore = GameEvents.on(EVENTS.SCORE_UPDATE, (e) => {
      const { score: s, highScore: h, isNewHigh: inh } = e.detail
      setScore(s)
      setHighScore(h)
      if (inh) setIsNewHigh(true)
    })

    const unsubTimer = GameEvents.on(EVENTS.TIMER_UPDATE, (e) => {
      setTimeLeft(e.detail.timeLeft)
    })

    const unsubTap = GameEvents.on(EVENTS.DROPLET_TAP, (e) => {
      const { x, y, points, type } = e.detail
      setLastPop({ id: Date.now(), x, y, points, gold: type === 'golden' })
    })

    const unsubEnd = GameEvents.on(EVENTS.GAME_END, (e) => {
      onGameEnd(e.detail)
    })

    return () => {
      unsubScore()
      unsubTimer()
      unsubTap()
      unsubEnd()
    }
  }, [onGameEnd])

  // Timer urgency
  const timerUrgent   = timeLeft <= 10
  const timerCritical = timeLeft <= 5

  // Circular ring math
  const RADIUS       = 32
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS  // ≈ 201
  const progress     = timeLeft / settings.gameDuration
  const dashOffset   = CIRCUMFERENCE * (1 - progress)
  const ringColor    = timerCritical
    ? '#f0c040'
    : timerUrgent
      ? '#e07030'
      : 'var(--color-teal-light)'

  // "So close!" indicator
  const gap     = Math.max(0, highScore - score)
  const soClose = !isNewHigh && highScore > 0 && gap > 0 && gap <= 30 && score > 0

  return (
    <div className="game-screen">
      {/* Phaser canvas container */}
      <div id="phaser-container" ref={containerRef} className="phaser-container" />

      {/* HUD overlay */}
      <div className="game-hud">

        {/* Best score — left */}
        <div className={`hud-card hud-card--left glass-card ${soClose ? 'hud-card--alert' : ''}`}>
          <span className="hud-label text-upper text-muted body-sm">Best</span>
          <span className={`hud-value heading-sm ${isNewHigh ? 'text-gold' : soClose ? 'hud-close-color' : 'text-aqua'}`}>
            {highScore}
          </span>
          {isNewHigh && <span className="hud-new-high text-gold body-sm">★ NEW!</span>}
          {soClose && <span className="hud-so-close body-sm">SO CLOSE! 🔥</span>}
        </div>

        {/* Timer — center with circular ring */}
        <div className={`hud-card hud-card--center glass-card ${timerUrgent ? 'hud-urgent' : ''}`}>
          <span className="hud-label text-upper text-muted body-sm">Time</span>
          <div className="hud-ring-wrap">
            <svg className="hud-ring-svg" viewBox="0 0 80 80" width="80" height="80">
              {/* Track */}
              <circle
                cx="40" cy="40" r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="5"
              />
              {/* Progress */}
              <circle
                cx="40" cy="40" r={RADIUS}
                fill="none"
                stroke={ringColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'center',
                  transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s',
                  filter: `drop-shadow(0 0 6px ${ringColor})`,
                }}
              />
              {/* Timer text */}
              <text
                x="40" y="44"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={ringColor}
                fontFamily="Inter, sans-serif"
                fontSize="22"
                fontWeight="700"
                style={{ transition: 'fill 0.3s' }}
              >
                {timeLeft}
              </text>
            </svg>
          </div>
        </div>

        {/* Score — right */}
        <div className="hud-card hud-card--right glass-card">
          <span className="hud-label text-upper text-muted body-sm">Score</span>
          <span className="hud-value heading-sm text-white">{score}</span>
        </div>
      </div>

      {/* Brand badge — bottom center */}
      <div className="hud-brand-badge">
        <img
          src="./assets/logo.png"
          alt="DR-RASHEL"
          className="hud-brand-logo"
          onError={e => { e.target.style.display = 'none' }}
        />
      </div>

      {/* Floating score popup */}
      {lastPop && (
        <FloatingPop key={lastPop.id} pop={lastPop} />
      )}
    </div>
  )
}

function FloatingPop({ pop }) {
  return (
    <div
      className={`float-pop ${pop.gold ? 'float-pop--gold' : 'float-pop--normal'}`}
      style={{ left: pop.x, top: pop.y - 60 }}
    >
      {pop.gold ? '✨ ' : ''}{'+' + pop.points}
    </div>
  )
}
