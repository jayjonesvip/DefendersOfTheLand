const assert=require('node:assert/strict'),crypto=require('node:crypto');
const site=require('../content/site.json'),{ids}=require('./public-policy.cjs');
const base=(process.argv[2]||site.url).replace(/\/$/,'');
async function get(file,status=200){
 for(let attempt=0;attempt<4;attempt++){
  const response=await fetch(new URL(file,base+'/'),{signal:AbortSignal.timeout(30000)});
  if([429,500,502,503,504].includes(response.status)&&attempt<3){await response.body?.cancel();await new Promise(r=>setTimeout(r,1000*2**attempt));continue;}
  assert.equal(response.status,status,`${file}: expected ${status}, got ${response.status}`);return response;
 }
}
(async()=>{
 const sitemap=await(await get('sitemap.xml')).text();
 const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert.equal(locations.length,19);
 assert(locations.some(url=>new URL(url).pathname.endsWith('/flaming-head-origin.html')),'Missing website-exclusive comic');
 assert(locations.some(url=>new URL(url).pathname.endsWith('/why-so-evil.html')),'Missing Billy and Daniel prequel');
 assert(locations.some(url=>new URL(url).pathname.endsWith('/loaded-glove.html')),'Missing Fist comic');
 assert(!/(?:origins|book-two|book-three|book-four)-chapter-(?:[2-9]|\d{2,})\.html/.test(sitemap));
 const rootPath=new URL(locations[0]).pathname.replace(/[^/]*$/,'');
 const resources=new Set();
 for(const location of locations){
  const file=new URL(location).pathname.slice(rootPath.length)||'index.html';
  const html=await(await get(file)).text();
  assert(html.includes(`rel="canonical" href="${location}"`),file);
  for(const match of html.matchAll(/<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]+)">/g)){
   const image=new URL(match[1],base+'/'+file);
   if(image.origin===new URL(base).origin)resources.add(image.href);
  }
  for(const m of html.matchAll(/\b(src|srcset)=["'](.*?)["']/g)){
   for(const value of (m[1]==='srcset'?m[2].split(',').map(s=>s.trim().split(/\s+/)[0]):[m[2]])){
    const url=new URL(value,base+'/'+file);if(url.origin===new URL(base).origin)resources.add(url.href);
   }
  }
 }
 for(const id of ids){
  const book=require('../content/books/'+id+'/book.json');
  const html=await(await get(id+'-chapter-1.html')).text();
  assert(html.includes(`data-complete data-next="" href="${book.amazonUrl}"`),id);
  await(await get(id+'-chapter-2.html',404)).body?.cancel();
 }
 for(const url of resources)await(await get(url)).arrayBuffer();
 const downloads=await(await get('books/downloads.json')).json();assert.equal(downloads.samples.length,2);assert.equal(downloads.sampleEpub.chapters,3);
 for(const sample of downloads.samples){const bytes=Buffer.from(await(await get('books/'+sample.file)).arrayBuffer());assert.equal(bytes.length,sample.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sample.sha256);}
 for(const file of ['origins-chapter-18.html','book-two-chapter-21.html','book-three-chapter-14.html','book-four-chapter-13.html','books/origins-kdp-interior.pdf','books/book-four-kdp-interior.pdf','books/defenders-of-the-land-origins.epub','books/defenders-of-the-land-book-four.epub','content/books/book-four/chapter-12.json','assets/book-four-chapter-12-control-v2.webp'])await(await get(file,404)).body?.cancel();
 console.log('PASS: hosted Chapter 1 previews, Amazon continuation, approved samples/assets, and removed chapter/private URLs.');
})().catch(error=>{console.error(error);process.exitCode=1;});
