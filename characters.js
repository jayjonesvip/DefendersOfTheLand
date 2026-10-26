// Progressive enhancement: without JavaScript every character stays visible.
(()=>{
 const controls=document.querySelector('[data-character-filters]');
 const status=document.querySelector('[data-character-status]');
 const grid=document.getElementById('character-grid');
 if(!controls||!status||!grid)return;
 const cards=[...grid.querySelectorAll('[data-character-group]')];
 const buttons=[...controls.querySelectorAll('[data-character-filter]')];
 status.textContent=`Showing all ${cards.length} characters.`;
 controls.hidden=false;status.hidden=false;
 for(const button of buttons)button.addEventListener('click',()=>{
  const filter=button.dataset.characterFilter;
  for(const control of buttons)control.setAttribute('aria-pressed',String(control===button));
  for(const card of cards)card.hidden=filter!=='all'&&card.dataset.characterGroup!==filter;
  const count=cards.filter(card=>!card.hidden).length;
  status.textContent=filter==='all'?`Showing all ${count} characters.`:`Showing ${count} ${button.textContent.toLowerCase()}.`;
 });
})();
