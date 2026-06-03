import { useEffect, useRef, useCallback } from 'react'

/**
 * Inactivity auto-reset hook.
 * Calls `onReset` after `seconds` of no user interaction.
 * @param {function} onReset - callback to trigger reset
 * @param {number} seconds   - inactivity timeout in seconds
 * @param {boolean} enabled  - whether the timer is active
 */
export function useAutoReset(onReset, seconds, enabled = true) {
  const timerRef = useRef(null)
  const onResetRef = useRef(onReset)
  
  useEffect(() => {
    onResetRef.current = onReset
  }, [onReset])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (enabled && seconds > 0) {
      timerRef.current = setTimeout(() => {
        onResetRef.current()
      }, seconds * 1000)
    }
  }, [enabled, seconds])

  useEffect(() => {
    if (!enabled) return
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'keydown']
    const handler = () => resetTimer()
    events.forEach(e => window.addEventListener(e, handler, { passive: true }))
    resetTimer()
    return () => {
      events.forEach(e => window.removeEventListener(e, handler))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, resetTimer])
}
