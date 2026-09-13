
const Q = window.QUESTIONS;
const subjects = [...new Set(Q.map(q=>q.subject))];
const state={index:0,answers:Array(Q.length).fill(null),flags:Array(Q.length).fill(false),seconds:240*60,finished:false};
const $=id=>document.getElementById(id);
const startScreen=$('startScreen'), testScreen=$('testScreen'), resultScreen=$('resultScreen');
$('agree').addEventListener('change',e=>$('startBtn').disabled=!e.target.checked);
$('startBtn').addEventListener('click',()=>{startScreen.classList.add('hidden');testScreen.classList.remove('hidden');buildSidebar();render();startTimer();});
function buildSidebar(){const host=$('subjectNav');host.innerHTML='';subjects.forEach(s=>{const wrap=document.createElement('div');wrap.className='subject-block';const h=document.createElement('h4');h.textContent=s;wrap.appendChild(h);const grid=document.createElement('div');grid.className='qgrid';Q.forEach((q,i)=>{if(q.subject!==s)return;const b=document.createElement('button');b.className='qdot';b.textContent=q.subjectNo;b.dataset.i=i;b.onclick=()=>{state.index=i;render();$('sidebar').classList.remove('open')};grid.appendChild(b)});wrap.appendChild(grid);host.appendChild(wrap)});updateSidebar()}
function updateSidebar(){document.querySelectorAll('.qdot').forEach(b=>{const i=+b.dataset.i;b.classList.toggle('answered',state.answers[i]!==null);b.classList.toggle('flagged',state.flags[i]);b.classList.toggle('current',i===state.index)});const n=state.answers.filter(x=>x!==null).length;$('answeredCount').textContent=`${n} / ${Q.length}`;$('mobileProgress').textContent=`${n}/${Q.length}`}
function render(){const q=Q[state.index];$('qSubject').textContent=q.subject;$('subjectTop').textContent=q.subject;$('qNumber').textContent=`${q.subjectNo}-сұрақ · жалпы ${q.id}/120`;$('qText').textContent=q.text;const p=$('passageBox');if(q.passage){p.textContent=q.passage;p.classList.remove('hidden')}else p.classList.add('hidden');const img=$('qImage');if(q.image){img.src=q.image;img.classList.remove('hidden')}else{img.classList.add('hidden');img.removeAttribute('src')}const box=$('options');box.innerHTML='';q.options.forEach((o,k)=>{const d=document.createElement('div');d.className='option'+(state.answers[state.index]===k?' selected':'');d.innerHTML=`<div class="opt-letter">${String.fromCharCode(65+k)}</div><div>${escapeHtml(o)}</div>`;d.onclick=()=>{state.answers[state.index]=k;save();render()};box.appendChild(d)});$('flagCheck').checked=state.flags[state.index];$('prevBtn').disabled=state.index===0;$('nextBtn').textContent=state.index===Q.length-1?'Аяқтауға өту →':'Келесі →';updateSidebar();save()}
$('flagCheck').addEventListener('change',e=>{state.flags[state.index]=e.target.checked;updateSidebar();save()});
$('prevBtn').onclick=()=>{if(state.index>0){state.index--;render()}};$('nextBtn').onclick=()=>{if(state.index<Q.length-1){state.index++;render()}else openFinish()};
$('finishBtn').onclick=openFinish;function openFinish(){const n=state.answers.filter(x=>x!==null).length;$('modalInfo').textContent=`${n} сұраққа жауап берілді, ${Q.length-n} сұрақ бос.`;$('confirmModal').classList.remove('hidden')}
$('cancelFinish').onclick=()=>$('confirmModal').classList.add('hidden');$('confirmFinish').onclick=finish;
$('toggleSidebar').onclick=()=>$('sidebar').classList.toggle('open');
let timerId;function startTimer(){timerId=setInterval(()=>{if(state.finished)return;if(state.seconds<=0){finish();return}state.seconds--;updateTimer();save()},1000);updateTimer()}
function updateTimer(){const h=String(Math.floor(state.seconds/3600)).padStart(2,'0'),m=String(Math.floor(state.seconds%3600/60)).padStart(2,'0'),s=String(state.seconds%60).padStart(2,'0');$('timer').textContent=`${h}:${m}:${s}`}
function finish(){state.finished=true;clearInterval(timerId);$('confirmModal').classList.add('hidden');testScreen.classList.add('hidden');resultScreen.classList.remove('hidden');localStorage.removeItem('ubt_demo_state_v2');showResult();window.scrollTo(0,0)}
function showResult(){let total=0;const stats={};subjects.forEach(s=>stats[s]={ok:0,total:0});Q.forEach((q,i)=>{stats[q.subject].total++;if(state.answers[i]===q.correct){total++;stats[q.subject].ok++}});$('scoreText').textContent=`${total} / ${Q.length}`;const pct=Math.round(total/Q.length*100);$('scoreMessage').textContent=pct>=75?'Өте жақсы нәтиже! Әлсіз тақырыптарды қайталап, толық нұсқаларды жалғастырыңыз.':pct>=50?'Жақсы бастама. Қате сұрақтарды талдап, әлсіз бөлімдерді бекітіңіз.':'Негізгі тақырыптарды қайта қарап, тестті тағы бір рет тапсырып көріңіз.';const box=$('subjectResults');box.innerHTML='';subjects.forEach(s=>{const v=stats[s];const p=Math.round(v.ok/v.total*100);box.innerHTML+=`<div class="result-item"><b>${s}</b><div>${v.ok} / ${v.total} дұрыс</div><div class="bar"><i style="width:${p}%"></i></div></div>`});}
$('reviewBtn').onclick=()=>{const list=$('reviewList');list.classList.toggle('hidden');if(!list.dataset.built){Q.forEach((q,i)=>{if(state.answers[i]===q.correct)return;const d=document.createElement('div');d.className='review-q';const user=state.answers[i]===null?'Жауап берілмеді':`${String.fromCharCode(65+state.answers[i])}) ${q.options[state.answers[i]]}`;const cor=`${String.fromCharCode(65+q.correct)}) ${q.options[q.correct]}`;d.innerHTML=`<h4>${q.id}. ${escapeHtml(q.text)}</h4><p class="bad">Сіздің жауабыңыз: ${escapeHtml(user)}</p><p class="good">Дұрыс жауап: ${escapeHtml(cor)}</p><p>${escapeHtml(q.explanation||'')}</p>`;list.appendChild(d)});list.dataset.built='1'} };
$('restartBtn').onclick=()=>location.reload();
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function save(){if(state.finished)return;localStorage.setItem('ubt_demo_state_v2',JSON.stringify({index:state.index,answers:state.answers,flags:state.flags,seconds:state.seconds}))}


// ---- Screen calculator ----
const calcModal=$('calcModal'), calcDisplay=$('calcDisplay'), calcExpr=$('calcExpr');
let calcInput='';
function openCalc(){calcModal.classList.remove('hidden');calcModal.setAttribute('aria-hidden','false')}
function closeCalc(){calcModal.classList.add('hidden');calcModal.setAttribute('aria-hidden','true')}
$('calcBtn').onclick=openCalc;$('calcClose').onclick=closeCalc;
calcModal.addEventListener('click',e=>{if(e.target===calcModal)closeCalc()});
function calcRender(v){calcDisplay.value=(v===''?'0':v);calcExpr.textContent=calcInput||' '}
function safeEval(expr){
  if(!expr || !/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('bad');
  const out=Function('"use strict";return ('+expr+')')();
  if(!Number.isFinite(out)) throw new Error('bad');
  return Math.round((out+Number.EPSILON)*1e12)/1e12;
}
function calcAct(a){
  try{
    if(a==='clear'){calcInput='';calcRender('');return}
    if(a==='back'){calcInput=calcInput.slice(0,-1);calcRender(calcInput);return}
    if(a==='equals'){const v=safeEval(calcInput);calcInput=String(v);calcRender(calcInput);return}
    if(a==='sqrt'){const base=calcInput? safeEval(calcInput):0;if(base<0)throw new Error('bad');calcInput=String(Math.sqrt(base));calcRender(calcInput);return}
    if(a==='square'){const base=calcInput? safeEval(calcInput):0;calcInput=String(base*base);calcRender(calcInput);return}
    if(a==='percent'){const base=calcInput? safeEval(calcInput):0;calcInput=String(base/100);calcRender(calcInput);return}
    if(/[0-9.+\-*/()]/.test(a)){calcInput+=a;calcRender(calcInput)}
  }catch(e){calcDisplay.value='Қате';setTimeout(()=>calcRender(calcInput),700)}
}
document.querySelectorAll('[data-calc]').forEach(b=>b.addEventListener('click',()=>calcAct(b.dataset.calc)));
document.addEventListener('keydown',e=>{
  if(calcModal.classList.contains('hidden'))return;
  if(e.key==='Escape'){closeCalc();return}
  if(e.key==='Enter'){e.preventDefault();calcAct('equals');return}
  if(e.key==='Backspace'){e.preventDefault();calcAct('back');return}
  if('0123456789.+-*/()'.includes(e.key)){e.preventDefault();calcAct(e.key)}
});
