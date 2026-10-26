// Render a complete static page using the existing approved book/sample metadata.
function createDownloads({books,site,downloads,escape:esc,img,link}){
 const words=['','One','Two','Three','Four'];
 const label=b=>`Book ${words[b.number]}`;
 const purchase=b=>b.number===1?site:b;
 const amazon=(href,text,aria,cls='button secondary')=>`<a class="${cls}" href="${esc(href)}" rel="noopener" aria-label="${esc(aria)}">${text}</a>`;
 const editionLinks=(b,short=false)=>{
  const p=purchase(b);
  return amazon(p.paperback.url,short?'Paperback':'Buy paperback',`Buy ${b.title} paperback on Amazon`)+amazon(p.ebook.url,short?'Kindle':'Buy Kindle',`Buy ${b.title} Kindle ebook on Amazon`);
 };
 const downloadLinks=downloads.samples.map(d=>{
  const format=d.file.endsWith('.pdf')?'PDF':'EPUB';
  const size=`${(d.bytes/1048576).toFixed(1)} MB`;
  const detail=`${d.pages?`${d.pages} pages · `:''}${size}`;
  return `<a class="button sample-download" href="books/${esc(d.file)}" download type="${esc(d.mediaType)}" aria-label="Download the Origins first three chapters as ${format}, ${detail}">
   <svg class="sample-file-icon" viewBox="0 0 32 36" width="32" height="36" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="M5 2h14l8 8v24H5Z"/><path d="M19 2v9h8M10 19h12M10 25h9"/></svg>
   <span class="sample-download-copy"><strong>Download ${format}</strong><span>${detail}</span></span><span class="sample-download-arrow" aria-hidden="true">↓</span>
  </a>`;
 }).join('');
 const origin=books[0];
 const cover=(b,eager=false)=>img(b.number===1?site.coverImage:b.cover,`${b.title} by ${b.author} cover`).replace('loading="lazy"',eager?'loading="eager" fetchpriority="high"':'loading="lazy"');
 const cards=books.map(b=>`<article class="sample-volume${b.number===4?' sample-volume-featured':''}" aria-labelledby="sample-volume-${b.number}">
  <div class="sample-volume-label"><p class="eyebrow">${label(b)}</p>${b.number===4?'<span class="sample-new">NEW</span>':''}</div>
  <figure class="sample-volume-cover">${link(`${b.id}.html`,cover(b))}</figure>
  <h3 id="sample-volume-${b.number}">${link(`${b.id}.html`,esc(b.title))}</h3>
  <p class="sample-volume-hook">${esc(b.description)}</p>
  <p class="sample-availability">Available in paperback and Kindle.</p>
  <a class="sample-read" href="${b.id}-chapter-1.html" aria-label="Read the first chapter of ${esc(b.title)}">Read first chapter <span aria-hidden="true">→</span></a>
  <div class="sample-editions">${editionLinks(b,true)}</div>
 </article>`).join('');
 return `<div class="sample-page">
  <section class="sample-hero" aria-labelledby="sample-title">
   <div class="sample-hero-copy">
    <p class="eyebrow">BOOK ONE · ORIGINS</p>
    <h1 id="sample-title">Take a free sample</h1>
    <p class="sample-intro">Read Chapter 1 of each book on this website, or download Book One’s first three chapters with their illustrations to try offline.</p>
    <div class="sample-downloads">${downloadLinks}</div>
    <p class="sample-includes">Includes the first three chapters with their illustrations.</p>
   </div>
   <figure class="sample-hero-cover">${link('origins.html',cover(origin,true))}</figure>
  </section>
  <section class="sample-online" aria-labelledby="sample-online-title">
   <h2 id="sample-online-title">Read online instead</h2>
   <div>${link('origins-chapter-1.html','Read Chapter 1 →')}${link('origins.html','Book One preview →')}</div>
  </section>
  <section class="sample-keep" aria-labelledby="sample-keep-title">
   <div><h2 id="sample-keep-title">Keep reading Book One</h2><p>Read Chapter 1 here, then continue Book One: Origins in paperback and as a Kindle ebook on Amazon.</p><p class="sample-availability">Available in paperback and Kindle.</p></div>
   <div class="actions">${editionLinks(origin)}</div>
  </section>
  <section class="sample-series" aria-labelledby="sample-series-title">
   <header class="sample-section-heading"><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="sample-series-title">Continue the series</h2></header>
   <div class="sample-volume-grid">${cards}</div>
  </section>
  <section class="sample-closing" aria-label="Continue on Amazon">
   ${amazon(site.amazonSeriesUrl,'Get the full series on Amazon <span aria-hidden="true">→</span>','Get the full Defenders of the Land series on Amazon','button sample-series-cta')}
   ${link('paperback.html','Explore all paperback & Kindle editions →','sample-editions-link')}
  </section>
 </div>`;
}
module.exports={createDownloads};
