import { useState, useCallback, useRef } from 'react'
import { GameProvider, useGame } from './context/GameContext.jsx'

import IdleScreen       from './screens/IdleScreen.jsx'
import GameScreen       from './screens/GameScreen.jsx'
import GameOverScreen   from './screens/GameOverScreen.jsx'
import LeaderboardScreen from './screens/LeaderboardScreen.jsx'
import AdminPanel       from './screens/AdminPanel.jsx'

import './App.css'

const SCREEN = {
  IDLE:        'IDLE',
  GAME:        'GAME',
  GAME_OVER:   'GAME_OVER',
  LEADERBOARD: 'LEADERBOARD',
  ADMIN:       'ADMIN',
}

// ── Admin secret gesture: 5 taps in top-left corner within 3 seconds ──
const ADMIN_TAPS_REQUIRED = 5
const ADMIN_TAP_WINDOW_MS = 3000
const ADMIN_TAP_ZONE_PX   = 80  // corner zone size

function AppInner() {
  const {
    settings,
    updateSettings,
    highScore,
    leaderboard,
    submitScore,
    resetHighScore,
    resetLeaderboard,
  } = useGame()

  const [screen,      setScreen]      = useState(SCREEN.IDLE)
  const [gameResult,  setGameResult]  = useState(null)
  const [adminAuth,   setAdminAuth]   = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwInput,     setPwInput]     = useState('')
  const [pwError,     setPwError]     = useState(false)

  // Admin gesture tracking
  const adminTapsRef = useRef([])

  // ── Auto-reset on Idle ─────────────────────────────────────────
  // (Idle screen handles its own attracting; auto-reset is on Game Over)

  // ── Screen transitions ─────────────────────────────────────────
  const goToIdle = useCallback(() => {
    setScreen(SCREEN.IDLE)
    setGameResult(null)
  }, [])

  const startGame = useCallback(() => {
    setScreen(SCREEN.GAME)
  }, [])

  const onGameEnd = useCallback((result) => {
    const newHighScore = submitScore(result.score)
    setGameResult({ ...result, highScore: newHighScore })
    setScreen(SCREEN.GAME_OVER)
  }, [submitScore])

  const playAgain = useCallback(() => {
    setScreen(SCREEN.GAME)
    setGameResult(null)
  }, [])

  const showLeaderboard = useCallback(() => {
    setScreen(SCREEN.LEADERBOARD)
  }, [])

  const backFromLeaderboard = useCallback(() => {
    setScreen(SCREEN.GAME_OVER)
  }, [])

  // ── Admin gesture ───────────────────────────────────────────────
  const handleTopLevelTouch = useCallback((e) => {
    const touch = e.touches?.[0] || e
    if (touch.clientX < ADMIN_TAP_ZONE_PX && touch.clientY < ADMIN_TAP_ZONE_PX) {
      const now = Date.now()
      adminTapsRef.current = adminTapsRef.current
        .filter(t => now - t < ADMIN_TAP_WINDOW_MS)
      adminTapsRef.current.push(now)
      if (adminTapsRef.current.length >= ADMIN_TAPS_REQUIRED) {
        adminTapsRef.current = []
        setShowPwModal(true)
      }
    }
  }, [])

  const handleAdminLogin = () => {
    if (pwInput === settings.adminPassword) {
      setAdminAuth(true)
      setShowPwModal(false)
      setPwInput('')
      setPwError(false)
      setScreen(SCREEN.ADMIN)
    } else {
      setPwError(true)
      setPwInput('')
    }
  }

  const handleAdminSave = (newSettings) => {
    updateSettings(newSettings)
  }

  const handleAdminClose = () => {
    setAdminAuth(false)
    setScreen(SCREEN.IDLE)
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div
      className="app-root"
      onTouchStart={handleTopLevelTouch}
      onMouseDown={handleTopLevelTouch}
    >
      {screen === SCREEN.IDLE && (
        <IdleScreen
          onStart={startGame}
          settings={settings}
        />
      )}

      {screen === SCREEN.GAME && (
        <GameScreen
          settings={settings}
          highScore={highScore}
          onGameEnd={onGameEnd}
        />
      )}

      {screen === SCREEN.GAME_OVER && gameResult && (
        <GameOverScreen
          result={gameResult}
          settings={settings}
          onPlayAgain={playAgain}
          onShowLeaderboard={showLeaderboard}
          onIdle={goToIdle}
        />
      )}

      {screen === SCREEN.LEADERBOARD && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          onBack={backFromLeaderboard}
        />
      )}

      {screen === SCREEN.ADMIN && adminAuth && (
        <AdminPanel
          settings={settings}
          onSave={handleAdminSave}
          onResetHighScore={resetHighScore}
          onResetLeaderboard={resetLeaderboard}
          onClose={handleAdminClose}
        />
      )}

      {/* Password Modal */}
      {showPwModal && (
        <div className="pw-overlay">
          <div className="pw-modal glass-card anim-scale-in">
            <h3 className="heading-display heading-sm text-gold text-center">Admin Access</h3>
            <p className="body-sm text-muted text-center" style={{ marginTop: '4px' }}>
              Enter the admin password to continue
            </p>
            <input
              id="admin-pw-input"
              type="password"
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Password"
              className={`pw-input ${pwError ? 'pw-input--error' : ''}`}
              autoFocus
            />
            {pwError && <p className="body-sm" style={{ color: '#ff8a8a', textAlign: 'center' }}>Incorrect password</p>}
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginTop: 'var(--space-sm)' }}>
              <button id="admin-pw-submit" className="btn btn-primary" onClick={handleAdminLogin}>
                Enter
              </button>
              <button id="admin-pw-cancel" className="btn btn-ghost" onClick={() => { setShowPwModal(false); setPwInput(''); setPwError(false) }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  )
}
