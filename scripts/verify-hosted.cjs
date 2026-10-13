const assert=require('node:assert/strict'),crypto=require('node:crypto');
const site=require('../content/site.json');
const base=(process.argv[2]||site.url).replace(/\/$/,'');
async function get(file){const response=await fetch(`${base}/${file}`);assert.equal(response.status,200,`${file}: HTTP ${response.status}`);return response}
(async()=>{
 const manifest=await(await get('books/downloads.json')).json();assert.equal(manifest.samples.length,2);assert.equal(manifest.sampleEpub.chapters,3);assert(!manifest.full&&!manifest.ebooks&&!manifest.print);
 const sitemap=await(await get('sitemap.xml')).text(),robots=await(await get('robots.txt')).text();
 const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert(locations.length>0);assert(!sitemap.includes('404.html'));
 const canonicalBase=new URL(locations[0]),rootPath=canonicalBase.pathname.slice(0,canonicalBase.pathname.lastIndexOf('/')+1);assert(robots.includes(`Sitemap: ${canonicalBase.origin}${rootPath}sitemap.xml`));
 for(const location of locations){
  const pathname=new URL(location).pathname,file=pathname.slice(rootPath.length)||'index.html';
  const html=await(await get(file)).text();assert(html.includes('Defenders of the Land'),file);assert(!html.includes('http://127.0.0.1'),file);assert(!html.includes('Download chapter PDF'),file);
  assert(html.includes(`<link rel="canonical" href="${location}"`),file);assert(html.includes('application/ld+json'),file);
  if(['index.html','paperback.html','downloads.html','origins.html','books.html'].includes(file)){assert(html.includes(`href="${site.paperback.url}"`),file);assert(html.includes(`href="${site.ebook.url}"`),file);}
 }
 for(const asset of ['story-map.js','assets/d3-7.9.0.min.js','assets/book-two-chapter-01-tutoring-graduation.webp','assets/book-two-chapter-02-jenny-practice-face-v2.webp','assets/book-two-chapter-02-seth-practice-face-v2.webp','assets/book-two-chapter-03-rooftop-talk-face-v2.webp','assets/book-two-chapter-03-seth-success-face-v2.webp','assets/book-two-chapter-03-jenny-success-face-v2.webp','assets/book-two-chapter-04-jenny-award.webp','assets/book-two-chapter-05-larry-advice.webp','assets/book-two-chapter-05-reporting-rounds.webp','assets/book-two-chapter-05-new-shoes.webp','assets/book-two-chapter-06-perch-farewell.webp','assets/book-two-chapter-06-lake-superior-sunset.webp','assets/book-two-chapter-07-landlord.webp','assets/book-two-chapter-07-newsroom-invoice-v2.webp','assets/book-two-chapter-07-campaign.webp'])await get(asset);
 for(const sample of manifest.samples){const response=await get(`books/${sample.file}`);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,sample.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sample.sha256,sample.file)}
 const removed=['defenders-of-the-land-origins-illustrated.pdf','defenders-of-the-land-origins-text.pdf','defenders-of-the-land-origins.epub','origins-kdp-interior.pdf','origins-kdp-cover.pdf','origins-front-cover.pdf','origins-back-cover.pdf','origins-ebook-cover.jpg',...Array.from({length:18},(_,i)=>`origins-chapter-${String(i+1).padStart(2,'0')}.pdf`)];
 await Promise.all(removed.map(async file=>{const response=await fetch(`${base}/books/${file}`);assert.equal(response.status,404,`Removed download still available: ${file}`)}));
 console.log(`PASS: ${locations.length} sitemap pages with canonical metadata, paperback purchase links, two combined samples, and 26 removed download URLs at ${base}`);
})().catch(e=>{console.error(e);process.exitCode=1});
