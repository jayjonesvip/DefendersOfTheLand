// Presentation-only metadata: descriptions remain explicit author placeholders.
const characterDetails={
 billy:{group:'heroes',firstBook:1},claude:{group:'allies',firstBook:1},
 doc:{group:'villains',firstBook:1},eleanor:{group:'villains',firstBook:1},
 fist:{group:'heroes',firstBook:1},'flaming-head':{group:'heroes',firstBook:1},
 jenny:{group:'heroes',firstBook:1},luke:{group:'villains',firstBook:1},
 perch:{group:'heroes',firstBook:1},seth:{group:'heroes',firstBook:1},
 laura:{group:'villains',firstBook:3}
};
function renderCharacters({characters,img,escape:esc}){
 // Measured natural dimensions for legacy PNGs that lack manifest entries.
 const sizes={'claude-portrait-v2.png':[1024,1536],'eleanor-portrait-v2.png':[1024,1536],'jenny-portrait-v2.png':[1024,1536],'luke-portrait-v1.png':[1338,1175]};
 const portraitImage=(file,alt)=>{
  let markup=img(file,alt);
  if(!/\swidth="/.test(markup)){
   const size=sizes[file];if(!size)throw Error(`Missing portrait dimensions: ${file}`);
   markup=markup.replace('<img ',`<img width="${size[0]}" height="${size[1]}" `);
  }
  return markup;
 };
 const roster=[...characters,{id:'laura',alias:'Laura Baxter',costumeAlias:'Lava Lips',placeholder:true}];
 const tags={heroes:'Hero',villains:'Villain',allies:'Ally'},books={1:['One','origins'],3:['Three','book-three']};
 return roster.map(c=>{
  const details=characterDetails[c.id];if(!details)throw Error(`Missing character-card metadata: ${c.id}`);
  const [bookName,bookId]=books[details.firstBook];
  const secondary=c.civilianAlias&&c.civilianAlias!==c.alias?c.civilianAlias:c.costumeAlias;
  let portrait,help='';
  if(c.placeholder){
   portrait='<div class="character-portrait-placeholder"><span aria-hidden="true">LL</span><p>[PORTRAIT: Laura Baxter / Lava Lips]</p></div>';
  }else if(!c.costumeImage){portrait=portraitImage(c.image,c.alias);}
  else{
   const toggle=`${c.id}-costume`,hint=`${c.id}-costume-help`;
   const base=portraitImage(c.image,c.alias).replace('<img ','<img class="character-civilian" aria-hidden="true" ');
   const costume=portraitImage(c.costumeImage,`${c.costumeAlias} costume`).replace('<img ','<img class="character-costume" aria-hidden="true" ');
   portrait=`<input class="character-costume-toggle" type="checkbox" id="${toggle}" aria-label="Keep ${esc(c.costumeAlias)} costume visible" aria-describedby="${hint}">
    <label class="character-transform" for="${toggle}">
     <span class="character-portrait-stack">${base}${costume}</span>
     <span class="character-pin-note" aria-hidden="true"><span class="character-pin-off">Keep costume visible</span><span class="character-pin-on">Costume pinned · tap to reset</span></span>
    </label>`;
   help=`<p class="character-transform-help" id="${hint}">Hover or focus to preview ${esc(c.costumeAlias)}. Tap or press Space to keep the costume visible.</p>`;
  }
  return `<article id="${esc(c.id)}" class="character-card${c.costumeImage?' character-can-transform':''}${c.placeholder?' character-pending':''}" data-character-group="${details.group}" aria-labelledby="${esc(c.id)}-name">
   <div class="character-media">${portrait}</div>
   <div class="character-identity"><h2 id="${esc(c.id)}-name">${esc(c.alias)}</h2>${secondary?`<p class="character-alias">${esc(secondary)}</p>`:''}</div>
   <span class="character-tag character-tag-${details.group}">${tags[details.group]}</span>
   <p class="character-description">[DESCRIPTION: ${esc(c.alias)}]</p>
   ${help}
   <a class="character-first-book" href="${bookId}-chapter-1.html" aria-label="${esc(c.alias)} first appears in Book ${bookName}. Read its first chapter.">First appears in Book ${bookName} <span aria-hidden="true">→</span></a>
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
  <p class="character-filter-status" data-character-status role="status" aria-live="polite" aria-atomic="true" hidden>Showing all ${characters.length+1} characters.</p>
  <div class="profiles" id="character-grid">${renderCharacters({characters,img,escape:esc})}</div>
  <aside class="character-roster-note" aria-labelledby="roster-note-title"><h2 id="roster-note-title">Roster notes</h2><p>Laura Baxter / Lava Lips has a placeholder above. Doc Dork and Jaws O’ Death are already included.</p><p>No other major omissions confirmed from the current four-book cast. [AUTHOR CHECK: additional characters to include.]</p></aside>
  <section class="character-closing" aria-labelledby="character-closing-title"><div><p class="eyebrow">DEFENDERS OF THE LAND · JAY JONES</p><h2 id="character-closing-title">Meet the Defenders</h2></div><div class="character-closing-links">
   <a class="button" href="origins-chapter-1.html">Meet them in Chapter 1 <span aria-hidden="true">→</span></a>
   <div class="actions">${amazon(site.paperback.url,'Buy paperback','Buy Origins paperback on Amazon')}${amazon(site.ebook.url,'Buy Kindle','Buy Origins Kindle ebook on Amazon')}</div>
   ${amazon(site.amazonSeriesUrl,'View series on Amazon <span aria-hidden="true">→</span>','View the Defenders of the Land series on Amazon','character-series-link')}
  </div></section>
 </section>`;
}
module.exports={renderCharacters,createCharacters};
