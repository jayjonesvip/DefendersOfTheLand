// Static additions to the existing launch page. No extra browser dependencies.
function mapPreview(geometry,landmarks){
 const features=geometry.features.filter(f=>f.geometry.type==='LineString'&&(f.properties.water||/Euclid|Superior|Ontario|Lakeside|West 3rd|East 9th/.test(f.properties.name)));
 const points=landmarks.filter(p=>!p.comingSoon).map(p=>[p.lng,p.lat]);
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const west=Math.min(...xs),east=Math.max(...xs),south=Math.min(...ys),north=Math.max(...ys),cos=Math.cos((north+south)/2*Math.PI/180);
 const scale=Math.min(592/((east-west)*cos),312/(north-south));
 const project=([lng,lat])=>[(320+(lng-(west+east)/2)*cos*scale).toFixed(1),(180-(lat-(north+south)/2)*scale).toFixed(1)];
 const paths=water=>features.filter(f=>Boolean(f.properties.water)===water).map(f=>f.geometry.coordinates.map((p,i)=>(i?'L':'M')+project(p).join(',')).join('')).join('');
 return `<svg class="world-map-preview" viewBox="0 0 640 360" width="640" height="360" role="img" aria-label="Preview of downtown Cleveland streets and the four mapped Book One landmarks"><path class="world-map-water" d="${paths(true)}"/><path class="world-map-streets" d="${paths(false)}"/>${landmarks.filter(p=>!p.comingSoon).map(p=>{const [x,y]=project([p.lng,p.lat]);return `<circle cx="${x}" cy="${y}" r="9"/>`;}).join('')}</svg>`;
}
function createLandingExtras({site,blurb,geometry,landmarks,escape:esc,img}){
 const announcement=`<aside class="launch-announcement" aria-label="Book Four release" data-announcement><div><p class="announcement-heading"><span class="launch-new-badge">NEW</span> <strong>Book Four is out now</strong></p><p>Clash in Cleveland, Book Four, is available in paperback and Kindle.</p></div><a class="button secondary" href="https://www.amazon.com/dp/B0HPBJWNMC" rel="noopener" aria-label="Get Clash in Cleveland paperback on Amazon">Get Book Four <span aria-hidden="true">→</span></a><button class="announcement-dismiss" type="button" data-dismiss-announcement hidden aria-label="Dismiss the Book Four announcement">×</button></aside>`;
 const about=`<section class="launch-about launch-added-section" aria-labelledby="launch-about-title"><div><p class="eyebrow">BOOK ONE · ORIGINS</p><h2 id="launch-about-title">About the book</h2></div><p>${esc(blurb.join(' '))}</p></section>`;
 const worlds=[
  {href:'characters.html',title:'Characters',description:'Meet the heroes, villains and allies of Defenders of the Land.',image:`<div class="world-character-collage">${img('jenny-pink-blur-transparent-v1.webp','Jenny Jenkins as Pink Blur')}${img('seth-civilian-transparent-v1.webp','Seth Zerdowski')}${img('billy-portrait-transparent-v1.webp','Inspector Billy')}</div>`},
  {href:'map.html',title:'Cleveland map',description:'Explore the downtown Cleveland landmark map.',image:mapPreview(geometry,landmarks),attribution:true},
  {href:'1990-vault.html',title:'From the Vault: 1990',description:'Explore the original notebook comic pages from 1990.',image:'<img src="/vault/1990/previews/p8_inspectorbilly_jungleheat-432.webp" alt="Page 8 of the 1990 notebook comics, featuring Inspector Billy and Jungle Heat" width="432" height="576" loading="lazy" decoding="async">'},
  {href:'author.html',title:'About the author',description:'Read Jay Jones’s story of the notebooks behind the books.',image:'<img src="assets/jay-jones-author.jpg" alt="Jay Jones, author of Defenders of the Land" width="300" height="300" loading="lazy" decoding="async">'}
 ];
 const explore=`<section class="launch-world launch-added-section" aria-labelledby="launch-world-title"><header class="launch-section-heading"><div><p class="eyebrow">DEFENDERS OF THE LAND</p><h2 id="launch-world-title">Explore the world</h2></div></header><div class="world-grid">${worlds.map(w=>`<article class="world-card"><a href="${w.href}"><div class="world-card-image">${w.image}</div><div class="world-card-copy"><h3>${esc(w.title)} <span aria-hidden="true">→</span></h3><p>${esc(w.description)}</p></div></a>${w.attribution?'<p class="world-map-attribution">Map data © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap contributors</a>.</p>':''}</article>`).join('')}</div></section>`;
 const readFree=`<section class="launch-free launch-added-section" aria-labelledby="launch-free-title"><div><p class="eyebrow">TRY THE STORY</p><h2 id="launch-free-title">Read free first</h2></div><div class="launch-free-actions"><a class="button" href="origins-chapter-1.html">Read Chapter 1 free <span aria-hidden="true">→</span></a><a class="button secondary" href="downloads.html">Get the 3-chapter PDF / EPUB <span aria-hidden="true">→</span></a></div></section>`;

 return {announcement,about,explore,readFree};
}
module.exports={createLandingExtras};
