(()=>{
 const header=document.querySelector('.site-header'),toggle=document.getElementById('nav-toggle'),nav=document.getElementById('site-navigation');
 if(!header||!toggle||!nav)return;
 const mobile=matchMedia('(max-width:800px)');
 let navHadFocus=false;
 document.addEventListener('focusin',event=>{navHadFocus=nav.contains(event.target);});
 header.classList.add('nav-ready');
 function setOpen(open){
  header.classList.toggle('nav-open',open);
  toggle.setAttribute('aria-expanded',String(open));
  toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  toggle.querySelector('.nav-toggle-label').textContent=open?'Close':'Menu';
 }
 toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
 header.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&header.classList.contains('nav-open')){event.preventDefault();setOpen(false);toggle.focus();}
 });
 nav.addEventListener('click',event=>{if(event.target.closest('a')&&mobile.matches)setOpen(false);});
 document.addEventListener('click',event=>{if(mobile.matches&&!header.contains(event.target))setOpen(false);});
 header.addEventListener('focusout',event=>{if(event.relatedTarget&&!header.contains(event.relatedTarget))setOpen(false);});
 function onResize(){
  const hidingFocusedLink=mobile.matches&&(nav.contains(document.activeElement)||(navHadFocus&&document.activeElement===document.body));
  setOpen(false);
  if(hidingFocusedLink)toggle.focus();
 }
 mobile.addEventListener('change',onResize);onResize();
})();
