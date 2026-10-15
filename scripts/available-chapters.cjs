// Preserve book.json order and original chapter numbers when entries are hidden.
function availableChapters(book,readChapter){
 const chapters=book.chapters.map(readChapter).filter(chapter=>chapter.available);
 if(chapters.some((chapter,index)=>!Number.isSafeInteger(chapter.number)||chapter.number<1||(index>0&&chapter.number<=chapters[index-1].number))){
  throw Error(`Invalid chapter order in ${book.id}`);
 }
 return chapters;
}
module.exports={availableChapters};
