const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const {samples,sampleLink}=require('../amazon-samples.cjs');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const site=require('../content/site.json');
const kindleBooks=fs.readdirSync(path.join(root,'content/books')).map(id=>require(path.join(root,'content/books',id,'book.json'))).filter(book=>(book.number===1?site:book).ebook?.asin);
const server=http.createServer((req,res)=>{
 const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}
 try{res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.ttf':'font/ttf'})[path.extname(file)]||'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
});
async function insideViewport(locator,width,height){
 const box=await locator.boundingBox();assert(box,'Control is visible');
 assert(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1,JSON.stringify(box));
 return box;
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
  const base=`http://127.0.0.1:${server.address().port}`;
  const context=await browser.newContext(),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let requests=0;
  // Only the shell is tested offline. This empty cross-origin document is not a Kindle sample.
  await context.route('https://read.amazon.com/**',route=>{requests++;return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Offline frame fixture</title>'});});
  for(const book of kindleBooks){
   const id=book.id,edition=(book.number===1?site:book).ebook;
   await page.goto(`${base}/${id}.html`);
   const button=page.locator('[data-kindle-sample]');
   assert.equal(await button.count(),1);assert.equal(await button.textContent(),'Read Sample');
   assert.equal(await page.locator('iframe').count(),0,'Nothing loaded before opening');
   const asin=await button.getAttribute('data-kindle-sample');
   assert.equal(asin,edition.asin,'Reader uses the supplied Kindle edition');
   await button.click();
   const dialog=page.getByRole('dialog');assert(await dialog.isVisible());
   assert.equal(await dialog.locator('h2').textContent(),await button.getAttribute('data-sample-title'));
   const src=new URL(await dialog.locator('iframe').getAttribute('src'));
   assert.equal(src.origin+src.pathname,'https://read.amazon.com/kp/embed');assert.equal(src.searchParams.get('asin'),asin);assert.equal(src.searchParams.get('preview'),'inline');
   assert.equal(await dialog.locator('[data-sample-fallback]').getAttribute('href'),samples[id]||edition.url);
   assert(await dialog.locator('[data-sample-close]').evaluate(n=>n===document.activeElement));
   await page.keyboard.press('Escape');assert(!(await dialog.isVisible()));
   await page.locator('iframe').waitFor({state:'detached'});
   assert(await button.evaluate(n=>n===document.activeElement));assert.equal(await page.locator('iframe').count(),0);
  }
  assert.equal(requests,kindleBooks.length,'One on-demand frame per book');
  assert.equal(sampleLink({number:2}, {},s=>s),'','No sample for books without Kindle metadata');
  assert.equal(sampleLink({number:2,ebook:{url:'https://www.amazon.com/dp/B0HMXK83HK',asin:'bad'}},{},s=>s),'');
  assert(sampleLink({number:2,title:'Unknown',ebook:{url:'https://www.amazon.com/dp/B0HMXK83HK',asin:'B0HMXK83HK'}},{},s=>s).includes('href="https://www.amazon.com/dp/B0HMXK83HK"'),'Unknown direct sample falls back to listing');
  for(const touch of [false,true])for(const [width,height] of [[320,568],[390,844],[768,1024],[1024,768],[1366,768],[1440,1000],[844,390]]){
   const sized=await browser.newContext({viewport:{width,height},hasTouch:touch,isMobile:touch});
   await sized.route('https://read.amazon.com/**',r=>r.fulfill({body:'<!doctype html><title>Offline frame fixture</title>',contentType:'text/html'}));
   const p=await sized.newPage();await p.goto(`${base}/origins.html`);
   for(const dark of [false,true]){
    await p.evaluate(dark=>document.body.classList.toggle('dark',dark),dark);
    const button=p.locator('[data-kindle-sample]');await button.scrollIntoViewIfNeeded();
    const before=await p.evaluate(()=>scrollY);await button.click();
    assert.equal(await p.locator('body').evaluate(n=>getComputedStyle(n).position),'fixed');
    const dialog=p.getByRole('dialog');await insideViewport(dialog,width,height);
    const closeBox=await insideViewport(dialog.locator('[data-sample-close]'),width,height);assert(closeBox.height>=48&&closeBox.width>=48);
    await insideViewport(dialog.locator('[data-sample-fallback]'),width,height);
    const frameBox=await insideViewport(dialog.locator('iframe'),width,height);
    const fullScreen=width<=600||touch&&height<=500;
    assert(frameBox.height>=(fullScreen?height:Math.min(940,height-48))-160,`Reader height at ${width}×${height}: ${frameBox.height}`);
    if(width<=600||touch&&height<=500){const box=await dialog.boundingBox();assert.equal(box.width,width);assert.equal(box.height,height);}
    // Native dialog keeps Tab navigation out of the background page.
    for(let i=0;i<5;i++){await p.keyboard.press('Tab');assert(await dialog.evaluate(d=>d.contains(document.activeElement)));}
    await dialog.locator('[data-sample-close]').click();
    await p.locator('iframe').waitFor({state:'detached'});
    assert(await button.evaluate(n=>n===document.activeElement));
    assert(Math.abs(await p.evaluate(()=>scrollY)-before)<2,'Scroll position restored');
    assert.equal(await p.locator('body').getAttribute('style'),null);
   }
   await sized.close();
  }
  await page.goto(`${base}/books.html`);assert.equal(await page.locator('[data-kindle-sample]').count(),kindleBooks.length);
  await page.locator('[data-kindle-sample]').last().focus();await page.keyboard.press('Space');assert(await page.getByRole('dialog').isVisible());await page.keyboard.press('Escape');
  for(const options of [{javaScriptEnabled:false},{}]){
   const fallbackContext=await browser.newContext(options);
   if(options.javaScriptEnabled!==false)await fallbackContext.addInitScript(()=>HTMLDialogElement.prototype.showModal=undefined);
   const fallbackPage=await fallbackContext.newPage();await fallbackPage.goto(`${base}/origins.html`);
   const button=fallbackPage.locator('[data-kindle-sample]');assert.equal(await button.getAttribute('href'),samples.origins);assert.equal(await button.getAttribute('role'),null);
   await fallbackContext.close();
  }
  assert.deepEqual(errors,[]);await context.close();
  console.log('PASS: all catalog ASINs, lazy loading and teardown, metadata fallback, dialog keyboard/focus, scroll restoration, no-JS links, both themes, phone/tablet/desktop and touch landscape layouts. Amazon content and page turning require live verification.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
