import { useState, useCallback, useRef } from 'react'
import { GameProvider, useGame } from './context/GameContext.jsx'

import IdleScreen from './screens/IdleScreen.jsx'
import GameScreen from './screens/GameScreen.jsx'
import GameOverScreen from './screens/GameOverScreen.jsx'
import LeaderboardScreen from './screens/LeaderboardScreen.jsx'
import AdminPanel from './screens/AdminPanel.jsx'

import './App.css'

const SCREEN = {
  IDLE: 'IDLE',
  GAME: 'GAME',
  NAME_ENTRY: 'NAME_ENTRY',  // new intermediate screen
  GAME_OVER: 'GAME_OVER',
  LEADERBOARD: 'LEADERBOARD',
  ADMIN: 'ADMIN',
}

// ── Admin secret gesture: 5 taps in top-left corner within 3 seconds ──
const ADMIN_TAPS_REQUIRED = 5
const ADMIN_TAP_WINDOW_MS = 3000
const ADMIN_TAP_ZONE_PX = 80  // corner zone size

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

  const [screen, setScreen] = useState(SCREEN.IDLE)
  const [gameResult, setGameResult] = useState(null)
  const [pendingScore, setPendingScore] = useState(null)
  const [adminAuth, setAdminAuth] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState(false)

  // Name entry state
  const [nameInput, setNameInput] = useState('')

  // Admin gesture tracking
  const adminTapsRef = useRef([])

  // ── Screen transitions ─────────────────────────────────────────
  const goToIdle = useCallback(() => {
    setScreen(SCREEN.IDLE)
    setGameResult(null)
    setPendingScore(null)
    setNameInput('')
  }, [])

  const startGame = useCallback(() => {
    setScreen(SCREEN.GAME)
  }, [])

  const onGameEnd = useCallback((result) => {
    // Only ask for name if player beats the current high score
    if (result.score > 0 && result.score > highScore) {
      setPendingScore(result)
      setScreen(SCREEN.NAME_ENTRY)
    } else {
      // Did not beat high score — submit anonymously and go to game over
      const { newHighScore } = submitScore(result.score, 'Anonymous')
      setGameResult({ ...result, highScore: newHighScore, isNewHigh: false })
      setScreen(SCREEN.GAME_OVER)
    }
  }, [submitScore, highScore])

  const handleNameSubmit = useCallback(() => {
    if (!pendingScore) return
    const name = nameInput.trim() || 'Anonymous'
    const { newHighScore } = submitScore(pendingScore.score, name)
    setGameResult({
      ...pendingScore,
      highScore: newHighScore,
      isNewHigh: pendingScore.score > 0 && pendingScore.score >= newHighScore,
    })
    setNameInput('')
    setPendingScore(null)
    setScreen(SCREEN.GAME_OVER)
  }, [pendingScore, nameInput, submitScore])

  const playAgain = useCallback(() => {
    setScreen(SCREEN.GAME)
    setGameResult(null)
    setPendingScore(null)
    setNameInput('')
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

      {/* ── Name Entry Modal (shown after game ends) ── */}
      {screen === SCREEN.NAME_ENTRY && pendingScore && (
        <div className="name-entry-overlay">
          <div className="name-entry-modal glass-card anim-scale-in">
            {/* Orbs */}
            <div className="ne-orb ne-orb--gold" />
            <div className="ne-orb ne-orb--teal" />

            <div className="ne-content">
              <div className="ne-score-display">
                <span className="text-upper text-muted body-sm" style={{ letterSpacing: '0.2em' }}>Your Score</span>
                <span className="ne-score text-gold">{pendingScore.score}</span>
                <span className="text-muted body-sm">points</span>
              </div>

              <div className="divider-gold" style={{ width: '160px', margin: '0 auto' }} />

              <h3 className="heading-display heading-md text-center" style={{ color: 'var(--color-text-primary)' }}>
                Enter Your Name
              </h3>
              <p className="body-sm text-muted text-center" style={{ marginTop: '4px' }}>
                Appear on the Hydration Hall of Fame
              </p>

              <input
                id="name-entry-input"
                type="text"
                value={nameInput}
                maxLength={20}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
                placeholder="Your name..."
                className="ne-input"
                autoFocus
              />

              <div className="ne-actions">
                <button
                  id="name-entry-submit"
                  className="btn btn-primary"
                  onClick={handleNameSubmit}
                >
                  Save Score
                </button>
                <button
                  id="name-entry-skip"
                  className="btn btn-ghost"
                  onClick={() => {
                    setNameInput('Anonymous')
                    handleNameSubmit()
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
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
