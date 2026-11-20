const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const {samples,sampleLink}=require('../amazon-samples.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist'),site=require('../content/site.json');
const books=fs.readdirSync(path.join(root,'content/books')).map(id=>require(path.join(root,'content/books',id,'book.json'))).filter(b=>(b.number===1?site:b).ebook?.asin);
const server=http.createServer((req,res)=>{
 const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.ttf':'font/ttf'})[path.extname(file)]||'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
  const base=`http://127.0.0.1:${server.address().port}`;
  assert.equal(sampleLink({number:2},{},s=>s),'');
  assert(sampleLink({number:2,title:'Unknown',ebook:{url:site.ebook.url,asin:site.ebook.asin}},{},s=>s).includes(`href="${site.ebook.url}"`),'Missing direct sample uses the Kindle listing');
  for(const javaScriptEnabled of [true,false]){
   const context=await browser.newContext({javaScriptEnabled});
   // This fixture verifies navigation, not Amazon content or sample page turning.
   await context.route('https://read.amazon.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Sample navigation fixture</title>'}));
   const page=await context.newPage();
   for(const [width,height] of [[390,844],[768,1024],[1440,1000]]){
    await page.setViewportSize({width,height});
    for(const file of ['downloads.html','index.html','books.html','paperback.html',...books.map(b=>b.id+'.html')]){
     await page.goto(`${base}/${file}`);
     assert.equal(await page.locator('#kindle-sample-dialog,iframe[src*="read.amazon.com"],script[src*="kindle-sample"]').count(),0,'No blocked embed or modal');
     const links=page.locator('[data-amazon-sample]');
     const expected=books.some(b=>file===b.id+'.html')?2:books.length+(['downloads.html','books.html'].includes(file)?1:0);
     assert.equal(await links.count(),expected,file);
     for(const link of await links.all()){
      assert.equal(await link.getAttribute('target'),'_blank');
      assert((await link.getAttribute('rel')).split(' ').includes('noopener'));
      assert((await link.getAttribute('aria-label')).includes('opens in a new tab'));
      assert(Object.values(samples).includes(await link.getAttribute('href')));
     }
     if(file==='downloads.html'||file==='book-seven.html'){
      const link=links.first(),href=await link.getAttribute('href');
      const popupPromise=page.waitForEvent('popup');await link.click();const popup=await popupPromise;
      await popup.waitForURL(url=>url.href===href);assert.equal(popup.url(),href);await popup.close();
      assert.equal(page.url(),`${base}/${file}`,'Website remains open');
      assert.equal(await page.locator('body').evaluate(n=>getComputedStyle(n).position),'static','No background scroll lock');
     }
    }
   }
   await context.close();
  }
  console.log('PASS: all seven official sample links across book/catalog/home/sample/edition pages; accessible new-tab navigation with and without JavaScript at phone, tablet and desktop sizes; no blocked Amazon iframe or reader modal.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
