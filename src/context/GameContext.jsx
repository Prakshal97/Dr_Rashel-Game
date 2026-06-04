import { createContext, useContext, useState, useCallback } from 'react'

// Bump this any time you need to wipe stored data (e.g. schema change)
const SCHEMA_VERSION = '3'

const DEFAULT_SETTINGS = {
  gameDuration:       20,      // seconds
  dropletSpeed:       { min: 250, max: 550 },
  spawnFrequency:     800,     // ms between spawns
  pointsNormal:       10,
  pointsGolden:       25,
  goldenFrequency:    0.15,    // 15% chance
  autoResetTimer:     10,      // seconds of inactivity
  soundEnabled:       true,
  adminPassword:      'admin1234',
  leaderboardSize:    10,
  leaderboardDailyReset: false,
  customLogo:         null,    // base64 or null
  customBackground:   null,    // base64 or null
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('drRashel_settings')
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch { /* ignore */ }
  return { ...DEFAULT_SETTINGS }
}

// ── Wipe data if schema version changed ──────────────────────
function migrateData() {
  try {
    const storedVersion = localStorage.getItem('drRashel_schemaVersion')
    if (storedVersion !== SCHEMA_VERSION) {
      localStorage.removeItem('drRashel_leaderboard')
      localStorage.removeItem('drRashel_highScore')
      localStorage.removeItem('drRashel_settings')
      localStorage.setItem('drRashel_schemaVersion', SCHEMA_VERSION)
    }
  } catch { /* ignore */ }
}
migrateData()

function loadLeaderboard() {
  try {
    const saved = localStorage.getItem('drRashel_leaderboard')
    if (saved) {
      const { date, scores } = JSON.parse(saved)
      const today = new Date().toDateString()
      const settings = loadSettings()
      if (settings.leaderboardDailyReset && date !== today) return []
      return scores || []
    }
  } catch { /* ignore */ }
  return []
}

function loadHighScore() {
  try {
    const val = localStorage.getItem('drRashel_highScore')
    return val ? parseInt(val, 10) : 0
  } catch { return 0 }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [settings,    setSettingsState] = useState(loadSettings)
  const [highScore,   setHighScoreState] = useState(loadHighScore)
  const [leaderboard, setLeaderboardState] = useState(loadLeaderboard)

  // Update settings and persist
  const updateSettings = useCallback((newSettings) => {
    setSettingsState(prev => {
      const merged = { ...prev, ...newSettings }
      localStorage.setItem('drRashel_settings', JSON.stringify(merged))
      return merged
    })
  }, [])

  /**
   * Submit a score with optional player name.
   * Returns { newHighScore, rank } — rank is 1-indexed position, or null if not in top N.
   */
  const submitScore = useCallback((score, playerName = '') => {
    let newHighScore = highScore
    if (score > highScore) {
      newHighScore = score
      setHighScoreState(score)
      localStorage.setItem('drRashel_highScore', String(score))
    }

    let rank = null
    setLeaderboardState(prev => {
      const entry = {
        score,
        name: (playerName || '').trim() || 'Anonymous',
        date: new Date().toISOString(),
      }
      const updated = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, settings.leaderboardSize)

      // Find rank of this submission
      rank = updated.findIndex(e => e.score === score && e.date === entry.date) + 1
      if (rank === 0) rank = null

      localStorage.setItem('drRashel_leaderboard', JSON.stringify({
        date: new Date().toDateString(),
        scores: updated,
      }))
      return updated
    })

    return { newHighScore, rank }
  }, [highScore, settings.leaderboardSize])

  // Reset high score
  const resetHighScore = useCallback(() => {
    setHighScoreState(0)
    localStorage.removeItem('drRashel_highScore')
  }, [])

  // Reset leaderboard
  const resetLeaderboard = useCallback(() => {
    setLeaderboardState([])
    localStorage.removeItem('drRashel_leaderboard')
  }, [])

  const value = {
    settings,
    updateSettings,
    highScore,
    leaderboard,
    submitScore,
    resetHighScore,
    resetLeaderboard,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
