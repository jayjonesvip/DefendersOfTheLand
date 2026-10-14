(()=>{
 const dialog=document.querySelector('.vault-lightbox');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const items=JSON.parse(document.getElementById('vault-gallery-data').textContent);
 const image=document.getElementById('vault-lightbox-image');
 const error=document.getElementById('vault-lightbox-error');
 let index=0,trigger=null,oldOverflow='',touch=null;
 function show(next){
  index=(next+items.length)%items.length;
  const item=items[index];
  document.getElementById('vault-lightbox-title').textContent=item.title;
  document.getElementById('vault-lightbox-caption').textContent=item.caption;
  document.getElementById('vault-lightbox-position').textContent=`${index+1} of ${items.length} · ${item.label==='END'?'Final page':'Page '+item.label}`;
  document.getElementById('vault-lightbox-original').href=item.original;
  image.alt=item.alt;image.width=item.width;image.height=item.height;
  image.hidden=false;error.hidden=true;
  image.src=item.original;
 }
 image.addEventListener('error',()=>{image.hidden=true;error.hidden=false;});
 document.querySelectorAll('[data-vault-index]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
  event.preventDefault();trigger=link;oldOverflow=document.body.style.overflow;
  show(Number(link.dataset.vaultIndex));dialog.showModal();document.body.style.overflow='hidden';
 }));
 dialog.querySelector('[data-vault-close]').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-vault-prev]').addEventListener('click',()=>show(index-1));
 dialog.querySelector('[data-vault-next]').addEventListener('click',()=>show(index+1));
 dialog.addEventListener('close',()=>{document.body.style.overflow=oldOverflow;trigger?.focus({preventScroll:true});image.removeAttribute('src');touch=null;});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='Tab'){
   const controls=[...dialog.querySelectorAll('button:not([disabled]),a[href]')].filter(control=>control.getClientRects().length);
   const current=controls.indexOf(document.activeElement);
   event.preventDefault();
   controls[(current+(event.shiftKey?-1:1)+controls.length)%controls.length]?.focus();
   return;
  }
  const next={'ArrowLeft':()=>show(index-1),'ArrowRight':()=>show(index+1),'Home':()=>show(0),'End':()=>show(items.length-1)}[event.key];
  if(next){event.preventDefault();next();}
 });
 dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
 });
 const stage=dialog.querySelector('.vault-lightbox-stage');
 stage.addEventListener('touchstart',event=>{touch=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
 stage.addEventListener('touchend',event=>{
  if(!touch||!event.changedTouches.length)return;
  const end=event.changedTouches[0],dx=end.clientX-touch.x,dy=end.clientY-touch.y;touch=null;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)show(index+(dx<0?1:-1));
 },{passive:true});
 stage.addEventListener('touchcancel',()=>{touch=null;},{passive:true});
})();
