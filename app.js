// app.js — Event handlers, router, session logic, timer

// ── Navigation ────────────────────────────────────────────────
function navigate(screen){
  if(screen==='home')        renderHome();
  else if(screen==='play')   renderGradeSelect();
  else if(screen==='dashboard') renderDashboard();
  else if(screen==='daily')  renderDaily();
}

// ── Grade / Topic / Mode / Diff selection ─────────────────────
function selectGrade(g){
  S.grade=g; S.topic=null; S.mode=null; saveState();
  renderTopicSelect();
}
function selectTopic(t){
  S.topic=t; saveState();
  renderModeSelect();
}
function selectMode(m){
  S.mode=m; saveState();
  document.querySelectorAll('[id^="mode-"]').forEach(el=>el.classList.remove('selected'));
  document.getElementById(`mode-${m}`)?.classList.add('selected');
}
function selectDiff(d){
  S.difficulty=d; saveState();
  document.querySelectorAll('[id^="diff-"]').forEach(el=>el.classList.remove('selected'));
  document.getElementById(`diff-${d}`)?.classList.add('selected');
}

// ── Session start ─────────────────────────────────────────────
function startSession(){
  if(!S.mode){ showToast('Please select a mode first!','warning'); return; }
  const qs = S.mode==='challenge'
    ? getMixedQuestions(12)
    : getQuestions(S.grade, S.topic, S.difficulty, 10);
  if(!qs.length){ showToast('No questions found for this selection.','error'); return; }
  S.quizSession = { questions:qs, idx:0, correct:0, mode:S.mode, timeLeft:30, answers:[] };
  saveState();
  renderSession();
}

function startPracticeForMe(){
  S.grade=8; S.topic=null; S.mode='practice'; S.difficulty='medium';
  S.quizSession={ questions:getMixedQuestions(10), idx:0, correct:0, mode:'practice', timeLeft:30, answers:[] };
  saveState();
  renderSession();
}

function startDaily(){
  S.quizSession={ questions:getDailyQuestions(), idx:0, correct:0, mode:'quiz', timeLeft:30, answers:[], isDaily:true };
  saveState();
  renderSession();
}

function restartSession(){
  const prev=S.quizSession;
  S.quizSession={ questions:prev.questions.sort(()=>Math.random()-0.5), idx:0, correct:0, mode:prev.mode, timeLeft:30, answers:[] };
  saveState();
  renderSession();
}

// ── Timer ─────────────────────────────────────────────────────
let timerInterval=null;

function startTimer(){
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    const qs=S.quizSession;
    if(!qs) return clearInterval(timerInterval);
    qs.timeLeft--;
    const arc=document.getElementById('timer-arc');
    const num=document.getElementById('timer-num');
    const ring=document.querySelector('.timer-ring');
    if(arc) arc.style.strokeDashoffset=`${125.6-125.6*(qs.timeLeft/30)}`;
    if(num){ num.textContent=qs.timeLeft+'s'; num.className=`text-2xl font-bold ${qs.timeLeft<=5?'text-red-400':'text-cyan-400'}`; }
    if(ring){ ring.className=`timer-ring w-14 h-14 ${qs.timeLeft<=5?'timer-urgent':''}`; }
    if(qs.timeLeft<=0){
      clearInterval(timerInterval);
      showToast('⏰ Time\'s up!','error');
      autoAnswer();
    }
  },1000);
}

function autoAnswer(){
  const qs=S.quizSession;
  if(!qs) return;
  const q=qs.questions[qs.idx];
  recordAnswer(q,false);
  qs.answers.push({q,given:null,correct:false});
  // disable all options
  document.querySelectorAll('.option-btn').forEach(b=>b.disabled=true);
  document.getElementById('solution-box')?.classList.remove('hidden');
  clearInterval(timerInterval);
}

// ── Answer handling ────────────────────────────────────────────
function answerQuestion(selected, idx){
  const qs=S.quizSession;
  if(!qs) return;
  clearInterval(timerInterval);
  const q=qs.questions[qs.idx];
  const isCorrect=(selected===q.answer);
  recordAnswer(q,isCorrect);
  adaptDifficulty(isCorrect);
  qs.answers.push({q,given:selected,correct:isCorrect});
  if(isCorrect) qs.correct++;

  // highlight buttons
  document.querySelectorAll('.option-btn').forEach((btn,i)=>{
    btn.disabled=true;
    if(q.options[i]===q.answer) btn.classList.add('correct');
    else if(i===idx && !isCorrect) btn.classList.add('wrong');
    else btn.classList.add('disabled-opt');
  });

  if(isCorrect) showToast('✅ Correct! +10 XP','success');
  else showToast(`❌ Wrong! Answer: ${q.answer}`,'error');

  // show solution in practice mode; auto-next in quiz
  if(qs.mode==='practice'){
    document.getElementById('solution-box')?.classList.remove('hidden');
  } else {
    setTimeout(()=>nextQuestion(),1200);
  }
}

function nextQuestion(){
  clearInterval(timerInterval);
  const qs=S.quizSession;
  if(!qs) return;
  qs.idx++;
  qs.timeLeft=30;
  if(qs.idx>=qs.questions.length){
    if(qs.isDaily){ S.dailyDone=true; addXP(50); showToast('🎉 Daily Challenge complete! +50 Bonus XP','info'); saveState(); }
    renderResults();
  } else {
    renderSession();
  }
}

function confirmExit(){
  clearInterval(timerInterval);
  if(confirm('Exit this session? Progress will be saved.')) renderHome();
  else if(S.quizSession?.mode==='quiz') startTimer();
}

// ── Init ───────────────────────────────────────────────────────
(function init(){
  checkStreak();
  renderHome();
  // Update mobile nav clicks live
  document.addEventListener('click',e=>{
    const btn=e.target.closest('.mob-nav-btn');
    if(btn){
      const id=btn.getAttribute('onclick')?.match(/'(\w+)'/)?.[1];
      if(id) navigate(id);
    }
  });
})();
