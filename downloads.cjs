const {samples}=require('./amazon-samples.cjs');
// Render a complete static page using the existing approved book/sample metadata.
function createDownloads({books,site,escape:esc,img,link}){
 const words=['','One','Two','Three','Four','Five'];
 const label=b=>`Book ${words[b.number]}`;
 const purchase=b=>b.number===1?site:b;
 const amazon=(href,text,aria,cls='button secondary')=>`<a class="${cls}" href="${esc(href)}" rel="noopener" aria-label="${esc(aria)}">${text}</a>`;
 const editionLinks=(b,short=false)=>{
  const p=purchase(b);
  return amazon(p.paperback.url,short?'Paperback':'Buy paperback',`Buy ${b.title} paperback on Amazon`)+amazon(p.ebook.url,short?'Kindle':'Buy Kindle',`Buy ${b.title} Kindle ebook on Amazon`);
 };
 const origin=books[0];
 const cover=(b,eager=false)=>img(b.number===1?site.coverImage:b.cover,`${b.title} by ${b.author} cover`).replace('loading="lazy"',eager?'loading="eager" fetchpriority="high"':'loading="lazy"');
 const cards=books.map(b=>`<article class="sample-volume${b.number===books.length?' sample-volume-featured':''}" aria-labelledby="sample-volume-${b.number}">
  <div class="sample-volume-label"><p class="eyebrow">${label(b)}</p>${b.number===books.length?'<span class="sample-new">NEW</span>':''}</div>
  <figure class="sample-volume-cover">${link(`${b.id}.html`,cover(b))}</figure>
  <h3 id="sample-volume-${b.number}">${link(`${b.id}.html`,esc(b.title))}</h3>
  <p class="sample-volume-hook">${esc(b.description)}</p>
  <p class="sample-availability">Available in paperback and Kindle.</p>
  <a class="sample-read" href="${samples[b.id]}" aria-label="Read the Amazon sample of ${esc(b.title)}">Read sample on Amazon <span aria-hidden="true">→</span></a>
  <div class="sample-editions">${editionLinks(b,true)}</div>
 </article>`).join('');
 return `<div class="sample-page">
  <section class="sample-hero" aria-labelledby="sample-title">
   <div class="sample-hero-copy">
    <p class="eyebrow">BOOK ONE · ORIGINS</p>
    <h1 id="sample-title">Free Superhero Book Samples</h1>
    <p class="sample-intro">Try a superhero adventure with pictures, for ages 9–14. Read a free sample of each book on Amazon, then choose a Kindle or paperback edition.</p>
    <div class="sample-downloads"><a class="button" href="${samples.origins}">Read Origins sample on Amazon →</a></div>

   </div>
   <figure class="sample-hero-cover">${link('origins.html',cover(origin,true))}</figure>
  </section>
  <section class="sample-keep" aria-labelledby="sample-keep-title">
   <div><h2 id="sample-keep-title">Keep reading Book One</h2><p>Read the sample on Amazon, then continue Book One: Origins in paperback and as a Kindle ebook on Amazon.</p><p class="sample-availability">Available in paperback and Kindle.</p></div>
   <div class="actions">${editionLinks(origin)}</div>
  </section>
  <section class="sample-series" aria-labelledby="sample-series-title">
   <header class="sample-section-heading"><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="sample-series-title">Choose your sample</h2></header>
   <div class="sample-volume-grid">${cards}</div>
  </section>
  <p>Looking for something to print? <a href="activities.html">Browse free coloring pages →</a></p>
  <section class="sample-closing" aria-label="Continue on Amazon">
   ${amazon(site.amazonSeriesUrl,'Get the full series on Amazon <span aria-hidden="true">→</span>','Get the full Defenders of the Land series on Amazon','button sample-series-cta')}
   ${link('paperback.html','Explore all paperback & Kindle editions →','sample-editions-link')}
  </section>
 </div>`;
}
module.exports={createDownloads};
