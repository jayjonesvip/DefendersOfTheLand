const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
const landmarks=require('../map-landmarks.js'),original=require('../content/map/locations.json');
assert.deepEqual(landmarks.slice(0,4).map(p=>({id:p.id,name:p.name,coordinates:[p.lng,p.lat]})),original.map(({id,name,coordinates})=>({id,name,coordinates})),'Preserve all original landmark coordinates and names');
assert.equal(landmarks.length,4,'Recurring locations share one marker');
for(const p of landmarks)for(const appearance of Object.values(p.appearances))assert(/^(origins|book-two|book-three|book-four)-chapter-1\.html$/.test(appearance.chapterUrl));
// Optional photos must be deliberate, dimensioned and accessible; none are published yet.
const renderMap=require('../map.cjs').createMap,site=require('../content/site.json');
try{
 landmarks[0].photo={src:'assets/origins-cover-unlikely-heroes-web-v6.webp',alt:'Test image',width:1200,height:1800,caption:'Test caption'};
 const html=renderMap({geometry:{features:[]},site,escape:String});
 assert(html.includes('class="map-location-photo"')&&html.includes('width="1200" height="1800"')&&html.includes('alt="Test image"'));
 landmarks[0].photo.alt='';assert.throws(()=>renderMap({geometry:{features:[]},site,escape:String}),/photo, alt text and dimensions/);
}finally{landmarks[0].photo=null;}
const server=http.createServer((req,res)=>{const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Security-Policy',"script-src 'self' 'unsafe-inline'; connect-src 'self'");res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.webp':'image/webp','.ttf':'font/ttf'})[path.extname(file)]||'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
 const base=`http://127.0.0.1:${server.address().port}`,errors=[];
 for(const dark of [false,true]){
  const context=await browser.newContext({viewport:{width:1200,height:950},reducedMotion:'reduce'});
  await context.addInitScript(d=>localStorage.setItem('defenders-book-settings-v1',JSON.stringify({size:20,dark:d})),dark);
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/map.html');
  assert.equal(await page.locator('[data-marker]:visible').count(),4);assert.equal(await page.locator('.map-location-photo').count(),0);
  const list=page.locator('[data-location="public-square"]');await list.focus();await page.keyboard.press('Enter');
  assert.equal(await list.getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-marker="public-square"]').getAttribute('aria-expanded'),'true');
  assert.equal(await page.locator('#map-popup-title').innerText(),'Public Square');assert.equal(await page.locator('.story-map-canvas').getAttribute('data-zoom'),'1.500');
  assert.equal(await page.locator('.is-selected').getAttribute('data-landmark-card'),'public-square');assert.equal(await page.locator('#map-popup a').getAttribute('href'),'origins-chapter-1.html');
  const mapBox=await page.locator('.story-map-canvas').boundingBox(),pinBox=await page.locator('[data-marker="public-square"]').boundingBox();assert(Math.abs(pinBox.x+pinBox.width/2-(mapBox.x+mapBox.width/2))<3,'Selected point pans to center');
  await page.locator('[data-map-close]').click();assert.equal(await page.locator('#map-popup').isVisible(),false);
  await page.locator('[data-map-reset]').click();await page.locator('[data-marker="main-library"]').click();
  assert.equal(await page.locator('[data-location="main-library"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#map-popup-title').innerText(),'Main Library');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#map-popup').isVisible(),false);
  for(const [book,count,prefix] of [['2',3,'book-two'],['3',1,'book-three'],['4',2,'book-four']]){
   await page.locator(`[data-map-book="${book}"]`).click();
   assert.equal(await page.locator('[data-landmark-card]:visible').count(),count);
   assert.equal(await page.locator('[data-marker]:visible').count(),count);
   assert(!(await page.locator('.map-empty').isVisible()));
   for(const href of await page.locator('[data-landmark-card]:visible .map-read-link').evaluateAll(links=>links.map(a=>a.getAttribute('href'))))assert.equal(href,prefix+'-chapter-1.html');
   await page.locator('[data-landmark-card]:visible [data-location]').first().click();
   assert.equal(await page.locator('#map-popup a').getAttribute('href'),prefix+'-chapter-1.html');
   if(book==='4'){
    await page.locator('[data-location="union-terminal"]').click();
    assert.equal(await page.locator('#map-popup-title').innerText(),'Terminal Tower');
    assert.equal(await page.locator('.is-selected .map-card-blurb').textContent(),'Dork has a shelf picked out for Terminal Tower.');
   }
  }
  await page.locator('[data-map-book="all"]').click();assert.equal(await page.locator('[data-marker]:visible').count(),4);
  await page.locator('[data-map-book="1"]').focus();await page.keyboard.press('Space');assert.equal(await page.locator('[data-landmark-card]:visible').count(),4);assert.equal(await page.locator('[data-marker]:visible').count(),4);
  await page.locator('[data-map-zoom="in"]').click();assert(Number(await page.locator('.story-map-canvas').getAttribute('data-zoom'))>1);await page.locator('[data-map-reset]').click();assert.equal(await page.locator('.story-map-canvas').getAttribute('data-zoom'),'1.000');
  await page.goto(base+'/map.html#union-terminal');assert.equal(await page.locator('#map-popup-title').innerText(),'Tower City / Union Terminal');
  for(const width of [320,390,768,1200]){await page.setViewportSize({width,height:950});await page.evaluate(()=>document.fonts.ready);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Map overflow ${width}, dark=${dark}`);if(width<900)assert((await page.locator('.story-map-canvas').boundingBox()).height>=950*.6-1);}
  await context.close();
 }
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await mobile.newPage();await page.goto(base+'/map.html');await page.locator('.story-map-canvas').scrollIntoViewIfNeeded();const box=await page.locator('.story-map-canvas').boundingBox(),before=await page.evaluate(()=>scrollY),client=await mobile.newCDPSession(page),start=Math.min(box.y+box.height-40,740);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:start}]});for(let step=1;step<=6;step++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y:start-step*35}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForFunction(y=>scrollY>y+50,before);await mobile.close();
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),staticPage=await nojs.newPage();await staticPage.goto(base+'/map.html');assert.equal(await staticPage.locator('[data-landmark-card]:visible').count(),4);assert.equal(await staticPage.locator('[data-landmark-card] .map-read-link:visible').count(),10);assert.equal(await staticPage.locator('[data-map-filters]').isVisible(),false);await nojs.close();
 assert.deepEqual(errors,[]);console.log('PASS: preserved coordinates, pan/zoom, marker/list sync, keyboard filters and popup, all four book filters and preview destinations, hash links, responsive themes, native touch scrolling and no-JS landmark links.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
