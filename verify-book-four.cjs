const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
async function check(){
 const root=__dirname,read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 const book=read('content/books/book-four/book.json');
 const chapters=require('./scripts/available-chapters.cjs').availableChapters(book,file=>read('content/books/book-four/'+file));
 const illustrations=chapters.flatMap(chapter=>chapter.blocks.filter(block=>block.art));
 const orangeCorrections=read('docs/art/book-four-audit-corrections-2026-10-23.json').records.filter(record=>record.chapter===12);
 assert.equal(orangeCorrections.length,10,'Every Chapter 12 Zerdo appearance needs its approved orange correction');
 const revisionArt=read('docs/art/book-four-chapter-12-submitted-revision-art-2026-10-23.json').images;
 const identityArt=read('docs/art/book-four-billy-fist-corrections-2026-10-23.json').images;
 assert.equal(identityArt.length,12,'Twelve reviewed character corrections remain selected');
 const replacements=[...revisionArt,...identityArt];
 const currentArt=image=>{
  const seen=new Set();
  while(replacements.some(next=>next.previousArt===image.newArt)){
   assert(!seen.has(image.newArt),'Artwork replacement cycle');seen.add(image.newArt);
   image=replacements.find(next=>next.previousArt===image.newArt);
  }
  return image;
 };
 for(const correction of orangeCorrections){
  const current=currentArt(correction);
  assert(illustrations.some(block=>block.art===current.newArt),`Approved orange artwork no longer active: ${current.key}`);
  const bytes=fs.readFileSync(path.join(root,'public/assets',current.newArt));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),current.sha256,`Reviewed orange artwork changed: ${current.key}`);
 }
 for(const reviewed of [...revisionArt,...identityArt]){
  const image=currentArt(reviewed);
  assert(illustrations.some(block=>block.art===image.newArt),`Revised action artwork no longer active: ${image.key}`);
  const bytes=fs.readFileSync(path.join(root,'public/assets',image.newArt));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),image.sha256,`Reviewed action artwork changed: ${image.key}`);
 }
 const pdf=read('output/publishing/book-four-pdf-build.json');
 const epub=read('tmp/epub-book-four/quality-report.json');
 for(const report of [pdf,epub]){
  const bytes=fs.readFileSync(path.join(root,'output/publishing',report.file));
  assert.equal(report.chapters,chapters.length);
  assert.equal(report.interiorIllustrations,illustrations.length);
  assert.equal(bytes.length,report.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),report.sha256);
  assert(!fs.existsSync(path.join(root,'dist/books',report.file)));
 }
 assert(epub.coverIncluded);assert.equal(pdf.paperbackInterior,false);
 const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'dist','.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});
  const page=await browser.newPage(),base=`http://127.0.0.1:${server.address().port}`,errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const file of ['index.html','books.html']){
   await page.goto(base+'/'+file);
   assert(await page.locator('a[href="book-four.html"]').count());
   assert(await page.locator('img[src="assets/'+book.cover+'"]').count());
  }
  const previous=read('content/books/book-three/book.json');
  const previousChapters=require('./scripts/available-chapters.cjs').availableChapters(previous,file=>read('content/books/book-three/'+file));
  await page.goto(base+'/book-three-chapter-'+previousChapters.at(-1).number+'.html');
  await page.getByRole('link',{name:'Continue to '+book.title+' →',exact:true}).click();
  await page.waitForURL('**/book-four-chapter-1.html');
  await page.goto(base+'/books.html');
  await page.locator('.book-card').filter({has:page.locator('a[href="book-four.html"]')}).locator('a[href="book-four-chapter-1.html"]').click();
  for(const [index,chapter] of chapters.entries()){
   assert.equal(await page.locator('h1').innerText(),chapter.title);
   assert.equal(await page.locator('.chapter-body p').allTextContents().then(values=>values.join('\n')),[...chapter.blocks.map(block=>block.text),chapter.ending].filter(Boolean).join('\n'));
   assert.deepEqual(await page.locator('.chapter-body img').evaluateAll(images=>images.map(image=>image.getAttribute('src'))),chapter.blocks.filter(block=>block.art).map(block=>'assets/'+block.art));
   for(const width of [320,390,1200]){
    await page.setViewportSize({width,height:850});
    await page.locator('.chapter-body img').evaluateAll(images=>Promise.all(images.map(image=>{image.loading='eager';return image.decode();})));
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Book Four chapter ${chapter.number} overflow at ${width}`);
    assert(await page.locator('.chapter-body img').evaluateAll(images=>images.every(image=>image.naturalWidth>0&&Math.abs(image.width/image.height-image.naturalWidth/image.naturalHeight)<.02)));
   }
   if(chapter.number===2){
    assert((await page.locator('.chapter-body img').nth(1).getAttribute('src')).endsWith('chase-design-v1.webp'));
    assert((await page.locator('.chapter-body img').last().getAttribute('src')).endsWith('newspaper-v1.webp'));
   }
   if(chapter.number===3){
    assert((await page.locator('.chapter-body img').nth(1).getAttribute('src')).endsWith('tank-v3.webp'));
    assert((await page.locator('.chapter-body img').last().getAttribute('src')).endsWith('bank-v1.webp'));
   }
   await page.locator('[data-complete]').click();
   await page.waitForURL('**/'+(chapters[index+1]?`book-four-chapter-${chapters[index+1].number}.html`:'book-four.html'));
  }
  assert.equal(await page.locator('[data-book-progress="book-four"]').innerText(),`${chapters.length} of ${chapters.length} chapters completed`);
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('defenders-book-progress-v8')));
  for(const chapter of chapters)assert(state.read.includes('book-four:'+chapter.number));
  assert(!state.read.includes('origins:1'));
  assert.deepEqual(errors,[]);
  fs.mkdirSync(path.join(root,'tmp/book-four-review'),{recursive:true});
  await page.goto(base+'/book-four.html');await page.screenshot({path:path.join(root,'tmp/book-four-review/contents-mobile.png'),fullPage:true});
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
 console.log(`PASS: Book Four discovery, reader artwork, mobile layout, completion state, PDF/EPUB contents and checksums; publishing files stay private.`);
}
module.exports={check};
if(require.main===module)check().catch(error=>{console.error(error);process.exitCode=1;});
