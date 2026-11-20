// Amazon sample destinations supplied by the author, in series order.
const samples={
 'origins':'https://read.amazon.com/sample/B0HMXK83HK?clientId=share',
 'book-two':'https://read.amazon.com/sample/B0HNFGZ9WM?clientId=share',
 'book-three':'https://read.amazon.com/sample/B0HNNGKC63?clientId=share',
 'book-four':'https://read.amazon.com/sample/B0HPBM1FJQ?clientId=share',
 'book-five':'https://read.amazon.com/sample/B0HQFT91NJ?clientId=share',
 'book-six':'https://read.amazon.com/sample/B0HR6DZ716?clientId=share',
 'book-seven':'https://read.amazon.com/sample/B0HS82ZTZH?clientId=share'
};
// Kindle edition metadata is kept in site.json for Origins and book.json for sequels.
// Keep the real link usable when JavaScript or native dialogs are unavailable.
function sampleLink(book,site,escape,cls='button'){
 const edition=(book.number===1?site:book).ebook;
 if(!edition?.url||!/^B[A-Z0-9]{9}$/.test(edition.asin||''))return '';
 const href=samples[book.id]||edition.url;
 return `<a class="${cls}" href="${escape(href)}" data-kindle-sample="${escape(edition.asin)}" data-sample-title="${escape(book.title)}" aria-label="Read ${escape(book.title)} sample">Read Sample</a>`;
}
const readerDialog=`<dialog class="kindle-sample" id="kindle-sample-dialog" aria-labelledby="kindle-sample-title" aria-describedby="kindle-sample-help">
 <header class="sample-header"><div class="sample-heading"><p class="eyebrow">READ SAMPLE · KINDLE</p><h2 id="kindle-sample-title"></h2></div><button type="button" class="sample-close" data-sample-close aria-label="Close sample reader"><span aria-hidden="true">×</span> Close</button></header>
 <div class="sample-reader" data-sample-reader></div>
 <footer class="sample-footer"><p id="kindle-sample-help">Sample not loading? Read it on Amazon.</p><a data-sample-fallback target="_blank" rel="noopener noreferrer">Open on Amazon <span aria-hidden="true">↗</span></a></footer>
</dialog>`;
module.exports={samples,sampleLink,readerDialog};
