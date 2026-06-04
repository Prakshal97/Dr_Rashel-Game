import './LeaderboardScreen.css'

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_HEIGHTS = ['140px', '100px', '80px']  // 1st, 2nd, 3rd
const PODIUM_ORDER = [1, 0, 2]  // visual order: 2nd, 1st, 3rd

export default function LeaderboardScreen({ leaderboard, onBack }) {
  const topThree = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <div className="lb-screen">
      {/* Background orbs */}
      <div className="lb-orb lb-orb--top" />
      <div className="lb-orb lb-orb--bottom" />
      <div className="lb-orb lb-orb--left" />

      {/* Grid overlay */}
      <div className="lb-grid-overlay" />

      <div className="lb-content">

        {/* Header */}
        <div className="lb-header anim-fade-in-down">
          <span className="text-upper body-sm" style={{ letterSpacing: '0.3em', color: 'var(--color-text-muted)' }}>
            DR-RASHEL · HYDRATION CHALLENGE
          </span>
          <h1 className="heading-display heading-lg text-center lb-title">
            <span className="text-shimmer">Hall of Fame</span>
          </h1>
          <p className="body-sm" style={{ marginTop: '4px', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
            Hydration Champions
          </p>
        </div>

        <div className="divider-gold anim-fade-in" style={{ width: '200px', margin: '-8px auto 0' }} />

        {/* Podium — top 3 */}
        {topThree.length > 0 && (
          <div className="lb-podium anim-fade-in delay-200">
            {PODIUM_ORDER.map(i => {
              const entry = topThree[i]
              if (!entry) return <div key={i} className="lb-podium-slot lb-podium-slot--empty" />
              const rank = i + 1
              return (
                <div key={i} className={`lb-podium-slot lb-podium-slot--rank${rank}`}>
                  {/* Crown for #1 */}
                  {rank === 1 && <div className="lb-crown">👑</div>}

                  {/* Avatar circle */}
                  <div className={`lb-avatar lb-avatar--rank${rank}`}>
                    <span className="lb-avatar-medal">{MEDALS[i]}</span>
                  </div>

                  {/* Name */}
                  <div className="lb-podium-name">{entry.name || 'Anonymous'}</div>

                  {/* Score */}
                  <div className={`lb-podium-score ${rank === 1 ? 'text-gold' : rank === 2 ? 'lb-silver' : 'lb-bronze'}`}>
                    {entry.score.toLocaleString()}
                  </div>

                  {/* Podium block */}
                  <div
                    className={`lb-podium-block lb-podium-block--rank${rank}`}
                    style={{ height: PODIUM_HEIGHTS[i] }}
                  >
                    <span className="lb-podium-rank">{rank}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Remaining entries */}
        {leaderboard.length === 0 ? (
          <div className="lb-empty anim-fade-in-up">
            <div className="lb-empty-icon">💧</div>
            <p className="body-lg text-center" style={{ color: 'var(--color-text-muted)' }}>
              No scores yet.<br />
              <span style={{ color: 'var(--color-teal-mid)', fontWeight: 600 }}>Be the first Hydration Champion!</span>
            </p>
          </div>
        ) : (
          rest.length > 0 && (
            <div className="lb-list">
              {rest.map((entry, i) => {
                const rank = i + 4
                return (
                  <div
                    key={i}
                    className="lb-row anim-fade-in-up"
                    style={{ animationDelay: `${(i + 3) * 50}ms` }}
                  >
                    <span className="lb-rank-num">{rank}</span>
                    <span className="lb-entry-name">{entry.name || 'Anonymous'}</span>
                    <div className="lb-bar-wrap">
                      <div
                        className="lb-bar lb-bar--default"
                        style={{ width: `${Math.max(8, (entry.score / leaderboard[0].score) * 100)}%` }}
                      />
                    </div>
                    <span className="lb-score" style={{ color: 'var(--color-teal-mid)' }}>
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Brand footer */}
        <div className="lb-brand-footer anim-fade-in delay-600">
          <span className="text-muted body-sm" style={{ letterSpacing: '0.15em' }}>
            www.drrashel.com &nbsp;·&nbsp;
          </span>
          <span className="text-gold body-sm" style={{ letterSpacing: '0.1em' }}>
            @drrashel
          </span>
        </div>

        {/* Back button */}
        <button
          id="lb-back-btn"
          className="btn btn-ghost anim-fade-in-up"
          onClick={onBack}
          style={{ animationDelay: '700ms' }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}
