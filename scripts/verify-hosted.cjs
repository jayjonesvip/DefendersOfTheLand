const assert=require('node:assert/strict'),crypto=require('node:crypto');
const site=require('../content/site.json');
const base=(process.argv[2]||site.url).replace(/\/$/,'');
async function get(file,expectedStatus=200){
 for(let attempt=0;attempt<4;attempt++){
  let response;
  try{response=await fetch(new URL(file,`${base}/`),{signal:AbortSignal.timeout(30000)});}
  catch(error){if(attempt===3)throw error;console.warn(`${file}: ${error.message}; retrying`);}
  if(response){
   if(![429,500,502,503,504].includes(response.status)||attempt===3){
    assert.equal(response.status,expectedStatus,`${file}: HTTP ${response.status}; expected ${expectedStatus}`);
    return response;
   }
   console.warn(`${file}: HTTP ${response.status}; retrying`);
   await response.body?.cancel();
  }
  await new Promise(resolve=>setTimeout(resolve,1000*2**attempt));
 }
}
(async()=>{
 const manifest=await(await get('books/downloads.json')).json();assert.equal(manifest.samples.length,2);assert.equal(manifest.sampleEpub.chapters,3);assert(!manifest.full&&!manifest.ebooks&&!manifest.print);
 const sitemap=await(await get('sitemap.xml')).text(),robots=await(await get('robots.txt')).text();
 const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);assert(locations.length>0);assert(!sitemap.includes('404.html'));
 const canonicalBase=new URL(locations[0]),rootPath=canonicalBase.pathname.slice(0,canonicalBase.pathname.lastIndexOf('/')+1);assert(robots.includes(`Sitemap: ${canonicalBase.origin}${rootPath}sitemap.xml`));
 const resources=new Set();
 for(const location of locations){
  const pathname=new URL(location).pathname,file=pathname.slice(rootPath.length)||'index.html';
  const html=await(await get(file)).text();assert(html.includes('Defenders of the Land'),file);assert(!html.includes('http://127.0.0.1'),file);assert(!html.includes('Download chapter PDF'),file);
  for(const match of html.matchAll(/\b(src|srcset)=(["'])(.*?)\2/g)){
   const urls=match[1]==='srcset'?match[3].split(',').map(candidate=>candidate.trim().split(/\s+/)[0]):[match[3]];
   for(const url of urls.filter(Boolean)){
    const resource=new URL(url,`${base}/${file}`);
    if(resource.origin===new URL(base).origin)resources.add(resource.href);
   }
  }
  assert(html.includes(`<link rel="canonical" href="${location}"`),file);assert(html.includes('application/ld+json'),file);
  if(['index.html','paperback.html','downloads.html','origins.html','books.html'].includes(file)){assert(html.includes(`href="${site.paperback.url}"`),file);assert(html.includes(`href="${site.ebook.url}"`),file);}
 }
 for(const resource of resources){const response=await get(resource);await response.arrayBuffer();}
 for(const sample of manifest.samples){const response=await get(`books/${sample.file}`);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,sample.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sample.sha256,sample.file)}
 const removed=['defenders-of-the-land-origins-illustrated.pdf','defenders-of-the-land-origins-text.pdf','defenders-of-the-land-origins.epub','origins-kdp-interior.pdf','origins-kdp-cover.pdf','origins-front-cover.pdf','origins-back-cover.pdf','origins-ebook-cover.jpg',...Array.from({length:18},(_,i)=>`origins-chapter-${String(i+1).padStart(2,'0')}.pdf`)];
 // Avoid a burst of 26 simultaneous missing-file requests immediately after deployment.
 for(const file of removed){const response=await get(`books/${file}`,404);await response.body?.cancel();}
 console.log(`PASS: ${locations.length} sitemap pages and ${resources.size} referenced assets with canonical metadata, paperback purchase links, two combined samples, and 26 removed download URLs at ${base}`);
})().catch(e=>{console.error(e);process.exitCode=1});
