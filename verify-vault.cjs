const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
async function check(){
 const root=__dirname,dist=path.join(root,'dist'),qa=path.join(root,'tmp/qa');fs.mkdirSync(qa,{recursive:true});
 const items=JSON.parse(fs.readFileSync(path.join(root,'content/vault/gallery.json')));
 assert.equal(items.length,9);assert.equal(new Set(items.map(i=>i.original)).size,9);
 for(const item of items){
  const original=fs.readFileSync(path.join(dist,item.original));
  assert.equal(crypto.createHash('sha256').update(original).digest('hex'),item.sha256);
  assert.deepEqual(original,fs.readFileSync(path.join(root,'public',item.original)));
  for(const preview of item.previews)assert(fs.statSync(path.join(dist,preview.file)).size<original.length/3,'Preview must be optimized');
 }
 assert.deepEqual(fs.readFileSync(path.join(dist,'vault/1990/1990Vault.md')),fs.readFileSync(path.join(root,'content/vault/1990Vault.md')));
 const server=http.createServer((req,res)=>{
  const file=path.resolve(dist,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.png')?'image/png':file.endsWith('.webp')?'image/webp':file.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const executable=process.env.BOOK_CHROMIUM||(process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p)):undefined);
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  const page=await browser.newPage({hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/1990-vault.html');
  assert.equal(await page.locator('h1').innerText(),'Before the Books,\nThere Were Notebooks.');
  assert.equal(await page.locator('.vault-card').count(),9);
  assert.equal(await page.locator('.vault-art img[loading="lazy"]').count(),9);
  assert(await page.locator('.vault-note').innerText().then(t=>t.includes('not current book canon')));
  assert(await page.locator('.vault-article').innerText().then(t=>t.includes('Harvey Wilcox Hawkins III')&&t.includes('THE END, DUDE.')&&t.includes('By Jason Jones')));
  assert.equal(await page.locator('.vault-books a').first().getAttribute('href'),'paperback.html');
  await page.locator('.vault-art img').evaluateAll(images=>Promise.all(images.map(image=>{image.loading='eager';return image.decode();})));
  for(const width of [320,390,768,1200]){
   await page.setViewportSize({width,height:900});
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Vault overflow at ${width}`);
   assert(await page.locator('.vault-art img').evaluateAll(images=>images.every(image=>Math.abs(image.getBoundingClientRect().width/image.getBoundingClientRect().height-image.naturalWidth/image.naturalHeight)<.005)),'Keep original proportions');
  }
  await page.setViewportSize({width:1200,height:900});
  await page.screenshot({path:path.join(qa,'vault-desktop.png'),fullPage:true});
  const first=page.locator('.vault-art').first();await first.click();
  assert(await page.locator('dialog').evaluate(d=>d.open));
  assert.equal(await page.locator('#vault-lightbox-image').getAttribute('src'),items[0].original);
  await page.locator('#vault-lightbox-image').evaluate(image=>image.decode());
  await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#vault-lightbox-title').innerText(),items[1].title);
  await page.keyboard.press('Home');await page.keyboard.press('ArrowLeft');assert.equal(await page.locator('#vault-lightbox-title').innerText(),items[8].title);
  await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#vault-lightbox-title').innerText(),items[0].title);
  await page.keyboard.press('End');assert.equal(await page.locator('#vault-lightbox-title').innerText(),items[8].title);
  for(let n=0;n<8;n++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>document.querySelector('dialog').contains(document.activeElement)),'Focus stays inside modal');}
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open&&document.body.style.overflow==='');
  assert(await first.evaluate(link=>document.activeElement===link),'Restore gallery focus');
  assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(qa,'vault-mobile.png'),fullPage:true});
  await first.click();
  await page.locator('.vault-lightbox-stage').evaluate(stage=>{
   const start=new Event('touchstart'),end=new Event('touchend');
   Object.defineProperty(start,'touches',{value:[{clientX:250,clientY:150}]});Object.defineProperty(end,'changedTouches',{value:[{clientX:80,clientY:153}]});
   stage.dispatchEvent(start);stage.dispatchEvent(end);
  });
  assert.equal(await page.locator('#vault-lightbox-title').innerText(),items[1].title);
  await page.locator('[data-vault-prev]').click();assert.equal(await page.locator('#vault-lightbox-title').innerText(),items[0].title);
  await page.locator('#vault-lightbox-image').evaluate(image=>image.decode());
  assert(!(await page.locator('dialog').evaluate(d=>d.scrollWidth>d.clientWidth)),'Mobile modal has no horizontal overflow');
  await page.screenshot({path:path.join(qa,'vault-lightbox-mobile.png')});
  await page.locator('[data-vault-close]').click();
  await page.waitForFunction(()=>!document.querySelector('dialog').open&&document.body.style.overflow==='');
  await page.locator('#nav-toggle').click();await page.locator('#theme').click();assert(await page.locator('body').evaluate(b=>b.classList.contains('dark')));
  await page.screenshot({path:path.join(qa,'vault-dark-mobile.png'),fullPage:false});
  for(const file of ['index.html','books.html','origins.html']){await page.goto(base+'/'+file);assert.equal(await page.locator('header nav a[href="author.html"]').count(),1);}
  await page.goto(base+'/author.html');
  assert.equal(await page.locator('h1').innerText(),'Jay Jones');
  await page.locator('.author-portrait img').evaluate(image=>image.decode());
  assert.equal(await page.locator('.author-archive-card').getAttribute('href'),'1990-vault.html');
  await page.locator('.author-archive-card img').evaluate(image=>image.decode());
  for(const width of [320,390,768,1200]){
   await page.setViewportSize({width,height:844});
   assert(await page.locator('.author-archive-card img').evaluate(image=>image.getBoundingClientRect().width<=150),'Author archive image stays thumbnail-sized');
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),'Author archive card fits viewport');
  }
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(qa,'author-mobile.png'),fullPage:true});
  await page.locator('.author-archive-card').click();
  assert.equal(await page.locator('.vault-breadcrumb a').nth(1).getAttribute('href'),'author.html');
  await require('./verify-navigation-race.cjs').check(browser,base);
  for(const file of ['index.html','author.html','1990-vault.html','origins-chapter-1.html']){
   // Set the mobile breakpoint before navigation. Otherwise a pending media-query
   // change from this resize can close the menu after Enter has opened it.
   await page.setViewportSize({width:390,height:844});await page.goto(base+'/'+file);
   const toggle=page.locator('#nav-toggle'),nav=page.locator('#site-navigation');
   assert(await toggle.isVisible());assert(!(await nav.isVisible()));assert.equal(await toggle.getAttribute('aria-expanded'),'false');
   await toggle.focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.getElementById('nav-toggle').getAttribute('aria-expanded')==='true'&&document.getElementById('site-navigation').getBoundingClientRect().height>0);
   assert(await nav.isVisible());assert.equal(await toggle.getAttribute('aria-expanded'),'true');
   await nav.locator('a').first().focus();await page.keyboard.press('Escape');
   await page.waitForFunction(()=>document.getElementById('nav-toggle').getAttribute('aria-expanded')==='false'&&document.getElementById('site-navigation').getBoundingClientRect().height===0);
   assert(!(await nav.isVisible()));assert(await toggle.evaluate(button=>document.activeElement===button));
   await toggle.click();await page.locator('h1').click();assert(!(await nav.isVisible()),'Close menu on outside click');
   await page.setViewportSize({width:1200,height:900});assert(!(await toggle.isVisible()));assert(await nav.isVisible());
   await nav.locator('a').first().focus();await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.activeElement===document.getElementById('nav-toggle'));assert(!(await nav.isVisible()));
   for(const width of [320,768,1200]){await page.setViewportSize({width,height:900});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`${file} navigation overflow at ${width}`);}
  }
  await page.goto(base+'/author.html');await page.setViewportSize({width:1200,height:900});
  await page.screenshot({path:path.join(qa,'author-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.locator('#nav-toggle').click();
  await page.screenshot({path:path.join(qa,'mobile-navigation.png'),fullPage:false});
  const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base+'/1990-vault.html');
  await nojs.setViewportSize({width:390,height:844});assert(await nojs.locator('#site-navigation').isVisible());assert(!(await nojs.locator('#nav-toggle').isVisible()));
  assert.equal(await nojs.locator('.vault-art').first().getAttribute('href'),items[0].original);
  await nojs.locator('.vault-art').first().click();assert(nojs.url().endsWith(items[0].original),'Original accessible without JavaScript');
  assert.deepEqual(errors,[]);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
 console.log('PASS: Vault originals and source preserved, nine uncropped optimized images, desktop/mobile layouts, keyboard navigation, modal focus, swipe handling, dark mode and no-JavaScript fallback.');
}
module.exports={check};
if(require.main===module)check().catch(error=>{console.error(error);process.exitCode=1;});
