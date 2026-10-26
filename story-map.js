(()=>{
 const root=document.getElementById('story-map');
 if(!root||typeof d3==='undefined'||!Array.isArray(window.defendersLandmarks))return;
 const map=root.querySelector('.story-map-canvas'),svg=d3.select(map.querySelector('svg'));
 const {geometry}=JSON.parse(document.getElementById('story-map-data').textContent);
 const locations=window.defendersLandmarks,ready=locations.filter(p=>!p.comingSoon&&Number.isFinite(p.lat)&&Number.isFinite(p.lng));
 const cards=[...root.querySelectorAll('[data-landmark-card]')],list=[...root.querySelectorAll('[data-location]')];
 const filters=[...root.querySelectorAll('[data-map-book]')],popup=root.querySelector('#map-popup'),status=root.querySelector('#map-status');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let filter='all',selected=null,opened=false,projection,layer,transform=d3.zoomIdentity,width=0,height=0;
 const active=p=>filter==='all'||p.books.includes(Number(filter));
 const view=p=>filter==='all'?p:{...p,...p.appearances[filter],book:Number(filter)};
 const names=['','One','Two','Three','Four'];
 const tag=p=>(filter==='all'?`Appears in ${p.books.length>1?'Books':'Book'} ${p.books.map(book=>names[book]).join(', ')}`:`Appears in Book ${names[Number(filter)]}`)+(p.fictional?' · Fictional location':'');
 const points=new Map();
 const pins=new Map(ready.map(p=>{
  const button=document.createElement('button');button.type='button';button.className='story-map-pin';
  button.dataset.marker=p.id;button.setAttribute('aria-label',`${locations.indexOf(p)+1}. ${p.name}${p.fictional?', approximate fictional location':''}`);
  button.setAttribute('aria-controls','map-popup');button.setAttribute('aria-expanded','false');button.setAttribute('aria-pressed','false');
  const label=document.createElement('span');label.textContent=p.shortLabel||locations.indexOf(p)+1;button.append(label);
  if(p.fictional){const caption=document.createElement('span');caption.className='map-hq-caption';caption.textContent=p.name;caption.setAttribute('aria-hidden','true');button.append(caption);}
  button.addEventListener('click',()=>select(p,true));map.append(button);return [p.id,button];
 }));
 const zoom=d3.zoom().scaleExtent([1,4]).touchable(()=>false).filter(event=>
  ready.some(active)&&!event.target.closest('button,a,.story-map-popup')&&
  (event.type==='wheel'?event.ctrlKey:event.type==='mousedown'&&event.button===0)
 ).on('zoom',event=>{transform=event.transform;position();});
 const canvas=d3.select(map).call(zoom).on('dblclick.zoom',null);
 function moveTo(next){canvas.interrupt();if(reduced.matches)canvas.call(zoom.transform,next);else canvas.transition().duration(260).call(zoom.transform,next);}
 function position(){
  if(!layer)return;layer.attr('transform',transform.toString());
  for(const p of ready){const pin=pins.get(p.id),point=points.get(p.id);if(!point)continue;const [x,y]=transform.apply(point);pin.style.left=x+'px';pin.style.top=y+'px';pin.hidden=!active(p)||x<0||x>width||y<0||y>height;}
  map.dataset.zoom=transform.k.toFixed(3);
 }
 function selectionState(){
  for(const button of [...pins.values(),...list]){const id=button.dataset.marker||button.dataset.location,chosen=selected?.id===id;button.setAttribute('aria-pressed',String(chosen));button.setAttribute('aria-expanded',String(chosen&&opened));}
  for(const card of cards)card.classList.toggle('is-selected',card.dataset.landmarkCard===selected?.id);
  popup.hidden=!opened||!selected;
 }
 function select(p,save=false,animate=true){
  if(!active(p))applyFilter(String(p.book));selected=p;opened=true;
  const shown=view(p);
  popup.querySelector('.map-popup-book').textContent=tag(p);
  popup.querySelector('#map-popup-title').textContent=shown.name;popup.querySelector('.map-popup-blurb').textContent=shown.blurb;
  const link=popup.querySelector('a');link.href=shown.chapterUrl;link.textContent=`Read Book ${names[shown.book]}’s first chapter →`;link.setAttribute('aria-label',`Read Book ${names[shown.book]}’s first chapter to explore ${shown.name}`);
  selectionState();status.textContent=`Selected ${shown.name}. ${tag(p)}.`;
  const point=points.get(p.id);if(point){const k=1.5,next=d3.zoomIdentity.translate(width/2-k*point[0],height*.35-k*point[1]).scale(k);if(animate)moveTo(next);else canvas.interrupt().call(zoom.transform,next);}
  if(save)history.replaceState(null,'','#'+p.id);
 }
 function applyFilter(value){
  filter=value;opened=false;selected=null;selectionState();
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapBook===value)));
  cards.forEach(card=>{
   const p=ready.find(p=>p.id===card.dataset.landmarkCard);card.hidden=!p||!active(p);if(card.hidden)return;
   const shown=view(p),button=card.querySelector('[data-location]'),link=card.querySelector('.map-read-link');
   button.querySelector('.map-location-name').textContent=shown.name;
   card.querySelector('.map-book-tag').textContent=tag(p);card.querySelector('.map-card-blurb').textContent=shown.blurb;
   link.href=shown.chapterUrl;link.textContent=`Read Book ${names[shown.book]}’s first chapter →`;
   link.setAttribute('aria-label',`Read Book ${names[shown.book]}’s first chapter to explore ${shown.name}`);
   pins.get(p.id).setAttribute('aria-label',`${locations.indexOf(p)+1}. ${shown.name}${p.fictional?', approximate fictional location':''}`);
  });
  const count=ready.filter(active).length;root.querySelector('.map-empty').hidden=count>0;
  root.querySelectorAll('[data-map-zoom],[data-map-reset]').forEach(b=>b.disabled=!count);
  status.textContent=count?`Showing ${count} landmarks${value==='all'?'':` from Book ${value}`}.`:`Book ${value} locations coming soon. No locations have been added.`;
  canvas.interrupt().call(zoom.transform,d3.zoomIdentity);
 }
 function draw(){
  const oldWidth=width,oldHeight=height;width=map.clientWidth;height=map.clientHeight;
  if(width===oldWidth&&height===oldHeight)return;
  svg.attr('viewBox',`0 0 ${width} ${height}`);svg.selectAll('*').remove();svg.append('title').text('Downtown Cleveland streets, shoreline and book landmarks');layer=svg.append('g');
  projection=d3.geoMercator().center([-81.695,41.504]).scale(Math.min(width/.021,height/.020)*180/Math.PI).translate([width/2,height/2]);
  const path=d3.geoPath(projection);
  layer.append('g').selectAll('path').data(geometry.features).join('path').attr('class',f=>f.properties.water?'map-shore':'map-roads').attr('d',path);
  ready.forEach(p=>{const [x,y]=projection([p.lng,p.lat]),dx=p.id==='union-terminal'?-46:p.id==='main-library'?20:0,dy=p.id==='union-terminal'?15:p.id==='main-library'?-10:0;points.set(p.id,[x+dx,y+dy]);if(dx||dy)layer.append('line').attr('x1',x).attr('y1',y).attr('x2',x+dx).attr('y2',y+dy).attr('class','map-leader');});
  const lake=projection([-81.696,41.5108]);layer.append('text').attr('class','map-place-label').attr('x',lake[0]).attr('y',lake[1]).attr('text-anchor','middle').text('LAKE ERIE');
  canvas.interrupt().call(zoom.transform,d3.zoomIdentity);if(selected&&opened)select(selected,false,false);else position();
 }
 root.classList.add('map-ready');root.querySelectorAll('[data-map-filters],[data-map-controls],[data-location]').forEach(n=>n.hidden=false);
 list.forEach(button=>button.addEventListener('click',()=>select(ready.find(p=>p.id===button.dataset.location),true)));
 filters.forEach(button=>button.addEventListener('click',()=>{applyFilter(button.dataset.mapBook);history.replaceState(null,'',location.pathname+location.search);}));
 root.querySelectorAll('[data-map-zoom]').forEach(b=>b.addEventListener('click',()=>{const factor=b.dataset.mapZoom==='in'?1.35:1/1.35,k=Math.max(1,Math.min(4,transform.k*factor)),[x,y]=transform.invert([width/2,height/2]);moveTo(d3.zoomIdentity.translate(width/2-k*x,height/2-k*y).scale(k));}));
 root.querySelector('[data-map-reset]').addEventListener('click',()=>{opened=false;selected=null;selectionState();moveTo(d3.zoomIdentity);status.textContent='Showing all locations in the current book filter.';history.replaceState(null,'',location.pathname+location.search);});
 const close=()=>{opened=false;selectionState();pins.get(selected?.id)?.focus({preventScroll:true});};
 popup.querySelector('[data-map-close]').addEventListener('click',close);
 root.addEventListener('keydown',event=>{if(event.key==='Escape'&&opened){event.preventDefault();close();}});
 const fromHash=()=>{const p=ready.find(p=>p.id===location.hash.slice(1));if(p)select(p,false,false);};
 draw();applyFilter('all');fromHash();new ResizeObserver(draw).observe(map);window.addEventListener('hashchange',fromHash);
})();
