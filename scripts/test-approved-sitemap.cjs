const {test}=require('node:test'),assert=require('node:assert/strict');
const site=require('../content/site.json');
const {approvedPages,assertApprovedSitemap}=require('./approved-sitemap.cjs');
const locations=approvedPages.map(file=>site.url+'/'+(file==='index.html'?'':file));
const check=urls=>assertApprovedSitemap(urls,site.url);

test('all 35 approved pages, including character profiles, pass in any order',()=>{
 assert.equal(locations.length,35);
 assert(locations.includes(site.url+'/seized-up.html'));
 check([...locations].reverse());
});
test('every approved page is required',()=>{
 for(const location of locations)assert.throws(()=>check(locations.filter(url=>url!==location)),/exactly the approved public URLs/);
});
test('unapproved pages and private URLs are rejected even at the correct count',()=>{
 for(const file of ['book-four-chapter-2.html','origins-chapter-18.html','404.html','unapproved-comic.html','books/defenders-of-the-land-book-four.epub']){
  const unauthorized=site.url+'/'+file;
  assert.throws(()=>check([...locations,unauthorized]),/exactly the approved public URLs/);
  assert.throws(()=>check([...locations.slice(0,-1),unauthorized]),/exactly the approved public URLs/);
 }
});
test('duplicate entries cannot replace missing pages',()=>{
 assert.throws(()=>check([...locations,locations[0]]),/exactly the approved public URLs/);
 assert.throws(()=>check([...locations.slice(0,-1),locations[0]]),/exactly the approved public URLs/);
});
test('canonical origin and path are checked, including configured site URLs',()=>{
 assert.throws(()=>check(locations.map(url=>url.replace(site.url,'https://example.com'))),/exactly the approved public URLs/);
 assert.throws(()=>check(locations.map(url=>url===site.url+'/'?url+'index.html':url)),/exactly the approved public URLs/);
 const alternate='https://example.com/previews/';
 assertApprovedSitemap(approvedPages.map(file=>alternate+(file==='index.html'?'':file)),alternate);
});
