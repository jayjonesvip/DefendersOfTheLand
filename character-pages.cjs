// Public character profiles use only the approved previews and website comics.
const profiles={
 fist:{file:'fist-o-mite.html',name:'Fist-O-Mite',image:'fist-portrait-transparent-v1.webp',alt:'Fist-O-Mite, a living red boxing glove with a white cuff and a grinning face.',hook:'A flying boxing glove. A sharp tongue. A mind of his own.',paragraphs:[
  'Dr. Daniel Orkleson wanted a strong helper who would follow orders. He got Fist-O-Mite instead: a living boxing glove with a mind of his own.',
  'Fist can float and fly with no hand inside his cuff. He can throw a punch—and talk back. First, he needs to escape the lab where he came to life.',
  'Fist likes to make jokes, but he cares about his friends. When something looks wrong, he is ready to stand up and help.'
 ],traits:[['Abilities','Flight and a powerful punch.'],['Personality','Independent, outspoken, and loyal.'],['Start reading','Meet Fist in The Glove That Hit Back, the free first chapter of Origins.']],comic:'loaded-glove.html',comicTitle:'Fist-O-Mite in: The Loaded Glove',comicDescription:'Join Fist and reporter Jenny at Cleveland’s Friday night fights. A suspicious glove gives this boxing fan something to investigate.',source:'loaded-glove.cjs',other:'flaming-head'},
 'flaming-head':{file:'flaming-head.html',name:'Flaming Head',image:'character-flaming-head-v1.png',alt:'Flaming Head, a round orange face surrounded by golden flames.',hook:'From the Sun to Lake Erie—with a whole world to discover.',paragraphs:[
  'Flaming Head is a gentle visitor wrapped in flame. He has a strange link to Cleveland’s new heroes. His journey begins far from Earth.',
  'In the free comic The One Who Fell, a small piece of the Sun comes to life. It lands in Lake Erie and sends a huge wave toward Cleveland.',
  'He can fly, but he still has a lot to learn about Earth. A curious fish and a city full of people give him plenty to discover.'
 ],traits:[['Abilities','Flight and a body surrounded by flame.'],['Personality','Gentle, curious, and new to Earth.'],['Start reading','Read his free origin comic, then start the book series with Origins.']],comic:'flaming-head-origin.html',comicTitle:'Flaming Head: The One Who Fell',comicDescription:'Follow a living fragment from the Sun to Lake Erie in this two-page origin comic, with a complete text transcript.',source:'flaming-head-origin.cjs',other:'fist'}
};
Object.assign(profiles,{
 "billy": {
  "file": "inspector-billy.html",
  "name": "Inspector Billy",
  "image": "billy-portrait-transparent-v1.webp",
  "alt": "Inspector Billy wearing a plaid cap and tan coat and holding a magnifying glass.",
  "hook": "Questions first. Magnifying glass ready.",
  "paragraphs": [
   "Inspector Billy is a detective with a notebook and a magnifying glass. He notices clues that other people miss.",
   "Billy keeps asking questions, even when others think they know the answer. He does not trust Daniel Orkleson just because his inventions look impressive.",
   "What were Billy and Daniel like as kids? Read WHY SO EVIL? to see a school mystery from their past."
  ],
  "traits": [
   [
    "Strengths",
    "Spotting clues and asking good questions."
   ],
   [
    "Personality",
    "Curious and persistent."
   ]
  ],
  "comics": [
   "why-so-evil.cjs"
  ],
  "other": "doc",
  "firstBook": "origins",
  "description": "Meet Inspector Billy in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the illustrated books, and read a free chapter."
 },
 "doc": {
  "file": "doc-dork.html",
  "name": "Doc Dork",
  "image": "doc-dossier.png",
  "alt": "Doc Dork wearing a white lab coat and oversized round glasses.",
  "hook": "Brilliant inventions. A demand for control.",
  "paragraphs": [
   "Dr. Daniel Orkleson is known as Doc Dork. He builds clever machines and wants everyone to know how smart he is.",
   "His experiments bring old objects to life. But the boxing glove he wakes up becomes Fist-O-Mite—and refuses to take orders.",
   "Daniel’s plans cause trouble for Cleveland’s heroes. Read his free comics for a school mystery with Billy and an experiment with a mind of its own."
  ],
  "traits": [
   [
    "Strengths",
    "Building machines and bringing objects to life."
   ],
   [
    "Personality",
    "Brilliant, impatient, and controlling."
   ]
  ],
  "comics": [
   "why-so-evil.cjs",
   "sticky-situation.cjs"
  ],
  "other": "fist",
  "firstBook": "origins",
  "description": "Meet Doc Dork in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the illustrated books, and read a free chapter."
 },
 "claude": {
  "file": "claude-blackwell.html",
  "name": "Claude Blackwell",
  "image": "claude-portrait-v2.png",
  "alt": "Portrait of Claude Blackwell, Cleveland lakefront investor.",
  "hook": "A better waterfront starts with listening.",
  "paragraphs": [
   "Claude Blackwell helps fund projects near Lake Erie. He wants the waterfront to be a better place for the people of Cleveland.",
   "Claude believes listening matters. He brings a different view to a city full of strange powers and big inventions.",
   "Explore the map to see places in the story. Then start Origins to meet the people who help shape this superhero adventure."
  ],
  "traits": [
   [
    "Role",
    "Helps fund projects near Lake Erie."
   ],
   [
    "Outlook",
    "Making the lakefront better by listening to people."
   ]
  ],
  "comics": [],
  "other": "eleanor",
  "firstBook": "origins",
  "description": "Meet Claude Blackwell in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the illustrated books, and read a free chapter."
 },
 "eleanor": {
  "file": "eleanor-blackwell.html",
  "name": "Eleanor Blackwell",
  "image": "eleanor-portrait-v2.png",
  "alt": "Portrait of Eleanor Blackwell, a supporter of Daniel Orkleson.",
  "hook": "Confidence in a scientist. Doubts from a detective.",
  "paragraphs": [
   "Eleanor Blackwell trusts Daniel Orkleson. She is sure he knows what he is doing, and she does not like Billy questioning his plans.",
   "In Aftershock, Eleanor promises free electricity for Cleveland. The heroes want to know where that power comes from. Their search leads to Daniel’s experiment, Skyfall.",
   "Can a promise sound so good that people stop asking questions? Eleanor’s part in the story gives the heroes something to think about."
  ],
  "traits": [
   [
    "Role",
    "Trusts Daniel Orkleson and his plans."
   ],
   [
    "Personality",
    "Calm, sure of herself, and hard to change."
   ]
  ],
  "comics": [],
  "other": "claude",
  "firstBook": "origins",
  "description": "Meet Eleanor Blackwell in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the illustrated books, and read a free chapter."
 },
 "jenny": {
  "file": "pink-blur.html",
  "name": "Jenny Jenkins / Pink Blur",
  "image": "jenny-pink-blur-transparent-v1.webp",
  "alt": "Pink Blur in a pink-and-white costume with white gloves and boots.",
  "hook": "A reporter’s determination. A hero’s sense of purpose.",
  "paragraphs": [
   "Jenny Jenkins is a reporter. She asks clear questions and works hard to find the facts. As Pink Blur, she also helps Cleveland as a superhero.",
   "Jenny has two jobs to juggle: getting the story and helping people. Both take courage and care.",
   "In The Loaded Glove, Jenny goes to a boxing match with Fist-O-Mite. When Fist spots something wrong, her camera helps them find the truth."
  ],
  "traits": [
   [
    "Roles",
    "Reporter Jenny Jenkins and superhero Pink Blur."
   ],
   [
    "Personality",
    "Determined, direct, and ready to help."
   ]
  ],
  "comics": [
   "loaded-glove.cjs"
  ],
  "other": "seth",
  "firstBook": "origins",
  "description": "Meet Jenny Jenkins / Pink Blur in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the books, and read a free chapter."
 },
 "seth": {
  "file": "super-zerdo.html",
  "name": "Seth Zerdowski / Super Zerdo",
  "image": "zerdo-costume-transparent-v1.webp",
  "alt": "Super Zerdo in an orange suit with white trim and brown gloves and boots.",
  "hook": "Amazing strength. A teenager learning to help.",
  "paragraphs": [
   "Seth Zerdowski is seventeen and wants to be a better person. A flash over Lake Erie gives him amazing strength. Now he has a lot to learn.",
   "As Super Zerdo, Seth still makes mistakes. He is kind and wants to help, but being strong does not always tell him what to do.",
   "Meet Cleveland’s unlikely heroes in Origins. Read the free sample to see how their adventures begin."
  ],
  "traits": [
   [
    "Ability",
    "Amazing strength."
   ],
   [
    "Personality",
    "Kind, awkward, and eager to help."
   ]
  ],
  "comics": [],
  "other": "jenny",
  "firstBook": "origins",
  "description": "Meet Seth Zerdowski / Super Zerdo in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the books, and read a free chapter."
 },
 "laura": {
  "file": "lava-lips.html",
  "name": "Laura Baxter / Lava Lips",
  "image": "laura-lava-lips-transparent-v1.webp",
  "alt": "Lava Lips in a black mask, flame-patterned suit, black boots and open coat.",
  "hook": "A sneeze can start a fire. Anger can do more.",
  "paragraphs": [
   "Laura Baxter can breathe fire. As Lava Lips, she is powerful and quick to get angry. But having a power does not make her life easy.",
   "In Book Three, Laura cannot even sneeze without starting a fire. Flaming Head tries to help. A costume and practice are not enough to give Laura her old life back.",
   "Daniel Orkleson offers a way to make Flaming Head helpless. Laura must decide how far she will go to get what she wants."
  ],
  "traits": [
   [
    "Ability",
    "Fiery breath."
   ],
   [
    "Personality",
    "Angry, outspoken, and struggling with a changed life."
   ]
  ],
  "comics": [],
  "other": "flaming-head",
  "firstBook": "book-three",
  "description": "Meet Laura Baxter / Lava Lips in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the books, and read a free chapter."
 },
 "luke": {
  "file": "jaws-o-death.html",
  "name": "Jaws O’ Death",
  "image": "luke-portrait-v1.png",
  "alt": "Jaws O’ Death, a floating blond head with metal jaws.",
  "hook": "Metal jaws. A mean streak. Little patience.",
  "paragraphs": [
   "Jaws O’ Death is a floating head with metal jaws. He would rather bite his way through a problem than wait.",
   "In Aftershock, Daniel’s living bear trap hopes another experiment will give him a body. But can he trust Daniel to help?",
   "Read Seized Up for a short adventure starring Jaws. Then try the books to find out more about his part in Cleveland’s troubles."
  ],
  "traits": [
   [
    "Features",
    "A floating head and metal jaws."
   ],
   [
    "Personality",
    "Hates waiting and is quick to start a fight."
   ]
  ],
  "comics": [
   "seized-up.cjs"
  ],
  "other": "doc",
  "firstBook": "origins",
  "description": "Meet Jaws O’ Death in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the illustrated books, and read a free chapter."
 },
 "perch": {
  "file": "super-perch-character.html",
  "name": "Super Perch",
  "image": "character-super-perch-v1.png",
  "alt": "Super Perch, a small fish with extraordinary powers.",
  "hook": "A small fish with a big sense of responsibility.",
  "paragraphs": [
   "Super Perch is a small fish with amazing powers. He is eager to help and keep his lake safe.",
   "A curious perch meets Flaming Head when he first reaches Earth in The One Who Fell. Lake Erie brings these unusual characters together.",
   "Read Which Way to Superior? for Super Perch’s own adventure. You can also explore the map to see more places in the story."
  ],
  "traits": [
   [
    "Role",
    "A superhero fish who protects his lake."
   ],
   [
    "Personality",
    "Enthusiastic and serious about helping."
   ]
  ],
  "comics": [
   "super-perch.cjs"
  ],
  "other": "flaming-head",
  "firstBook": "origins",
  "description": "Meet Super Perch in Defenders of the Land by Jay Jones. Discover this Cleveland character’s story, explore the illustrated books, and read a free chapter."
 }
});
const metadata={
 'fist-o-mite.html':{title:'Fist-O-Mite | Cleveland Superhero Character',description:'Meet Fist-O-Mite, Jay Jones’s flying boxing-glove superhero. Explore his personality, read The Loaded Glove comic, and try Origins Chapter 1 free on this site.',lastModified:'2026-11-01'},
 'flaming-head.html':{title:'Flaming Head | Cleveland Superhero Character',description:'Meet Flaming Head, the fiery visitor in Jay Jones’s Cleveland superhero adventures. Read his free origin comic, discover his personality, and explore the books.',lastModified:'2026-11-01'}
};
for(const p of Object.values(profiles)){
 p.firstBook=p.firstBook||'origins';
 p.comicEntries=p.comics?p.comics.map(source=>{const comic=require('./'+source);return {file:comic.file,title:comic.title,description:comic.metadata[comic.file].description,socialImage:comic.socialImage};}):[{file:p.comic,title:p.comicTitle,description:p.comicDescription,socialImage:require('./'+p.source).socialImage}];
 if(!metadata[p.file])metadata[p.file]={title:p.name+' | Defenders of the Land',description:p.description,lastModified:'2026-11-01'};
}
function renderProfile(id,{img,escape:esc}){
 const p=profiles[id],other=profiles[p.other];
 let portrait=img(p.image,p.alt);
 if(!/\swidth=/.test(portrait)){const [width,height]=id==='luke'?[1338,1175]:[1024,1536];portrait=portrait.replace('<img ',`<img width="${width}" height="${height}" `);}
 return `<article class="book-overview character-profile"><p><a href="characters.html">← All characters</a></p>
 <header class="book-hero"><figure class="book-hero-cover">${portrait.replace('loading="lazy"','loading="eager" fetchpriority="high"')}</figure><div class="book-hero-copy"><p class="eyebrow">DEFENDERS OF THE LAND · CHARACTER PROFILE</p><h1>${esc(p.name)}</h1><p class="book-hook">${esc(p.hook)}</p><p>Meet one of the characters in Jay Jones’s superhero adventures with pictures. The stories take place in Cleveland in 1987.</p><div class="actions">${p.comicEntries.length?'<a class="button" href="#character-comics">Read the free comics ↓</a>':`<a class="button" href="${p.firstBook}-chapter-1.html">Read a free chapter →</a>`}<a class="button secondary" href="${p.firstBook}.html">About ${p.firstBook==='origins'?'Book One: Origins':'Book Three: Lava Lips'}</a></div></div></header>
 <div class="book-reading-layout"><section class="book-about" aria-labelledby="character-about"><h2 id="character-about">Meet ${esc(p.name)}</h2>${p.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}</section><section class="book-preview-card" aria-labelledby="character-facts"><h2 id="character-facts">Quick facts</h2><dl>${p.traits.map(([term,text])=>`<dt><strong>${esc(term)}</strong></dt><dd>${esc(text)}</dd>`).join('')}</dl></section></div>
 ${p.comicEntries.length?`<section class="book-about" id="character-comics" aria-labelledby="character-comics-title"><p class="eyebrow">FREE COMICS · ONLY ON THIS WEBSITE</p><h2 id="character-comics-title">Read ${esc(p.name)}’s comics</h2><div class="web-comics-grid">${p.comicEntries.map((c,i)=>`<article class="web-comic-card" aria-labelledby="character-comic-${i}"><a class="web-comic-thumbnail" href="${c.file}" aria-label="Read ${esc(c.title)}"><img src="assets/${c.socialImage.file}" width="${c.socialImage.width}" height="${c.socialImage.height}" alt="${esc(c.socialImage.alt)}" loading="lazy" decoding="async"></a><div class="web-comic-copy"><p class="eyebrow">FREE TO READ</p><h3 id="character-comic-${i}">${esc(c.title)}</h3><p>${esc(c.description)}</p><a class="web-comic-read character-comic-link" href="${c.file}">Read comic <span aria-hidden="true">→</span></a></div></article>`).join('')}</div></section>`:''}
 <section class="book-about" aria-labelledby="character-books"><h2 id="character-books">Read their adventures</h2><p>${p.firstBook!=='origins'?'Meet Laura in <a href="book-three.html">Lava Lips, Book Three</a>, or <a href="book-three-chapter-1.html">read its first chapter free</a>. ':''}Start with <a href="origins.html">Origins</a>, Book One of the four-book series. <a href="origins-chapter-1.html">Read Chapter 1 free</a> or <a href="downloads.html">download the three-chapter sample</a> then find the rest on Amazon.</p><p>The free comics are extra adventures with these characters. See <a href="books.html">which book to read first</a>. Grown-ups can visit the <a href="books.html#reader-guide">guide for parents and teachers</a>.</p></section>
 <nav class="book-neighbors" aria-label="More characters"><a href="characters.html">See all characters →</a><a href="${other.file}">Meet ${esc(other.name)} →</a></nav></article>`;
}
module.exports={profiles,metadata,renderProfile};
