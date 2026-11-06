const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const {checkSource,files,ids}=require('./scripts/public-policy.cjs');
const root=__dirname,out=path.join(root,'dist');
checkSource(root);
for(const [id,url] of Object.entries(require('./amazon-samples.cjs').samples)){
 for(const page of ['index','books','downloads',id])assert(fs.readFileSync(path.join(out,page+'.html'),'utf8').includes(`href="${url}"`),`${page}: missing ${id} Amazon sample`);
}
const activityFiles=new Set(require('./content/activities.json').sheets.map(s=>s.pdf).concat(require('./content/activities.json').puzzles.flatMap(p=>[p.pdf,p.answer,p.combined]),require('./content/activities.json').archive,require('./content/activities.json').allArchive));
for(const file of files(out).filter(f=>/\.(pdf|epub|zip)$/i.test(f)))assert(activityFiles.has(path.relative(out,file).split(path.sep).join('/')),'Unapproved downloadable file');
const activityData=require('./content/activities.json'),activityHtml=fs.readFileSync(path.join(out,'activities.html'),'utf8');
assert.equal((activityHtml.match(/class="activity-card"/g)||[]).length,7);
for(const sheet of activityData.sheets){assert(activityHtml.includes(`href="${sheet.pdf}" download`));assert(fs.readFileSync(path.join(out,sheet.pdf)).subarray(0,5).equals(Buffer.from('%PDF-')));}
assert.equal((activityHtml.match(/class="activity-card puzzle-card"/g)||[]).length,3);
for(const puzzle of activityData.puzzles)for(const name of [puzzle.pdf,puzzle.answer,puzzle.combined]){assert(activityHtml.includes(`href="${name}" download`));assert.equal(fs.readFileSync(path.join(out,name)).subarray(0,5).toString(),'%PDF-');}
assert(activityHtml.includes(`href="${activityData.allArchive}" download`));
assert(activityHtml.includes(`href="${activityData.archive}" download`));assert.equal(fs.readFileSync(path.join(out,activityData.archive)).readUInt32LE(0),0x04034b50);
const fifthHtml=fs.readFileSync(path.join(out,'book-five.html'),'utf8');
for(const href of ['https://www.amazon.com/dp/B0HQFMBW2R','https://www.amazon.com/dp/B0HQFT91NJ',require('./amazon-samples.cjs').samples['book-five']])assert(fifthHtml.includes(`href="${href}"`),'Book Five edition/sample link missing');
assert(!fs.existsSync(path.join(out,'book-five-chapter-1.html')),'Book Five sample must open on Amazon');
const htmlFiles=fs.readdirSync(out).filter(f=>f.endsWith('.html'));
const expected=[...Object.values(require('./character-pages.cjs').profiles).map(p=>p.file),'index.html','books.html','paperback.html','downloads.html','author.html','1990-vault.html','characters.html','map.html','flaming-head-origin.html','why-so-evil.html','loaded-glove.html','sticky-situation.html','super-perch.html','seized-up.html','web-comics.html','activities.html','book-five.html','404.html',...ids.flatMap(id=>[id+'.html',id+'-chapter-1.html'])];
assert.deepEqual(htmlFiles.sort(),expected.sort());
const approved=[...JSON.parse(fs.readFileSync(path.join(root,'public-preview-inventory.json'))).files,...JSON.parse(fs.readFileSync(path.join(root,'website-originals.json'))).files];
const allowed=new Set(approved.filter(f=>f.path.startsWith('public/')&&!f.path.startsWith('public/vendor/')).map(f=>f.path.slice(7)));
for(const file of ['d3-7.9.0.min.js','D3-LICENSE.txt'])allowed.add('assets/'+file);
for(const file of [...expected,'styles.css','activities.css','landing.css','landing.js','downloads.css','characters.css','characters.js','map.css','map-landmarks.js','books.css','book-contents.css','author.css','reader.js','site-nav.js','story-map.js','vault.css','vault-gallery.js','flaming-head-origin.css','flaming-head-origin.js','web-comics.css','sitemap.xml','robots.txt','CNAME','.nojekyll','vault/1990/1990Vault.md'])allowed.add(file);
for(const file of files(out))assert(allowed.has(path.relative(out,file).split(path.sep).join('/')),`Unexpected deploy file: ${file}`);
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,expected.length-1);
for(const file of htmlFiles){
 const html=fs.readFileSync(path.join(out,file),'utf8');
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file);
 const nav=html.match(/<nav id="site-navigation"[^>]*>(.*?)<\/nav>/s)[1];
 const links=[...nav.matchAll(/<a href="([^"]+)"([^>]*)>/g)];
 assert.deepEqual(links.map(m=>m[1]),['books.html','characters.html','web-comics.html','activities.html','map.html','1990-vault.html','author.html','downloads.html']);
 assert.deepEqual(links.filter(m=>m[2].includes('aria-current="page"')).map(m=>m[1]),links.some(m=>m[1]===file)?[file]:[]);
 const footer=html.match(/<footer class="site-footer">(.*?)<\/footer>/s)[1];
 for(const href of ['paperback.html','downloads.html','author.html','https://www.amazon.com/author/jayjonesvip','https://www.amazon.com/dp/B0HMXH258N'])assert(footer.includes(`href="${href}"`));
 assert(!footer.includes('[CONTACT EMAIL OR FORM URL]')&&!footer.includes('href="['));
 assert(!/\[(?:DESCRIPTION|HOOK|BLURB|CONTACT|FORM ACTION|AUTHOR CHECK|GALLERY LINK NEEDED|UPDATE NEEDED)[^\]]*\]/.test(html),`Unfinished public copy in ${file}`);

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
 const server=http.createServer((req,res)=>{const file=path.resolve(out,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(out+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Security-Policy',"script-src 'self' 'unsafe-inline'; connect-src 'self'");res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.webp')?'image/webp':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
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
   for(const file of [...Object.values(require('./character-pages.cjs').profiles).map(p=>p.file),'fist-o-mite.html','flaming-head.html','index.html','books.html','paperback.html','characters.html','map.html','1990-vault.html','flaming-head-origin.html','why-so-evil.html','loaded-glove.html','sticky-situation.html','super-perch.html','seized-up.html','web-comics.html','activities.html','book-five.html',...ids.map(id=>id+'.html'),...ids.map(id=>id+'-chapter-1.html')]){
    await page.goto(base+'/'+file);await page.evaluate(()=>document.fonts.ready);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${file}: overflow at ${width}`);
    for(const href of await page.locator('[data-resume]:visible').evaluateAll(links=>links.map(a=>a.href)))assert(/-chapter-1\.html$/.test(href),`Stale resume: ${href}`);
    if(file==='map.html')assert.equal(await page.locator('.map-chapter-link').getAttribute('href'),require('./content/site.json').ebook.url);
   }
  }
  await page.goto(base+'/characters.html');
  assert.equal(await page.locator('#perch .character-profile-link').getAttribute('href'),'super-perch-character.html');
  await page.goto(base+'/web-comics.html');
  assert.equal(await page.locator('.web-comic-card').count(),6);
  assert.deepEqual(await page.locator('.web-comic-read').evaluateAll(links=>links.map(a=>a.getAttribute('href'))),['seized-up.html','super-perch.html','sticky-situation.html','loaded-glove.html','flaming-head-origin.html','why-so-evil.html']);
  await page.goto(base+'/characters.html');
  assert.equal(await page.locator('#billy .character-first-book').textContent(),'Book 1: Free chapter →');
  for(const dark of [false,true]){
   await page.evaluate(dark=>document.body.classList.toggle('dark',dark),dark);
   const colors=await page.locator('#billy .character-callout').evaluateAll(nodes=>nodes.map(n=>{const s=getComputedStyle(n);return [s.backgroundColor,s.color,s.borderTopColor,s.fontFamily]}));
   for(const [bg,ink,border,font]of colors){assert.equal(bg,'rgb(255, 213, 74)');assert.equal(ink,'rgb(0, 0, 0)');assert.equal(border,'rgb(0, 0, 0)');assert(font.startsWith('BookDisplay'));}
  }
  assert.equal(await page.locator('#luke .character-profile-link').getAttribute('href'),'jaws-o-death.html');
  const comics=[
   {file:'seized-up.html',title:'Jaws O’ Death: Seized Up',panels:[6],artworks:['seized-up-page-1-v1.webp']},
   {file:'super-perch.html',title:'Super Perch: Which Way to Superior?',panels:[5,5,5,5,5],artworks:Array.from({length:5},(_,i)=>`super-perch-page-${i+1}-v1.webp`)},
   {file:'flaming-head-origin.html',title:'Flaming Head: The One Who Fell',panels:[5,6],artworks:['flaming-head-origin-page-1-v1.webp','flaming-head-origin-page-2-v1.webp']},
   {file:'why-so-evil.html',title:'WHY SO EVIL?',panels:[6,6,6],artworks:['why-so-evil-page-1-v3.webp','why-so-evil-page-2-v3.webp','why-so-evil-page-3-v1.webp']},
   {file:'loaded-glove.html',title:'Fist-O-Mite in: The Loaded Glove',panels:[5,6,6],artworks:['loaded-glove-page-1-v1.webp','loaded-glove-page-2-v1.webp','loaded-glove-page-3-v1.webp']},
   {file:'sticky-situation.html',title:'A Sticky Situation',panels:[5,5],artworks:['sticky-situation-page-1-v1.webp','sticky-situation-page-2-v1.webp']}
  ];
  for(const comic of comics){
   await page.goto(base+'/'+comic.file);
   assert.equal(await page.locator('.comic-sheet').count(),comic.artworks.length);
   assert.equal(await page.locator('.comic-transcript li').count(),comic.panels.reduce((a,b)=>a+b,0));
   for(let index=0;index<comic.panels.length;index++)assert.equal(await page.locator('.comic-transcript-page').nth(index).locator('li').count(),comic.panels[index]);
   assert.equal(await page.locator('.comic-sequential a').first().getAttribute('href'),comic.artworks.length>1?'#comic-page-2':'web-comics.html');
   assert.equal(await page.locator('.comic-sequential').last().locator('a').last().getAttribute('href'),'web-comics.html');
   const transcript=await page.locator('.comic-transcript').textContent();
   if(comic.file==='flaming-head-origin.html'){
    assert(transcript.includes('water washes across him'));
    assert(!transcript.includes('Super Perch'));
    assert.equal(await page.locator('.comic-transcript li').last().locator('p').last().textContent(),'Flaming Head, thinking: “I am Flaming Head… from Cleveland.”');
   }else if(comic.file==='why-so-evil.html'){
    assert(transcript.includes('He could’ve been killed.')&&!transcript.includes('Someone could’ve been hurt.'));
    const silent=page.locator('.comic-transcript-page').nth(2).locator('li').nth(4);
    assert.equal(await silent.locator('p').count(),1,'Rescue aftermath remains silent');
    assert.equal(await page.locator('.comic-transcript li').last().locator('p').last().textContent(),'Narration: One learned to follow the clues. The other learned to hide them.');
   }
   if(comic.file==='sticky-situation.html'){assert(transcript.includes('RESULT: ALIVE.')&&transcript.includes('COOPERATIVE: NO.'));assert(!await page.locator('.comic-transcript strong').allTextContents().then(labels=>labels.some(label=>label.startsWith('Gum:'))));}
   if(comic.file==='loaded-glove.html'){
    const ending=page.locator('.comic-transcript-page').nth(2).locator('li');
    assert((await ending.nth(1).textContent()).includes('WHAM!!'));
    assert((await ending.nth(2).textContent()).includes('CLICK.'));
    assert((await ending.nth(3).textContent()).includes('DUST SETTLES.'));
    assert(transcript.includes('Got it on camera.')&&!transcript.includes('You’re welcome.'));
    assert(transcript.includes('Get a picture.')&&!transcript.includes('Stay put.'));
   }
   for(const dark of [false,true]){
    await page.evaluate(dark=>document.body.classList.toggle('dark',dark),dark);
    for(const width of [320,1200]){
     await page.setViewportSize({width,height:900});
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Comic page overflow');
     for(let index=0;index<comic.artworks.length;index++){
      const link=page.locator('[data-comic-enlarge]').nth(index);
      await link.focus();await page.keyboard.press('Enter');
      assert(await page.locator('[data-comic-dialog]').evaluate(el=>el.open));
      assert.equal(await page.locator('[data-comic-close]').evaluate(el=>el===document.activeElement),true);
      assert((await page.locator('[data-comic-dialog] img').getAttribute('src')).endsWith(comic.artworks[index]));
      await page.locator('[data-comic-dialog] img').evaluate(image=>image.decode());
      assert.equal(await page.locator('#comic-dialog-title').textContent(),`${comic.title} · Page ${index+1}`);
      const viewport=page.locator('.comic-dialog-scroll');
      await viewport.focus();await page.keyboard.press('PageDown');
      await page.waitForFunction(()=>document.querySelector('.comic-dialog-scroll').scrollTop>0);
      if(index%2===0)await page.keyboard.press('Escape');else await page.locator('[data-comic-close]').click();
      // Native closure and the queued close event can finish in different frames.
      await page.waitForFunction(index=>!document.querySelector('[data-comic-dialog]').open&&!document.documentElement.classList.contains('comic-viewer-open')&&document.activeElement===document.querySelectorAll('[data-comic-enlarge]')[index],index);
     }
    }
   }
  }
  const noScript=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:900}});
  const staticComic=await noScript.newPage();
  for(const comic of comics){
   await staticComic.goto(base+'/'+comic.file);
   assert(await staticComic.locator('#comic-transcript').isVisible());
   assert.equal(await staticComic.locator('[data-comic-enlarge]').count(),comic.artworks.length);
   for(let index=0;index<comic.artworks.length;index++){
    assert.equal(await staticComic.locator('[data-comic-enlarge]').nth(index).getAttribute('href'),'assets/'+comic.artworks[index]);
    assert.equal((await noScript.request.get(base+'/assets/'+comic.artworks[index])).status(),200);
   }
  }
  await noScript.close();
  await page.goto(base+'/characters.html');
  const profiles=require('./character-pages.cjs').profiles;
  for(const [id,p] of Object.entries(profiles)){
   assert.equal(await page.locator(`#${id} .comic-origin-link`).count(),0);
   if(['claude','eleanor'].includes(id)){assert.equal(await page.locator(`#${id}`).count(),0);await page.goto(base+'/'+p.file);}
   else{await page.locator(`#${id} .character-profile-link`).click();assert(page.url().endsWith('/'+p.file));}
   assert.equal(await page.locator('h1').textContent(),p.name);
   assert.deepEqual(await page.locator('.character-comic-link').evaluateAll(a=>a.map(n=>n.getAttribute('href'))),p.comicEntries.map(c=>c.file));
   if(p.comicEntries.length){await page.locator('.character-comic-link').first().click();assert(page.url().endsWith('/'+p.comicEntries[0].file));}
   await page.goto(base+'/characters.html');
  }
  for(const id of ids){
   await page.goto(base+'/'+id+'.html');
   const approved=id==='origins'?[require('./content/book-one-marketing.json').blurb.join(' ')]:require('./content/website-book-copy.json').descriptions[id];
   assert.deepEqual(await page.locator('.book-about>p:not(.eyebrow)').allTextContents(),approved);
   assert.equal(await page.locator('.book-read').getAttribute('href'),require('./amazon-samples.cjs').samples[id]);
   assert.equal(await page.locator('.book-series a[aria-current="page"]').getAttribute('href'),id+'.html');
   assert.equal(await page.locator('.book-preview-card a').getAttribute('href'),require('./amazon-samples.cjs').samples[id]);
   for(const dark of [false,true]){
    await page.evaluate(dark=>document.body.classList.toggle('dark',dark),dark);
    for(const width of [320,600,820,1200]){
     await page.setViewportSize({width,height:900});
     assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+': book-page overflow');
    }
   }
   await page.goto(base+'/'+id+'-chapter-1.html');
   await page.locator('[data-complete]').evaluate(a=>a.addEventListener('click',event=>event.preventDefault()));
   await page.locator('[data-complete]').click();
   await page.goto(base+'/'+id+'.html');
  }
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('defenders-book-progress-v8'))),legacy);
  assert.equal((await page.evaluate(()=>JSON.parse(localStorage.getItem('defenders-preview-progress-v1')))).read.length,4);
  assert.deepEqual(errors,[]);
  for(const id of ids){const response=await context.request.get(base+'/'+id+'-chapter-2.html');assert.equal(response.status(),404);}
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
}
browserChecks().then(()=>console.log('PASS: four Chapter 1 previews, Amazon sample links, Amazon continuation, no later pages/assets, safe source boundary, mobile layouts and preserved legacy progress.')).catch(error=>{console.error(error);process.exitCode=1;});
