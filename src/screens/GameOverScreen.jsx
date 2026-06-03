import './GameOverScreen.css'

const MESSAGES = [
  { min: 0,   max: 100,  text: 'Good Try!',         sub: 'Keep hydrating and try again.' },
  { min: 101, max: 250,  text: 'Well Done!',         sub: 'You\'re getting the hang of it.' },
  { min: 251, max: 500,  text: 'Great Performance!', sub: 'You have excellent reflexes.' },
  { min: 501, max: Infinity, text: 'Hydration Champion!', sub: 'An extraordinary result!' },
]

function getPerformanceMessage(score) {
  return MESSAGES.find(m => score >= m.min && score <= m.max)
    || MESSAGES[MESSAGES.length - 1]
}

export default function GameOverScreen({ result, onPlayAgain, onShowLeaderboard, onIdle }) {
  const { score = 0, highScore = 0, isNewHigh = false } = result || {}
  const perf = getPerformanceMessage(score)

  const handlePlayAgain = () => {
    onPlayAgain()
  }

  return (
    <div className="gameover-screen">
      {/* Ambient glow orbs */}
      <div className="go-orb go-orb--aqua" />
      <div className="go-orb go-orb--gold" />

      <div className="gameover-content">

        {/* Header */}
        <div className="go-header anim-fade-in-down">
          <span className="text-upper text-muted body-sm" style={{ letterSpacing: '0.3em' }}>
            DR-RASHEL · HYDRATION CHALLENGE
          </span>
          <h1 className="heading-display heading-xl text-center" style={{ marginTop: '12px', color: 'var(--color-teal-deep)' }}>
            Time&apos;s Up
          </h1>
        </div>

        {/* New High Score Banner */}
        {isNewHigh && score > 0 && (
          <div className="go-new-high glass-card glass-card--gold anim-scale-in delay-200">
            <span className="text-upper body-sm" style={{ letterSpacing: '0.25em', color: 'var(--color-gold)', fontWeight: 'bold' }}>
              ✦ New High Score ✦
            </span>
          </div>
        )}

        {/* Score card */}
        <div className="go-score-card glass-card anim-scale-in delay-300">
          <span className="text-upper text-muted body-sm" style={{ letterSpacing: '0.2em' }}>
            Your Score
          </span>
          <div className={`go-score-number ${isNewHigh && score > 0 ? 'text-gold anim-pulse-gold' : 'text-aqua'}`}>
            {score}
          </div>
          <span className="text-muted body-sm">points</span>
        </div>

        {/* Performance message */}
        <div className="go-perf anim-fade-in-up delay-400">
          <h2 className="heading-display heading-md text-gold">
            {perf.text}
          </h2>
          <p className="body-md text-muted" style={{ marginTop: '8px' }}>
            {perf.sub}
          </p>
        </div>

        {/* High score display */}
        <div className="go-highscore-row anim-fade-in delay-500">
          <span className="text-muted body-sm text-upper" style={{ letterSpacing: '0.15em' }}>
            Best &nbsp;·&nbsp;
          </span>
          <span className={`body-lg ${isNewHigh ? 'text-gold' : 'text-aqua'}`}>
            {highScore} pts
          </span>
        </div>

        <div className="divider-gold anim-fade-in delay-500" style={{ width: '180px', margin: '0 auto' }} />

        {/* Action buttons */}
        <div className="go-actions anim-fade-in-up delay-600">
          <button
            id="go-play-again-btn"
            className="btn btn-primary btn-lg"
            onClick={handlePlayAgain}
          >
            ↺ &nbsp; Play Again
          </button>
          <button
            id="go-leaderboard-btn"
            className="btn btn-ghost"
            onClick={onShowLeaderboard}
          >
            🏆 &nbsp; Leaderboard
          </button>
          <button
            id="go-home-btn"
            className="btn btn-ghost"
            onClick={onIdle}
          >
            🏠 &nbsp; Exit to Home
          </button>
        </div>

      </div>
    </div>
  )
}
