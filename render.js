// render.js — All HTML rendering functions

// ── Toast ──────────────────────────────────────────────────────
function showToast(msg, type='info'){
  let c = document.getElementById('toast-container');
  if(!c){ c=document.createElement('div'); c.id='toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className=`toast toast-${type}`;
  t.textContent=msg;
  c.appendChild(t);
  setTimeout(()=>{ t.classList.add('toast-out'); setTimeout(()=>t.remove(),300); },3000);
}

// ── Confetti ───────────────────────────────────────────────────
function confetti(){
  const colors=['#7c3aed','#ec4899','#06b6d4','#f59e0b','#10b981'];
  for(let i=0;i<60;i++){
    const d=document.createElement('div');
    d.className='confetti-piece';
    d.style.cssText=`left:${Math.random()*100}vw;background:${colors[i%5]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;animation-duration:${1.5+Math.random()*2}s;animation-delay:${Math.random()*0.5}s;border-radius:${Math.random()>0.5?'50%':'2px'}`;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),3500);
  }
}

// ── Layout wrapper ─────────────────────────────────────────────
function renderLayout(mainHTML){
  const acc = S.totalSolved>0 ? Math.round(S.totalCorrect/S.totalSolved*100) : 0;
  const xpPct = Math.min(100,Math.round(S.xp/xpForLevel(S.level)*100));
  const nav = [
    {id:'home',icon:'🏠',label:'Home'},
    {id:'play',icon:'⚡',label:'Play'},
    {id:'daily',icon:'📅',label:'Daily'},
    {id:'dashboard',icon:'📊',label:'Stats'},
  ];
  const navItems = nav.map(n=>`
    <div class="nav-item ${S.screen===n.id?'active':''}" onclick="navigate('${n.id}')">
      <span class="nav-icon">${n.icon}</span><span>${n.label}</span>
    </div>`).join('');
  const mobNav = nav.map(n=>`
    <div class="mob-nav-btn ${S.screen===n.id?'active':''}" onclick="navigate('${n.id}')">
      <span class="mob-icon">${n.icon}</span><span>${n.label}</span>
    </div>`).join('');

  document.getElementById('app').innerHTML=`
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside id="sidebar" class="w-56 flex-shrink-0 flex flex-col p-4 gap-2 fixed top-0 left-0 bottom-0 z-50" style="background:rgba(8,8,21,0.95);border-right:1px solid var(--appborder)">
      <div class="flex items-center gap-2 px-2 py-3 mb-2">
        <span class="text-2xl">⚡</span>
        <span class="font-display font-800 text-xl neon-text" style="font-weight:800">MathBlitz</span>
      </div>
      <!-- User card -->
      <div class="glass p-3 mb-2">
        <div class="flex items-center gap-2 mb-2">
          <div class="level-badge w-9 h-9 text-sm">${S.level}</div>
          <div class="flex-1 min-w-0">
            <div class="text-xs text-slate-400">Level ${S.level}</div>
            <div class="text-xs text-slate-500">${S.xp}/${xpForLevel(S.level)} XP</div>
          </div>
          <div class="text-lg streak-flame">🔥</div>
          <div class="text-xs font-bold text-orange-400">${S.streak}</div>
        </div>
        <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${xpPct}%"></div></div>
      </div>
      <nav class="flex flex-col gap-1 flex-1">${navItems}</nav>
      <div class="text-xs text-slate-600 px-2 pb-2">Accuracy: ${acc}% · ${S.totalSolved} solved</div>
    </aside>
    <!-- Main -->
    <main id="main-content" class="flex-1 ml-56 min-h-screen" style="padding:1.5rem">
      ${mainHTML}
    </main>
  </div>
  <!-- Mobile nav -->
  <nav id="mobile-nav">${mobNav}</nav>`;
}

// ── Home screen ────────────────────────────────────────────────
function renderHome(){
  S.screen='home'; saveState();
  const acc = S.totalSolved>0?Math.round(S.totalCorrect/S.totalSolved*100):0;
  const weak = Object.entries(S.weakTopics).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t,c])=>`<span class="px-2 py-1 rounded-full text-xs diff-hard">${t} (${c})</span>`).join('')||'<span class="text-slate-500 text-sm">None yet — keep practicing!</span>';
  renderLayout(`
  <div class="animate-slide-up max-w-5xl mx-auto">
    <div class="mb-6">
      <h1 class="font-display text-4xl font-bold neon-text mb-1">Welcome back! 👋</h1>
      <p class="text-slate-400">Ready to blitz some math? Let's go!</p>
    </div>
    <!-- Stats row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="stat-card glass" style="color:#7c3aed;border:1px solid rgba(124,58,237,0.3)">
        <div class="text-3xl font-bold">${S.totalSolved}</div>
        <div class="text-xs text-slate-400 mt-1">Questions Solved</div>
        <div class="text-2xl mt-1">📚</div>
      </div>
      <div class="stat-card glass" style="color:#10b981;border:1px solid rgba(16,185,129,0.3)">
        <div class="text-3xl font-bold">${acc}%</div>
        <div class="text-xs text-slate-400 mt-1">Accuracy</div>
        <div class="text-2xl mt-1">🎯</div>
      </div>
      <div class="stat-card glass" style="color:#f59e0b;border:1px solid rgba(245,158,11,0.3)">
        <div class="text-3xl font-bold">${S.streak}</div>
        <div class="text-xs text-slate-400 mt-1">Day Streak</div>
        <div class="text-2xl mt-1">🔥</div>
      </div>
      <div class="stat-card glass" style="color:#ec4899;border:1px solid rgba(236,72,153,0.3)">
        <div class="text-3xl font-bold">${S.level}</div>
        <div class="text-xs text-slate-400 mt-1">Current Level</div>
        <div class="text-2xl mt-1">⭐</div>
      </div>
    </div>
    <!-- Quick actions -->
    <div class="grid md:grid-cols-3 gap-4 mb-6">
      <div class="glass glass-hover p-5 select-card" onclick="navigate('play')">
        <div class="text-3xl mb-2">⚡</div>
        <div class="font-bold text-lg mb-1">Start Playing</div>
        <div class="text-sm text-slate-400">Choose grade, topic & mode</div>
      </div>
      <div class="glass glass-hover p-5 select-card" onclick="startPracticeForMe()">
        <div class="text-3xl mb-2">🎲</div>
        <div class="font-bold text-lg mb-1">Practice For Me</div>
        <div class="text-sm text-slate-400">Auto-mixed questions</div>
      </div>
      <div class="glass glass-hover p-5 select-card" onclick="navigate('daily')">
        <div class="text-3xl mb-2">📅</div>
        <div class="font-bold text-lg mb-1">Daily Challenge</div>
        <div class="text-sm text-slate-400">${S.dailyDone?'✅ Completed today!':'Fresh challenge awaits'}</div>
      </div>
    </div>
    <!-- Weak topics -->
    <div class="glass p-5">
      <h2 class="font-bold mb-3 flex items-center gap-2">⚠️ Weak Topics</h2>
      <div class="flex flex-wrap gap-2">${weak}</div>
    </div>
  </div>`);
}

// ── Grade select ───────────────────────────────────────────────
function renderGradeSelect(){
  S.screen='play'; saveState();
  const cards = GRADES.map(g=>`
    <div class="select-card p-6 text-center glass-hover" onclick="selectGrade(${g.id})">
      <div class="text-5xl mb-3">${g.emoji}</div>
      <div class="font-bold text-lg" style="color:${g.color}">${g.label}</div>
      <div class="text-xs text-slate-400 mt-1">${TOPICS[g.id].length} topics</div>
    </div>`).join('');
  renderLayout(`
  <div class="animate-slide-up max-w-3xl mx-auto">
    <button class="btn-ghost px-4 py-2 mb-4 text-sm" onclick="renderHome()">← Back</button>
    <h1 class="font-display text-3xl font-bold mb-2">Choose Your Grade</h1>
    <p class="text-slate-400 mb-6">Select the grade you want to practice</p>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">${cards}</div>
  </div>`);
}

// ── Topic select ───────────────────────────────────────────────
function renderTopicSelect(){
  const g = GRADES.find(x=>x.id===S.grade);
  const topics = TOPICS[S.grade];
  const cards = topics.map(t=>{
    const weak = S.weakTopics[t]||0;
    return `<div class="select-card p-5 glass-hover" onclick="selectTopic('${t}')">
      <div class="font-bold mb-1">${t}</div>
      ${weak?`<span class="text-xs diff-hard px-2 py-0.5 rounded-full">Weak area (${weak}✗)</span>`:'<span class="text-xs text-slate-500">No mistakes</span>'}
    </div>`;
  }).join('');
  renderLayout(`
  <div class="animate-slide-up max-w-3xl mx-auto">
    <button class="btn-ghost px-4 py-2 mb-4 text-sm" onclick="renderGradeSelect()">← Back</button>
    <h1 class="font-display text-3xl font-bold mb-2">${g.emoji} ${g.label} Topics</h1>
    <p class="text-slate-400 mb-6">Pick a topic to practice</p>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">${cards}</div>
  </div>`);
}

// ── Mode select ────────────────────────────────────────────────
function renderModeSelect(){
  const modes=[
    {id:'practice',icon:'📖',label:'Practice Mode',desc:'Untimed · Step-by-step solutions',color:'#10b981'},
    {id:'quiz',icon:'⏱️',label:'Quiz Mode',desc:'Timed · Score at the end',color:'#7c3aed'},
    {id:'challenge',icon:'🏆',label:'Challenge Mode',desc:'Mixed topics · Increasing difficulty',color:'#ec4899'},
  ];
  const diffs=[
    {id:'easy',label:'Easy',emoji:'🟢',desc:'Basic questions'},
    {id:'medium',label:'Medium',emoji:'🟡',desc:'Intermediate'},
    {id:'hard',label:'Hard',emoji:'🔴',desc:'Advanced questions'},
  ];
  const mCards=modes.map(m=>`
    <div class="select-card p-5 glass-hover" id="mode-${m.id}" onclick="selectMode('${m.id}')">
      <div class="text-3xl mb-2">${m.icon}</div>
      <div class="font-bold text-lg" style="color:${m.color}">${m.label}</div>
      <div class="text-sm text-slate-400 mt-1">${m.desc}</div>
    </div>`).join('');
  const dCards=diffs.map(d=>`
    <div class="select-card p-4 glass-hover text-center" id="diff-${d.id}" onclick="selectDiff('${d.id}')">
      <div class="text-2xl mb-1">${d.emoji}</div>
      <div class="font-bold diff-${d.id} px-2 py-0.5 rounded-full text-xs inline-block">${d.label}</div>
      <div class="text-xs text-slate-500 mt-1">${d.desc}</div>
    </div>`).join('');
  renderLayout(`
  <div class="animate-slide-up max-w-3xl mx-auto">
    <button class="btn-ghost px-4 py-2 mb-4 text-sm" onclick="renderTopicSelect()">← Back</button>
    <h1 class="font-display text-3xl font-bold mb-6">Choose Mode & Difficulty</h1>
    <h2 class="font-semibold text-slate-300 mb-3">Mode</h2>
    <div class="grid md:grid-cols-3 gap-4 mb-6">${mCards}</div>
    <h2 class="font-semibold text-slate-300 mb-3">Difficulty</h2>
    <div class="grid grid-cols-3 gap-4 mb-8">${dCards}</div>
    <button class="btn-primary px-8 py-3 text-base w-full" onclick="startSession()">
      <span>Start ${S.mode||'Practice'} →</span>
    </button>
  </div>`);
  // highlight current selections
  if(S.mode) document.getElementById(`mode-${S.mode}`)?.classList.add('selected');
  document.getElementById(`diff-${S.difficulty}`)?.classList.add('selected');
}

// ── Quiz / Practice session ────────────────────────────────────
function renderSession(){
  const qs = S.quizSession;
  if(!qs||qs.idx>=qs.questions.length){ renderResults(); return; }
  const q = qs.questions[qs.idx];
  const prog = Math.round((qs.idx/qs.questions.length)*100);
  const opts = q.options.map((o,i)=>`
    <button class="option-btn w-full p-4 text-left font-medium" id="opt-${i}" onclick="answerQuestion('${o.replace(/'/g,"\\'")}',${i})">
      <span class="inline-block w-7 h-7 rounded-full border border-current mr-2 text-center text-sm leading-7 font-bold">${'ABCD'[i]}</span>${o}
    </button>`).join('');
  const timer = qs.mode==='quiz'?`
    <div class="flex items-center gap-3 mb-4">
      <svg class="timer-ring w-14 h-14 ${qs.timeLeft<=5?'timer-urgent':''}" viewBox="0 0 48 48">
        <circle class="timer-ring-bg" cx="24" cy="24" r="20" stroke-width="4"/>
        <circle class="timer-ring-fill" id="timer-arc" cx="24" cy="24" r="20" stroke-width="4"
          stroke-dasharray="125.6" stroke-dashoffset="${125.6-125.6*(qs.timeLeft/30)}"/>
      </svg>
      <span id="timer-num" class="text-2xl font-bold ${qs.timeLeft<=5?'text-red-400':'text-cyan-400'}">${qs.timeLeft}s</span>
    </div>`:'';
  const diffBadge=`<span class="diff-${q.difficulty} text-xs px-2 py-0.5 rounded-full font-semibold">${q.difficulty.toUpperCase()}</span>`;
  renderLayout(`
  <div class="animate-slide-up max-w-2xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <button class="btn-ghost px-3 py-1.5 text-sm" onclick="confirmExit()">✕ Exit</button>
      <div class="text-sm text-slate-400">Q ${qs.idx+1} of ${qs.questions.length}</div>
      <div class="flex items-center gap-2">${diffBadge}<span class="text-sm text-slate-400">${q.topic}</span></div>
    </div>
    <!-- Progress -->
    <div class="progress-track mb-6"><div class="progress-fill" style="width:${prog}%"></div></div>
    ${timer}
    <!-- Question card -->
    <div class="glass p-6 mb-4">
      <p class="text-lg font-semibold leading-relaxed">${q.question}</p>
    </div>
    <!-- Options -->
    <div class="flex flex-col gap-3 mb-4" id="options-list">${opts}</div>
    <!-- Solution (hidden) -->
    <div id="solution-box" class="glass p-5 hidden animate-fade-in">
      <h3 class="font-bold text-neonlt mb-3">📐 Step-by-Step Solution</h3>
      <div class="flex flex-col gap-3">
        ${q.solution.map((s,i)=>`<div class="step-item revealed p-2" data-step="${i+1}"><p class="text-sm text-slate-300">${s}</p></div>`).join('')}
      </div>
      <button class="btn-primary px-6 py-2.5 mt-4 w-full" onclick="nextQuestion()"><span>Next Question →</span></button>
    </div>
  </div>`);
  // Start timer for quiz mode
  if(qs.mode==='quiz'){ startTimer(); }
}

// ── Results ────────────────────────────────────────────────────
function renderResults(){
  const qs=S.quizSession;
  const pct=Math.round((qs.correct/qs.questions.length)*100);
  const grade=pct>=80?'🏆 Excellent!':pct>=60?'👍 Good Job!':'😤 Keep Practicing!';
  const color=pct>=80?'#10b981':pct>=60?'#f59e0b':'#ef4444';
  if(pct>=80) confetti();
  renderLayout(`
  <div class="animate-bounce-in max-w-xl mx-auto text-center">
    <div class="text-6xl mb-4">${pct>=80?'🏆':pct>=60?'🎯':'💪'}</div>
    <h1 class="font-display text-3xl font-bold mb-2" style="color:${color}">${grade}</h1>
    <p class="text-slate-400 mb-6">You scored ${qs.correct}/${qs.questions.length} (${pct}%)</p>
    <div class="glass p-6 mb-6">
      <div class="grid grid-cols-3 gap-4 text-center">
        <div><div class="text-2xl font-bold text-green-400">${qs.correct}</div><div class="text-xs text-slate-400">Correct</div></div>
        <div><div class="text-2xl font-bold text-red-400">${qs.questions.length-qs.correct}</div><div class="text-xs text-slate-400">Wrong</div></div>
        <div><div class="text-2xl font-bold text-purple-400">+${qs.correct*10+((qs.questions.length-qs.correct)*2)}</div><div class="text-xs text-slate-400">XP Earned</div></div>
      </div>
    </div>
    <div class="flex gap-3 justify-center flex-wrap">
      <button class="btn-primary px-6 py-3" onclick="restartSession()"><span>🔄 Try Again</span></button>
      <button class="btn-secondary px-6 py-3" onclick="renderHome()">🏠 Home</button>
      <button class="btn-ghost px-6 py-3" onclick="renderGradeSelect()">📚 New Topic</button>
    </div>
  </div>`);
}

// ── Dashboard ──────────────────────────────────────────────────
function renderDashboard(){
  S.screen='dashboard'; saveState();
  const acc=S.totalSolved>0?Math.round(S.totalCorrect/S.totalSolved*100):0;
  const weak=Object.entries(S.weakTopics).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const weakHTML=weak.length?weak.map(([t,c])=>`
    <div class="flex items-center justify-between p-3 glass-light mb-2">
      <span class="font-medium text-sm">${t}</span>
      <span class="diff-hard text-xs px-2 py-0.5 rounded-full">${c} mistakes</span>
    </div>`).join(''):`<p class="text-slate-500 text-sm">No weak topics yet. Keep practicing!</p>`;
  const recentMistakes=S.mistakes.slice(-5).reverse().map(m=>{
    const q=QUESTIONS.find(x=>x.id===m.id);
    return q?`<div class="p-3 glass-light mb-2 text-sm"><span class="text-slate-300">${q.question.slice(0,60)}…</span> <span class="diff-hard text-xs ml-2 px-1 rounded">${q.topic}</span></div>`:'';
  }).join('');
  renderLayout(`
  <div class="animate-slide-up max-w-4xl mx-auto">
    <h1 class="font-display text-3xl font-bold mb-6">📊 Your Dashboard</h1>
    <div class="grid md:grid-cols-4 gap-4 mb-6">
      <div class="stat-card glass text-center" style="color:#7c3aed"><div class="text-3xl font-bold">${S.totalSolved}</div><div class="text-xs text-slate-400 mt-1">Total Solved</div></div>
      <div class="stat-card glass text-center" style="color:#10b981"><div class="text-3xl font-bold">${acc}%</div><div class="text-xs text-slate-400 mt-1">Accuracy</div></div>
      <div class="stat-card glass text-center" style="color:#f59e0b"><div class="text-3xl font-bold">${S.streak}</div><div class="text-xs text-slate-400 mt-1">Streak</div></div>
      <div class="stat-card glass text-center" style="color:#ec4899"><div class="text-3xl font-bold">${S.level}</div><div class="text-xs text-slate-400 mt-1">Level</div></div>
    </div>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="glass p-5">
        <h2 class="font-bold mb-4">⚠️ Weak Topics</h2>${weakHTML}
      </div>
      <div class="glass p-5">
        <h2 class="font-bold mb-4">❌ Recent Mistakes</h2>
        ${recentMistakes||'<p class="text-slate-500 text-sm">No mistakes yet!</p>'}
      </div>
    </div>
    <div class="glass p-5 mt-6">
      <h2 class="font-bold mb-4">📈 Performance Chart</h2>
      <div class="chart-container" style="height:220px"><canvas id="perfChart"></canvas></div>
    </div>
  </div>`);
  buildChart();
}

function buildChart(){
  const ctx=document.getElementById('perfChart');
  if(!ctx) return;
  const labels=TOPICS[8];
  const data=labels.map(t=>S.weakTopics[t]||0);
  new Chart(ctx,{
    type:'bar',
    data:{ labels, datasets:[{ label:'Mistakes', data, backgroundColor:'rgba(124,58,237,0.6)', borderColor:'#7c3aed', borderWidth:1, borderRadius:6 }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}}, y:{ticks:{color:'#94a3b8'},grid:{color:'rgba(255,255,255,0.05)'}} } }
  });
}

// ── Daily challenge ────────────────────────────────────────────
function renderDaily(){
  S.screen='daily'; saveState();
  renderLayout(`
  <div class="animate-slide-up max-w-xl mx-auto text-center">
    <div class="text-6xl mb-4">📅</div>
    <h1 class="font-display text-3xl font-bold mb-2">Daily Challenge</h1>
    <p class="text-slate-400 mb-6">${S.dailyDone?'You already completed today\'s challenge! Come back tomorrow.':'8 mixed questions from all grades. Complete to earn bonus XP!'}</p>
    ${S.dailyDone
      ? `<button class="btn-ghost px-6 py-3" onclick="renderHome()">🏠 Go Home</button>`
      : `<button class="btn-primary px-8 py-3 text-lg" onclick="startDaily()"><span>🚀 Start Challenge</span></button>`}
  </div>`);
}
