const file='seized-up.html',title='Jaws O’ Death: Seized Up';
const artworks=[{file:'seized-up-page-1-v1.webp',width:1024,height:1536,alt:'Six-panel Jaws O’ Death comic. Dork sends his floating metal-jawed creation for groceries, but rain rusts his jaws shut and the errand money goes on oil.'}];
const socialImage={file:'seized-up-social-1200x630-v1.jpg',width:1200,height:630,type:'image/jpeg',alt:'Jaws O’ Death in the Cleveland rain with a grocery list, beside the title Seized Up. A free web comic by Jay Jones.'};
const metadata={[file]:{title:'Jaws O’ Death: Seized Up | Free Web Comic',description:'Read Seized Up, a free Jaws O’ Death comic by Jay Jones. A grocery errand for Doc Dork takes a rusty turn when rain leaves his metal jaws stuck firmly shut.',lastModified:'2026-10-29'}};
const pages=[[
 {description:'In his cluttered laboratory, Doc Dork places a grocery list and ten-dollar bill between Jaws’ metal teeth. Jaws is a floating blond head without a body or limbs.',dialogue:[['Doc Dork','Bread and milk. Bring me the change.']]},
 {description:'Jaws floats along a rainy Cleveland sidewalk, gripping the grocery list and money between his teeth.',dialogue:[['Jaws','Ha! Rain doesn’t scare me.']]},
 {description:'Rust spreads over the jaw hinges. His jagged metal teeth clamp completely shut, pinching the soggy grocery list. A thought bubble shows his worried realization.',sound:'KRRK!',thoughtSpeaker:'Jaws',thought:'Uh oh. My jaws are stuck.'},
 {description:'At the corner store, a clerk offers an oil can with a ten-dollar price tag. Jaws’ rusted teeth remain interlocked.',dialogue:[['Clerk','You’re all rusted. I got just the thing…'],['Jaws','MM.']]},
 {description:'The clerk oils the hinge, freeing Jaws’ mouth. The entire ten-dollar grocery allowance lies on the counter as payment.',sound:'CLACK!',dialogue:[['Jaws','There goes the grocery money.']]},
 {description:'Back in the laboratory, Dork throws up his hands. The oil can sits on the workbench. Jaws has returned without groceries or change.',dialogue:[['Doc Dork','You spent ALL of it on oil?!'],['Jaws','I don’t want to talk about it.']]}
]];
function createComic(options){return require('./comic-pages.cjs').renderComic({...options,title,eyebrow:'JAWS O’ DEATH · A WEBSITE-EXCLUSIVE COMIC',intro:'A simple errand. A sudden shower. One expensive can of oil.',artworks,pages,pageTitles:['Seized Up'],closingTitle:'More trouble from the lab',closingLinks:[['characters.html#luke','Meet Jaws O’ Death'],['sticky-situation.html','Read A Sticky Situation']]});}
module.exports={file,title,artworks,socialImage,metadata,pages,createComic};
