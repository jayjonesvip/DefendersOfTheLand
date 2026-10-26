const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const {checkSource,files,ids}=require('./scripts/public-policy.cjs');
const root=__dirname,out=path.join(root,'dist');
checkSource(root);
const htmlFiles=fs.readdirSync(out).filter(f=>f.endsWith('.html'));
const expected=['index.html','books.html','paperback.html','downloads.html','author.html','1990-vault.html','characters.html','map.html','404.html',...ids.flatMap(id=>[id+'.html',id+'-chapter-1.html'])];
assert.deepEqual(htmlFiles.sort(),expected.sort());
const approved=JSON.parse(fs.readFileSync(path.join(root,'public-preview-inventory.json'))).files;
const allowed=new Set(approved.filter(f=>f.path.startsWith('public/')&&!f.path.startsWith('public/vendor/')).map(f=>f.path.slice(7)));
for(const file of ['d3-7.9.0.min.js','D3-LICENSE.txt'])allowed.add('assets/'+file);
for(const file of [...expected,'styles.css','landing.css','landing.js','downloads.css','characters.css','characters.js','reader.js','site-nav.js','story-map.js','vault.css','vault-gallery.js','sitemap.xml','robots.txt','CNAME','.nojekyll','vault/1990/1990Vault.md'])allowed.add(file);
for(const file of files(out))assert(allowed.has(path.relative(out,file).split(path.sep).join('/')),`Unexpected deploy file: ${file}`);
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,16);
for(const file of htmlFiles){
 const html=fs.readFileSync(path.join(out,file),'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
 assert(html.includes('application/ld+json')&&html.includes('rel="canonical"'),file);
 for(const match of html.matchAll(/(?:origins|book-two|book-three|book-four)-chapter-(\d+)\.html/g))assert.equal(Number(match[1]),1,`Private chapter link in ${file}`);
 for(const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
  const ref=match[1].split(/[?#]/)[0];if(/^(https?:|data:)/.test(ref))continue;
  assert(fs.existsSync(path.join(out,ref)),`${file}: missing ${ref}`);
 }
 assert(!/read all \d+ chapters|complete book free|whole illustrated adventure is free/i.test(html),file);
}
for(const id of ids){
 const book=require('./content/books/'+id+'/book.json');
 const html=fs.readFileSync(path.join(out,id+'-chapter-1.html'),'utf8');
 assert(html.includes(`data-complete data-next="" href="${book.amazonUrl}"`));
 assert(html.includes('Next: continue on Amazon'));
}
async function browserChecks(){
 const {chromium}=require('playwright');
 const server=http.createServer((req,res)=>{const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.webp')?'image/webp':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
  const context=await browser.newContext();
  const legacy={read:['origins:18','book-four:12'],last:'book-four:12',lastByBook:{'book-four':'book-four:12'}};
  await context.addInitScript(value=>localStorage.setItem('defenders-book-progress-v8',JSON.stringify(value)),legacy);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const width of [320,390,1200]){
   await page.setViewportSize({width,height:900});
   for(const file of ['index.html','books.html','paperback.html','characters.html','map.html','1990-vault.html',...ids.map(id=>id+'-chapter-1.html')]){
    await page.goto(base+'/'+file);await page.evaluate(()=>document.fonts.ready);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file}: overflow at ${width}`);
    for(const href of await page.locator('[data-resume]:visible').evaluateAll(links=>links.map(a=>a.href)))assert(/-chapter-1\.html$/.test(href),`Stale resume: ${href}`);
    if(file==='map.html')assert.equal(await page.locator('.map-chapter-link').getAttribute('href'),require('./content/site.json').ebook.url);
   }
  }
  await page.goto(base+'/book-four-chapter-1.html');
  await page.locator('[data-complete]').evaluate(a=>a.addEventListener('click',event=>event.preventDefault()));
  await page.locator('[data-complete]').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('defenders-book-progress-v8'))),legacy);
  assert((await page.evaluate(()=>JSON.parse(localStorage.getItem('defenders-preview-progress-v1')))).read.includes('book-four:1'));
  assert.deepEqual(errors,[]);
  for(const id of ids){const response=await context.request.get(base+'/'+id+'-chapter-2.html');assert.equal(response.status(),404);}
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
}
browserChecks().then(()=>console.log('PASS: four Chapter 1 previews, two approved samples, Amazon continuation, no later pages/assets, safe source boundary, mobile layouts and preserved legacy progress.')).catch(error=>{console.error(error);process.exitCode=1;});
