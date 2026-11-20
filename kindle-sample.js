/* Amazon owns the cross-origin reader; this file only manages the dialog shell. */
(()=>{
 const dialog=document.querySelector('#kindle-sample-dialog');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const title=dialog.querySelector('#kindle-sample-title');
 const close=dialog.querySelector('[data-sample-close]');
 const fallback=dialog.querySelector('[data-sample-fallback]');
 const reader=dialog.querySelector('[data-sample-reader]');
 let trigger,scrollY=0,bodyStyle;

 document.querySelectorAll('[data-kindle-sample]').forEach(button=>{
  button.setAttribute('role','button');
  button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-controls',dialog.id);
  button.addEventListener('keydown',event=>{
   if(event.key===' '){event.preventDefault();button.click();}
  });
  button.addEventListener('click',event=>{
   if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   event.preventDefault();
   if(dialog.open)return;
   trigger=button;
   title.textContent=button.dataset.sampleTitle;
   fallback.href=button.href;
   const url=new URL('https://read.amazon.com/kp/embed');
   url.search=new URLSearchParams({asin:button.dataset.kindleSample,preview:'inline',linkCode:'kpe',ref_:'cm_sw_r_kb_dp'});
   const iframe=document.createElement('iframe');
   iframe.title=`${button.dataset.sampleTitle} — Kindle sample`;
   iframe.src=url.href;
   iframe.allowFullscreen=true;
   // No eager frames, third-party scripts, or local copies of Kindle content.
   reader.replaceChildren(iframe);
   scrollY=window.scrollY;
   bodyStyle=document.body.getAttribute('style');
   Object.assign(document.body.style,{position:'fixed',top:`-${scrollY}px`,width:'100%',overflow:'hidden'});
   document.documentElement.classList.add('sample-open');
   dialog.showModal();
   close.focus();
  });
 });
 close.addEventListener('click',()=>dialog.close());
 // Keep shell keyboard navigation cycling within the modal, including Shift+Tab.
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  if(event.shiftKey&&document.activeElement===close){event.preventDefault();fallback.focus();}
  else if(!event.shiftKey&&document.activeElement===fallback){event.preventDefault();close.focus();}
 });
 // Native dialog handles Escape when focus is in this document. Amazon controls
 // keys inside its cross-origin iframe; the visible Close button is always available.
 dialog.addEventListener('close',()=>{
  reader.replaceChildren();
  document.documentElement.classList.remove('sample-open');
  if(bodyStyle===null)document.body.removeAttribute('style');
  else document.body.setAttribute('style',bodyStyle);
  window.scrollTo({top:scrollY,behavior:'instant'});
  trigger?.focus({preventScroll:true});
 });
})();
