// Produces ordinary static markup; no client-side rendering or dependencies.
function createLanding({books,site,blurb,geometry,landmarks,escape:esc,img,link}){
 const extras=require('./landing-extras.cjs').createLandingExtras({site,blurb,geometry,landmarks,escape:esc,img});
 const origin=books[0],words=['','One','Two','Three','Four'];
 const label=b=>`Book ${words[b.number]||b.number}`;
 const purchase=b=>b.number===1?site:b;
 const cover=b=>b.number===1?site.coverImage:b.cover;
 const amazon=(href,text,cls,label)=>`<a href="${esc(href)}" class="${cls}" rel="noopener"${label?` aria-label="${esc(label)}"`:''}>${text}</a>`;
 const series=(cls='launch-series-link')=>amazon(site.amazonSeriesUrl,'Get the full series on Amazon <span aria-hidden="true">→</span>',cls,'Get the full Defenders of the Land series on Amazon');
 const editions=b=>{
  const p=purchase(b);
  return [p.paperback?amazon(p.paperback.url,'Buy paperback on Amazon','launch-buy',`Buy ${b.title} paperback on Amazon`):'',p.ebook?amazon(p.ebook.url,'Buy Kindle ebook','launch-buy',`Buy ${b.title} Kindle ebook on Amazon`):''].join('');
 };
 const coverLink=(b,hero=false)=>link(`${b.id}.html`,img(cover(b),b.number===1?'Defenders of the Land: Book One: Origins paperback cover':`${b.title} by ${b.author} cover`).replace('loading="lazy"',hero?'loading="eager" fetchpriority="high"':'loading="lazy"'),'launch-cover-link');
 const cards=books.map((b,index)=>`<article class="volume-card${index===0?' volume-featured':''}" aria-labelledby="volume-${b.number}-title" data-reveal>
   <figure class="volume-cover">${coverLink(b)}</figure>
   <div class="volume-copy">
    <p class="eyebrow">${esc(label(b).toUpperCase())} · ${index===0?'ORIGINS':'THE STORY CONTINUES'} ${b.number===4?'<span class="launch-new-badge volume-new-badge">NEW</span>':''}</p>
    <h3 id="volume-${b.number}-title">${link(`${b.id}.html`,esc(b.title))}</h3>
    <p class="volume-teaser">${esc(b.description)}</p>
    ${index>0?`<p class="volume-preview">Chapter 1 preview · ${esc(b.entries[0].title)}</p>`:''}
    <div class="volume-actions">${link(`${b.id}-chapter-1.html`,index===0?'Read Chapter 1 →':`Start ${esc(b.title)} →`,'launch-read')}</div>
    <div class="volume-editions">${editions(b)}${!purchase(b).paperback&&!purchase(b).ebook?series('launch-buy'):''}</div>
    ${link(`${b.id}.html`,index===0?'Read the Chapter 1 preview':`${esc(b.title)} contents`,'launch-contents')}
   </div>
  </article>`).join('');
 return `<div class="launch-page">
  ${extras.announcement}
  <section class="launch-hero" aria-labelledby="launch-title">
   <div class="hero-copy">
    <p class="launch-location"><span aria-hidden="true">●</span> CLEVELAND, OHIO <span class="location-year">1987</span></p>
    <p class="eyebrow hero-volume">BOOK ONE · ORIGINS</p>
    <h1 id="launch-title" class="launch-title">Defenders <span class="title-last"><span class="title-small">of the</span> Land</span></h1>
    <p class="launch-author">Jay Jones</p>
    <p class="launch-tagline">${esc(origin.description)}</p>
    <p class="launch-intro">An illustrated superhero adventure set in Cleveland in 1987. Buy <em>Book One: Origins</em> in paperback or on Kindle, or try Chapter 1 free here.</p>
    <div class="hero-primary">${link('origins-chapter-1.html','Read Chapter 1 free <span aria-hidden="true">→</span>','launch-read launch-read-hero')}<a class="launch-resume" data-resume hidden>Continue reading →</a></div>
    <div class="hero-editions">${editions(origin)}</div>
    <p class="launch-audience">Superhero books for kids and younger teens, ages 9–14.</p>
    <p class="hero-series-complete"><strong>Four books. One Cleveland.</strong><span>The complete four-book series.</span></p>
    ${series('launch-series-link button secondary')}
    <div class="hero-extras">${link('downloads.html','Download a free sample')}${link('origins.html','Read the Chapter 1 preview')}</div>
   </div>
   <div class="hero-art">
    <div class="hero-halftone" aria-hidden="true"></div>
    <figure class="hero-cover">${coverLink(origin,true)}<figcaption>BOOK ONE <span aria-hidden="true">/</span> ORIGINS</figcaption></figure>
   </div>
  </section>

  ${extras.about}

  <section class="series-strip" aria-labelledby="series-title">
   <div class="series-strip-inner">
    <div class="strip-heading"><p class="eyebrow">DEFENDERS OF THE LAND</p><h2 id="series-title">The Series</h2><p>Jay Jones</p></div>
    <ol class="series-shelf">${books.map(b=>`<li><a href="${b.id}.html" class="series-volume">${img(cover(b),`${b.title} by ${b.author} cover`)}<span class="series-volume-label">${esc(label(b))}</span><span class="series-volume-title">${esc(b.title)}</span></a></li>`).join('')}</ol>
   </div>
  </section>

  <section class="launch-books" aria-labelledby="launch-books-title">
   <header class="launch-section-heading" data-reveal><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="launch-books-title">The story continues.</h2></div>${link('books.html','Browse the books <span aria-hidden="true">→</span>','launch-section-link')}</header>
   <div class="volume-grid">${cards}</div>
  </section>

  ${extras.explore}
  ${extras.readFree}

  <section class="launch-closing" aria-labelledby="closing-title" data-reveal>
   <div class="closing-sun" aria-hidden="true"></div>
   <div class="closing-copy"><p class="eyebrow">DEFENDERS OF THE LAND</p><h2 id="closing-title">Continue the series.</h2><p>An illustrated superhero adventure set in Cleveland in 1987.</p></div>
   <div class="closing-actions">${series('launch-read launch-read-sun')}${link('downloads.html','Download a free sample','closing-sample')}</div>
  </section>
 </div>`;
}
module.exports={createLanding};
