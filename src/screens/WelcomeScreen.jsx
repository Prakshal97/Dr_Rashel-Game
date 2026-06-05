import { useEffect, useRef } from 'react'
import './WelcomeScreen.css'

export default function WelcomeScreen({ onBegin }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    // Scattered bubbles matching the image
    const bubbles = Array.from({ length: 15 }, (_, i) => {
      const zone = i < 5 ? 'left' : i < 10 ? 'center' : 'right'
      let x = Math.random() * window.innerWidth
      if (zone === 'left') x = Math.random() * window.innerWidth * 0.3
      if (zone === 'center') x = window.innerWidth * 0.35 + Math.random() * window.innerWidth * 0.3
      if (zone === 'right') x = window.innerWidth * 0.7 + Math.random() * window.innerWidth * 0.3
      
      // Tiny, Medium, Large, Huge hierarchy
      let r;
      const type = Math.random();
      if (type < 0.4) r = 4 + Math.random() * 6; // Tiny
      else if (type < 0.7) r = 15 + Math.random() * 10; // Medium
      else if (type < 0.9) r = 30 + Math.random() * 15; // Large
      else r = 55 + Math.random() * 30; // Huge
      
      return {
        x,
        y: Math.random() * window.innerHeight,
        r: r,
        vy: 0.15 + Math.random() * 0.3,
        wobble: Math.random() * Math.PI * 2,
        ws: 0.003 + Math.random() * 0.007,
      }
    })

    function drawBubble(x, y, r) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 1.2
      ctx.stroke()
      
      const g = ctx.createRadialGradient(x - r*.3, y - r*.3, r*.05, x, y, r)
      g.addColorStop(0,    'rgba(255,255,255,0.6)')
      g.addColorStop(0.3,  'rgba(255,255,255,0.1)')
      g.addColorStop(0.8,  'rgba(180,240,220,0.15)')
      g.addColorStop(1,    'rgba(255,255,255,0.35)')
      ctx.fillStyle = g
      ctx.fill()
      
      ctx.beginPath()
      ctx.arc(x - r*.35, y - r*.35, r*.15, 0, Math.PI*2)
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.fill()
      ctx.restore()
    }

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      bubbles.forEach(b => {
        b.wobble += b.ws
        b.y -= b.vy
        if (b.y + b.r < 0) b.y = canvas.height + b.r
        drawBubble(b.x + Math.sin(b.wobble) * 2, b.y, b.r)
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="ws-screen">
      <canvas ref={canvasRef} className="ws-canvas" />

      {/* Top Right Ceramide Badge */}
      <div className="ws-ceramide-badge">
        <span className="ws-ceramide-val">1%</span>
        <span className="ws-ceramide-lbl">CERAMIDE<br/>COMPLEX</span>
      </div>

      <div className="ws-main">
        
        {/* ════ LEFT COLUMN ════ */}
        <div className="ws-left">
          
          {/* Top Left Badge */}
          <div className="ws-top-badge">
            <span className="ws-badge-dot" />
            PREMIUM SKINCARE EXHIBITION
            <span className="ws-badge-dot" />
          </div>

          <div className="ws-brand">DR. RASHEL</div>
          <h1 className="ws-title">HYDRATION CHALLENGE</h1>
          <p className="ws-desc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="ws-desc-star">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#321682"/>
            </svg>
            Catch the drops, build your glow,<br/>and discover the power of hydration.
          </p>

          {/* Card 1: Complete Challenges To */}
          <div className="ws-card">
            <div className="ws-card-title ws-text-teal">COMPLETE CHALLENGES TO</div>
            <div className="ws-card-items">
              <div className="ws-item">
                <div className="ws-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0a6e52" strokeWidth="1.5" className="ws-icon">
                    <path d="M12 3C12 3 5 10 5 15A7 7 0 0 0 19 15C19 10 12 3 12 3Z"/>
                  </svg>
                </div>
                <span className="ws-text-teal">BOOST<br/>HYDRATION</span>
              </div>
              <div className="ws-item">
                <div className="ws-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0a6e52" strokeWidth="1.5" className="ws-icon">
                    <path d="M12 2L20 6V12C20 17 12 22 12 22C12 22 4 17 4 12V6L12 2Z"/>
                    <path d="M9 12L11 14L15 10"/>
                  </svg>
                </div>
                <span className="ws-text-teal">STRENGTHEN<br/>SKIN BARRIER</span>
              </div>
              <div className="ws-item">
                <div className="ws-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0a6e52" strokeWidth="1.5" className="ws-icon">
                    <path d="M12 6V3M12 21V18M6 12H3M21 12H18M8 8L6 6M18 18L16 16M8 16L6 18M18 6L16 8"/>
                  </svg>
                </div>
                <span className="ws-text-teal">REVEAL<br/>GLASS SKIN</span>
              </div>
            </div>
          </div>

          {/* Card 2: Challenge Highlights */}
          <div className="ws-card">
            <div className="ws-card-title ws-text-purple">CHALLENGE HIGHLIGHTS</div>
            <div className="ws-card-items">
              <div className="ws-item">
                <div className="ws-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#321682" strokeWidth="1.5" className="ws-icon">
                    <circle cx="12" cy="12" r="9"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="12" cy="12" r="1" fill="#321682"/>
                    <path d="M18 6L21 3" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="ws-text-teal">FUN &amp; EASY<br/>MISSIONS</span>
              </div>
              <div className="ws-item">
                <div className="ws-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#321682" strokeWidth="1.5" className="ws-icon">
                    <path d="M12 3C12 3 5 10 5 15A7 7 0 0 0 19 15C19 10 12 3 12 3Z"/>
                    <path d="M12 11V16M10 14L12 16L14 14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="ws-text-teal">LEARN &amp;<br/>HYDRATE</span>
              </div>
              <div className="ws-item">
                <div className="ws-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#321682" strokeWidth="1.5" className="ws-icon">
                    <rect x="4" y="10" width="16" height="11" rx="1"/>
                    <path d="M8 10V8C8 6 9.5 5 12 5C14.5 5 16 6 16 8V10"/>
                    <path d="M12 10V21M9 13H15" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="ws-text-teal">EXCITING<br/>REWARDS</span>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT COLUMN ════ */}
        <div className="ws-right">
          
          {/* Background Glowing Arch */}
          <div className="ws-arch-glow" />

          {/* Molecule Decor Left */}
          <div className="ws-molecule-left">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="20" cy="80" r="8" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <circle cx="50" cy="50" r="12" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <circle cx="90" cy="60" r="10" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <circle cx="70" cy="100" r="6" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <line x1="26" y1="74" x2="42" y2="58" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <line x1="61" y1="54" x2="80" y2="58" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <line x1="56" y1="60" x2="66" y2="94" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
            </svg>
          </div>

          {/* Molecule Decor Right */}
          <div className="ws-molecule-right">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="100" cy="80" r="8" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <circle cx="70" cy="50" r="12" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <circle cx="30" cy="60" r="10" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <circle cx="50" cy="100" r="6" fill="rgba(255,255,255,0.8)" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <line x1="94" y1="74" x2="78" y2="58" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <line x1="59" y1="54" x2="40" y2="58" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
              <line x1="64" y1="60" x2="54" y2="94" stroke="rgba(255,255,255,1)" strokeWidth="2"/>
            </svg>
          </div>

          <div className="ws-product-group">
            <div className="ws-water-ripples" />
            <div className="ws-product-glow" />
            <img 
              src="./assets/Daily_Moisturizer_Front_Finished.png" 
              alt="K-DERMA" 
              className="ws-hero-product"
              onError={(e) => e.target.style.display='none'}
            />
            {/* 3-Tier Podium */}
            <div className="ws-podium">
              <div className="ws-podium-tier ws-tier-1"></div>
              <div className="ws-podium-tier ws-tier-2"></div>
              <div className="ws-podium-tier ws-tier-3"></div>
            </div>
          </div>

          {/* Start Button Area */}
          <div className="ws-cta-container">
            <button className="ws-start-btn" onClick={onBegin}>
              START CHALLENGE &rarr;
            </button>
            <div className="ws-dermatologist">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                <path d="M8 1L10 4H14V8L16 11L13 14H9L7 16L4 14H1V10L3 7L1 4H5L8 1Z" stroke="white" strokeWidth="1" fill="transparent"/>
                <path d="M5 8L7 10L11 5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span>Dermatologically Tested</span>
            </div>
          </div>
        </div>

      </div>{/* End Main */}

      {/* ════ BOTTOM BAR ════ */}
      <div className="ws-footer-container">
        <div className="ws-footer">
          <div className="ws-footer-title">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M12 2L2 8L12 22L22 8L12 2Z" stroke="white" strokeWidth="1.5"/>
              <path d="M2 8H22M12 2V22M7 5L12 8L17 5" stroke="white" strokeWidth="1.5"/>
            </svg>
            WHY PARTICIPATE?
          </div>
          <div className="ws-footer-items">
            <div className="ws-footer-item">
              <div className="ws-check">✓</div> IMPROVE SKIN<br/>HYDRATION
            </div>
            <div className="ws-footer-item">
              <div className="ws-check">✓</div> BUILD STRONGER<br/>SKIN BARRIER
            </div>
            <div className="ws-footer-item">
              <div className="ws-check">✓</div> ACHIEVE GLASS<br/>SKIN GLOW
            </div>
            <div className="ws-footer-item">
              <div className="ws-check">✓</div> WIN EXCLUSIVE<br/>REWARDS
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

