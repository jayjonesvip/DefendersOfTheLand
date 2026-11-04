const {samples}=require('./amazon-samples.cjs');
// Shared static book-page template. Values come from the approved public export.
function createBookContents({book:b,entries,books,site,blurb,websiteCopy,publicationDetails,escape:esc,img}){
 const purchase=b.number===1?site:b;
 const cover=b.number===1?site.coverImage:b.cover;
 const amazon=(href,label,text,cls='button secondary')=>`<a class="${cls}" href="${esc(href)}" rel="noopener" aria-label="${esc(label)}">${text}</a>`;
 const chapterUrl=samples[b.id];
 const previous=books.find(book=>book.number===b.number-1);
 const next=books.find(book=>book.number===b.number+1);
 const description=b.number===1?[blurb.join(' ')]:websiteCopy.descriptions[b.id];
 if(!Array.isArray(description)||!description.length)throw Error('Missing approved book description: '+b.id);
 const strip=books.map(book=>`<li><a href="${book.id}.html"${book.id===b.id?' aria-current="page"':''} aria-label="Book ${book.number}: ${esc(book.title)}${book.id===b.id?', current book':''}">${img(book.number===1?site.coverImage:book.cover,`${book.title} cover`)}<span class="book-series-number">Book ${book.number}</span><span class="book-series-title">${esc(book.title)}</span>${book.id===b.id?'<span class="book-series-current">Current book</span>':''}</a></li>`).join('');
 return `<div class="book-overview">
  <section class="book-hero" aria-labelledby="book-title">
   <figure class="book-hero-cover">${img(cover,`${b.title} by ${site.author}, Book ${b.number} of Defenders of the Land, cover`).replace('loading="lazy"','loading="eager" fetchpriority="high"')}</figure>
   <div class="book-hero-copy"><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><p class="book-volume">Book ${b.number} of ${books.length}</p><h1 id="book-title">${esc(b.title)}</h1><p class="book-hook">${esc(b.description)}</p>${b.number===1?'<p class="book-preview-note">Meet Cleveland’s unlikely heroes in an adventure with pictures by Jay Jones. Read sample on Amazon, then find the rest on Amazon.</p>':''}
    <div class="book-hero-actions"><a class="button book-read" href="${chapterUrl}" aria-label="Read ${esc(b.title)} Chapter 1 free">Read sample on Amazon <span aria-hidden="true">→</span></a><div class="book-buy-actions">${amazon(purchase.paperback.url,`Buy ${b.title} paperback on Amazon`,'Paperback')}${amazon(purchase.ebook.url,`Buy ${b.title} Kindle ebook on Amazon`,'Kindle')}</div><a class="book-editions-link" href="paperback.html">Ways to read <span aria-hidden="true">→</span></a></div>
    <div class="book-details"><p class="eyebrow">Details</p>${publicationDetails(b)}</div>
   </div>
  </section>
  <div class="book-reading-layout">
   <section class="book-about" aria-labelledby="book-about-title"><p class="eyebrow">${esc(b.title)}</p><h2 id="book-about-title">What’s the story?</h2>${description.map(paragraph=>`<p>${esc(paragraph)}</p>`).join('')}</section>
   <section class="book-preview-card" aria-labelledby="book-preview-title"><p class="eyebrow">FREE AMAZON SAMPLE</p><h2 id="book-preview-title">Start reading</h2><p>Try the story in Amazon’s reader, then continue with the Kindle or paperback edition.</p><a class="button secondary" href="${samples[b.id]}">Read sample on Amazon →</a></section>
  </div>

  <p>Meet the <a href="characters.html">heroes, villains and allies</a>, explore the <a href="map.html">places in the story</a>, or visit the <a href="books.html#reader-guide">guide for parents and teachers</a>.</p>
  <section class="book-series" aria-labelledby="book-series-title"><div><p class="eyebrow">THE READING ORDER</p><h2 id="book-series-title">Read the books in order</h2></div><ol>${strip}</ol></section>
  <nav class="book-neighbors" aria-label="Book navigation">${previous?`<a href="${previous.id}.html"><span class="eyebrow">← Previous book</span><span>${esc(previous.title)}</span></a>`:''}${next?`<a href="${next.id}.html" class="book-next"><span class="eyebrow">Next book →</span><span>${esc(next.title)}</span></a>`:`<a href="1990-vault.html"><span class="eyebrow">FROM THE NOTEBOOKS</span><span>Explore the Vault →</span></a><a href="characters.html"><span class="eyebrow">THE CAST</span><span>Meet the characters →</span></a>`}</nav>
  <section class="book-series-cta" aria-labelledby="book-series-cta-title"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="book-series-cta-title">Five books. One Cleveland.</h2></div>${amazon(site.amazonSeriesUrl,'Get the full Defenders of the Land series on Amazon','Get the full series on Amazon <span aria-hidden="true">→</span>','button')}</section>
 </div>`;
}
module.exports={createBookContents};
