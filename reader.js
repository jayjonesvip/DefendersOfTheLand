(()=>{
const key='defenders-book-progress-v8',settingsKey='defenders-book-settings-v1';
const storage={get(k){try{return JSON.parse(localStorage.getItem(k))}catch{return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}}};
const count=Number(document.body.dataset.chapterCount);
const activeBook=document.body.dataset.bookId||'origins';
const bookCounts=JSON.parse(document.body.dataset.bookCounts||JSON.stringify({origins:count}));
const valid=id=>{if(typeof id!=='string')return false;const match=/^([a-z0-9-]+):(\d+)$/.exec(id);return !!match&&Object.hasOwn(bookCounts,match[1])&&Number(match[2])>=1&&Number(match[2])<=bookCounts[match[1]]};
let raw=storage.get(key);
if(!raw){
 raw=storage.get('defenders-book-progress-v7');
 if(!raw){
 raw=storage.get('defenders-book-progress-v6');
 if(!raw){
 raw=storage.get('defenders-book-progress-v5');
 if(!raw){
 raw=storage.get('defenders-book-progress-v4');
 if(!raw){
 raw=storage.get('defenders-book-progress-v3');
 if(!raw){
 let old=storage.get('defenders-book-progress-v2');
 if(!old){const legacy=storage.get('defenders-book-progress-v1');const migrate=id=>{if(typeof id!=='string'||!/^origins:\d+$/.test(id))return null;const n=Number(id.split(':')[1])-1;return n>=1&&n<=14?'origins:'+n:null};old={read:(Array.isArray(legacy?.read)?legacy.read:[]).map(migrate).filter(Boolean),positions:Object.fromEntries(Object.entries(legacy?.positions||{}).map(([id,p])=>[migrate(id),p]).filter(([id])=>id)),last:migrate(legacy?.last)};}
 const shift=id=>{if(typeof id!=='string'||!/^origins:\d+$/.test(id))return null;const n=Number(id.split(':')[1]);return n>=1&&n<=14?'origins:'+(n===1?1:n+1):null};
 raw={read:(Array.isArray(old.read)?old.read:[]).flatMap(id=>id==='origins:1'?['origins:1','origins:2']:[shift(id)]).filter(Boolean),positions:Object.fromEntries(Object.entries(old.positions||{}).filter(([id])=>id!=='origins:1').map(([id,p])=>[shift(id),p]).filter(([id])=>id)),last:shift(old.last)};
 }
 const reorder=id=>id==='origins:6'?'origins:7':id==='origins:7'?'origins:6':id;
 raw={read:(Array.isArray(raw.read)?raw.read:[]).map(reorder),positions:Object.fromEntries(Object.entries(raw.positions||{}).map(([id,p])=>[reorder(id),p])),last:reorder(raw.last)};
 }
 const compact=(id,resume=false)=>{if(typeof id!=='string'||!/^origins:\d+$/.test(id))return null;const n=Number(id.split(':')[1]);if(n<1||n>15)return null;if(n===7||n===9)return resume?'origins:'+(n===7?7:8):null;return 'origins:'+(n-(n>7?1:0)-(n>9?1:0))};
 raw={read:(Array.isArray(raw.read)?raw.read:[]).map(id=>compact(id)).filter(Boolean),positions:Object.fromEntries(Object.entries(raw.positions||{}).map(([id,p])=>[compact(id),p]).filter(([id])=>id)),last:compact(raw.last,true)};
 }
 const opening=id=>{if(typeof id!=='string'||!/^origins:\d+$/.test(id))return null;const n=Number(id.split(':')[1]);return n>=1&&n<=13?'origins:'+({1:3,2:4,3:5,4:6,5:1,6:2}[n]||n):null};
 raw={read:(Array.isArray(raw.read)?raw.read:[]).map(opening).filter(Boolean),positions:Object.fromEntries(Object.entries(raw.positions||{}).map(([id,p])=>[opening(id),p]).filter(([id])=>id)),last:opening(raw.last)};
 }
 const funding=id=>{if(typeof id!=='string'||!/^origins:\d+$/.test(id))return null;const n=Number(id.split(':')[1]);return n>=1&&n<=13?'origins:'+(n>=5?n+1:n):null};
 raw={read:(Array.isArray(raw.read)?raw.read:[]).map(funding).filter(Boolean),positions:Object.fromEntries(Object.entries(raw.positions||{}).map(([id,p])=>[funding(id),p]).filter(([id])=>id)),last:funding(raw.last)};
 }
 const direct=(id,resume=false)=>{if(typeof id!=='string'||!/^origins:\d+$/.test(id))return null;const n=Number(id.split(':')[1]);if(n<1||n>14)return null;if(n===9)return resume?'origins:9':null;return 'origins:'+(n>9?n-1:n)};
 raw={read:(Array.isArray(raw.read)?raw.read:[]).map(id=>direct(id)).filter(Boolean),positions:Object.fromEntries(Object.entries(raw.positions||{}).map(([id,p])=>[direct(id),p]).filter(([id])=>id)),last:direct(raw.last,true)};
}
const state={read:[...new Set((Array.isArray(raw.read)?raw.read:[]).filter(valid))],positions:raw.positions&&typeof raw.positions==='object'?raw.positions:{},last:valid(raw.last)?raw.last:null,lastByBook:Object.fromEntries(Object.entries(raw.lastByBook||{}).filter(([book,id])=>valid(id)&&id.split(':')[0]===book))};
if(state.last&&!state.lastByBook[state.last.split(':')[0]])state.lastByBook[state.last.split(':')[0]]=state.last;
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
