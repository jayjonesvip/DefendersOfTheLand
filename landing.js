// Progressive enhancement: all content is visible without this script.
(()=>{
 const page=document.querySelector('.launch-page');
 if(!page||!('IntersectionObserver' in window))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const nodes=[...page.querySelectorAll('[data-reveal]')];
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.classList.remove('will-reveal');observer.unobserve(entry.target);}
 },{rootMargin:'0px 0px 64px 0px',threshold:0.05});
 for(const node of nodes)if(node.getBoundingClientRect().top>innerHeight+24){node.classList.add('will-reveal');observer.observe(node);}
 page.addEventListener('focusin',event=>{const node=event.target.closest('[data-reveal]');if(node){node.classList.remove('will-reveal');observer.unobserve(node);}});
 reduced.addEventListener('change',event=>{if(event.matches){observer.disconnect();for(const node of nodes)node.classList.remove('will-reveal');}});
})();
