import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from '../game/PhaserGame.js'
import { GameEvents, EVENTS } from '../game/events/GameEvents.js'
import './GameScreen.css'

export default function GameScreen({ settings, highScore: initialHighScore, onGameEnd }) {
  const containerRef  = useRef(null)
  const gameRef       = useRef(null)

  const [score,     setScore]     = useState(0)
  const [timeLeft,  setTimeLeft]  = useState(settings.gameDuration)
  const [highScore, setHighScore] = useState(initialHighScore)
  const [ceramide,  setCeramide]  = useState(1) // Fake tracker just for visuals as requested
  const [lastPop,   setLastPop]   = useState(null)

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
      const { score: s, highScore: h } = e.detail
      setScore(s)
      setHighScore(h)
    })

    const unsubTimer = GameEvents.on(EVENTS.TIMER_UPDATE, (e) => {
      setTimeLeft(e.detail.timeLeft)
    })

    const unsubTap = GameEvents.on(EVENTS.DROPLET_TAP, (e) => {
      const { x, y, points, type } = e.detail
      setLastPop({ id: Date.now(), x, y, points, gold: type === 'golden' })
      if (type === 'golden') {
        setCeramide(c => Math.min(c + 1, 3))
      }
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

  // Circular ring math for the timer
  const RADIUS = 34
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const progress = timeLeft / settings.gameDuration
  const dashOffset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="game-screen">
      <div id="phaser-container" ref={containerRef} className="phaser-container" />

      {/* HUD overlay */}
      <div className="game-hud">

        {/* LEFT COLUMN: Best Score & Ceramide Tracker */}
        <div className="hud-left">
          {/* Best Score Pill */}
          <div className="hud-pill hud-pill-best">
            <div className="hud-best-col">
              <span className="hud-label-best">BEST</span>
              <span className="hud-val-best">{highScore}</span>
            </div>
            <div className="hud-icon-trophy">🏆</div>
          </div>
          
          {/* Ceramide Tracker Pill */}
          <div className="hud-pill hud-pill-ceramide">
            <div className="hud-ceramide-header">
              <span className="hud-label-ceramide">CERAMIDE</span>
              <span className="hud-val-ceramide">{ceramide} / 3</span>
            </div>
            <div className="hud-ceramide-bar-bg">
              <div 
                className="hud-ceramide-bar-fill" 
                style={{ width: `${(ceramide / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CENTER: Bronze Timer Ring */}
        <div className="hud-center">
          <div className="hud-timer-ring-wrapper">
            <div className="hud-timer-inner">
              <span className="hud-timer-label">TIME</span>
              <span className="hud-timer-val">{timeLeft}</span>
              <svg className="hud-timer-svg" viewBox="0 0 80 80">
                <circle
                  cx="40" cy="40" r={RADIUS}
                  fill="none"
                  stroke="#3b5eca" /* inner blue progress color */
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* RIGHT: Score Pill */}
        <div className="hud-pill hud-pill-score">
          <div className="hud-icon-drop-wrap">
            <div className="hud-icon-drop"></div>
          </div>
          <div className="hud-score-col">
            <span className="hud-label-score">SCORE</span>
            <span className="hud-val-score">{score}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM CENTER: Watermark */}
      <div className="hud-brand-badge">
        <div className="hud-brand-text-best">
          🏆 BEAT THE BEST: <span>{highScore} pts</span>
        </div>
        <div className="hud-brand-text-challenge">
          DR·RASHEL  ·  HYDRATION CHALLENGE
        </div>
      </div>

      {/* Floating score popups */}
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
