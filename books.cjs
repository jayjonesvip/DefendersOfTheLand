// Static catalog; all book copy, covers and purchase URLs come from approved metadata.
function createBooks({books,site,escape:esc,img,link}){
 const words=['','One','Two','Three','Four'];
 const amazon=(href,text,label,cls='button secondary')=>`<a href="${esc(href)}" class="${cls}" rel="noopener" aria-label="${esc(label)}">${text}</a>`;
 const series=(cls='button')=>amazon(site.amazonSeriesUrl,'Get the full series on Amazon <span aria-hidden="true">→</span>','Get the full Defenders of the Land series on Amazon',cls);
 const cover=b=>img(b.number===1?site.coverImage:b.cover,`${b.title} by ${b.author} cover`);
 const order=books.map(b=>`<li><a href="#catalog-${b.id}" aria-label="Go to Book ${words[b.number]}: ${esc(b.title)}">${cover(b)}<span class="catalog-order-number">Book ${b.number}</span><span class="catalog-order-title">${esc(b.title)}</span></a></li>`).join('');
 const cards=books.map(b=>{
  const purchase=b.number===1?site:b;
  return `<article class="catalog-card${b.number===1?' catalog-start':''}${b.number===4?' catalog-new':''}" id="catalog-${b.id}" aria-labelledby="catalog-${b.id}-title">
   <div class="catalog-card-label"><p class="eyebrow">Book ${b.number} of ${books.length}</p>${b.number===1?'<span class="catalog-badge">Start here</span>':b.number===4?'<span class="catalog-badge">New</span>':''}</div>
   <figure class="catalog-cover">${link(`${b.id}.html`,cover(b))}</figure>
   <h3 id="catalog-${b.id}-title">${link(`${b.id}.html`,esc(b.title))}</h3>
   <p class="catalog-hook">${esc(b.description)}</p>
   <div class="catalog-card-actions"><a class="button catalog-read" href="${b.id}-chapter-1.html" aria-label="Read ${esc(b.title)} Chapter 1 free">Read Chapter 1 free <span aria-hidden="true">→</span></a>
    <div class="catalog-purchases">${amazon(purchase.paperback.url,'Paperback',`Buy ${b.title} paperback on Amazon`)}${amazon(purchase.ebook.url,'Kindle',`Buy ${b.title} Kindle ebook on Amazon`)}</div>
    ${link(`${b.id}.html`,'Contents <span aria-hidden="true">→</span>','catalog-contents')}
   </div>
  </article>`;
 }).join('');
 return `<div class="catalog-page">
  <header class="catalog-hero"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h1>Four books.<br><span>One Cleveland.</span></h1><p>An illustrated superhero series set in Cleveland in 1987.</p></div><div class="catalog-hero-cta">${series()}</div></header>
  <section class="catalog-order" aria-labelledby="catalog-order-title"><div><p class="eyebrow">BOOK ONE TO BOOK FOUR</p><h2 id="catalog-order-title">Read in order</h2></div><ol>${order}</ol></section>
  <section class="catalog-library" aria-labelledby="catalog-library-title"><header><p class="eyebrow">DEFENDERS OF THE LAND</p><h2 id="catalog-library-title">The books</h2></header><div class="catalog-grid">${cards}</div></section>
  <section class="catalog-closing" aria-labelledby="catalog-closing-title"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="catalog-closing-title">New here?</h2></div><div class="catalog-closing-links"><div class="actions">${link('downloads.html','Get the free sample <span aria-hidden="true">→</span>','button')}${link('characters.html','Meet the characters','button secondary')}${link('map.html','Explore the Land','button secondary')}</div>${series('catalog-series-link')}</div></section>
 </div>`;
}
module.exports={createBooks};
