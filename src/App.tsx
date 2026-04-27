import { useEffect } from 'react';
import { initGameLogic } from './gameLogic';

export default function App() {
  useEffect(() => {
    initGameLogic();
  }, []);

  return (
    <div className="h-full w-full">
      {/* ═══════════ TITLE ═══════════ */}
      <div className="screen active" id="title">
        <canvas id="title-canvas"></canvas>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/80 z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-4 md:p-8 overflow-y-auto">

          {/* Hero */}
          <div className="text-center mb-8 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-amber-400 text-xs font-bungee tracking-widest">EDUCATIONAL TOWER DEFENSE</span>
            </div>
            <div className="text-5xl md:text-6xl mb-3" style={{ filter: 'drop-shadow(0 0 24px rgba(251,191,36,0.6))' }}>🏰</div>
            <h1 className="font-bungee leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-amber-400 to-orange-500 drop-shadow-lg mb-3" style={{ fontSize: 'clamp(2.4rem,7vw,5rem)' }}>
              KNOWLEDGE<br/>FORTRESS
            </h1>
            <p className="font-bungee text-cyan-400 tracking-[0.35em] text-xs md:text-sm uppercase">
              Answer • Build • Defend • Conquer
            </p>
          </div>

          {/* Main Menu Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both">

            {/* Left Column */}
            <div className="flex flex-col gap-5">
              {/* Difficulty */}
              <div className="menu-card">
                <div className="menu-card-header">
                  <div className="step-badge">1</div>
                  <h2 className="font-bungee text-slate-200 tracking-widest text-sm">SELECT DIFFICULTY</h2>
                </div>
                <div className="diff-row">
                  <div className="diff-btn diff-easy" data-diff="easy" onClick={() => (window as any).setDifficulty('easy')}>
                    <div className="di">🟢</div>
                    <div className="dn">Easy</div>
                    <div className="dd">25 HP · Slow · 22s</div>
                  </div>
                  <div className="diff-btn diff-normal sel" data-diff="normal" onClick={() => (window as any).setDifficulty('normal')}>
                    <div className="di">🟡</div>
                    <div className="dn">Normal</div>
                    <div className="dd">20 HP · Standard · 16s</div>
                  </div>
                  <div className="diff-btn diff-hard" data-diff="hard" onClick={() => (window as any).setDifficulty('hard')}>
                    <div className="di">🔴</div>
                    <div className="dn">Hard</div>
                    <div className="dd">15 HP · Fast · 10s</div>
                  </div>
                </div>
              </div>

              {/* Game Mode */}
              <div className="menu-card">
                <div className="menu-card-header">
                  <div className="step-badge">2</div>
                  <h2 className="font-bungee text-slate-200 tracking-widest text-sm">CHOOSE GAME MODE</h2>
                </div>
                <div className="mode-card group" onClick={() => (window as any).showModeModal('classic')}>
                  <div className="mode-card-icon">🛡️</div>
                  <div className="text-left">
                    <div className="font-bungee text-amber-400 text-lg mb-1 group-hover:text-amber-300 transition-colors">CLASSIC DEFENSE</div>
                    <div className="text-slate-400 text-sm leading-relaxed">Answer questions to earn gold, build towers, and survive 12 waves of enemies.</div>
                  </div>
                  <div className="mode-card-arrow">▶</div>
                </div>
              </div>
            </div>

            {/* Right Column — Question Bank */}
            <div className="menu-card flex flex-col min-h-[420px]">
              <div className="menu-card-header">
                <div className="step-badge">3</div>
                <h2 className="font-bungee text-slate-200 tracking-widest text-sm">SELECT QUESTION BANK</h2>
              </div>

              <div className="flex gap-1.5 mb-4">
                <button className="tab-pill tab-active" id="tab-presets" onClick={() => {
                  document.getElementById('preset-list')!.style.display = 'block';
                  document.getElementById('custom-quiz-area')!.style.display = 'none';
                  document.getElementById('ai-quiz-area')!.style.display = 'none';
                  document.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('tab-active'));
                  document.getElementById('tab-presets')!.classList.add('tab-active');
                }}>📚 PRESETS</button>
                <button className="tab-pill" id="tab-custom" onClick={() => {
                  document.getElementById('preset-list')!.style.display = 'none';
                  document.getElementById('custom-quiz-area')!.style.display = 'flex';
                  document.getElementById('ai-quiz-area')!.style.display = 'none';
                  document.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('tab-active'));
                  document.getElementById('tab-custom')!.classList.add('tab-active');
                }}>✏️ CUSTOM</button>
                <button className="tab-pill tab-ai" id="tab-ai" onClick={() => {
                  document.getElementById('preset-list')!.style.display = 'none';
                  document.getElementById('custom-quiz-area')!.style.display = 'none';
                  document.getElementById('ai-quiz-area')!.style.display = 'flex';
                  document.querySelectorAll('.tab-pill').forEach(t => t.classList.remove('tab-active'));
                  document.getElementById('tab-ai')!.classList.add('tab-active');
                }}>✨ AI</button>
              </div>

              <div id="preset-list" className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                {/* Populated by JS */}
              </div>

              <div id="custom-quiz-area" className="flex-1 flex-col gap-3" style={{ display: 'none' }}>
                <div className="text-xs text-slate-400 mb-1">One question per line:</div>
                <div className="bg-slate-950 border border-slate-700/60 rounded-lg p-2.5 text-[10px] font-mono text-cyan-400 mb-2">
                  Question? | Correct Answer | Wrong1 | Wrong2 | Wrong3
                </div>
                <textarea id="custom-quiz-input" className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 font-mono focus:border-amber-500/70 focus:outline-none resize-none custom-scrollbar mb-3" placeholder="What is 2+2? | 4 | 3 | 5 | 6" style={{ minHeight: '120px' }}></textarea>
                <div className="flex gap-2">
                  <button className="share-btn" onClick={() => (window as any).generateShareLink()}>
                    🔗 COPY STUDENT LINK
                  </button>
                  <button className="play-btn" onClick={() => (window as any).startCustomQuiz()}>
                    PLAY NOW ▶
                  </button>
                </div>
              </div>

              {/* AI Generate Panel */}
              <div id="ai-quiz-area" className="flex-1 flex-col gap-3" style={{ display: 'none' }}>
                <div className="ai-banner">
                  ✨ Generate questions on <strong>any topic</strong> with Google Gemini AI
                </div>
                <div>
                  <label className="field-label">TOPIC</label>
                  <input id="ai-topic-input" type="text"
                    className="field-input"
                    placeholder="e.g. Newton's Laws, The Civil War, DNA…" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="field-label">GRADE LEVEL</label>
                    <select id="ai-grade-select" className="field-input">
                      <option>Elementary School</option>
                      <option>Middle School</option>
                      <option>High School</option>
                      <option>College</option>
                    </select>
                  </div>
                  <div className="w-20">
                    <label className="field-label">COUNT</label>
                    <select id="ai-count-select" className="field-input">
                      <option>5</option>
                      <option>10</option>
                      <option>15</option>
                    </select>
                  </div>
                </div>
                <button className="ai-gen-btn" onClick={() => (window as any).generateAIQuiz()}>
                  ✨ GENERATE QUESTIONS
                </button>
                <div id="ai-status" className="text-xs text-center min-h-[16px]"></div>
                <div id="ai-preview" className="flex-1 overflow-y-auto space-y-1"></div>
                <button id="ai-play-btn" className="play-btn" style={{ display: 'none' }} onClick={() => (window as any).playAIQuiz()}>
                  PLAY NOW ▶
                </button>
              </div>
            </div>

          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-5xl mt-8 animate-in fade-in duration-700 delay-200 fill-mode-both">
            <div className="feature-pill">
              <span className="text-xl">✨</span>
              <div>
                <div className="font-bungee text-purple-400 text-[10px] mb-0.5">AI-GENERATED</div>
                <div className="text-slate-500 text-[10px] leading-tight hidden sm:block">Quizzes on any topic in seconds</div>
              </div>
            </div>
            <div className="feature-pill">
              <span className="text-xl">💡</span>
              <div>
                <div className="font-bungee text-cyan-400 text-[10px] mb-0.5">LEARN AS YOU PLAY</div>
                <div className="text-slate-500 text-[10px] leading-tight hidden sm:block">Explanations after every answer</div>
              </div>
            </div>
            <div className="feature-pill">
              <span className="text-xl">🔗</span>
              <div>
                <div className="font-bungee text-amber-400 text-[10px] mb-0.5">SHARE INSTANTLY</div>
                <div className="text-slate-500 text-[10px] leading-tight hidden sm:block">No accounts needed, just a link</div>
              </div>
            </div>
          </div>

          <div className="mt-5 mb-4 text-slate-700 text-[10px] font-mono tracking-widest uppercase">
            Knowledge Fortress v7 · AI-Powered Edition
          </div>
        </div>
      </div>

      {/* ═══════════ STUDENT LOGIN ═══════════ */}
      <div className="screen" id="student-login">
        <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ background: 'radial-gradient(ellipse at 50% 30%, #0f1f3e 0%, #04080f 70%)' }}>
          <div className="menu-card max-w-md w-full text-center p-8">
            <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 16px rgba(251,191,36,0.5))' }}>🏰</div>
            <h1 className="font-bungee text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-500 mb-2">
              CLASS ASSIGNMENT
            </h1>
            <p className="text-slate-400 text-sm mb-8">Your teacher has assigned you a Knowledge Fortress mission!</p>

            <div className="text-left mb-5">
              <label className="field-label mb-2 block">YOUR NAME</label>
              <input type="text" id="student-name-input"
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl p-4 text-lg text-white font-bold focus:border-amber-500 focus:outline-none transition-colors"
                placeholder="Enter your name…" />
            </div>

            <button className="w-full py-4 font-bungee text-xl rounded-xl text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#0891b2,#2563eb)', boxShadow: '0 5px 0 #1e3a8a, 0 0 30px rgba(6,182,212,0.3)' }}
              onClick={() => (window as any).startStudentQuiz()}>
              START MISSION 🚀
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ GAME ═══════════ */}
      <div className="screen" id="game">
        <div className="hud">
          <div className="hud-l">
            <div className="hud-stat">🏰 <span className="font-bungee text-amber-400 text-xs" id="hlv">LV1</span></div>
            <div className="xw"><div className="xf" id="hxp"></div></div>
            <div className="hud-divider"></div>
            <div className="hud-stat">🌊 <span className="v wv font-bungee" id="hw">0</span><span className="text-slate-600 text-xs" id="hwmax">/12</span></div>
            <div className="hud-divider"></div>
            <div className="hud-stat">💰 <span className="v gv font-bungee" id="hg">0</span></div>
            <div className="hud-divider"></div>
            <div className="hud-stat">❤️ <span className="v hpv font-bungee" id="hh">0</span></div>
            <div className="hud-divider"></div>
            <div className="hud-stat">🎯 <span className="v accv font-bungee" id="hacc">—</span></div>
            <div className="hud-stat tmr font-bungee" id="htmr">0:00</div>
          </div>
          <div className="hud-r">
            <div className="hud-stat">⭐ <span className="v scv font-bungee" id="hsc">0</span></div>
            <div className="hud-divider"></div>
            {/* Mobile-only quick action buttons */}
            <button className="hud-btn mobile-answer-btn" onClick={() => (window as any).askQ()}>📖</button>
            <button className="hud-btn mobile-wave-btn" id="wbtn-hud" onClick={() => (window as any).launchWave()}>🌊</button>
            <div className="hud-divider mobile-divider"></div>
            <button className="hud-btn" id="speed-btn">1×</button>
            <button className="hud-btn" id="pause-btn" onClick={() => (window as any).togglePause()}>⏸</button>
          </div>
        </div>

        <div className="gb">
          <div className="arena" id="arena">
            <canvas id="gc"></canvas>
            <div className="castle-hp-bar" id="castlebar">
              <div className="castle-hp-fill" id="castlefill" style={{ height: '100%' }}></div>
            </div>

            <div className="tut-ov" id="tutov">
              <div className="tut-box">
                <div className="text-3xl mb-3">⚔️</div>
                <h2 className="font-bungee text-amber-400 text-xl mb-5">HOW TO PLAY</h2>
                <div className="tut-step"><div className="tut-num">1</div><div>Tap <b>Answer for Gold</b>. Correct answers earn 💰. Game pauses while you answer!</div></div>
                <div className="tut-step"><div className="tut-num">2</div><div>Select a tower from the shop, then tap an empty grid cell to place it. Towers auto-fire!</div></div>
                <div className="tut-step"><div className="tut-num">3</div><div>Hit <b>Send Wave</b>. Stop enemies before they reach your 🏰!</div></div>
                <button className="big-btn mt-5" onClick={() => (window as any).closeTut()}>👍 LET'S GO!</button>
              </div>
            </div>

            <div className="pause-ov" id="pauseov">
              <div className="pause-box">
                <div className="pause-ttl">⏸ PAUSED</div>
                <button className="big-btn mt-4" onClick={() => (window as any).togglePause()}>▶ RESUME</button>
              </div>
            </div>

            <div className="wave-announcer-ov" id="wave-announcer-ov">
              <div className="wave-announcer-box">
                <div className="wave-announcer-title" id="wave-announcer-title">WAVE 1</div>
                <div className="wave-announcer-count" id="wave-announcer-count">3</div>
                <button className="big-btn mt-4" onClick={() => (window as any).skipWaveAnnouncer()}>▶ SKIP</button>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="ps">
              <div className="sbox" id="sbox">
                <div className="sll">🔥 STREAK</div>
                <div className="svl" id="sval">0</div>
              </div>
              <button className="pbtn" onClick={() => (window as any).askQ()}>📖 ANSWER FOR GOLD</button>
            </div>

            <div className="ps" id="sel-tower-panel" style={{ display: 'none' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 className="!mb-0">🎯 SELECTED</h3>
                <button className="hud-btn" onClick={() => (window as any).deselectTower()}>✕</button>
              </div>
              <div id="sel-t-info" className="mb-2"></div>
              <button id="sel-t-upg" className="pbtn mb-1" onClick={() => (window as any).upgSelected()}>UPGRADE</button>
              <button id="sel-t-ab" className="pbtn btn-pu mb-1" onClick={() => (window as any).useAbility()}>ABILITY</button>
              <button id="sel-t-sell" className="sell-btn mt-2" onClick={() => (window as any).sellSelected()}>🪙 SELL</button>
            </div>

            <div className="ps" id="shop-panel">
              <h3>🏗️ TOWERS</h3>
              <div className="ts" id="tshop"></div>
              <button className="sell-btn" id="sellbtn">🪙 SELL MODE</button>
            </div>
            <div className="ps border-none">
              <button className="wvb" id="wbtn" onClick={() => (window as any).launchWave()}>🌊 SEND WAVE</button>
            </div>
          </div>
        </div>
      </div>

      {/* UPGRADE MODAL */}
      <div className="qo" id="upg-ov">
        <div className="qm">
          <div className="qlbl">CHOOSE UPGRADE PATH</div>
          <div className="upg-grid" id="upg-grid"></div>
          <button className="big-btn mt-4 b-blue w-full" onClick={() => (window as any).closeUpg()}>CANCEL</button>
        </div>
      </div>

      {/* QUESTION MODAL */}
      <div className="qo" id="qov">
        <div className="qm" id="qm-box">
          <div className="qtb"><div className="qtf" id="qtf" style={{ width: '100%' }}></div></div>
          <div className="qlbl" id="qlbl">QUESTION <span className="paused-tag">⏸ PAUSED</span></div>
          <div className="qtx" id="qtx"></div>
          <div className="ag" id="agrid"></div>
          <div className="qrs" id="qres"></div>
        </div>
      </div>

      {/* GAME OVER */}
      <div className="gov" id="goov">
        <div className="got" id="got"></div>
        <div id="go-stats" className="gost my-5"></div>
        <div id="go-review" className="w-full max-w-2xl bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-6 shadow-2xl backdrop-blur-md" style={{ display: 'none' }}></div>
        <div className="go-btns">
          <button className="big-btn" onClick={() => (window as any).goHome()}>🏠 PLAY AGAIN</button>
        </div>
      </div>

      <div className="hk" id="hk">
        Answer Qs to earn gold · Build towers to defend
      </div>
    </div>
  );
}
