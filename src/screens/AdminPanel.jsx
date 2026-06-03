import { useState, useRef } from 'react'
import './AdminPanel.css'

const FIELD_DEFS = [
  { key: 'gameDuration',     label: 'Game Duration (seconds)',    type: 'number', min: 10, max: 120, step: 5 },
  { key: 'spawnFrequency',   label: 'Spawn Frequency (ms)',       type: 'number', min: 400, max: 3000, step: 100 },
  { key: 'pointsNormal',     label: 'Normal Droplet Points',      type: 'number', min: 1, max: 100 },
  { key: 'pointsGolden',     label: 'Golden Droplet Points',      type: 'number', min: 5, max: 500 },
  { key: 'goldenFrequency',  label: 'Golden Droplet Chance (0–1)', type: 'number', min: 0, max: 0.5, step: 0.05 },
  { key: 'autoResetTimer',   label: 'Auto-Reset Timer (seconds)', type: 'number', min: 5, max: 60 },
  { key: 'leaderboardSize',  label: 'Leaderboard Size',           type: 'number', min: 3, max: 20 },
  { key: 'adminPassword',    label: 'Admin Password',             type: 'text' },
]

const SPEED_DEFS = [
  { key: 'min', label: 'Droplet Speed Min (px/s)', min: 50, max: 500 },
  { key: 'max', label: 'Droplet Speed Max (px/s)', min: 100, max: 800 },
]

export default function AdminPanel({
  settings,
  onSave,
  onResetHighScore,
  onResetLeaderboard,
  onClose,
}) {
  const [form,    setForm]    = useState({ ...settings })
  const [saved,   setSaved]   = useState(false)
  const [confirm, setConfirm] = useState(null)  // 'highscore' | 'leaderboard'
  const logoRef   = useRef(null)
  const bgRef     = useRef(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setSpeed = (sub, val) => setForm(f => ({
    ...f,
    dropletSpeed: { ...f.dropletSpeed, [sub]: Number(val) },
  }))

  const handleSave = () => {
    onSave(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => set(key, ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleConfirmedAction = (action) => {
    if (action === 'highscore') onResetHighScore()
    if (action === 'leaderboard') onResetLeaderboard()
    setConfirm(null)
  }

  return (
    <div className="admin-screen">
      <div className="admin-panel glass-card">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="heading-display heading-sm text-gold">Admin Panel</h2>
            <p className="body-sm text-muted" style={{ marginTop: '4px' }}>
              DR-RASHEL Hydration Challenge · Exhibition Settings
            </p>
          </div>
          <button id="admin-close-btn" className="btn btn-ghost" onClick={onClose} style={{ minWidth: 'auto', padding: '8px 20px' }}>
            ✕ Close
          </button>
        </div>

        <div className="divider-gold" />

        <div className="admin-body">
          {/* Gameplay Settings */}
          <section className="admin-section">
            <h3 className="admin-section-title text-upper text-aqua body-sm">Gameplay Settings</h3>
            <div className="admin-grid">
              {FIELD_DEFS.map(field => (
                <label key={field.key} className="admin-field">
                  <span className="admin-label body-sm text-muted">{field.label}</span>
                  <input
                    id={`admin-field-${field.key}`}
                    type={field.type}
                    value={form[field.key] ?? ''}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    onChange={e => set(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="admin-input"
                  />
                </label>
              ))}
            </div>

            {/* Droplet speed sub-fields */}
            <div className="admin-grid" style={{ marginTop: '12px' }}>
              {SPEED_DEFS.map(s => (
                <label key={s.key} className="admin-field">
                  <span className="admin-label body-sm text-muted">{s.label}</span>
                  <input
                    id={`admin-speed-${s.key}`}
                    type="number"
                    value={form.dropletSpeed?.[s.key] ?? ''}
                    min={s.min} max={s.max} step={10}
                    onChange={e => setSpeed(s.key, e.target.value)}
                    className="admin-input"
                  />
                </label>
              ))}
            </div>

            {/* Sound toggle */}
            <label className="admin-toggle">
              <input
                id="admin-sound-toggle"
                type="checkbox"
                checked={form.soundEnabled ?? true}
                onChange={e => set('soundEnabled', e.target.checked)}
              />
              <span className="admin-toggle-track">
                <span className="admin-toggle-thumb" />
              </span>
              <span className="body-md text-white-80">Sound Effects Enabled</span>
            </label>

            {/* Daily leaderboard reset */}
            <label className="admin-toggle">
              <input
                id="admin-daily-reset-toggle"
                type="checkbox"
                checked={form.leaderboardDailyReset ?? false}
                onChange={e => set('leaderboardDailyReset', e.target.checked)}
              />
              <span className="admin-toggle-track">
                <span className="admin-toggle-thumb" />
              </span>
              <span className="body-md text-white-80">Daily Leaderboard Reset</span>
            </label>
          </section>

          <div className="divider-gold" />

          {/* Branding */}
          <section className="admin-section">
            <h3 className="admin-section-title text-upper text-aqua body-sm">Branding</h3>
            <div className="admin-grid">
              <label className="admin-field">
                <span className="admin-label body-sm text-muted">Custom Logo (PNG/JPG)</span>
                <button
                  id="admin-logo-btn"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                  onClick={() => logoRef.current?.click()}
                >
                  {form.customLogo ? '✓ Logo Uploaded' : 'Upload Logo'}
                </button>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImageUpload(e, 'customLogo')} />
                {form.customLogo && (
                  <button className="admin-clear-btn body-sm text-muted"
                    onClick={() => set('customLogo', null)}>✕ Remove</button>
                )}
              </label>

              <label className="admin-field">
                <span className="admin-label body-sm text-muted">Custom Background (PNG/JPG)</span>
                <button
                  id="admin-bg-btn"
                  className="btn btn-ghost"
                  style={{ fontSize: '0.875rem', padding: '8px 16px' }}
                  onClick={() => bgRef.current?.click()}
                >
                  {form.customBackground ? '✓ Background Uploaded' : 'Upload Background'}
                </button>
                <input ref={bgRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => handleImageUpload(e, 'customBackground')} />
                {form.customBackground && (
                  <button className="admin-clear-btn body-sm text-muted"
                    onClick={() => set('customBackground', null)}>✕ Remove</button>
                )}
              </label>
            </div>
          </section>

          <div className="divider-gold" />

          {/* Data Management */}
          <section className="admin-section">
            <h3 className="admin-section-title text-upper text-aqua body-sm">Data Management</h3>
            <div className="admin-danger-row">
              {confirm === 'highscore' ? (
                <div className="admin-confirm">
                  <span className="body-sm text-muted">Reset all high scores?</span>
                  <button id="admin-confirm-hs-btn" className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.875rem', color: '#ff6b6b' }}
                    onClick={() => handleConfirmedAction('highscore')}>Confirm Reset</button>
                  <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.875rem' }}
                    onClick={() => setConfirm(null)}>Cancel</button>
                </div>
              ) : (
                <button id="admin-reset-hs-btn" className="btn btn-ghost admin-danger-btn"
                  onClick={() => setConfirm('highscore')}>
                  Reset High Score
                </button>
              )}

              {confirm === 'leaderboard' ? (
                <div className="admin-confirm">
                  <span className="body-sm text-muted">Clear leaderboard?</span>
                  <button id="admin-confirm-lb-btn" className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.875rem', color: '#ff6b6b' }}
                    onClick={() => handleConfirmedAction('leaderboard')}>Confirm Reset</button>
                  <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.875rem' }}
                    onClick={() => setConfirm(null)}>Cancel</button>
                </div>
              ) : (
                <button id="admin-reset-lb-btn" className="btn btn-ghost admin-danger-btn"
                  onClick={() => setConfirm('leaderboard')}>
                  Reset Leaderboard
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Save bar */}
        <div className="admin-footer">
          <button
            id="admin-save-btn"
            className={`btn ${saved ? 'btn-gold' : 'btn-primary'}`}
            onClick={handleSave}
            style={{ minWidth: '200px' }}
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
