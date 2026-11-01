// Public character profiles use only the approved previews and website comics.
const profiles={
 fist:{file:'fist-o-mite.html',name:'Fist-O-Mite',image:'fist-portrait-transparent-v1.webp',alt:'Fist-O-Mite, a living red boxing glove with a white cuff and a grinning face.',hook:'A flying boxing glove. A sharp tongue. A mind of his own.',paragraphs:[
  'Dr. Daniel Orkleson wanted a strong assistant who would obey him. What he got was Fist-O-Mite: a living boxing glove who immediately decided he could choose his own direction.',
  'Fist can float and fly without a hand inside his cuff. He can also throw a punch—and an answer back. His first challenge is getting out of the laboratory where he came to life.',
  'Behind the wisecracks is a loyal heart. In Cleveland’s unlikely cast of heroes, Fist brings independence, curiosity, and a willingness to stand up when something looks wrong.'
 ],traits:[['Abilities','Flight and a powerful punch.'],['Personality','Independent, outspoken, and loyal.'],['Start reading','Meet Fist in The Glove That Hit Back, the free first chapter of Origins.']],comic:'loaded-glove.html',comicTitle:'Fist-O-Mite in: The Loaded Glove',comicDescription:'Join Fist and reporter Jenny at Cleveland’s Friday night fights. A suspicious glove gives this boxing fan something to investigate.',source:'loaded-glove.cjs',other:'flaming-head'},
 'flaming-head':{file:'flaming-head.html',name:'Flaming Head',image:'character-flaming-head-v1.png',alt:'Flaming Head, a round orange face surrounded by golden flames.',hook:'From the Sun to Lake Erie—with a whole world to discover.',paragraphs:[
  'Flaming Head is a gentle visitor wrapped in flame, with a mysterious connection to Cleveland’s unlikely heroes. His story begins far beyond the city he will come to know.',
  'In the website-exclusive origin comic The One Who Fell, a fragment from the Sun awakens on its journey toward Earth. Its arrival in Lake Erie sends a wave toward Cleveland’s shore.',
  'He can fly, but understanding his new home takes more than staying in the air. A curious perch and a city full of unfamiliar people give this fiery newcomer plenty to discover.'
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
   "Inspector Billy is a private investigator with a notebook, a magnifying glass, and a habit of noticing what others miss. In a city acquiring unlikely superheroes, an observant person still has plenty to offer.",
   "Billy follows questions rather than accepting a convenient explanation. His doubts put him at odds with people who would rather trust Daniel Orkleson and leave the matter there.",
   "The website comic WHY SO EVIL? looks back at Billy and Daniel during their schooldays. Read that short prequel alongside the books for another glimpse of their history."
  ],
  "traits": [
   [
    "Strengths",
    "Observation, investigation, and asking direct questions."
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
   "Dr. Daniel Orkleson, known as Doc Dork, is an inventor who wants both control and recognition. He expects his scientific achievements to prove he is the smartest person in the room.",
   "His reanimation experiments bring discarded objects to life. When he awakens a boxing glove, the result is strong, outspoken, and unwilling to obey: Fist-O-Mite.",
   "Daniel’s plans put Cleveland’s heroes to the test. His website comics offer two other windows into his world: a schooldays prequel with Billy and a short adventure among his failed experiments."
  ],
  "traits": [
   [
    "Strengths",
    "Inventing machines and experimenting with reanimation."
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
   "Claude Blackwell is a lakefront investor who wants Cleveland’s waterfront to thrive. His place in the story connects the city’s future with the people who live beside the lake.",
   "Claude believes listening matters. Among a cast full of extraordinary powers and ambitious inventions, his interest in a better city brings a different perspective.",
   "Explore the Cleveland story map to discover the setting, then start Origins to meet the people whose choices shape this superhero adventure."
  ],
  "traits": [
   [
    "Role",
    "A lakefront investor and ally."
   ],
   [
    "Outlook",
    "A thriving waterfront and a city built by listening."
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
   "Eleanor Blackwell is composed, confident, and convinced that Daniel Orkleson deserves her faith. She has little patience for Inspector Billy’s doubts about the inventor.",
   "In Aftershock, Eleanor promises Cleveland free electricity. The mysterious power source leads the Defenders toward Daniel and the experiment he calls Skyfall.",
   "Her confidence raises a question that runs through the series: what happens when an impressive promise keeps people from questioning the person making it?"
  ],
  "traits": [
   [
    "Role",
    "A supporter of Daniel Orkleson and his plans."
   ],
   [
    "Personality",
    "Composed, confident, and difficult to persuade."
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
   "Jenny Jenkins is a determined reporter who asks direct questions and keeps moving. As Pink Blur, she brings that same drive to helping Cleveland.",
   "Balancing reporting with being a hero means that Jenny has more than one way to pursue a story. Getting the facts matters just as much as stepping in to help.",
   "In The Loaded Glove, Jenny attends Cleveland’s Friday night fights with Fist-O-Mite. Her camera becomes part of their investigation when Fist notices something suspicious in the ring."
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
  "hook": "Extraordinary strength. A teenager learning to help.",
  "paragraphs": [
   "Seventeen-year-old Seth Zerdowski wants to be someone better. After a flash over Lake Erie, he discovers impossible strength—and the very real consequences of having it.",
   "As Super Zerdo, Seth is still kind, awkward, and learning. Wanting to help does not mean he always knows what to do, especially when a new power changes everyday life.",
   "His story is part of Origins, where Cleveland needs people willing to stand up for one another. Read the free sample to begin the series and discover its unlikely heroes."
  ],
  "traits": [
   [
    "Ability",
    "Extraordinary strength."
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
   "Laura Baxter has fiery breath and a sharp tongue. As Lava Lips, she is powerful, bitter, and quick to lash out—but having a power does not make her life easy.",
   "In Lava Lips, Book Three, Laura cannot even sneeze without starting a fire. Flaming Head offers help, but a costume and target practice cannot restore the ordinary life she wants.",
   "When Daniel Orkleson offers a way to make Flaming Head helpless, Laura faces a choice about how far she is willing to go. Her story brings anger, responsibility, and consequences into the Defenders’ Cleveland."
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
   "Jaws O’ Death is a floating head with metal jaws who would rather bite through a problem than wait. He is one of the dangerous personalities in Daniel Orkleson’s world.",
   "In Aftershock, Daniel’s animated bear trap still believes another experiment will give him a body. That hope ties his future to a scientist who sees power where others see people.",
   "The free website comic Seized Up puts Jaws in a short adventure of his own. Meet him there, then explore the books for more of his part in Cleveland’s superhero troubles."
  ],
  "traits": [
   [
    "Features",
    "A floating head and metal jaws."
   ],
   [
    "Personality",
    "Impatient, aggressive, and spoiling for a fight."
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
   "Super Perch is a small fish with extraordinary powers and plenty of enthusiasm. Protecting his lake is a responsibility he takes seriously.",
   "A curious perch is part of Flaming Head’s first encounter with Earth in The One Who Fell. Lake Erie connects these unusual characters to the city beyond its shore.",
   "Super Perch also has his own free website comic, Which Way to Superior? Read the short adventure, then explore the story map to see more of the Cleveland setting."
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
 p.comicEntries=p.comics?p.comics.map(source=>{const comic=require('./'+source);return {file:comic.file,title:comic.title,description:comic.metadata[comic.file].description};}):[{file:p.comic,title:p.comicTitle,description:p.comicDescription}];
 if(!metadata[p.file])metadata[p.file]={title:p.name+' | Defenders of the Land',description:p.description,lastModified:'2026-11-01'};
}
function renderProfile(id,{img,escape:esc}){
 const p=profiles[id],other=profiles[p.other];
 let portrait=img(p.image,p.alt);
 if(!/\swidth=/.test(portrait)){const [width,height]=id==='luke'?[1338,1175]:[1024,1536];portrait=portrait.replace('<img ',`<img width="${width}" height="${height}" `);}
 return `<article class="book-overview character-profile"><p><a href="characters.html">← All characters</a></p>
 <header class="book-hero"><figure class="book-hero-cover">${portrait.replace('loading="lazy"','loading="eager" fetchpriority="high"')}</figure><div class="book-hero-copy"><p class="eyebrow">DEFENDERS OF THE LAND · CHARACTER PROFILE</p><h1>${esc(p.name)}</h1><p class="book-hook">${esc(p.hook)}</p><p>An original character from Jay Jones’s illustrated middle-grade superhero adventures, set in Cleveland in 1987.</p><div class="actions">${p.comicEntries.length?'<a class="button" href="#character-comics">Read the free comics ↓</a>':`<a class="button" href="${p.firstBook}-chapter-1.html">Read a free chapter →</a>`}<a class="button secondary" href="${p.firstBook}.html">Explore ${p.firstBook==='origins'?'Book One: Origins':'Book Three: Lava Lips'}</a></div></div></header>
 <div class="book-reading-layout"><section class="book-about" aria-labelledby="character-about"><h2 id="character-about">Meet ${esc(p.name)}</h2>${p.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}</section><section class="book-preview-card" aria-labelledby="character-facts"><h2 id="character-facts">At a glance</h2><dl>${p.traits.map(([term,text])=>`<dt><strong>${esc(term)}</strong></dt><dd>${esc(text)}</dd>`).join('')}</dl></section></div>
 ${p.comicEntries.length?`<section class="book-about" id="character-comics" aria-labelledby="character-comics-title"><p class="eyebrow">FREE WEBSITE-EXCLUSIVE COMICS</p><h2 id="character-comics-title">Read ${esc(p.name)}’s comics</h2>${p.comicEntries.map(c=>`<article><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><p><a class="button character-comic-link" href="${c.file}">Read ${esc(c.title)} →</a></p></article>`).join('')}</section>`:''}
 <section class="book-about" aria-labelledby="character-books"><h2 id="character-books">Explore the book adventures</h2><p>${p.firstBook!=='origins'?'Meet Laura in <a href="book-three.html">Lava Lips, Book Three</a>, or <a href="book-three-chapter-1.html">read its first chapter free</a>. ':''}Start with <a href="origins.html">Origins</a>, Book One of the four-book series. <a href="origins-chapter-1.html">Read Chapter 1 free</a> or <a href="downloads.html">download the three-chapter sample</a> before continuing on Amazon.</p><p>The website comics are short adventures to enjoy alongside the illustrated prose books. Visit the <a href="books.html">series reading order</a> or <a href="books.html#reader-guide">parent, teacher and librarian guide</a>.</p></section>
 <nav class="book-neighbors" aria-label="More characters"><a href="characters.html">Meet all the heroes, villains and allies →</a><a href="${other.file}">Meet ${esc(other.name)} →</a></nav></article>`;
}
module.exports={profiles,metadata,renderProfile};
