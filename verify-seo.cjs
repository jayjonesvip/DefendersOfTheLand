const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
function check(){
 const root=__dirname,dist=path.join(root,'dist'),site=JSON.parse(fs.readFileSync(path.join(root,'content/site.json')));
 const base=(process.env.SITE_URL||site.url).replace(/\/$/,'');
 const files=fs.readdirSync(dist).filter(f=>f.endsWith('.html'));
 const titles=new Set(),descriptions=new Set(),expected=[];
 const meta=(html,key)=>html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1];
 for(const file of files){
  const html=fs.readFileSync(path.join(dist,file),'utf8'),title=html.match(/<title>(.*?)<\/title>/)?.[1],description=meta(html,'description');
  assert(title&&description,`${file}: missing title/description`);
  assert(!titles.has(title),`${file}: duplicate title`);titles.add(title);
  assert(!descriptions.has(description),`${file}: duplicate description`);descriptions.add(description);
  assert.equal((html.match(/<meta name="description"/g)||[]).length,1,file);
  assert(html.includes('href="favicon.svg"'),file);assert(fs.existsSync(path.join(dist,'favicon.svg')));
  const canonical=file==='index.html'?base+'/':base+'/'+file;
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],canonical,file);
  assert.equal(meta(html,'og:url'),canonical,file);
  for(const key of ['og:title','og:description','og:image','og:image:alt','twitter:card','twitter:image'])assert(meta(html,key),`${file}: missing ${key}`);
  const image=new URL(meta(html,'og:image')),relative=image.pathname.slice(new URL(base+'/').pathname.length);
  assert(fs.existsSync(path.join(dist,relative)),`${file}: missing social image`);
  const blocks=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];assert.equal(blocks.length,1,file);
  const graph=JSON.parse(blocks[0][1])['@graph'];assert(graph.some(n=>n['@type']==='WebSite'),file);
  if(file==='1990-vault.html'){
   assert.equal(meta(html,'og:type'),'article');
   assert(meta(html,'og:image').includes('/vault/1990/previews/'),'Vault sharing image must use the archival artwork');
   assert.equal(graph.find(n=>n['@type']==='ImageGallery').associatedMedia.length,9);
   assert.equal(graph.find(n=>n['@type']==='Article').author.name,'Jason Jones');
   assert.equal(graph.find(n=>n['@type']==='BreadcrumbList').itemListElement[1].item,base+'/author.html');
  }
  if(file==='author.html')assert.equal(graph.find(n=>n['@type']==='ProfilePage').mainEntity['@id'],base+'/#author');
  if(file==='404.html')assert(meta(html,'robots').includes('noindex'),file);
  else{assert(!meta(html,'robots').includes('noindex'),file);expected.push(canonical);assert(graph.some(n=>n['@type']==='BreadcrumbList'),file);}
  if(file==='paperback.html'){
   const paperback=graph.find(n=>n.bookFormat==='https://schema.org/Paperback');
   assert.equal(paperback.url,site.paperback.url);assert.equal(paperback.identifier.value,site.paperback.asin);
   assert(!paperback.offers&&!paperback.aggregateRating,'Do not fabricate pricing or reviews');
   const ebook=graph.find(n=>n.bookFormat==='https://schema.org/EBook');assert.equal(ebook.url,site.ebook.url);assert.equal(ebook.identifier.value,site.ebook.asin);
  }
 }
 // Publication/artwork reconciliation: exercise the book page and every chapter.
 const aftershock=JSON.parse(fs.readFileSync(path.join(root,'content/books/book-two/book.json')));
 assert.equal(aftershock.title,'Aftershock');assert.equal(aftershock.publicationStatus,'Published');
 assert.equal(aftershock.ebook.asin,'B0HNFGZ9WM');assert.equal(aftershock.paperback.asin,'B0HNFGR781');
 assert.equal(aftershock.cover,'book-two-cover-v6-aftershock.png');assert.equal(aftershock.ebookCover,aftershock.cover);
 for(const file of files.filter(f=>f==='book-two.html'||f.startsWith('book-two-chapter-'))){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  const title=html.match(/<title>(.*?)<\/title>/)?.[1];
  for(const value of [title,meta(html,'description'),meta(html,'og:title'),meta(html,'og:description'),meta(html,'twitter:title'),meta(html,'twitter:description'),meta(html,'og:image:alt')]){
   assert(value.includes('Aftershock'),`${file}: Aftershock missing from metadata`);
   assert(!/Book 2: Book Two|Book Two: Book Two/.test(value),`${file}: duplicated volume label`);
  }
  assert(meta(html,'og:image').endsWith('/assets/book-two-cover-web-v6-aftershock.webp'),file);
  assert.equal(meta(html,'twitter:image'),meta(html,'og:image'),file);
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.equal(graph.find(n=>n['@type']==='Book').name,`${site.name}: Book 2: Aftershock`);
 }
 for(const file of ['index.html','books.html','book-two.html','paperback.html','downloads.html']){
  const html=fs.readFileSync(path.join(dist,file),'utf8');
  for(const edition of ['ebook','paperback'])assert(html.includes(`href="${aftershock[edition].url}"`),`${file}: missing Aftershock ${edition} purchase link`);
 }
 const xml=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
 const locations=[...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
 assert.deepEqual(locations.sort(),expected.sort(),'Sitemap must include each indexable page exactly once');
 assert(!xml.includes('404.html'));assert(!xml.includes('<lastmod>'),'Do not invent modification dates');
 assert(fs.readFileSync(path.join(dist,'robots.txt'),'utf8').includes(`Sitemap: ${base}/sitemap.xml`));
 for(const file of ['index.html','origins.html','books.html','downloads.html','paperback.html']){
  const html=fs.readFileSync(path.join(dist,file),'utf8');assert(html.includes(`href="${site.paperback.url}"`),`${file}: missing paperback purchase link`);
  assert(html.includes(`href="${site.ebook.url}"`),`${file}: missing Kindle purchase link`);
  assert(!html.includes('Kindle purchase link will be added'),file);
 }
 if(!new URL(base).hostname.endsWith('.github.io'))assert.equal(fs.readFileSync(path.join(dist,'CNAME'),'utf8').trim(),new URL(base).hostname);
 console.log(`PASS: ${files.length} unique page titles/descriptions, canonical/social metadata, structured data, complete sitemap, robots.txt and paperback links.`);
}
module.exports={check};
if(require.main===module)check();
