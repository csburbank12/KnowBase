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
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-950/90 z-0 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full p-4 md:p-8 overflow-y-auto">
          
          {/* Hero */}
          <div className="text-center mb-10 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="text-6xl md:text-7xl mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">🏰</div>
            <h1 className="font-bungee text-5xl md:text-7xl leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-amber-100 via-amber-400 to-orange-600 drop-shadow-lg mb-4">
              KNOWLEDGE<br/>FORTRESS
            </h1>
            <p className="font-bungee text-cyan-400 tracking-[0.3em] text-sm md:text-base uppercase drop-shadow-md">
              Answer • Build • Defend • Conquer
            </p>
          </div>

          {/* Main Menu Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
            
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Difficulty */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <h2 className="font-bungee text-slate-400 tracking-widest text-sm mb-4">1. SELECT DIFFICULTY</h2>
                <div className="diff-row">
                  <div className="diff-btn" data-diff="easy" onClick={() => (window as any).setDifficulty('easy')}>
                    <div className="di">🟢</div>
                    <div className="dn">Easy</div>
                    <div className="dd">25 HP · Slow · 22s</div>
                  </div>
                  <div className="diff-btn sel" data-diff="normal" onClick={() => (window as any).setDifficulty('normal')}>
                    <div className="di">🟡</div>
                    <div className="dn">Normal</div>
                    <div className="dd">20 HP · Standard · 16s</div>
                  </div>
                  <div className="diff-btn" data-diff="hard" onClick={() => (window as any).setDifficulty('hard')}>
                    <div className="di">🔴</div>
                    <div className="dn">Hard</div>
                    <div className="dd">15 HP · Fast · 10s</div>
                  </div>
                </div>
              </div>

              {/* Game Mode */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                <h2 className="font-bungee text-slate-400 tracking-widest text-sm mb-4">2. CHOOSE GAME MODE</h2>
                <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600 hover:border-amber-500/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:-translate-y-1" onClick={() => (window as any).showModeModal('classic')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="text-4xl bg-slate-950 p-3 rounded-lg border border-slate-700 group-hover:border-amber-500/30 transition-colors">🛡️</div>
                    <div className="text-left">
                      <div className="font-bungee text-amber-400 text-xl mb-1">CLASSIC DEFENSE</div>
                      <div className="text-slate-400 text-sm leading-relaxed">Answer questions to earn gold, build towers, and survive 12 waves of enemies.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl flex flex-col h-full min-h-[400px]">
              <h2 className="font-bungee text-slate-400 tracking-widest text-sm mb-4">3. SELECT QUESTION BANK</h2>
              <div id="preset-list" className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {/* Populated by JS */}
              </div>
            </div>

          </div>

          <div className="mt-12 text-slate-600 text-xs font-mono tracking-widest uppercase">
            Knowledge Fortress v6 · Ported to React
          </div>
        </div>
      </div>

      {/* ═══════════ GAME ═══════════ */}
      <div className="screen" id="game">
        <div className="hud">
          <div className="hud-l">
            <span className="B text-gold-500">🏰</span>
            <div className="hd"></div>
            <div className="hs">🌊<span className="v wv" id="hw">0</span><span style={{ color: 'var(--text3)' }} id="hwmax">/12</span></div>
            <div className="hd"></div>
            <div className="hs"><span className="lv-b" id="hlv">LV1</span><div className="xw"><div className="xf" id="hxp"></div></div></div>
            <div className="tmr" id="htmr">0:00</div>
          </div>
          <div className="hud-r">
            <div className="hs">🎯<span className="v accv" id="hacc">—</span></div>
            <div className="hs">💰<span className="v gv" id="hg">0</span></div>
            <div className="hs">❤️<span className="v hpv" id="hh">0</span></div>
            <div className="hs">⭐<span className="v scv" id="hsc">0</span></div>
            <div className="hd"></div>
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
                <h2 className="B text-gold-500 text-lg mb-4">⚔️ HOW TO PLAY</h2>
                <div className="tut-step"><div className="tut-num">1</div><div>Click <b>Answer for Gold</b>. Correct answers earn 💰. Game pauses while you answer!</div></div>
                <div className="tut-step"><div className="tut-num">2</div><div>Select a tower, click an empty grid cell to place it. Towers fire automatically!</div></div>
                <div className="tut-step"><div className="tut-num">3</div><div>Click <b>Send Wave</b>. Stop enemies before they reach the 🏰!</div></div>
                <button className="big-btn mt-4" onClick={() => (window as any).closeTut()}>👍 LET'S GO!</button>
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
                <button className="hud-btn" onClick={() => (window as any).deselectTower()}>❌</button>
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
          <div className="qlbl" id="qlbl">QUESTION <span className="paused-tag">⏸ GAME PAUSED</span></div>
          <div className="qtx" id="qtx"></div>
          <div className="ag" id="agrid"></div>
          <div className="qrs" id="qres"></div>
        </div>
      </div>

      {/* GAME OVER */}
      <div className="gov" id="goov">
        <div className="got" id="got"></div>
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
