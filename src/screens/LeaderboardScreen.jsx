import './LeaderboardScreen.css'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardScreen({ leaderboard, onBack }) {
  return (
    <div className="lb-screen">
      <div className="lb-orb lb-orb--top" />
      <div className="lb-orb lb-orb--bottom" />

      <div className="lb-content">
        {/* Header */}
        <div className="lb-header anim-fade-in-down">
          <span className="text-upper text-muted body-sm" style={{ letterSpacing: '0.3em' }}>
            DR-RASHEL · HYDRATION CHALLENGE
          </span>
          <h1 className="heading-display heading-lg text-center" style={{ marginTop: '12px' }}>
            <span className="text-gold">Top</span> Scores
          </h1>
        </div>

        <div className="divider-gold anim-fade-in" style={{ width: '200px', margin: '0 auto' }} />

        {/* Leaderboard list */}
        <div className="lb-list">
          {leaderboard.length === 0 ? (
            <div className="lb-empty anim-fade-in-up">
              <p className="body-lg text-muted text-center">
                No scores yet.<br />
                <span className="text-aqua">Be the first to play!</span>
              </p>
            </div>
          ) : (
            leaderboard.map((entry, i) => (
              <div
                key={i}
                className={`lb-row anim-fade-in-up ${i < 3 ? `lb-row--top${i + 1}` : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="lb-rank">
                  {i < 3 ? MEDALS[i] : <span className="lb-rank-num">{i + 1}</span>}
                </span>

                <div className="lb-bar-wrap">
                  <div
                    className={`lb-bar ${i === 0 ? 'lb-bar--gold' : i === 1 ? 'lb-bar--silver' : i === 2 ? 'lb-bar--bronze' : 'lb-bar--default'}`}
                    style={{ width: `${Math.max(8, (entry.score / leaderboard[0].score) * 100)}%` }}
                  />
                </div>

                <span className={`lb-score ${i === 0 ? 'text-gold' : i < 3 ? 'text-aqua' : 'text-white-80'}`}>
                  {entry.score.toLocaleString()}
                </span>

                {i === 0 && (
                  <span className="lb-crown text-gold body-sm text-upper" style={{ letterSpacing: '0.1em' }}>
                    Champion
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Back button */}
        <button
          id="lb-back-btn"
          className="btn btn-ghost anim-fade-in-up"
          onClick={onBack}
          style={{ animationDelay: '600ms' }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
