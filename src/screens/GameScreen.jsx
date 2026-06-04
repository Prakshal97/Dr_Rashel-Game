import { useEffect, useRef, useState } from 'react'
import { createPhaserGame } from '../game/PhaserGame.js'
import { GameEvents, EVENTS } from '../game/events/GameEvents.js'
import './GameScreen.css'

export default function GameScreen({ settings, highScore: initialHighScore, onGameEnd }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  const [score,    setScore]    = useState(0)
  const [timeLeft, setTimeLeft] = useState(settings.gameDuration)
  const [highScore,setHighScore]= useState(initialHighScore)
  const [lastPop,  setLastPop]  = useState(null)

  // ── Launch Phaser ─────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return
    const game = createPhaserGame('phaser-container', {
      ...settings,
      highScore: initialHighScore,
    })
    gameRef.current = game
    return () => {
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Subscribe to game events ──────────────────────────────────
  useEffect(() => {
    const u1 = GameEvents.on(EVENTS.SCORE_UPDATE, e => {
      setScore(e.detail.score)
      setHighScore(e.detail.highScore)
    })
    const u2 = GameEvents.on(EVENTS.TIMER_UPDATE, e => setTimeLeft(e.detail.timeLeft))
    const u3 = GameEvents.on(EVENTS.DROPLET_TAP,  e => {
      const { x, y, points, type } = e.detail
      setLastPop({ id: Date.now(), x, y, points, type })
    })
    const u4 = GameEvents.on(EVENTS.GAME_END, e => onGameEnd(e.detail))
    return () => { u1(); u2(); u3(); u4() }
  }, [onGameEnd])

  // ── Timer ring maths ──────────────────────────────────────────
  const R    = 32          // radius of the progress ring
  const CIRC = 2 * Math.PI * R
  const offset = CIRC * (1 - timeLeft / settings.gameDuration)

  return (
    <div className="game-screen">

      {/* ── Phaser canvas ──────────────────────────────────────── */}
      <div id="phaser-container" ref={containerRef} className="phaser-container" />

      {/* ── Top HUD row ────────────────────────────────────────── */}
      <div className="gs-hud-top">
        {/* LEFT — BEST */}
        <div className="gs-pill">
          <span className="gs-pill-label">BEST</span>
          <span className="gs-pill-value">{highScore}</span>
        </div>

        {/* CENTER — DR.RASHEL logo text */}
        <div className="gs-logo-block">
          <div className="gs-logo-brand">DR.RASHEL<sup>®</sup></div>
          <div className="gs-logo-tagline">BEAUTY ELIXIRS</div>
        </div>

        {/* RIGHT — SCORE */}
        <div className="gs-pill gs-pill--right">
          <span className="gs-pill-label">SCORE</span>
          <span className="gs-pill-value">{score}</span>
        </div>
      </div>

      {/* ── Timer (centered, below logo) ───────────────────────── */}
      <div className="gs-timer-wrap">
        <span className="gs-timer-label">TIME</span>
        <div className="gs-timer-circle">
          <svg className="gs-timer-svg" viewBox="0 0 76 76">
            <defs>
              <linearGradient id="gsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#b28bf7" />
                <stop offset="100%" stopColor="#7be8ce" />
              </linearGradient>
            </defs>
            {/* White filled background circle */}
            <circle cx="38" cy="38" r={R} fill="rgba(255,255,255,0.75)" />
            {/* Track ring */}
            <circle cx="38" cy="38" r={R}
              fill="none"
              stroke="rgba(180,160,220,0.25)"
              strokeWidth="3.5"
            />
            {/* Progress ring */}
            <circle cx="38" cy="38" r={R}
              fill="none"
              stroke="url(#gsRingGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 38 38)"
              style={{ transition: 'stroke-dashoffset 0.95s linear' }}
            />
          </svg>
          <span className="gs-timer-val">{timeLeft}</span>
        </div>
      </div>

      {/* ── Bottom purple wave + content ───────────────────────── */}
      <div className="gs-wave-bottom">
        {/* SVG wave shape */}
        <svg
          className="gs-wave-svg"
          viewBox="0 0 680 320"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* Subtle glowing swoosh lines */}
          <path d="M0,10  C160,90 520,90 680,10"  fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
          <path d="M0,25 C160,105 520,105 680,25" fill="none" stroke="rgba(255,255,255,0.35)"  strokeWidth="1.5"/>

          {/* Main purple fill */}
          <path d="M0,50 C180,130 500,130 680,50 L680,320 L0,320 Z" fill="#321682"/>
          {/* Glowing edge for main wave */}
          <path d="M0,50 C180,130 500,130 680,50" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" />

          {/* Stars / sparkles */}
          <circle cx="90"  cy="240" r="2"   fill="#fff" opacity="0.8"/>
          <circle cx="200" cy="290" r="1.5" fill="#fff" opacity="0.4"/>
          <circle cx="540" cy="250" r="2.5" fill="#fff" opacity="0.6"/>
          <circle cx="620" cy="185" r="1.5" fill="#fff" opacity="0.9"/>
          <circle cx="380" cy="305" r="1.5" fill="#fff" opacity="0.5"/>
        </svg>

        {/* Text content inside wave */}
        <div className="gs-bottom-content">
          <div className="gs-best-row">
            🏆 BEAT THE BEST: <span>{highScore} pts</span>
          </div>
          
          <div className="gs-glow-line" />

          <div className="gs-challenge-title">
            <span className="gs-title-hyd">Hydration </span>
            <span className="gs-title-cha">Challenge</span>
          </div>
          <div className="gs-subtitle">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: '6px', transform: 'translateY(2px)'}}>
              <path d="M5 0C5 0 0 5.8 0 9C0 11.7614 2.23858 14 5 14C7.76142 14 10 11.7614 10 9C10 5.8 5 0 5 0Z" fill="#7be8ce"/>
            </svg>
            Collect as many <span>hydration droplets</span> as possible!
          </div>
          <div className="gs-brand-foot">DR-RASHEL  •  HYDRATION CHALLENGE</div>
        </div>
      </div>

      {/* ── Floating score popups ──────────────────────────────── */}
      {lastPop && <FloatingPop key={lastPop.id} pop={lastPop} />}
    </div>
  )
}

function FloatingPop({ pop }) {
  const isHazard = pop.points < 0;
  const isGold = pop.type === 'golden';
  const prefix = isHazard ? '' : '+';
  return (
    <div
      className={`float-pop ${isHazard ? 'float-pop--hazard' : isGold ? 'float-pop--gold' : 'float-pop--normal'}`}
      style={{ left: pop.x, top: pop.y - 60 }}
    >
      {isGold ? '✨ ' : ''}{prefix}{pop.points}
    </div>
  )
}
