const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
async function check(){
 const dist=path.join(__dirname,'dist'),qa=path.join(__dirname,'tmp/qa');fs.mkdirSync(qa,{recursive:true});
 const server=http.createServer((req,res)=>{const file=path.resolve(dist,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(dist+path.sep)){res.writeHead(403).end();return}try{res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const executable=process.env.BOOK_CHROMIUM||(process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p)):undefined);
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  const page=await browser.newPage(),errors=[],base=`http://127.0.0.1:${server.address().port}`;page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/books.html');assert.equal(await page.locator('.book-card').count(),2);
  await page.evaluate(()=>localStorage.setItem('defenders-book-progress-v8',JSON.stringify({read:['origins:4'],positions:{'origins:4':.35},last:'origins:4'})));
  await page.goto(base+'/book-two.html');assert.equal(await page.locator('[data-book-progress]').innerText(),'0 of 5 chapters completed');assert.equal(await page.locator('[data-resume]').isVisible(),false);assert.equal(await page.locator('.chapter-list li').count(),5);
  await page.locator('.chapter-list a').first().click();await page.waitForURL('**/book-two-chapter-1.html');assert.equal(await page.locator('h1').innerText(),'One More Thing to Finish');
  const chapter=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two/chapter-01.json')));
  assert.equal(await page.locator('.chapter-body p').allTextContents().then(ps=>ps.join('\n')),chapter.blocks.map(b=>b.text).join('\n'));
  await page.locator('.chapter-body img').evaluate(img=>{img.loading='eager';return img.decode()});
  for(const width of [320,390,1200]){await page.setViewportSize({width,height:850});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Book Two chapter overflow at ${width}`);assert(await page.locator('.chapter-body img').evaluate(img=>img.naturalWidth>0));}
  await page.locator('[data-font="+"]').click();assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--prose-size')),'22px');await page.locator('#focus').click();assert.equal(await page.locator('#focus').innerText(),'Exit focus');await page.locator('#focus').click();
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:path.join(qa,'book-two-chapter-1-mobile.png'),fullPage:false});
  await page.setViewportSize({width:1200,height:900});await page.screenshot({path:path.join(qa,'book-two-chapter-1-desktop.png'),fullPage:false});
  await page.locator('[data-complete]').click();await page.waitForURL('**/book-two-chapter-2.html');assert.equal(await page.locator('h1').innerText(),'Watch Where You Kick');assert.equal(await page.locator('.chapter-ending a').first().getAttribute('href'),'book-two-chapter-1.html');
  const chapterTwo=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two/chapter-02.json')));
  assert.equal(await page.locator('.chapter-body p').allTextContents().then(ps=>ps.join('\n')),chapterTwo.blocks.map(b=>b.text).filter(Boolean).join('\n'));
  assert.deepEqual(await page.locator('.scene-heading').allTextContents(),['Jenny’s Practice','Seth’s Practice']);
  assert.deepEqual(await page.locator('.chapter-body img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src'))),['assets/book-two-chapter-02-jenny-practice.webp','assets/book-two-chapter-02-seth-practice.webp']);
  await page.locator('.chapter-body img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return img.decode()})));
  assert(await page.locator('.chapter-body').evaluate(body=>{const headings=body.querySelectorAll('h2'),figures=body.querySelectorAll('figure');return !!(headings[0].compareDocumentPosition(figures[0])&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(figures[0].compareDocumentPosition(headings[1])&Node.DOCUMENT_POSITION_FOLLOWING)&&!!(headings[1].compareDocumentPosition(figures[1])&Node.DOCUMENT_POSITION_FOLLOWING)}));
  for(const width of [320,390,1200]){await page.setViewportSize({width,height:850});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Chapter 2 overflow at ${width}`);assert(await page.locator('.chapter-body img').evaluateAll(imgs=>imgs.every(img=>img.naturalWidth>0)));}
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:path.join(qa,'book-two-chapter-2-mobile.png'),fullPage:false});
  await page.setViewportSize({width:1200,height:900});await page.screenshot({path:path.join(qa,'book-two-chapter-2-desktop.png'),fullPage:false});
  await page.locator('[data-complete]').click();await page.waitForURL('**/book-two-chapter-3.html');assert.equal(await page.locator('h1').innerText(),'Room to Breathe');assert.equal(await page.locator('.chapter-ending a').first().getAttribute('href'),'book-two-chapter-2.html');
  const chapterThree=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two/chapter-03.json')));
  assert.equal(await page.locator('.chapter-body p').allTextContents().then(ps=>ps.join('\n')),chapterThree.blocks.map(b=>b.text).filter(Boolean).join('\n'));
  assert.deepEqual(await page.locator('.chapter-body img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src'))),['assets/book-two-chapter-03-rooftop-talk.webp','assets/book-two-chapter-03-seth-success.webp','assets/book-two-chapter-03-jenny-training-rear.webp','assets/book-two-chapter-03-jenny-success.webp']);
  await page.locator('.chapter-body img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return img.decode()})));
  for(const width of [320,390,1200]){await page.setViewportSize({width,height:850});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Chapter 3 overflow at ${width}`);assert(await page.locator('.chapter-body img').evaluateAll(imgs=>imgs.every(img=>img.naturalWidth>0)));}
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:path.join(qa,'book-two-chapter-3-mobile.png'),fullPage:false});
  await page.setViewportSize({width:1200,height:900});await page.screenshot({path:path.join(qa,'book-two-chapter-3-desktop.png'),fullPage:false});
  await page.locator('[data-complete]').click();await page.waitForURL('**/book-two-chapter-4.html');assert.equal(await page.locator('h1').innerText(),'More to Carry');assert.equal(await page.locator('.chapter-ending a').first().getAttribute('href'),'book-two-chapter-3.html');
  const chapterFour=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two/chapter-04.json')));
  assert.equal(await page.locator('.chapter-body p').allTextContents().then(ps=>ps.join('\n')),chapterFour.blocks.map(b=>b.text).filter(Boolean).join('\n'));
  assert.equal(await page.locator('.chapter-body img').count(),1);assert(chapterFour.blocks.map(b=>b.text).join(' ').split(/\s+/).length<400);
  await page.locator('.chapter-body img').evaluate(img=>{img.loading='eager';return img.decode()});
  for(const width of [320,390,1200]){await page.setViewportSize({width,height:850});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Chapter 4 overflow at ${width}`);assert(await page.locator('.chapter-body img').evaluate(img=>img.naturalWidth>0));}
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:path.join(qa,'book-two-chapter-4-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1200,height:900});await page.screenshot({path:path.join(qa,'book-two-chapter-4-desktop.png'),fullPage:true});
  await page.locator('[data-complete]').click();await page.waitForURL('**/book-two-chapter-5.html');assert.equal(await page.locator('h1').innerText(),'Words and Actions');assert.equal(await page.locator('.chapter-ending a').first().getAttribute('href'),'book-two-chapter-4.html');
  const chapterFive=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two/chapter-05.json')));
  assert.equal(await page.locator('.chapter-body p').allTextContents().then(ps=>ps.join('\n')),chapterFive.blocks.map(b=>b.text).filter(Boolean).join('\n'));
  assert.deepEqual(await page.locator('.chapter-body img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src'))),['assets/book-two-chapter-05-larry-advice.webp','assets/book-two-chapter-05-reporting-rounds.webp','assets/book-two-chapter-05-new-shoes.webp']);
  await page.locator('.chapter-body img').evaluateAll(imgs=>Promise.all(imgs.map(img=>{img.loading='eager';return img.decode()})));
  for(const width of [320,390,1200]){await page.setViewportSize({width,height:850});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Chapter 5 overflow at ${width}`);assert(await page.locator('.chapter-body img').evaluateAll(imgs=>imgs.every(img=>img.naturalWidth>0)));}
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:path.join(qa,'book-two-chapter-5-mobile.png'),fullPage:false});
  await page.setViewportSize({width:1200,height:900});await page.screenshot({path:path.join(qa,'book-two-chapter-5-desktop.png'),fullPage:false});
  await page.locator('[data-complete]').click();await page.waitForURL('**/book-two.html');assert.equal(await page.locator('[data-book-progress]').innerText(),'5 of 5 chapters completed');assert.equal(await page.locator('[data-resume]').getAttribute('href'),'book-two-chapter-5.html');
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('defenders-book-progress-v8')));assert.deepEqual(state.read,['origins:4','book-two:1','book-two:2','book-two:3','book-two:4','book-two:5']);assert.equal(state.positions['origins:4'],.35);
  await page.goto(base+'/origins.html');assert.equal(await page.locator('[data-book-progress]').innerText(),'1 of 18 chapters completed');assert.equal(await page.locator('[data-resume]').getAttribute('href'),'origins-chapter-4.html');
  await page.goto(base+'/origins-chapter-4.html');await page.goto(base+'/book-two.html');assert.equal(await page.locator('[data-book-progress]').innerText(),'5 of 5 chapters completed');assert.equal(await page.locator('[data-resume]').getAttribute('href'),'book-two-chapter-5.html');
  for(const file of ['index.html','books.html','book-two.html']){await page.goto(base+'/'+file);for(const width of [320,390,1200]){await page.setViewportSize({width,height:850});assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`${file} overflow at ${width}`);}}
  await page.setViewportSize({width:1200,height:900});await page.goto(base+'/books.html');await page.screenshot({path:path.join(qa,'book-library-desktop.png'),fullPage:true});assert.deepEqual(errors,[]);
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
 console.log('PASS: Book Two manuscript/art, per-book completion and resume, existing progress preservation, reader controls and 320/390/1200px layouts.');
}
module.exports={check};
