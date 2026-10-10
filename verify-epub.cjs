const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
async function check(){
 const root=__dirname,preview=path.join(root,'tmp/epub/preview/EPUB');
 const executable=process.env.BOOK_CHROMIUM||(process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p)):undefined);
 const browser=await chromium.launch({headless:true,...(executable?{executablePath:executable}:{})});
 try{
  const page=await browser.newPage();
  for(const width of [1200,320]){
   await page.setViewportSize({width,height:850});
   for(let n=1;n<=18;n++){
    await page.goto(pathToFileURL(path.join(preview,`chapter-${String(n).padStart(2,'0')}.xhtml`)).href);
    await page.evaluate(async()=>{for(const image of document.images)await image.decode()});
    assert.equal(await page.locator('h1').count(),1);
    for(const size of [16,30]){
     await page.evaluate(size=>document.body.style.fontSize=`${size}px`,size);
     assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`EPUB overflow: chapter ${n}, ${width}px, font ${size}`);
     assert(await page.locator('img').evaluateAll(images=>images.every(i=>i.naturalWidth>0&&Math.abs(i.width/i.height-i.naturalWidth/i.naturalHeight)<.02)),`EPUB artwork: chapter ${n}`);
    }
    if(n===9&&width===320){await page.screenshot({path:path.join(root,'tmp/epub/chapter-09-mobile.png'),fullPage:true});await page.screenshot({path:path.join(root,'tmp/epub/chapter-09-mobile-top.png')});await page.locator('figure').last().screenshot({path:path.join(root,'tmp/epub/chapter-09-rescue.png')});}
   }
  }
  await page.goto(pathToFileURL(path.join(preview,'nav.xhtml')).href);
  assert.equal(await page.locator('#toc a').count(),18);
  await page.locator('#toc a').nth(8).click();assert(page.url().endsWith('chapter-09.xhtml'));
  await page.setViewportSize({width:390,height:850});
  await page.goto(pathToFileURL(path.join(preview,'cover.xhtml')).href);
  await page.locator('img').evaluate(i=>i.decode());
  await page.screenshot({path:path.join(root,'tmp/epub/cover-mobile.png')});
 }finally{await browser.close()}
}
module.exports={check};
