import { createContext, useContext, useState, useCallback } from 'react'

const DEFAULT_SETTINGS = {
  gameDuration:       30,      // seconds
  dropletSpeed:       { min: 150, max: 350 },
  spawnFrequency:     1200,    // ms between spawns
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

  // Submit a score (updates high score + leaderboard)
  const submitScore = useCallback((score) => {
    let newHighScore = highScore
    if (score > highScore) {
      newHighScore = score
      setHighScoreState(score)
      localStorage.setItem('drRashel_highScore', String(score))
    }

    setLeaderboardState(prev => {
      const updated = [...prev, { score, date: new Date().toISOString() }]
        .sort((a, b) => b.score - a.score)
        .slice(0, settings.leaderboardSize)
      localStorage.setItem('drRashel_leaderboard', JSON.stringify({
        date: new Date().toDateString(),
        scores: updated,
      }))
      return updated
    })

    return newHighScore
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
