const landmarks=require('./map-landmarks.js');
function createMap({geometry,site,escape:esc}){
 const names=['','One','Two','Three','Four'];
 const photo=p=>{
  if(!p.photo)return '';
  const {src,alt,width,height,caption}=p.photo;
  if(!/^assets\/[a-zA-Z0-9._-]+$/.test(src)||!alt||!(width>0&&height>0))throw Error(`Provide a local approved photo, alt text and dimensions: ${p.id}`);
  return `<figure class="map-location-photo"><img src="${esc(src)}" alt="${esc(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
 };
 const cards=landmarks.map((p,i)=>{
  const pending=p.comingSoon;
  if(!pending&&(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||!/^\w[\w-]*-chapter-1\.html$/.test(p.chapterUrl)))throw Error(`Provide coordinates and a verified Chapter 1 URL: ${p.id}`);
  return `<article class="map-landmark-card${pending?' map-landmark-pending':''}" data-landmark-card="${esc(p.id)}" data-book="${p.book}" aria-labelledby="${esc(p.id)}-title">
   <div class="map-card-heading"><span class="map-card-number" aria-hidden="true">${pending?'—':i+1}</span><h3 id="${esc(p.id)}-title"><span class="map-static-name">${esc(p.name)}</span>${pending?'':`<button type="button" data-location="${esc(p.id)}" aria-pressed="false" aria-expanded="false" aria-controls="map-popup" hidden><span class="map-location-name">${esc(p.name)}</span> <span aria-hidden="true">→</span></button>`}</h3></div>
   <p class="map-book-tag">${pending?`Book ${names[p.book]} · Coming soon`:`Appears in ${p.books.length>1?'Books':'Book'} ${p.books.map(book=>names[book]).join(', ')}`}</p>
   <p class="map-card-blurb">${esc(p.blurb)}</p>
   ${photo(p)}
   ${pending?'<p class="map-pending-note">Locations coming soon. No coordinates or chapter links have been added.</p>':`<a class="map-read-link" href="${esc(p.chapterUrl)}" aria-label="Read Book ${names[p.book]}’s first chapter to explore ${esc(p.name)}">Read Book ${names[p.book]}’s first chapter <span aria-hidden="true">→</span></a><noscript>${p.books.filter(book=>book!==p.book).map(book=>`<p><a class="map-read-link" href="${esc(p.appearances[book].chapterUrl)}">Read Book ${names[book]}’s first chapter <span aria-hidden="true">→</span></a></p>`).join('')}</noscript>`}
  </article>`;
 }).join('');
 const amazon=(href,text,label,cls='button secondary')=>`<a href="${esc(href)}" class="${cls}" rel="noopener" aria-label="${esc(label)}">${text}</a>`;
 return `<section class="contents map-page">
  <header class="map-hero"><p class="eyebrow">DEFENDERS OF THE LAND · CLEVELAND, 1987</p><h1>Explore the Land</h1><p>Explore Cleveland, the setting of Defenders of the Land.</p></header>
  <div id="story-map">
   <fieldset class="map-book-filters" data-map-filters hidden><legend>Explore by book</legend><div>${['All','Book 1','Book 2','Book 3','Book 4'].map((label,i)=>`<button type="button" data-map-book="${i||'all'}" aria-pressed="${i===0}" aria-controls="map-landmark-list">${label}${i>0&&!landmarks.some(p=>p.books.includes(i))?'<span>Coming soon</span>':''}</button>`).join('')}</div></fieldset>
   <p class="map-live-status" id="map-status" role="status" aria-live="polite" aria-atomic="true">Four Cleveland landmarks across all four books.</p>
   <div class="map-layout">
    <div class="map-visual-column">
     <div class="map-map-toolbar" data-map-controls hidden><div><button type="button" data-map-zoom="in" aria-label="Zoom in on the map">+</button><button type="button" data-map-zoom="out" aria-label="Zoom out on the map">−</button></div><button type="button" data-map-reset>Show all locations</button></div>
     <div class="story-map-canvas" id="story-map-canvas" role="region" aria-label="Interactive downtown Cleveland landmark map">
      <svg role="img" aria-label="OpenStreetMap street and shoreline geometry for downtown Cleveland"></svg>
      <p class="map-static-help">Enable JavaScript to explore the interactive map. Landmark links are available below.</p>
      <div class="map-empty" hidden><h2>Locations coming soon</h2><p>No locations have been added for this book.</p></div>
      <section class="story-map-popup" id="map-popup" aria-labelledby="map-popup-title" hidden><button type="button" data-map-close aria-label="Close selected landmark details">×</button><p class="eyebrow map-popup-book"></p><h2 id="map-popup-title"></h2><p class="map-popup-blurb"></p><a class="map-read-link" href="origins-chapter-1.html">Read where it happens <span aria-hidden="true">→</span></a></section>
     </div>
     <p class="map-use-note" data-map-controls hidden>Choose a landmark to focus the map. Use +/− to zoom; drag with a mouse to pan. Scroll or swipe to move down the page.</p>
     <p class="map-note">Book One takes place in 1987. This locator uses current street geography. Fictional locations do not have exact mapped addresses.</p>
     <p class="map-attribution">Map data © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap contributors</a>.</p>
    </div>
    <section class="map-landmarks" aria-labelledby="map-landmarks-title"><h2 id="map-landmarks-title">Landmarks</h2><p class="map-list-intro">Select a name to find it on the map.</p><div class="map-landmark-list" id="map-landmark-list">${cards}</div></section>
   </div>
  </div>
  <section class="map-closing" aria-labelledby="map-closing-title"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="map-closing-title">Walk the streets in the story</h2></div><div class="map-closing-links"><div class="actions"><a class="button" href="origins-chapter-1.html">Read Chapter 1 free <span aria-hidden="true">→</span></a><a class="button secondary" href="downloads.html">Get the free sample</a></div><div class="actions">${amazon(site.paperback.url,'Buy Book One paperback','Buy Origins paperback on Amazon')}${amazon(site.ebook.url,'Continue Book One on Kindle →','Continue Book One: Origins on Kindle','button secondary map-chapter-link')}</div>${amazon(site.amazonSeriesUrl,'View series on Amazon <span aria-hidden="true">→</span>','View the Defenders of the Land series on Amazon','map-series-link')}</div></section>
 </section><script type="application/json" id="story-map-data">${JSON.stringify({geometry}).replace(/</g,'\\u003c')}</script><script defer src="assets/d3-7.9.0.min.js"></script><script defer src="map-landmarks.js"></script><script defer src="story-map.js"></script>`;
}
module.exports={createMap};
