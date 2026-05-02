// ── State ─────────────────────────────────────────────────────
const DEFAULT_STATE = {
  screen:'home', grade:null, topic:null, mode:null, difficulty:'medium',
  xp:0, level:1, streak:0, lastDate:'', totalSolved:0, totalCorrect:0,
  weakTopics:{}, mistakes:[], dailyDone:false,
  quizSession:null,
};

function loadState(){
  try{ return Object.assign({},DEFAULT_STATE,JSON.parse(localStorage.getItem('mbstate')||'{}')); }
  catch(e){ return {...DEFAULT_STATE}; }
}
function saveState(){ localStorage.setItem('mbstate',JSON.stringify(S)); }

let S = loadState();

// ── XP / Level helpers ────────────────────────────────────────
function xpForLevel(l){ return l*200; }
function addXP(pts){
  S.xp += pts;
  while(S.xp >= xpForLevel(S.level)){ S.xp -= xpForLevel(S.level); S.level++; showToast(`🎉 Level Up! You're now Level ${S.level}!`,'info'); }
  saveState();
}

// ── Streak ────────────────────────────────────────────────────
function checkStreak(){
  const today = new Date().toDateString();
  if(S.lastDate === today) return;
  const yesterday = new Date(Date.now()-86400000).toDateString();
  S.streak = S.lastDate===yesterday ? S.streak+1 : 1;
  S.lastDate = today; S.dailyDone = false;
  saveState();
}

// ── Mistake tracker ───────────────────────────────────────────
function recordAnswer(q, correct){
  S.totalSolved++;
  if(correct){ S.totalCorrect++; addXP(10); }
  else{
    addXP(2);
    S.mistakes.push({id:q.id,topic:q.topic,grade:q.grade,ts:Date.now()});
    if(S.mistakes.length>50) S.mistakes.shift();
    S.weakTopics[q.topic] = (S.weakTopics[q.topic]||0)+1;
  }
  saveState();
}

// ── Adaptive difficulty ───────────────────────────────────────
function adaptDifficulty(wasCorrect){
  const d = ['easy','medium','hard'];
  let i = d.indexOf(S.difficulty);
  if(wasCorrect && i<2) i++;
  else if(!wasCorrect && i>0) i--;
  S.difficulty = d[i];
}

// ── Get questions filtered ────────────────────────────────────
function getQuestions(grade, topic, difficulty, count=10){
  let pool = QUESTIONS.filter(q=>q.grade===grade);
  if(topic) pool = pool.filter(q=>q.topic===topic);
  
  // If there are specific difficulty questions, prefer them. Otherwise fallback to the same topic pool.
  if(difficulty) {
    let diffPool = pool.filter(q=>q.difficulty===difficulty);
    if(diffPool.length > 0) pool = diffPool;
  }
  
  // Fisher-Yates shuffle for true randomization
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  
  return pool.slice(0,count);
}

function getDailyQuestions(){
  const day = Math.floor(Date.now()/86400000);
  const ids = DAILY_SEED.slice(day%DAILY_SEED.length).concat(DAILY_SEED.slice(0,day%DAILY_SEED.length));
  return ids.slice(0,8).map(id=>QUESTIONS.find(q=>q.id===id)).filter(Boolean);
}

function getMixedQuestions(count=12){
  let pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0,count);
}
