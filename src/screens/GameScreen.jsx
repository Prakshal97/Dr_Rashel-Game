import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from '../game/PhaserGame.js'
import { GameEvents, EVENTS } from '../game/events/GameEvents.js'
import './GameScreen.css'

/**
 * GameScreen – Hosts the Phaser canvas and overlays the HUD.
 */
export default function GameScreen({ settings, highScore: initialHighScore, onGameEnd }) {
  const containerRef  = useRef(null)
  const gameRef       = useRef(null)

  const [score,      setScore]      = useState(0)
  const [timeLeft,   setTimeLeft]   = useState(settings.gameDuration)
  const [highScore,  setHighScore]  = useState(initialHighScore)
  const [isNewHigh,  setIsNewHigh]  = useState(false)
  const [lastPop,    setLastPop]    = useState(null)  // { id, text, x, y, gold }

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

  // Timer urgency color
  const timerUrgent = timeLeft <= 10
  const timerColor  = timeLeft <= 5
    ? 'var(--color-gold)'
    : timeLeft <= 10
      ? '#d4691a'
      : 'var(--color-teal-mid)'

  // "So close!" indicator
  const gap      = Math.max(0, highScore - score)
  const soClose  = !isNewHigh && highScore > 0 && gap > 0 && gap <= 30 && score > 0

  return (
    <div className="game-screen">
      {/* Phaser canvas container */}
      <div id="phaser-container" ref={containerRef} className="phaser-container" />

      {/* HUD overlay */}
      <div className="game-hud">
        {/* High score */}
        <div className={`hud-card hud-card--left glass-card ${soClose ? 'hud-card--alert' : ''}`}>
          <span className="hud-label text-upper text-muted body-sm">Best</span>
          <span className={`hud-value heading-sm ${isNewHigh ? 'text-gold' : soClose ? 'hud-close-color' : 'text-aqua'}`}>
            {highScore}
          </span>
          {isNewHigh && <span className="hud-new-high text-gold body-sm">★ NEW!</span>}
          {soClose && <span className="hud-so-close body-sm">SO CLOSE! 🔥</span>}
        </div>

        {/* Timer */}
        <div className={`hud-card hud-card--center glass-card ${timerUrgent ? 'hud-urgent' : ''}`}>
          <span className="hud-label text-upper text-muted body-sm">Time</span>
          <span
            className="hud-timer heading-md"
            style={{ color: timerColor, transition: 'color 0.3s' }}
          >
            {timeLeft}
          </span>
        </div>

        {/* Score */}
        <div className="hud-card hud-card--right glass-card">
          <span className="hud-label text-upper text-muted body-sm">Score</span>
          <span className="hud-value heading-sm text-white">{score}</span>
        </div>
      </div>

      {/* Floating score popup (React overlay) */}
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
      +{pop.points}
    </div>
  )
}
