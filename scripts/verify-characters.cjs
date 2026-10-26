const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const server=http.createServer((req,res)=>{const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf'})[path.extname(file)]||'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
  const url=`http://127.0.0.1:${server.address().port}/characters.html`;
  const context=await browser.newContext({viewport:{width:1200,height:900}}),page=await context.newPage();
  await page.goto(url);
  assert(await page.locator('.profiles img').evaluateAll(images=>images.every(image=>image.getAttribute('loading')==='lazy'&&Number(image.getAttribute('width'))>0&&Number(image.getAttribute('height'))>0)),'Portraits need lazy loading and intrinsic dimensions');
  const alpha=await page.locator('.profiles img').evaluateAll(async images=>{
   const results=[];
   for(const image of images){image.loading='eager';await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,64,64);const pixels=ctx.getImageData(0,0,64,64).data;let transparent=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]<=2)transparent++;results.push({file:image.src.split('/').at(-1),transparent:transparent/4096,corners:[pixels[3],pixels[63*4+3],pixels[(63*64)*4+3],pixels[(64*64-1)*4+3]]});}return results;
  });
  assert.equal(alpha.length,14);
  for(const image of alpha){assert(image.transparent>.2,`Opaque portrait: ${image.file}`);assert(image.corners.every(a=>a<=2),`Opaque portrait corners: ${image.file}`);}
  assert.equal(await page.locator('.character-card:visible').count(),11);
  const villain=page.locator('[data-character-filter="villains"]');await villain.focus();await page.keyboard.press('Space');
  assert.equal(await villain.getAttribute('aria-pressed'),'true');
  assert.deepEqual(await page.locator('.character-card:visible').evaluateAll(nodes=>nodes.map(n=>n.id)),['doc','eleanor','luke','laura']);
  assert.equal(await page.locator('[data-character-status]').innerText(),'Showing 4 villains.');
  await page.locator('[data-character-filter="allies"]').click();
  assert.deepEqual(await page.locator('.character-card:visible').evaluateAll(nodes=>nodes.map(n=>n.id)),['claude']);
  await page.locator('[data-character-filter="all"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.character-card:visible').count(),11);
  const opacity=async(id,view)=>Number(await page.locator(`#${id} .character-${view}`).evaluate(n=>getComputedStyle(n).opacity));
  for(const id of ['jenny','seth','laura']){
   assert.equal(await page.locator('#'+id+'-costume').isChecked(),false);
   await page.locator('#'+id+' .character-transform').hover();
   await page.waitForFunction(id=>getComputedStyle(document.querySelector(`#${id} .character-costume`)).opacity==='1',id);
   assert.equal(await opacity(id,'civilian'),0);
   await page.locator('h1').hover();
   await page.waitForFunction(id=>getComputedStyle(document.querySelector(`#${id} .character-costume`)).opacity==='0',id);
  }
  await page.keyboard.press('Tab');await page.locator('#jenny-costume').focus();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#jenny .character-costume')).opacity==='1');
  assert.equal(await page.locator('#jenny .character-transform').evaluate(n=>getComputedStyle(n).outlineStyle),'solid');
  await page.keyboard.press('Space');assert(await page.locator('#jenny-costume').isChecked());
  await page.keyboard.press('Tab');assert.equal(await opacity('jenny','costume'),1,'Pinned costume persists after focus leaves');
  await page.locator('[data-character-filter="villains"]').click();
  await page.locator('[data-character-filter="all"]').click();
  assert(await page.locator('#jenny-costume').isChecked(),'Filtering must preserve pinned costumes');
  await context.close();
  for(const javaScriptEnabled of [true,false]){
   const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',javaScriptEnabled});
   const p=await mobile.newPage();await p.goto(url);
   for(const id of ['jenny','seth','laura']){
    const label=p.locator('#'+id+' .character-transform'),input=p.locator('#'+id+'-costume');
    await label.tap();assert(await input.isChecked());assert.equal(await p.locator('#'+id+' .character-costume').evaluate(n=>getComputedStyle(n).opacity),'1');
    await label.tap();assert.equal(await input.isChecked(),false);assert.equal(await p.locator('#'+id+' .character-costume').evaluate(n=>getComputedStyle(n).opacity),'0');
    assert.equal(await p.locator('#'+id+' .character-costume').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
   }
   if(!javaScriptEnabled){assert.equal(await p.locator('[data-character-filters]').isVisible(),false);assert.equal(await p.locator('.character-card:visible').count(),11);}
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mobile.close();
  }
  console.log('PASS: all 14 character views have real transparency; hover, keyboard focus/Space, persistent pinning, touch, reduced motion and no-JS toggles work; keyboard filters, live counts and pin preservation pass.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exitCode=1});
