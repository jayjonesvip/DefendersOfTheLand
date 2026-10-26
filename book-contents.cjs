// Shared static book-page template. Values come from the approved public export.
function createBookContents({book:b,entries,books,site,blurb,publicationDetails,escape:esc,img}){
 const purchase=b.number===1?site:b;
 const cover=b.number===1?site.coverImage:b.cover;
 const amazon=(href,label,text,cls='button secondary')=>`<a class="${cls}" href="${esc(href)}" rel="noopener" aria-label="${esc(label)}">${text}</a>`;
 const chapterUrl=`${b.id}-chapter-1.html`;
 const previous=books.find(book=>book.number===b.number-1);
 const next=books.find(book=>book.number===b.number+1);
 const description=b.number===1?blurb.join(' '):`[DESCRIPTION: ${b.title}, 80-120 words, spoiler-free]`;
 const strip=books.map(book=>`<li><a href="${book.id}.html"${book.id===b.id?' aria-current="page"':''} aria-label="Book ${book.number}: ${esc(book.title)}${book.id===b.id?', current book':''}">${img(book.number===1?site.coverImage:book.cover,`${book.title} cover`)}<span class="book-series-number">Book ${book.number}</span><span class="book-series-title">${esc(book.title)}</span>${book.id===b.id?'<span class="book-series-current">Current book</span>':''}</a></li>`).join('');
 return `<div class="book-overview">
  <section class="book-hero" aria-labelledby="book-title">
   <figure class="book-hero-cover">${img(cover,`${b.title} cover`).replace('loading="lazy"','loading="eager" fetchpriority="high"')}</figure>
   <div class="book-hero-copy"><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><p class="book-volume">Book ${b.number} of ${books.length}</p><h1 id="book-title">${esc(b.title)}</h1><p class="book-hook">${esc(b.description)}</p>${b.number===1?'<p class="book-preview-note">An illustrated Cleveland superhero adventure by Jay Jones. Read Chapter 1 here, then continue on Amazon.</p>':''}
    <div class="book-hero-actions"><a class="button book-read" href="${chapterUrl}" aria-label="Read ${esc(b.title)} Chapter 1 free">Read Chapter 1 free <span aria-hidden="true">→</span></a><div class="book-buy-actions">${amazon(purchase.paperback.url,`Buy ${b.title} paperback on Amazon`,'Paperback')}${amazon(purchase.ebook.url,`Buy ${b.title} Kindle ebook on Amazon`,'Kindle')}</div><a class="book-editions-link" href="paperback.html">About the editions <span aria-hidden="true">→</span></a></div>
    <div class="book-details"><p class="eyebrow">Details</p>${publicationDetails(b)}</div>
   </div>
  </section>
  <div class="book-reading-layout">
   <section class="book-about" aria-labelledby="book-about-title"><p class="eyebrow">${esc(b.title)}</p><h2 id="book-about-title">About this book</h2><p${b.number!==1?' class="book-description-placeholder"':''}>${esc(description)}</p></section>
   <section class="book-preview-card" aria-labelledby="book-preview-title"><p class="eyebrow">FREE CHAPTER 1 PREVIEW</p><h2 id="book-preview-title">Start reading</h2><p class="book-preview-progress" data-book-progress="${b.id}" aria-live="polite">0 of ${entries.length} chapters completed</p><a class="button secondary book-resume" data-resume="${b.id}" hidden>Continue reading →</a><ol class="chapter-list">${entries.map(c=>`<li><a href="${b.id}-chapter-${c.number}.html"><span class="chapter-num">${String(c.number).padStart(2,'0')}</span><span class="book-chapter-title">${esc(c.title)}</span><span class="read-label" data-read="${b.id}:${c.number}"></span></a></li>`).join('')}</ol></section>
  </div>
  ${b.number===1?`<section class="book-sample" aria-labelledby="book-sample-title"><div><p class="eyebrow">PDF &amp; EPUB</p><h2 id="book-sample-title">Read three chapters free</h2><p>Includes the first three chapters with their illustrations.</p></div><div class="book-sample-actions"><a class="button secondary" href="/books/origins-sample-chapters-01-03.pdf" aria-label="Download the free three-chapter Origins PDF sample">Download PDF <span aria-hidden="true">↓</span></a><a class="button secondary" href="/books/origins-sample-chapters-01-03.epub" aria-label="Download the free three-chapter Origins EPUB sample">Download EPUB <span aria-hidden="true">↓</span></a></div></section>`:''}
  <section class="book-series" aria-labelledby="book-series-title"><div><p class="eyebrow">THE READING ORDER</p><h2 id="book-series-title">Where this fits</h2></div><ol>${strip}</ol></section>
  <nav class="book-neighbors" aria-label="Book navigation">${previous?`<a href="${previous.id}.html"><span class="eyebrow">← Previous book</span><span>${esc(previous.title)}</span></a>`:''}${next?`<a href="${next.id}.html" class="book-next"><span class="eyebrow">Next book →</span><span>${esc(next.title)}</span></a>`:`<a href="1990-vault.html"><span class="eyebrow">FROM THE NOTEBOOKS</span><span>Explore the Vault →</span></a><a href="characters.html"><span class="eyebrow">THE CAST</span><span>Meet the characters →</span></a>`}</nav>
  <section class="book-series-cta" aria-labelledby="book-series-cta-title"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="book-series-cta-title">Four books. One Cleveland.</h2></div>${amazon(site.amazonSeriesUrl,'Get the full Defenders of the Land series on Amazon','Get the full series on Amazon <span aria-hidden="true">→</span>','button')}</section>
 </div>`;
}
module.exports={createBookContents};
