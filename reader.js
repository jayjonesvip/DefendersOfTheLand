(()=>{
const key='defenders-preview-progress-v1',settingsKey='defenders-book-settings-v1';
const storage={get(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}};
const count=Number(document.body.dataset.chapterCount),activeBook=document.body.dataset.bookId||'origins';
const bookCounts=JSON.parse(document.body.dataset.bookCounts||JSON.stringify({origins:count}));
const valid=id=>typeof id==='string'&&/^([a-z0-9-]+):1$/.test(id)&&Object.hasOwn(bookCounts,id.split(':')[0]);
// Keep the former complete-reader progress untouched under its original storage key.
const raw=storage.get(key)||{};
const state={read:[...new Set((Array.isArray(raw.read)?raw.read:[]).filter(valid))],positions:raw.positions&&typeof raw.positions==='object'?raw.positions:{},last:valid(raw.last)?raw.last:null,lastByBook:Object.fromEntries(Object.entries(raw.lastByBook||{}).filter(([book,id])=>valid(id)&&id.split(':')[0]===book))};
storage.set(key,state);
const saved=storage.get(settingsKey)||{},settings={size:[18,20,22,24,26].includes(saved.size)?saved.size:20,dark:saved.dark===true};
function apply(){document.body.classList.toggle('dark',settings.dark);document.documentElement.style.setProperty('--prose-size',settings.size+'px');const theme=document.getElementById('theme');if(theme){theme.textContent=settings.dark?'Light mode':'Dark mode';theme.setAttribute('aria-pressed',String(settings.dark))}storage.set(settingsKey,settings)}apply();
const theme=document.getElementById('theme');if(theme)theme.onclick=()=>{settings.dark=!settings.dark;apply()};
document.querySelectorAll('[data-read]').forEach(el=>{if(state.read.includes(el.dataset.read)){el.textContent='✓ Read';el.closest('li').classList.add('completed')}});
document.querySelectorAll('[data-book-progress]').forEach(el=>{const book=el.dataset.bookProgress;el.textContent=`${state.read.filter(id=>id.split(':')[0]===book).length} of ${bookCounts[book]} chapters completed`});
document.querySelectorAll('[data-reveal]').forEach(el=>{if(state.read.includes(el.dataset.reveal)){el.querySelector('.profile-details').hidden=false;el.querySelector('.sealed-message').hidden=true}});
document.querySelectorAll('[data-resume]').forEach(el=>{const last=state.lastByBook[el.dataset.resume||activeBook];if(valid(last)){el.href=last.replace(':','-chapter-')+'.html';el.hidden=false}});
const reader=document.querySelector('[data-chapter]');if(!reader)return;
const id=reader.dataset.chapter,position=state.positions[id];state.last=id;state.lastByBook[activeBook]=id;storage.set(key,state);
if(Number.isFinite(position)&&position>0&&position<1){document.getElementById('resume-position').hidden=false;document.getElementById('restore').onclick=()=>scrollTo({top:position*Math.max(0,document.documentElement.scrollHeight-innerHeight),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
document.querySelectorAll('[data-font]').forEach(el=>el.onclick=()=>{settings.size=Math.min(26,Math.max(18,settings.size+(el.dataset.font==='+'?2:-2)));apply()});
document.getElementById('focus').onclick=e=>{const enabled=document.body.classList.toggle('focus-mode');e.currentTarget.setAttribute('aria-pressed',String(enabled));e.currentTarget.textContent=enabled?'Exit focus':'Focus mode'};
let timer,completed=false;
function update(save=false){const body=reader.querySelector('.chapter-body'),start=body.getBoundingClientRect().top+scrollY,end=start+body.offsetHeight-innerHeight;const ratio=Math.min(1,Math.max(0,(scrollY-start)/Math.max(1,end-start)));document.getElementById('reading-progress').value=ratio*100;document.getElementById('percent').textContent=Math.round(ratio*100)+'%';if(save&&!completed){state.positions[id]=Math.min(1,Math.max(0,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));storage.set(key,state)}}
document.querySelector('[data-complete]').addEventListener('click',e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;completed=true;clearTimeout(timer);if(!state.read.includes(id))state.read.push(id);state.positions[id]=1;state.last=valid(e.currentTarget.dataset.next)?e.currentTarget.dataset.next:id;state.lastByBook[activeBook]=state.last;storage.set(key,state)});
addEventListener('scroll',()=>{update();clearTimeout(timer);timer=setTimeout(()=>update(true),250)},{passive:true});addEventListener('pagehide',()=>update(true));addEventListener('resize',()=>update());addEventListener('load',()=>update());update();
})();
