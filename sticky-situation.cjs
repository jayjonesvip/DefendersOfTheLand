const file='sticky-situation.html',title='A Sticky Situation';
const artworks=[
 {file:'sticky-situation-page-1-v1.webp',width:1024,height:1536,alt:'A Sticky Situation, page one. Dork scrapes chewing gum from a Cleveland sidewalk and animates it into a flying pink blob with one eye.'},
 {file:'sticky-situation-page-2-v1.webp',width:1024,height:1536,alt:'A Sticky Situation, page two. The gum sticks to Dork’s hair, escapes through the window and reaches a sewer pipe wearing a stolen tuft.'}
];
const socialImage={file:'sticky-situation-social-1200x630-v1.jpg',width:1200,height:630,type:'image/jpeg',alt:'Doc Dork reaches for a flying pink one-eyed piece of gum beneath the title A Sticky Situation, a free two-page comic by Jay Jones.'};
const metadata={
 [file]:{title:'A Sticky Situation | Doc Dork’s Failed Experiments',description:'Read A Sticky Situation, a free two-page Doc Dork comic by Jay Jones. A piece of chewing gum becomes an experiment with an eye—and a mind—of its very own.',lastModified:'2026-10-27'}
};
const pages=[
 [
  {description:'Outside his brick laboratory, Dork crouches on a Cleveland sidewalk and scrapes a flattened wad of discarded pink chewing gum with a metal spatula. Pedestrians step around him. The gum has no eye yet.',captions:['CLEVELAND. 1987.'],dialogue:[['Dork','Saliva. Traces of DNA. Practically a volunteer.']]},
  {description:'Dork lifts the spatula to inspect the specimen. A sticky pink strand still stretches toward the ground.',dialogue:[['Dork','Some specimens require persuasion.']]},
  {description:'In his blue-brick laboratory, Dork adjusts an analog dial. The ordinary gum rests on the steel workbench beneath the Animator, beside his open notebook.',dialogue:[['Dork','A small, simple organism. An excellent place to begin.']]},
  {description:'Blue-white light crackles around the gum. It swells into an uneven pink blob and opens one large eye for the first time. It has no mouth or permanent limbs.',sound:'BZZZT!',dialogue:[['Dork, off-panel','There we are.']]},
  {description:'The living gum springs from the workbench and stretches through the laboratory. Dork ducks, reaching toward it. A sticky strand catches his pencil. The gum glances back silently.',dialogue:[['Dork','Return to the table.']]}
 ],
 [
  {description:'Dork reaches for the darting gum as it releases the pencil toward his outstretched hand.',dialogue:[['Dork','You will follow instructions.']]},
  {description:'The gum lands in Dork’s wild white hair. Its single eye peers down over his forehead while he looks upward through his enormous glasses.',sound:'SPLAT!',dialogue:[['Dork','That is not the table.']]},
  {description:'Dork tries to peel the gum from his hair. It stretches between his hands and scalp, then springs away carrying a small tuft of white hair. His glasses sit crookedly. There is no wound.',sound:'TWANG!',dialogue:[['Dork','MY HAIR!']]},
  {description:'The gum leaps through the open window toward a curbside drain, carrying the stolen tuft. Dork leans out after it.',dialogue:[['Dork','You are laboratory property!']]},
  {description:'Inside the sewer, the pink blob perches proudly on a rusty pipe, wearing the tuft like a wig. Dork’s brown shoes are visible through the drain overhead as he searches. The gum remains silent. A small inset shows his laboratory notebook.',dialogue:[['Dork, from above','I know you’re down there.']],captions:['RESULT: ALIVE.','COOPERATIVE: NO.']}
 ]
];
function createComic(options){return require('./comic-pages.cjs').renderComic({...options,title,eyebrow:'DOC DORK’S FAILED EXPERIMENTS · A WEBSITE-EXCLUSIVE COMIC',intro:'One small specimen. One very uncooperative experiment.',artworks,pages,pageTitles:['The Specimen','Loss of Control'],closingTitle:'More trouble from Dork',closingLinks:[['characters.html#doc','Meet Doc Dork'],['why-so-evil.html','Read WHY SO EVIL?']]});}
module.exports={file,title,artworks,socialImage,metadata,pages,createComic};
