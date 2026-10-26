// Spoiler-free character summaries and presentation metadata for the public gallery.
const characterDetails={
 billy:{group:'heroes',firstBook:1,description:"An observant private investigator with a notebook, a magnifying glass and a knack for asking the question everyone else missed."},claude:{group:'allies',firstBook:1,description:"A lakefront investor who wants Cleveland’s waterfront to thrive. Claude believes a better city starts with listening."},
 doc:{group:'villains',firstBook:1,description:"A brilliant inventor with no patience for limits. Daniel Orkleson wants control—and credit for being the smartest man in the room."},eleanor:{group:'villains',firstBook:1,description:"Composed and certain of herself, Eleanor Blackwell puts her faith in Daniel Orkleson—and has little time for Billy’s doubts."},
 fist:{group:'heroes',firstBook:1,description:"A living, flying boxing glove with a sharp tongue and a loyal heart. Fist-O-Mite decides for himself who deserves his help."},'flaming-head':{group:'heroes',firstBook:1,description:"A gentle visitor wrapped in flame, with a mysterious connection to Cleveland’s unlikely heroes."},
 jenny:{group:'heroes',firstBook:1,description:"A determined reporter who asks direct questions and keeps moving. As Pink Blur, Jenny brings that same drive to helping Cleveland."},luke:{group:'villains',firstBook:1,description:"A floating head with metal jaws and a mean streak. Jaws O’ Death would rather bite his way through a problem than wait."},
 perch:{group:'heroes',firstBook:1,description:"A small fish with extraordinary powers and plenty of enthusiasm. Super Perch takes protecting his lake seriously."},seth:{group:'heroes',firstBook:1,description:"A kind, awkward teenager learning what to do with extraordinary strength. Seth wants to help, even when he gets things wrong."},
 laura:{group:'villains',firstBook:3,description:"With a sharp tongue and fiery breath, Laura Baxter has become Lava Lips. She is powerful, bitter and quick to lash out."}
};
function renderCharacters({characters,img,escape:esc}){
 // Measured natural dimensions for legacy PNGs that lack manifest entries.
 const altText={billy:'Inspector Billy in a plaid cap and tan coat, holding a magnifying glass.',fist:'Fist-O-Mite, a red boxing glove with a grinning face.',seth:'Seth Zerdowski wearing an orange Z hoodie and jeans.',jenny:'Jenny Jenkins in a white blouse and pink skirt.',doc:'Doc Dork in a white lab coat and oversized round glasses.',luke:'Jaws O’ Death, a floating blond head with metal jaws.',laura:'Laura Baxter wearing glasses, a black T-shirt and gray sweatpants.'};
 const costumeAlt={seth:'Super Zerdo in an orange suit with white trim and brown gloves and boots.',jenny:'Pink Blur in a pink-and-white costume with white gloves and boots.',laura:'Lava Lips in a black mask, flame-patterned suit, black boots and open coat.'};
 const sizes={'claude-portrait-v2.png':[1024,1536],'eleanor-portrait-v2.png':[1024,1536],'jenny-portrait-v2.png':[1024,1536],'luke-portrait-v1.png':[1338,1175]};
 const portraitImage=(file,alt)=>{
  let markup=img(file,alt);
  if(!/\swidth="/.test(markup)){
   const size=sizes[file];if(!size)throw Error(`Missing portrait dimensions: ${file}`);
   markup=markup.replace('<img ',`<img width="${size[0]}" height="${size[1]}" `);
  }
  return markup;
 };
 const roster=[...characters.filter(c=>c.id!=='laura'),characters.find(c=>c.id==='laura')||{id:'laura',alias:'Laura Baxter',costumeAlias:'Lava Lips',placeholder:true}];
 const tags={heroes:'Hero',villains:'Villain',allies:'Ally'},books={1:['One','origins'],3:['Three','book-three']};
 return roster.map(c=>{
  const details=characterDetails[c.id];if(!details||!details.description)throw Error(`Missing character-card metadata: ${c.id}`);
  const [bookName,bookId]=books[details.firstBook];
  const primary=c.civilianAlias||c.alias;
  const secondary=c.costumeAlias||(c.alias!==primary?c.alias:null);
  let portrait,help='';
  if(c.placeholder){
   portrait='<div class="character-portrait-placeholder"><span aria-hidden="true">LL</span><p>[PORTRAIT: Laura Baxter / Lava Lips]</p></div>';
  }else if(!c.costumeImage){portrait=portraitImage(c.image,altText[c.id]||c.alias);}
  else{
   const toggle=`${c.id}-costume`,hint=`${c.id}-costume-help`;
   const base=portraitImage(c.image,altText[c.id]||c.alias).replace('<img ','<img class="character-civilian" aria-hidden="true" ');
   const costume=portraitImage(c.costumeImage,costumeAlt[c.id]||`${c.costumeAlias} costume`).replace('<img ','<img class="character-costume" aria-hidden="true" ');
   portrait=`<input class="character-costume-toggle" type="checkbox" id="${toggle}" aria-label="Keep ${esc(c.costumeAlias)} costume visible" aria-describedby="${hint}">
    <label class="character-transform" for="${toggle}">
     <span class="character-portrait-stack">${base}${costume}</span>
     <span class="character-pin-note" aria-hidden="true"><span class="character-pin-off">Keep costume visible</span><span class="character-pin-on">Costume pinned · tap to reset</span></span>
    </label>`;
   help=`<p class="character-transform-help" id="${hint}">Hover or focus to preview ${esc(c.costumeAlias)}. Tap or press Space to keep the costume visible.</p>`;
  }
  return `<article id="${esc(c.id)}" class="character-card${c.costumeImage?' character-can-transform':''}${c.placeholder?' character-pending':''}" data-character-group="${details.group}" aria-labelledby="${esc(c.id)}-name">
   <div class="character-media">${portrait}</div>
   <div class="character-identity"><h2 id="${esc(c.id)}-name">${esc(primary)}</h2>${secondary?`<p class="character-alias">${esc(secondary)}</p>`:''}</div>
   <span class="character-tag character-tag-${details.group}">${tags[details.group]}</span>
   <p class="character-description">${esc(details.description)}</p>
   ${help}
   <a class="character-first-book" href="${bookId}-chapter-1.html" aria-label="${esc(primary)} first appears in Book ${bookName}. Read its first chapter.">First appears in Book ${bookName} <span aria-hidden="true">→</span></a>
  </article>`;
 }).join('');
}
function createCharacters({characters,img,escape:esc,site}){
 const amazon=(href,text,label,cls='button secondary')=>`<a href="${esc(href)}" class="${cls}" rel="noopener" aria-label="${esc(label)}">${text}</a>`;
 return `<section class="contents character-gallery">
  <header class="character-intro"><p class="eyebrow">THE PEOPLE OF THE LAND</p><h1>Characters</h1><p>Meet some of Cleveland’s unlikely heroes and troublemakers.</p></header>
  <fieldset class="character-filters" data-character-filters hidden><legend>Show characters</legend><div class="character-filter-buttons">
   ${[['all','All'],['heroes','Heroes'],['villains','Villains'],['allies','Allies']].map(([value,label])=>`<button type="button" data-character-filter="${value}" aria-pressed="${value==='all'}" aria-controls="character-grid">${label}</button>`).join('')}
  </div></fieldset>
  <p class="character-filter-status" data-character-status role="status" aria-live="polite" aria-atomic="true" hidden>Showing all ${characters.length+(characters.some(c=>c.id==='laura')?0:1)} characters.</p>
  <div class="profiles" id="character-grid">${renderCharacters({characters,img,escape:esc})}</div>

  <section class="character-closing" aria-labelledby="character-closing-title"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="character-closing-title">Meet the Defenders</h2></div><div class="character-closing-links">
   <a class="button" href="origins-chapter-1.html">Meet them in Chapter 1 <span aria-hidden="true">→</span></a>
   <div class="actions">${amazon(site.paperback.url,'Buy paperback','Buy Origins paperback on Amazon')}${amazon(site.ebook.url,'Buy Kindle','Buy Origins Kindle ebook on Amazon')}</div>
   ${amazon(site.amazonSeriesUrl,'View series on Amazon <span aria-hidden="true">→</span>','View the Defenders of the Land series on Amazon','character-series-link')}
  </div></section>
 </section>`;
}
module.exports={renderCharacters,createCharacters};
