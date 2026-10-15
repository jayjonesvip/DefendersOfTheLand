const assert=require('node:assert/strict');

// Exercise the event ordering behind PR #5's reviewed CI failure in the same
// browser as the accessibility suite. Delaying delivery is deterministic: no
// sleeps, application changes or disabled keyboard checks are involved.
async function check(browser,base){
 const page=await browser.newPage({hasTouch:true,viewport:{width:1200,height:900}});
 try{
  await page.addInitScript(()=>{
   const native=window.matchMedia.bind(window);
   window.pendingNavChanges=[];
   window.matchMedia=query=>{
    const media=native(query),add=media.addEventListener.bind(media);
    if(query==='(max-width:800px)')media.addEventListener=(type,listener,...options)=>add(type,event=>window.pendingNavChanges.push(()=>listener(event)),...options);
    return media;
   };
  });
  await page.goto(base+'/index.html');
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>pendingNavChanges.length>0);
  await page.locator('#nav-toggle').focus();await page.keyboard.press('Enter');
  assert(await page.locator('#site-navigation').isVisible(),'Enter opens the mobile menu');
  assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'true');
  await page.evaluate(()=>pendingNavChanges.splice(0).forEach(deliver=>deliver()));
  assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'false','A late breakpoint callback closes the menu');
  assert(!(await page.locator('#site-navigation').isVisible()),'Closed ARIA state matches hidden menu');

  // Load at the intended breakpoint, as the corrected keyboard test does.
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/index.html');
  assert.equal(await page.evaluate(()=>pendingNavChanges.length),0,'No old-document breakpoint callback races with Enter');
  await page.locator('#nav-toggle').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.getElementById('nav-toggle').getAttribute('aria-expanded')==='true'&&document.getElementById('site-navigation').getBoundingClientRect().height>0);
  assert(await page.locator('#site-navigation').isVisible());
  assert.equal(await page.locator('#nav-toggle').getAttribute('aria-expanded'),'true');
  console.log(`PASS: controlled navigation breakpoint race reproduced and corrected ordering verified in Chromium ${browser.version()}.`);
 }finally{await page.close();}
}
module.exports={check};
