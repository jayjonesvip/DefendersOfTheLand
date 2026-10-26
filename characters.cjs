function renderCharacters({characters,img,escape:esc}){
 return characters.map(c=>{
  if(!c.costumeImage)return `<article id="${esc(c.id)}" class="character-card">${img(c.image,c.alias)}<h2>${esc(c.alias)}</h2></article>`;
  const toggle=`${c.id}-costume`,hint=`${c.id}-costume-help`;
  const base=img(c.image,c.alias).replace('<img ','<img class="character-civilian" aria-hidden="true" ');
  const costume=img(c.costumeImage,`${c.costumeAlias} costume`).replace('<img ','<img class="character-costume" aria-hidden="true" ');
  return `<article id="${esc(c.id)}" class="character-card character-can-transform">
   <input class="character-costume-toggle" type="checkbox" id="${toggle}" aria-label="Keep ${esc(c.costumeAlias)} costume visible" aria-describedby="${hint}">
   <label class="character-transform" for="${toggle}">
    <span class="character-portrait-stack">${base}${costume}</span>
    <span class="character-pin-note" aria-hidden="true"><span class="character-pin-off">Keep costume visible</span><span class="character-pin-on">Costume pinned · tap to reset</span></span>
   </label>
   <h2>${esc(c.alias)}</h2>
   <p class="character-transform-help" id="${hint}">Hover or focus to preview ${esc(c.costumeAlias)}. Tap or press Space to keep the costume visible.</p>
  </article>`;
 }).join('');
}
module.exports={renderCharacters};
