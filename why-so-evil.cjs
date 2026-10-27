const file='why-so-evil.html',title='WHY SO EVIL?';
const artworks=[
 {file:'why-so-evil-page-1-v2.webp',width:1024,height:1536,alt:'Why So Evil?, page one. Young Billy finds Daniel’s notebook and admires his generator. The two friends face a classmate’s mockery.'},
 {file:'why-so-evil-page-2-v2.webp',width:1024,height:1536,alt:'Why So Evil?, page two. Billy follows trolley tracks and a small scorched clue to Daniel’s untested generator in the school workshop.'},
 {file:'why-so-evil-page-3-v1.webp',width:1024,height:1536,alt:'Why So Evil?, page three. Billy cuts the power to protect a trapped student. Daniel blames Billy, and their friendship breaks apart.'}
];
const socialImage={file:'why-so-evil-social-1200x630-v2.jpg',width:1200,height:630,type:'image/jpeg',alt:'Young Billy Warrner and Daniel Orkleson with an electrical invention beneath the title Why So Evil?, a three-page prequel comic by Jay Jones.'};
const metadata={
 [file]:{title:'Why So Evil? | Billy and Daniel’s Origin Comic',description:'Read WHY SO EVIL?, a free three-page prequel comic by Jay Jones. Follow young Billy Warrner and Daniel Orkleson through a school mystery and a dangerous choice.',lastModified:'2026-10-27'}
};
const pages=[
 [
  {description:'Outside the grand, ivy-covered private school, taller students pass the two short boys. Daniel anxiously searches his open schoolbag while Billy notices something near the steps.',dialogue:[['Daniel','My notebook! All my designs are in it!']]},
  {description:'Billy examines a torn scrap of graph paper caught on a rosebush. Another scrap lies near a groundskeeper’s cart.',dialogue:[['Billy','You left your bag open again.']]},
  {description:'Billy follows the scraps to the cart, where Daniel finds his burgundy bound notebook among fallen leaves. Daniel looks relieved.',dialogue:[['Daniel','How did you find it?'],['Billy','I followed what you left behind.']]},
  {description:'Later in the laboratory, Daniel proudly demonstrates a small generator lighting a bulb. The generator sits on a green wheeled trolley. Billy watches with sincere admiration.',dialogue:[['Billy','You built that yourself?'],['Daniel','Every bit of it.']]},
  {description:'Two taller students pass the boys and their invention. One glances dismissively at the glowing bulb.',dialogue:[['Student','All that for a lightbulb?']]},
  {description:'Billy stays beside Daniel after the others leave. Daniel looks toward a science fair poster, his wounded expression becoming determined.',dialogue:[['Billy','I still think it’s brilliant.'],['Daniel','Tomorrow, they’ll all think so.']]}
 ],
 [
  {description:'The next morning, Daniel’s science fair display is empty. The trolley and generator are gone. Daniel points accusingly at the student who mocked him.',dialogue:[['Daniel','He took it!'],['Student','I never touched it!']]},
  {description:'Billy kneels beside faint trolley tracks in the dusty floor beneath the display. A short piece of freshly cut wire lies nearby.',dialogue:[['Billy','Then let’s see where it went.']]},
  {description:'Billy follows the tracks down a service corridor. At a basement workshop door, he examines a palm-sized scrap of graph paper with scorched edges and part of Daniel’s handwritten diagram. He holds the scrap in his left hand while his right hand holds a pencil beside his small tan notebook.'},
  {description:'Billy opens the door. Daniel works on a much larger generator built on the same green trolley. His blazer hangs on a chair and his white shirt sleeves are rolled up. Billy holds the same small scorched scrap.',dialogue:[['Billy','You moved it yourself?'],['Daniel','I needed more time.']]},
  {description:'Daniel adjusts a control while Billy notices the gauge approaching its red danger zone. The younger student approaches the open door carrying a small school toolbox.',dialogue:[['Daniel','A lightbulb won’t win. This could power the whole school.'],['Billy','Has it been tested?']]},
  {description:'The younger student steps inside with the toolbox. A cable spits sparks beside a tall storage shelf. Billy turns toward the danger, the small clue tucked into his blazer pocket. Daniel watches the rising gauge.',dialogue:[['Student','I brought the tools you wanted.'],['Billy','Daniel—turn it off.'],['Daniel','Just a little more…']]}
 ],
 [
  {description:'An electrical burst knocks a shelf support loose. The shelf falls, trapping the younger student’s leg. Billy rushes toward him with his hands free; the small clue stays in his blazer pocket. Daniel stands beside the power switch.',sound:'KRAK!',dialogue:[['Student','Help!']]},
  {description:'Billy uses both hands to try to lift the shelf while sparks fall dangerously close. He looks directly toward Daniel.',dialogue:[['Billy','Pull the switch!']]},
  {description:'Daniel hesitates with one hand hovering beside the switch and the other clutching his diagrams and bound notebook. He sees the trapped student and the invention’s gauge deep in the red, but still delays.',dialogue:[['Daniel','But it’ll ruin everything…']]},
  {description:'Billy rushes to the switch and pulls it. The generator burns out. A teacher arrives through the open doorway, alerted by the noise. Billy’s clue stays pocketed while he acts.',sound:'FZZZT!',dialogue:[['Daniel','NO!']]},
  {description:'The teacher has lifted the shelf, and the rescued student sits safely nearby. The teacher rests a grateful hand on Billy’s shoulder. Billy looks shaken and concerned for the student. Daniel stands apart with his scorched burgundy notebook, watching with hurt and resentment. No one speaks.'},
  {description:'Later, the boys face each other in the grand school hallway, separated by a widening gap. Billy holds the same palm-sized scorched scrap again. Daniel clutches his damaged bound notebook. In a small final inset, Daniel turns away, his expression hardening.',dialogue:[['Daniel','You just couldn’t let me win.'],['Billy','He could’ve been killed.'],['Daniel','Next time, I won’t let anyone stop me.']],caption:'One learned to follow the clues. The other learned to hide them.'}
 ]
];
function createComic(options){return require('./comic-pages.cjs').renderComic({...options,title,eyebrow:'A WEBSITE-EXCLUSIVE PREQUEL COMIC',intro:'Billy and Daniel’s schooldays.',artworks,pages,pageTitles:['Two Friends','Follow the Clues','The Choice'],closingTitle:'Meet them in the books',closingLinks:[['characters.html#billy','Meet Billy'],['characters.html#doc','Meet Daniel']]});}
module.exports={file,title,artworks,socialImage,metadata,pages,createComic};
