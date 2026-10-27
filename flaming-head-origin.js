(() => {
 const trigger=document.querySelector('[data-comic-enlarge]');
 const dialog=document.querySelector('[data-comic-dialog]');
 if(!trigger||!dialog||typeof dialog.showModal!=='function')return;
 trigger.setAttribute('aria-haspopup','dialog');
 trigger.addEventListener('click',event=>{
  // Keep modified clicks available for opening the image in another tab.
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  dialog.showModal();
  document.documentElement.classList.add('comic-viewer-open');
  const viewport=dialog.querySelector('.comic-dialog-scroll');
  viewport.scrollTop=0;viewport.scrollLeft=0;
 });
 dialog.querySelector('[data-comic-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{
  document.documentElement.classList.remove('comic-viewer-open');
  trigger.focus({preventScroll:true});
 });
})();
