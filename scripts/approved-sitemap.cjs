const assert=require('node:assert/strict');
const site=require('../content/site.json');

// Update this explicit boundary only when another public page is approved.
// Keep it independent of the build so accidental output cannot approve itself.
const approvedPages=[
 'inspector-billy.html','doc-dork.html','claude-blackwell.html','eleanor-blackwell.html','pink-blur.html','super-zerdo.html','lava-lips.html','jaws-o-death.html','super-perch-character.html',
 'fist-o-mite.html','flaming-head.html',
 'index.html','books.html','web-comics.html','characters.html','map.html',
 'paperback.html','author.html','downloads.html','1990-vault.html',
 'flaming-head-origin.html','why-so-evil.html','loaded-glove.html',
 'sticky-situation.html','super-perch.html','seized-up.html',
 'origins.html','book-two.html','book-three.html','book-four.html','book-five.html',
 'origins-chapter-1.html','book-two-chapter-1.html',
 'book-three-chapter-1.html','book-four-chapter-1.html'
];

function assertApprovedSitemap(locations,siteUrl=process.env.SITE_URL||site.url){
 const base=siteUrl.replace(/\/$/,'');
 const expected=approvedPages.map(file=>base+'/'+(file==='index.html'?'':file));
 assert.deepEqual([...locations].sort(),expected.sort(),
  'Sitemap must contain exactly the approved public URLs (no missing, extra, or duplicate entries)');
}

module.exports={approvedPages,assertApprovedSitemap};
