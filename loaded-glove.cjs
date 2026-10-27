const file='loaded-glove.html',title='Fist-O-Mite in: The Loaded Glove';
const artworks=[
 {file:'loaded-glove-page-1-v1.webp',width:1024,height:1536,alt:'The Loaded Glove, page one. Jenny and Fist-O-Mite watch Iron Eddie Malone enter a crowded Cleveland boxing arena.'},
 {file:'loaded-glove-page-2-v1.webp',width:1024,height:1536,alt:'The Loaded Glove, page two. Fist spots something hidden inside Dirty Dan’s glove and asks Jenny to photograph it.'},
 {file:'loaded-glove-page-3-v1.webp',width:1024,height:1536,alt:'The Loaded Glove, page three. Fist exposes the coins in Dan’s glove, Jenny photographs the evidence, and Eddie signs Fist’s attached cuff.'}
];
const socialImage={file:'loaded-glove-social-1200x630-v1.jpg',width:1200,height:630,type:'image/jpeg',alt:'Fist-O-Mite and Jenny watch a Cleveland boxing match beneath the title The Loaded Glove, a free website-exclusive comic by Jay Jones.'};
const metadata={
 [file]:{title:'The Loaded Glove | A Fist-O-Mite Comic',description:'Read The Loaded Glove, a free three-page Fist-O-Mite comic by Jay Jones. Cleveland’s Friday night fights put a loaded glove and a proud fan in the spotlight.',lastModified:'2026-10-27'}
};
const pages=[
 [
  {description:'A packed Cleveland boxing arena glows beneath smoky overhead lights. Jenny sits high in the cheap seats with a press camera and a huge brown tote. Fist-O-Mite peeks out of the bag.',captions:['CLEVELAND. 1987. FRIDAY NIGHT FIGHTS.']},
  {description:'Fist pokes his uncovered red glove face out of the tote beside Jenny.',dialogue:[['Fist-O-Mite','Best seats in the house.'],['Jenny','We’re in the nosebleeds.'],['Fist-O-Mite','Exactly. Nobody looks up here.']]},
  {description:'Iron Eddie Malone, a lean African American boxer wearing green trunks and blue gloves, enters beside his corner team. Fist watches with huge, starry eyes.',dialogue:[['Fist-O-Mite, whispering','That’s him. Iron Eddie. Fourteen straight.']]},
  {description:'Jenny studies the delighted glove with an eyebrow raised.',dialogue:[['Jenny','You know his record?'],['Fist-O-Mite','Know it? I’ve got a poster. Of a different glove, but still.']]},
  {description:'Dirty Dan Kovacs climbs through the ropes in purple trunks and black gloves. The gray-haired referee gives his glove a casual check.',sound:'DING!'}
 ],
 [
  {description:'Eddie lands a clean blue-gloved jab. Dan staggers and grins.',sound:'THWAP!'},
  {description:'Dan drives his black glove into Eddie’s ribs. The padding sags around an unnatural lump.',sound:'CRUNCH!'},
  {description:'Eddie drops to one knee, winded. Dan stands nearby while the referee looks away. The crowd watches.'},
  {description:'Fist goes still in the tote. His eyes widen with shock as he realizes Dan is cheating.',dialogue:[['Fist-O-Mite','That’s not leather.'],['Jenny','What?'],['Fist-O-Mite','I know gloves. There’s something in there. Plaster. Maybe a roll of quarters.']]},
  {description:'Jenny squints toward the ring. Dan adjusts his black glove near the ropes. Fist’s expression hardens into anger.',dialogue:[['Jenny','The ref’s not looking.'],['Fist-O-Mite','Then I’ll look for him.']]},
  {description:'Fist flies openly out of the bag, angry and determined. Jenny readies her camera to record the evidence.',dialogue:[['Fist-O-Mite','Get a picture.']]}
 ],
 [
  {description:'Fist streaks down from the stands toward the normally lit ring. There is no blackout or blinding flash.',sound:'WHOOSH!'},
  {description:'Fist strikes Dan’s loaded black glove. Its seam bursts and silver coins scatter through the air. Dan recoils while Eddie stares at the exposed cheating.',sound:'WHAM!!'},
  {description:'Jenny photographs the exposed glove and falling coins. In the ring, the referee turns toward the evidence. The photograph comes after the glove bursts.',sound:'CLICK.'},
  {description:'Coins settle across the canvas. The referee points toward Dan’s torn glove while Eddie remains on one knee. Dan stands over the spilled evidence.',captions:['DUST SETTLES.']},
  {description:'Dan is disqualified and the referee raises Eddie’s blue glove. Back in the stands, Jenny and Fist watch from beside the tote.',dialogue:[['Jenny','Got it on camera.'],['Fist-O-Mite','I’d do it again.']]},
  {description:'After the fight, Eddie sits beside Jenny’s tote in an arena hallway. His boxing gloves are off and a towel rests around his neck. Fist hovers above the bag as one complete glove, with his red cuff visibly attached. Eddie signs Eddie Malone directly on the cuff’s inset white panel while the glove beams.',captions:['ONE AUTOGRAPH. ONE VERY PROUD GLOVE.'],dialogue:[['Eddie','Whoever you are, kid… thanks.'],['Fist-O-Mite','…I’m never washing this.']]}
 ]
];
function createComic(options){return require('./comic-pages.cjs').renderComic({...options,title,eyebrow:'A WEBSITE-EXCLUSIVE COMIC',intro:'Cleveland. 1987. Friday night fights.',artworks,pages,pageTitles:['Ringside','The Cheat','Caught on Camera'],closingTitle:'Meet Fist in the books',closingLinks:[['characters.html#fist','Meet Fist-O-Mite'],['characters.html#jenny','Meet Jenny']]});}
module.exports={file,title,artworks,socialImage,metadata,pages,createComic};
