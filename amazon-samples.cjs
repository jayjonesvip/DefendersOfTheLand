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
// Amazon's frame-ancestors policy blocks third-party embeds. Open the official
// sample in a new tab; these links also work without JavaScript.
function sampleLink(book,site,escape,cls='button'){
 const edition=(book.number===1?site:book).ebook;
 if(!edition?.url||!/^B[A-Z0-9]{9}$/.test(edition.asin||''))return '';
 const href=samples[book.id]||edition.url;
 return `<a class="${cls}" href="${escape(href)}" data-amazon-sample target="_blank" rel="noopener noreferrer" aria-label="Read ${escape(book.title)} sample on Amazon (opens in a new tab)">Read Sample <span aria-hidden="true">↗</span></a>`;
}
module.exports={samples,sampleLink};
