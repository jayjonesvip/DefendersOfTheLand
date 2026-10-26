const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist'),site=require('../content/site.json');
const ids=['origins','book-two','book-three','book-four'];
const server=http.createServer((req,res)=>{const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Security-Policy',"script-src 'self' 'unsafe-inline'; connect-src 'self'");res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]||'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
function contrast(a,b){const luminance=hex=>{let h=hex.trim().slice(1);if(h.length===3)h=[...h].map(c=>c+c).join('');const rgb=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
  const base=`http://127.0.0.1:${server.address().port}`,errors=[];
  for(const dark of [false,true]){
   const context=await browser.newContext({reducedMotion:'reduce'});
   await context.addInitScript(value=>localStorage.setItem('defenders-book-settings-v1',JSON.stringify({size:20,dark:value})),dark);
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   for(const width of [320,390,768,820,1200,1440]){
    await page.setViewportSize({width,height:900});await page.goto(base+'/index.html');await page.evaluate(()=>document.fonts.ready);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Landing overflow: ${width}, dark=${dark}`);
    assert.equal(await page.locator('.series-shelf li').count(),4);
    assert.equal(await page.locator('.volume-card').count(),4);
    assert.equal(await page.locator('h1').count(),1);
    assert.equal(await page.locator('.hero-primary a').first().getAttribute('href'),'origins-chapter-1.html');
    assert.equal(await page.locator('.hero-copy>.launch-series-link').getAttribute('href'),site.amazonSeriesUrl);
    assert.equal(await page.locator('.closing-actions a').first().getAttribute('href'),site.amazonSeriesUrl);
    assert.equal(await page.locator('.will-reveal').count(),0,'Reduced motion must not hide content');
    for(const [i,id] of ids.entries()){
     const book=require('../content/books/'+id+'/book.json');
     assert.equal(await page.locator('.series-shelf li').nth(i).locator('a').getAttribute('href'),id+'.html');
     assert.equal(await page.locator('.volume-teaser').nth(i).innerText(),book.description);
    }
    assert(await page.locator('img').evaluateAll(images=>images.every(img=>Number(img.getAttribute('width'))>0&&Number(img.getAttribute('height'))>0)),'Reserve image dimensions');
    assert(await page.locator('.series-volume-title,.volume-copy h3').evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth+1)),'Book titles must not overflow their cards');
    const pairs=await page.evaluate(()=>{const s=getComputedStyle(document.body),v=p=>s.getPropertyValue(p).trim();return [[v('--ink'),v('--paper')],[v('--muted'),v('--paper')],[v('--accent'),v('--paper')],[v('--ink'),v('--launch-surface')],[v('--muted'),v('--launch-surface')],['#fff7e9',v('--launch-night')],['#c2cdd0',v('--launch-night')],[v('--launch-sun'),v('--launch-night')]];});
    for(const pair of pairs)assert(contrast(...pair)>=4.5,`Text contrast below AA: ${pair}`);
    if(width<=800){
     const toggle=page.locator('#nav-toggle');await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
     assert.equal(await page.locator('#site-navigation a:visible').count(),6);await page.keyboard.press('Escape');
     assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(n=>n===document.activeElement));
    }
   }
   await page.locator('#theme').click();assert.equal(await page.locator('body').evaluate(n=>n.classList.contains('dark')),!dark);
   await context.close();
  }
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const staticPage=await nojs.newPage();await staticPage.goto(base+'/index.html');
  assert.equal(await staticPage.locator('#site-navigation a:visible').count(),6);
  assert.equal(await staticPage.locator('[data-reveal]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1')),true);
  await nojs.close();
  const motion=await browser.newContext({viewport:{width:1200,height:800},reducedMotion:'no-preference'});
  const page=await motion.newPage();await page.goto(base+'/index.html');
  assert(await page.locator('.will-reveal').count()>0,'Enable progressive scroll reveal when appropriate');
  for(const node of await page.locator('[data-reveal]').all())await node.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelectorAll('.will-reveal').length===0);
  await motion.close();assert.deepEqual(errors,[]);
  console.log('PASS: landing themes, AA text-color pairs, 320–1440px layouts, book order/copy/links, reserved image sizes, menu keyboard behavior, no-JS and reduced-motion fallbacks.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1});
