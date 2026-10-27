const file='flaming-head-origin.html',title='Flaming Head: The One Who Fell';
const artworks=[
 {file:'flaming-head-origin-page-1-v1.webp',width:1024,height:1536,alt:'Flaming Head: The One Who Fell, page one. A plasma fragment awakens in space, reaches Earth and strikes Lake Erie, raising a huge wave.'},
 {file:'flaming-head-origin-page-2-v1.webp',width:1024,height:1536,alt:'Flaming Head: The One Who Fell, page two. The wave washes over Seth, a perch gives the visitor a name, and he flies above Cleveland.'}
];
const socialImage={file:'flaming-head-origin-social-1200x630-v1.jpg',width:1200,height:630,type:'image/jpeg',alt:'Flaming Head above Cleveland’s 1987 skyline, with the title The One Who Fell by Jay Jones.'};
const metadata={
 [file]:{title:'Flaming Head: The One Who Fell | Defenders of the Land',description:'Read Flaming Head’s two-page origin comic by Jay Jones. Follow a plasma fragment from the Sun to Lake Erie, meet a curious perch, and see Cleveland in 1987.',lastModified:'2026-10-27'}
};
const pages=[
 [
  {description:'The Sun erupts. A small, faceless fragment separates from an enormous cloud of orange-and-gold plasma.',captions:['Sometimes the Sun throws a huge cloud of plasma into space.','Plasma is gas made of electrically charged particles.']},
  {description:'The small fragment, still without eyes or a mouth, enters a mysterious cloud of luminous blue and violet particles.',captions:['One small fragment passed through a mysterious cloud.']},
  {description:'Eyes open within the plasma for the first time. A round orange face forms among the glowing particles, looking around with wonder.',captions:['Something inside it woke up.']},
  {description:'Earth fills the view ahead of the living plasma head. A small inset shows his bright streak passing through the atmosphere toward Lake Erie and Cleveland.',captions:['For the next twenty-four hours, Earth grew closer.']},
  {description:'The fragment crashes into Lake Erie offshore. Light, spray and steam burst upward. An enormous wall of water, lit from within, rises and rolls toward the rocky Cleveland shore. Municipal Stadium and Terminal Tower remain standing beyond the water.',sound:'KRAAASH!'}
 ],
 [
  {description:'The towering wave breaks over Seth on the shoreline rocks. Wearing his orange Z hoodie and blue jeans, he shields his face as water washes across him. The Cleveland skyline stands behind the lakefront.'},
  {description:'Underwater, bubbles and disturbed sediment swirl around the dazed but unharmed visitor. His golden glow lights the rocks. A friendly blue-green perch with dark vertical stripes and yellow fins cautiously approaches.',dialogue:[['Fish','Who are you?'],['Flaming Head','I don’t know.']]},
  {description:'The perch studies the visitor’s glowing face. The floating head brightens at the suggestion.',dialogue:[['Fish','You look like a flaming head.'],['Flaming Head','I like the sound of that.']]},
  {description:'Light filters through the disturbed water above as the two look at each other.',dialogue:[['Flaming Head','Where am I?'],['Fish','Cleveland.']]},
  {description:'The perch looks at his underwater flames. Flaming Head glances upward, suddenly concerned.',dialogue:[['Fish','Flames aren’t supposed to be underwater.'],['Flaming Head','Oh. I’d better go.']]},
  {description:'Flaming Head flies above Lake Erie with a long, sweeping trail of orange-and-gold flames. Foaming waves and glowing reflections still disturb the water below. Old Municipal Stadium and Terminal Tower rise along the Cleveland skyline.',thought:'I am Flaming Head… from Cleveland.'}
 ]
];
function createComic(options){return require('./comic-pages.cjs').renderComic({...options,title,titleHtml:'Flaming Head: <span>The One Who Fell</span>',eyebrow:'A WEBSITE-EXCLUSIVE ORIGIN COMIC',intro:'From the Sun to the Land.',artworks,pages,pageTitles:['The Fall','A Name and a Home'],closingTitle:'Discover the books',closingLinks:[['characters.html#flaming-head','Meet Flaming Head']]});}
module.exports={file,title,artworks,socialImage,metadata,pages,createComic};
