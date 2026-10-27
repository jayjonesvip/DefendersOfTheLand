(() => {
 const triggers=document.querySelectorAll('[data-comic-enlarge]');
 const dialog=document.querySelector('[data-comic-dialog]');
 if(!triggers.length||!dialog||typeof dialog.showModal!=='function')return;
 const heading=dialog.querySelector('h2'),defaultTitle=heading.textContent;
 const enlargedImage=dialog.querySelector('img');
 let activeTrigger;
 for(const trigger of triggers){
  trigger.setAttribute('aria-haspopup','dialog');
  trigger.addEventListener('click',event=>{
  // Keep modified clicks available for opening the image in another tab.
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  activeTrigger=trigger;
  const thumbnail=trigger.querySelector('img');
  enlargedImage.src=trigger.href;
  enlargedImage.alt=thumbnail.alt;
  enlargedImage.width=Number(thumbnail.getAttribute('width'));
  enlargedImage.height=Number(thumbnail.getAttribute('height'));
  heading.textContent=trigger.dataset.comicTitle||defaultTitle;
  dialog.showModal();
  document.documentElement.classList.add('comic-viewer-open');
  const viewport=dialog.querySelector('.comic-dialog-scroll');
  viewport.scrollTop=0;viewport.scrollLeft=0;
  });
 }
 dialog.querySelector('[data-comic-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{
  if(dialog.open)return;
  document.documentElement.classList.remove('comic-viewer-open');
  activeTrigger?.focus({preventScroll:true});
 });
})();
