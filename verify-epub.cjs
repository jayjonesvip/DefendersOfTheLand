const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
async function check(){
 const root=__dirname,reports=JSON.parse(fs.readFileSync(path.join(root,'output/publishing/epub-builds.json'))).books;
 const site=JSON.parse(fs.readFileSync(path.join(root,'content/site.json')));
 const previews=new Map(reports.map(b=>[b.bookId,path.join(root,'tmp',b.bookId==='origins'?'epub':'epub-'+b.bookId,'preview/EPUB')]));
 previews.set('sample',path.join(root,'tmp/epub-sample/preview/EPUB'));
 // Serve only generated EPUB previews; this also works where file:// navigation is disabled.
 const server=http.createServer((req,res)=>{
  const parts=decodeURIComponent(req.url.split('?')[0]).split('/').filter(Boolean),directory=previews.get(parts.shift());
  if(!directory){res.writeHead(404).end();return;}
  const file=path.resolve(directory,parts.join('/'));
  if(!file.startsWith(directory+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',file.endsWith('.xhtml')?'application/xhtml+xml':file.endsWith('.css')?'text/css':file.endsWith('.jpg')?'image/jpeg':'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const executable=process.env.BOOK_CHROMIUM||(process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p)):undefined);
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
  const page=await browser.newPage();
  for(const report of reports){
   const prefix=`${base}/${report.bookId}`,qa=path.join(root,'tmp',report.bookId==='origins'?'epub':'epub-'+report.bookId);
   for(const width of [1200,320]){
    await page.setViewportSize({width,height:850});
    for(let n=1;n<=report.chapters;n++){
     await page.goto(`${prefix}/chapter-${String(n).padStart(2,'0')}.xhtml`);
     await page.evaluate(async()=>{for(const image of document.images)await image.decode()});
     assert.equal(await page.locator('h1').count(),1);
     for(const size of [16,30]){
      await page.evaluate(size=>document.body.style.fontSize=`${size}px`,size);
      assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`EPUB overflow: ${report.bookId}, chapter ${n}, ${width}px, font ${size}`);
      assert(await page.locator('img').evaluateAll(images=>images.every(i=>i.naturalWidth>0&&Math.abs(i.width/i.height-i.naturalWidth/i.naturalHeight)<.02)),`EPUB artwork: ${report.bookId}, chapter ${n}`);
     }
     if(n===9&&width===320){await page.screenshot({path:path.join(qa,'chapter-09-mobile.png'),fullPage:true});}
    }
   }
   await page.goto(`${prefix}/nav.xhtml`);assert.equal(await page.locator('#toc a').count(),report.chapters);
   const selected=Math.min(8,report.chapters-1);await page.locator('#toc a').nth(selected).click();assert(page.url().endsWith(`chapter-${String(selected+1).padStart(2,'0')}.xhtml`));
   await page.setViewportSize({width:390,height:850});
   await page.goto(`${prefix}/${report.coverIncluded?'cover':'title'}.xhtml`);
   await page.evaluate(async()=>{for(const image of document.images)await image.decode()});
   await page.screenshot({path:path.join(qa,'cover-mobile.png')});
   if(report.status.toLowerCase()==='in progress'){
    await page.goto(`${prefix}/title.xhtml`);assert((await page.locator('body').innerText()).includes('Work in progress'));
   }
  }
  for(let n=1;n<=3;n++){
   await page.goto(`${base}/sample/chapter-${String(n).padStart(2,'0')}.xhtml`);
   await page.evaluate(async()=>{for(const image of document.images)await image.decode();document.body.style.fontSize='30px'});
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Sample EPUB overflow: chapter ${n}`);
  }
  await page.goto(`${base}/sample/nav.xhtml`);assert.equal(await page.locator('#toc a').count(),3);
  assert(!fs.existsSync(path.join(previews.get('sample'),'chapter-04.xhtml')));
  await page.goto(`${base}/sample/continue.xhtml`);
  assert.equal(await page.locator('a').first().getAttribute('href'),site.url.replace(/\/$/,'')+'/origins-chapter-4.html');
  assert.equal(await page.locator('a').nth(1).getAttribute('href'),site.paperback.url);
  await page.screenshot({path:path.join(root,'tmp/epub-sample/continue-mobile.png')});
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
 console.log(`PASS: full EPUB chapters, images, contents and large-text layouts for ${reports.length} books; Book One sample only.`);
}
module.exports={check};
